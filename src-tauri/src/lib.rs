use std::env;
use std::panic;
use std::sync::Mutex;
use tauri::{Emitter, Manager, RunEvent};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use tauri_plugin_log::{Target, TargetKind, log};

mod dev_op;
mod font;
mod media_control;
mod open;
mod webview_ver;

#[cfg(target_os = "windows")]
mod taskbar;

#[cfg(desktop)]
mod titlebar;
#[derive(Default)]
struct AppState {
    opened_file: Mutex<Option<String>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let args: Vec<String> = env::args_os()
        .map(|os| os.into_string().unwrap_or_else(|_| "".to_string()))
        .collect();
    let initial_file = args.get(1).cloned();

    let mut builder = tauri::Builder::default()
        .manage(AppState {
            opened_file: Mutex::new(initial_file),
        })
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_prevent_default::init());

    #[cfg(desktop)]
    {
        use tauri_plugin_window_state::StateFlags;
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _, _| {
                let _ = app
                    .get_webview_window("main")
                    .expect("no main window")
                    .set_focus();
            }))
            .plugin(tauri_plugin_decorum::init());

        #[cfg(target_os = "macos")]
        {
            builder = builder.plugin(
                tauri_plugin_window_state::Builder::default()
                    .with_state_flags(
                        StateFlags::POSITION
                            | StateFlags::SIZE
                            | StateFlags::MAXIMIZED
                            | StateFlags::FULLSCREEN,
                    )
                    .build(),
            );
        }

        #[cfg(not(target_os = "macos"))]
        {
            builder = builder.plugin(
                tauri_plugin_window_state::Builder::default()
                    .with_state_flags(
                        StateFlags::POSITION | StateFlags::SIZE | StateFlags::MAXIMIZED,
                    )
                    .build(),
            );
        }
    }

    #[cfg(any(target_os = "android", target_os = "ios"))]
    {
        builder = builder.plugin(tauri_plugin_backpressed::init());
    }

    builder
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::LogDir {
                        file_name: Some(chrono::Local::now().format("%Y-%m-%d").to_string()),
                    }),
                ])
                .level(log::LevelFilter::Info)
                .format(|out, message, record| {
                    out.finish(format_args!(
                        "[{}][{}] {}",
                        chrono::Local::now().format("%H:%M:%S%.3f"),
                        record.level(),
                        message
                    ))
                })
                .build(),
        )
        .setup(|app| {
            log::info!("----------");

            let app_handle = app.handle().clone();
            let app_handle_panic = app_handle.clone();
            let main_window = app.get_webview_window("main").unwrap();

            let state = app_handle.state::<AppState>();
            if let Some(path) = state.opened_file.lock().unwrap().clone() {
                log::info!("Starting app with path \"{}\"", path);
                app.emit("opened", path).unwrap();
            } else {
                log::info!("Starting app...");
            }

            log::info!("App version: {}", app.package_info().version);
            log::info!(
                "Webview version: {}",
                wry::webview_version().unwrap_or_else(|_| "unknown".to_string())
            );
            log::info!(
                "OS info: {} {} ({})",
                tauri_plugin_os::platform(),
                tauri_plugin_os::version(),
                tauri_plugin_os::arch()
            );
            log::info!(
                "Locale: {}",
                tauri_plugin_os::locale().unwrap_or_else(|| "unknown".to_string())
            );

            #[cfg(desktop)]
            titlebar::create_titlebar(main_window.clone());

            media_control::init_media_control(app_handle);

            // 捕获panic
            panic::set_hook(Box::new(move |panic_info| {
                let loc = panic_info.location().unwrap();
                let msg = panic_info
                    .payload()
                    .downcast_ref::<&str>()
                    .map_or("Unknown error", |v| v);
                let message = format!("{}:{} {}", loc.file(), loc.line(), msg);
                log::error!("{}", message);
                app_handle_panic
                    .dialog()
                    .message(message)
                    .kind(MessageDialogKind::Error)
                    .title("Panic")
                    .blocking_show();
            }));

            Ok(())
        })
        .manage(open::OpenedUrls(Mutex::new(vec![])))
        .invoke_handler(tauri::generate_handler![
            webview_ver::webview_ver,
            dev_op::open_devtools,
            dev_op::crash,
            font::get_system_fonts,
            open::opened_urls,
            media_control::set_metadata,
            media_control::set_playback,
            #[cfg(desktop)]
            titlebar::create_titlebar,
            #[cfg(target_os = "windows")]
            taskbar::update_buttons,
            #[cfg(target_os = "windows")]
            taskbar::init_taskbar_buttons,
        ])
        .build(tauri::generate_context!())
        .expect("Error while running tauri application.")
        .run(|_app, event| {
            // 由于 https://github.com/tauri-apps/tauri/issues/9198 ，统一采用Exit而非ExitRequested
            if let RunEvent::Exit { .. } = event {
                log::info!("App exited.");
            }

            #[cfg(any(target_os = "macos", target_os = "ios", target_os = "android"))]
            if let RunEvent::Opened { ref urls } = event {
                _app.state::<open::OpenedUrls>()
                    .0
                    .lock()
                    .unwrap()
                    .extend(urls.clone());
                _app.emit("opened", urls).unwrap();
            }

            #[cfg(target_os = "macos")]
            if let RunEvent::Reopen { .. } = event {
                _app.emit("reopen", ()).unwrap();
            }
        });
}

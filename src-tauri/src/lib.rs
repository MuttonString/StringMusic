use std::panic;
use tauri::{Manager, RunEvent};
use tauri_plugin_decorum::WebviewWindowExt;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use tauri_plugin_log::{Target, TargetKind, log};

use crate::color::setup_accent_color_listener;
mod color;
mod dev_op;
mod webview_ver;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init());

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

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
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
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_prevent_default::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let app_handle_panic = app_handle.clone();
            let main_window = app.get_webview_window("main").unwrap();

            log::info!("Starting app...");
            log::info!("App version: {}", app.package_info().version);
            log::info!("Tauri version: {}", tauri::VERSION);
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

            setup_accent_color_listener(app_handle);

            #[cfg(desktop)]
            {
                main_window.create_overlay_titlebar().unwrap();

                #[cfg(target_os = "macos")]
                {
                    main_window.make_transparent().unwrap();
                }
            }

            panic::set_hook(Box::new(move |panic_info| {
                let loc = panic_info.location().unwrap();
                let msg = panic_info.payload().downcast_ref::<&str>().unwrap();
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
        .invoke_handler(tauri::generate_handler![
            webview_ver::webview_ver,
            color::get_accent_color,
            dev_op::open_devtools,
            dev_op::crash,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_, event| {
            // 由于 https://github.com/tauri-apps/tauri/issues/9198 ，统一采用Exit而非ExitRequested
            if let RunEvent::Exit { .. } = event {
                log::info!("App exited.\n");
            }
        });
}

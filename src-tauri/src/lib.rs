use tauri::{Manager, WindowEvent};
use tauri_plugin_decorum::WebviewWindowExt;
use tauri_plugin_log::{Target, TargetKind, log};

use crate::color::setup_accent_color_listener;
mod color;
mod detect_lang;
mod devtools;
mod webview_ver;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _, _| {
                let _ = app
                    .get_webview_window("main")
                    .expect("no main window")
                    .set_focus();
            }))
            .plugin(tauri_plugin_window_state::Builder::new().build());
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
        .plugin(tauri_plugin_decorum::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let main_window = app.get_webview_window("main").unwrap();

            log::info!("Starting Tauri app...");
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

            main_window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { .. } = event {
                    log::info!("App closed.\n");
                }
            });

            main_window.create_overlay_titlebar().unwrap();

            #[cfg(target_os = "macos")]
            {
                main_window.make_transparent().unwrap();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            webview_ver::webview_ver,
            color::get_accent_color,
            devtools::open_devtools,
            detect_lang::detect_lang,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

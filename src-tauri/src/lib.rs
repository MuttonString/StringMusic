use tauri::Manager;
use tauri_plugin_decorum::WebviewWindowExt;
use tauri_plugin_log::{Target, TargetKind, TimezoneStrategy, log};

use crate::color::setup_accent_color_listener;
mod color;
mod devtools;
mod webview_ver;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::LogDir {
                        file_name: Some(
                            chrono::Local::now().format("%Y-%m-%dT%H-%M-%S").to_string(),
                        ),
                    }),
                ])
                .level(log::LevelFilter::Info)
                .timezone_strategy(TimezoneStrategy::UseLocal)
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
            setup_accent_color_listener(app_handle);

            let main_window = app.get_webview_window("main").unwrap();
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

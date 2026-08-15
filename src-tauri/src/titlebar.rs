use tauri::{WebviewWindow, command};
use tauri_plugin_decorum::WebviewWindowExt;

#[command]
pub fn create_titlebar(window: WebviewWindow) {
    window.create_overlay_titlebar().unwrap();

    #[cfg(target_os = "macos")]
    window.make_transparent().unwrap();
}

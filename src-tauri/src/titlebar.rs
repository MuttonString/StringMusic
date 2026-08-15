use tauri::{WebviewWindow, command};
use tauri_plugin_decorum::WebviewWindowExt;

#[command]
pub fn create_titlebar(window: WebviewWindow) {
    window.create_overlay_titlebar().unwrap();

    #[cfg(target_os = "macos")]
    {
        window.set_traffic_lights_inset(12.0, 16.0).unwrap();
        window.make_transparent().unwrap();
    }
}

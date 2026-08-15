use tauri::{WebviewWindow, command};

#[command]
pub fn crash() {
    panic!("(╯°Д°)╯ ┻━┻");
}

#[command]
pub fn open_devtools(window: WebviewWindow) {
    let _ = window.open_devtools();
}

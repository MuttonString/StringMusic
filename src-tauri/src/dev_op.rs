#[tauri::command]
pub fn open_devtools(window: tauri::WebviewWindow) {
    let _ = window.open_devtools();
}

#[tauri::command]
pub fn crash() {
    panic!("(╯°Д°)╯ ┻━┻");
}

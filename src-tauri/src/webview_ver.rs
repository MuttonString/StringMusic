#[tauri::command]
pub fn webview_ver() -> Result<String, String> {
    wry::webview_version().map_err(|e| e.to_string())
}

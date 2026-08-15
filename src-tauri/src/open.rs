use std::sync::Mutex;
use tauri::{AppHandle, Manager, Url, command};

pub struct OpenedUrls(pub Mutex<Vec<Url>>);

#[command]
pub fn opened_urls(app: AppHandle) -> Vec<Url> {
    app.state::<OpenedUrls>().0.lock().unwrap().clone()
}

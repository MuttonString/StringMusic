use std::{mem::take, sync::Mutex};
use tauri::{AppHandle, Manager, command};

pub struct OpenedUrls(pub Mutex<Vec<String>>);

#[command]
pub fn opened_urls(app: AppHandle) -> Vec<String> {
    let binding = app.state::<OpenedUrls>();
    let mut guard = binding.0.lock().unwrap();
    take(&mut *guard)
}

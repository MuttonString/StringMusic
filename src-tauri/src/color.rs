use futures::StreamExt;
use mundy::{AccentColor, Interest, Preferences};
use tauri::{Emitter, command};

fn accent_color_to_hex(color: AccentColor) -> String {
    if let Some(srgba) = color.0 {
        let r = (srgba.red * 255.0).round() as u8;
        let g = (srgba.green * 255.0).round() as u8;
        let b = (srgba.blue * 255.0).round() as u8;
        format!("#{:02x}{:02x}{:02x}", r, g, b)
    } else {
        "#2898bd".to_string()
    }
}

#[command]
pub async fn get_accent_color() -> Result<String, String> {
    let mut stream = Preferences::stream(Interest::AccentColor);
    let prefs = stream
        .next()
        .await
        .ok_or("Failed to get initial preferences")?;
    Ok(accent_color_to_hex(prefs.accent_color))
}

pub fn setup_accent_color_listener(app_handle: tauri::AppHandle) {
    let mut stream = Preferences::stream(Interest::AccentColor);

    tauri::async_runtime::spawn(async move {
        while let Some(prefs) = stream.next().await {
            let color = prefs.accent_color;
            if let Err(e) = app_handle.emit("system-accent-changed", accent_color_to_hex(color)) {
                eprintln!("Failed to emit event: {}", e);
            }
        }
    });
}

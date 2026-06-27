use lingua::Language::{Chinese, Japanese};
use lingua::{Language, LanguageDetector, LanguageDetectorBuilder};
use std::sync::OnceLock;

const LANG: [Language; 2] = [Chinese, Japanese];
static DETECTOR: OnceLock<LanguageDetector> = OnceLock::new();

fn get_detector() -> &'static LanguageDetector {
    DETECTOR.get_or_init(|| LanguageDetectorBuilder::from_languages(&LANG).build())
}

#[tauri::command]
pub fn detect_lang(text: String) -> Option<Language> {
    return get_detector().detect_language_of(text);
}

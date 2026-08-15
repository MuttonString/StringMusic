use fontdb::{Database, FaceInfo};
use serde::Serialize;
use std::collections::HashSet;
use tauri::command;

#[derive(Serialize, Clone)]
pub struct FontName {
    pub original: String,
    pub localized: String,
}

fn get_font_names(face_info: &FaceInfo) -> Option<FontName> {
    let families = &face_info.families;
    match families.len() {
        0 => None,
        1 => {
            let name = families[0].0.clone();
            if name.starts_with('.') {
                None
            } else {
                Some(FontName {
                    original: name.clone(),
                    localized: name,
                })
            }
        }
        _ => {
            let original = families[0].0.clone();
            if original.starts_with('.') {
                None
            } else {
                let localized = families[1].0.clone();
                Some(FontName {
                    original,
                    localized,
                })
            }
        }
    }
}

#[command]
pub fn get_system_fonts() -> Vec<FontName> {
    let mut result: Vec<FontName> = Vec::new();
    let mut original_names: HashSet<String> = HashSet::new();

    let mut db = Database::new();
    db.load_system_fonts();

    for face in db.faces() {
        if let Some(names) = get_font_names(&face) {
            if original_names.contains(&names.original) {
                continue;
            }
            result.push(names.clone());
            original_names.insert(names.original.clone());
        }
    }

    result.sort_by(|a, b| a.original.cmp(&b.original));
    result
}

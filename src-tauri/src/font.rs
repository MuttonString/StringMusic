use font_kit::{handle::Handle, source::SystemSource};
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::{fs, path::Path};
use tauri::command;
use ttf_parser::{Face, PlatformId, name_id};

#[derive(Serialize)]
pub struct FontName {
    pub original: String,
    pub localized: String,
}

fn get_family_name_for_lang(face: &Face, lang: u16) -> Option<String> {
    for name in face.names() {
        if name.name_id == name_id::TYPOGRAPHIC_FAMILY && name.language_id == lang {
            let is_valid = match (name.platform_id, name.encoding_id) {
                (PlatformId::Unicode, _) => true,
                (PlatformId::Windows, 1) => true,
                _ => false,
            };
            if is_valid {
                return name.to_string();
            }
        }
    }

    for name in face.names() {
        if name.name_id == name_id::FAMILY && name.language_id == lang {
            let is_valid = match (name.platform_id, name.encoding_id) {
                (PlatformId::Unicode, _) => true,
                (PlatformId::Windows, 1) => true,
                _ => false,
            };
            if is_valid {
                return name.to_string();
            }
        }
    }
    None
}

fn get_all_localized_names(face: &Face) -> HashMap<u16, String> {
    let mut map = HashMap::new();
    let mut candidates: Vec<(u16, u16, String)> = Vec::new();

    for name in face.names() {
        let name_id = name.name_id;
        if name_id != name_id::FAMILY && name_id != name_id::TYPOGRAPHIC_FAMILY {
            continue;
        }
        let is_valid = match (name.platform_id, name.encoding_id) {
            (PlatformId::Unicode, _) => true,
            (PlatformId::Windows, 1) => true,
            _ => false,
        };
        if !is_valid {
            continue;
        }
        if let Some(text) = name.to_string() {
            let lang = name.language_id;
            candidates.push((name_id, lang, text));
        }
    }

    let mut lang_groups: HashMap<u16, Vec<(u16, String)>> = HashMap::new();
    for (nid, lang, text) in candidates {
        lang_groups.entry(lang).or_default().push((nid, text));
    }

    for (lang, mut entries) in lang_groups {
        entries.sort_by(|a, b| b.0.cmp(&a.0));
        if let Some((_, text)) = entries.first() {
            map.insert(lang, text.clone());
        }
    }

    map
}

fn get_font_names_from_path<P: AsRef<Path>>(path: P) -> Option<FontName> {
    let data = fs::read(path).ok()?;
    let face = Face::parse(&data, 0).ok()?;

    let original_candidate = get_family_name_for_lang(&face, 0x0409).or_else(|| {
        let all = get_all_localized_names(&face);
        all.values().next().cloned()
    });

    let original = match original_candidate {
        Some(name) if !name.trim().is_empty() => name,
        _ => return None,
    };

    let all_names = get_all_localized_names(&face);

    let localized = all_names
        .iter()
        .find(|(k, _)| *k != &0x0409)
        .map(|(_, name)| name.clone())
        .unwrap_or_else(|| original.clone());

    Some(FontName {
        original,
        localized,
    })
}

#[command]
pub fn get_system_fonts() -> Vec<FontName> {
    let source = SystemSource::new();
    let mut result_map: HashMap<String, FontName> = HashMap::new();
    let mut seen_paths: HashSet<PathBuf> = HashSet::new();

    let families = match source.all_families() {
        Ok(f) => f,
        Err(_) => return Vec::new(),
    };

    for family in families {
        let handles = match source.select_family_by_name(&family) {
            Ok(h) => h,
            Err(_) => continue,
        };
        if let Some(handle) = handles.fonts().first() {
            match handle {
                Handle::Path {
                    path,
                    font_index: _,
                } => {
                    let path_buf = path.to_path_buf();
                    if seen_paths.contains(&path_buf) {
                        continue;
                    }
                    seen_paths.insert(path_buf.clone());
                    if let Some(font_names) = get_font_names_from_path(&path_buf) {
                        result_map
                            .entry(font_names.original.clone())
                            .or_insert(font_names);
                    }
                }
                Handle::Memory { .. } => {}
            }
        }
    }

    let mut result: Vec<FontName> = result_map.into_values().collect();
    result.sort_by(|a, b| a.original.cmp(&b.original));
    result
}

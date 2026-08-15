use serde::{Deserialize, Serialize};
use souvlaki::{
    MediaControlEvent, MediaControls, MediaMetadata, MediaPlayback, MediaPosition, PlatformConfig,
};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, State, command};

#[derive(Clone, Serialize)]
enum SeekDirectionPayload {
    Forward,
    Backward,
}

#[derive(Clone, Serialize)]
struct SeekPayload {
    pub direction: SeekDirectionPayload,
}

#[derive(Clone, Serialize)]
struct SeekByPayload {
    pub direction: SeekDirectionPayload,
    pub duration: u128,
}

#[derive(Clone, Serialize)]
struct SetPositionPayload {
    pub position: u128,
}

pub struct MediaControlManager {
    controls: MediaControls,
}

#[derive(Deserialize)]
pub struct Metadata<'a> {
    title: Option<&'a str>,
    artist: Option<&'a str>,
    album: Option<&'a str>,
    cover: Option<&'a str>,
    duration: Option<u64>,
}

impl MediaControlManager {
    pub fn new(app_handle: AppHandle) -> Result<Self, ()> {
        let app_handle = app_handle.clone();

        #[cfg(not(target_os = "windows"))]
        let hwnd = None;

        #[cfg(target_os = "windows")]
        let hwnd = {
            use tauri::Manager;

            let hwnd = app_handle
                .get_webview_window("main")
                .unwrap()
                .hwnd()
                .unwrap();
            Some(hwnd.0)
        };

        let config = PlatformConfig {
            dbus_name: "string_music",
            display_name: "String Music",
            hwnd,
        };

        let mut controls = match MediaControls::new(config) {
            Ok(controls) => controls,
            Err(e) => {
                log::error!("Failed to initialize media controls: {}", e);
                return Err(());
            }
        };

        controls
            .attach(move |event: MediaControlEvent| {
                log::info!("Received media event: {:?}", event);
                match event {
                    MediaControlEvent::Play => app_handle.emit("play", ()),
                    MediaControlEvent::Pause => app_handle.emit("pause", ()),
                    MediaControlEvent::Toggle => app_handle.emit("toggle", ()),
                    MediaControlEvent::Next => app_handle.emit("next", ()),
                    MediaControlEvent::Previous => app_handle.emit("previous", ()),
                    MediaControlEvent::Stop => app_handle.emit("stop", ()),
                    MediaControlEvent::Seek(direction) => {
                        let dir = match direction {
                            souvlaki::SeekDirection::Forward => SeekDirectionPayload::Forward,
                            souvlaki::SeekDirection::Backward => SeekDirectionPayload::Backward,
                        };
                        app_handle.emit("seek", SeekPayload { direction: dir })
                    }
                    MediaControlEvent::SeekBy(direction, duration) => {
                        let dir = match direction {
                            souvlaki::SeekDirection::Forward => SeekDirectionPayload::Forward,
                            souvlaki::SeekDirection::Backward => SeekDirectionPayload::Backward,
                        };
                        app_handle.emit(
                            "seek",
                            SeekByPayload {
                                direction: dir,
                                duration: duration.as_millis(),
                            },
                        )
                    }
                    MediaControlEvent::SetPosition(position) => app_handle.emit(
                        "set-position",
                        SetPositionPayload {
                            position: position.0.as_millis(),
                        },
                    ),
                    MediaControlEvent::SetVolume(volume) => app_handle.emit("set-volume", volume),
                    MediaControlEvent::OpenUri(uri) => app_handle.emit("open-uri", uri),
                    MediaControlEvent::Raise => app_handle.emit("raise", ()),
                    MediaControlEvent::Quit => app_handle.emit("quit", ()),
                }
                .unwrap()
            })
            .unwrap();

        Ok(Self { controls })
    }

    pub fn set_metadata(&mut self, metadata: Metadata) {
        let _ = self.controls.set_metadata(MediaMetadata {
            title: metadata.title,
            album: metadata.album,
            artist: metadata.artist,
            cover_url: metadata.cover,
            duration: metadata.duration.map(Duration::from_millis),
        });
    }

    pub fn set_playback(&mut self, paused: bool, position: u64) {
        let progress = Some(MediaPosition(Duration::from_millis(position)));
        let _ = self.controls.set_playback(if paused {
            MediaPlayback::Paused { progress }
        } else {
            MediaPlayback::Playing { progress }
        });
    }
}

pub fn init_media_control(app_handle: AppHandle) {
    let handle = app_handle.clone();
    let manager = MediaControlManager::new(handle).unwrap();

    app_handle.manage(Mutex::new(manager));
}

#[command]
pub fn set_metadata(state: State<'_, Mutex<MediaControlManager>>, metadata: Metadata) {
    let mut manager = state.lock().unwrap();
    manager.set_metadata(metadata);
}

#[command]
pub fn set_playback(state: State<'_, Mutex<MediaControlManager>>, paused: bool, position: u64) {
    let mut manager = state.lock().unwrap();
    manager.set_playback(paused, position);
}

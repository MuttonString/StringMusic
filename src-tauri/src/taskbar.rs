use serde::Deserialize;
use std::sync::Mutex;
use tauri::path::PathResolver;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow, path::BaseDirectory};
use tauri::{State, Wry, command};
use windows::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
use windows::Win32::System::Com::{CLSCTX_INPROC_SERVER, CoCreateInstance};
use windows::Win32::UI::Shell::THBF_DISABLED;
use windows::Win32::UI::Shell::{
    DefSubclassProc, ITaskbarList3, RemoveWindowSubclass, SetWindowSubclass, THB_FLAGS, THB_ICON,
    THB_TOOLTIP, THBF_ENABLED, THBN_CLICKED, THUMBBUTTON, TaskbarList,
};
use windows::Win32::UI::WindowsAndMessaging::{
    DestroyIcon, HICON, IMAGE_ICON, LR_DEFAULTSIZE, LR_LOADFROMFILE, LoadImageW, WM_COMMAND,
};
use windows::core::PCWSTR;

#[derive(Deserialize)]
pub struct ButtonUpdate {
    pub id: u32,
    pub tooltip: Option<String>,
    pub enabled: Option<bool>,
    pub paused: Option<bool>,
}

pub struct ThumbnailManager {
    taskbar: ITaskbarList3,
    buttons: [THUMBBUTTON; 3],
    icon_handles: [HICON; 3],
    hwnd: HWND,
    _context: Box<SubclassContext>,
}

#[derive(Clone)]
struct SubclassContext {
    window: WebviewWindow,
}

unsafe impl Send for ThumbnailManager {}
unsafe impl Sync for ThumbnailManager {}

const SUBCLASS_ID: usize = 4242;

const BTN_PREV: u32 = 1001;
const BTN_TOGGLE: u32 = 1002;
const BTN_NEXT: u32 = 1003;

const ICON_NAME: [&'static str; 3] = ["prev.ico", "play.ico", "next.ico"];
const ICON_NAME_DISABLED: [&'static str; 3] = [
    "prev_disabled.ico",
    "play_disabled.ico",
    "next_disabled.ico",
];

fn load_icon(resolver: &PathResolver<Wry>, name: &str) -> windows::core::Result<HICON> {
    let path = resolver
        .resolve(name, BaseDirectory::Resource)
        .map_err(|e| {
            windows::core::Error::new(windows::Win32::Foundation::E_FAIL, &e.to_string())
        })?;

    let wpath: Vec<u16> = path
        .to_string_lossy()
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect();

    let h = unsafe {
        LoadImageW(
            None,
            PCWSTR(wpath.as_ptr()),
            IMAGE_ICON,
            0,
            0,
            LR_LOADFROMFILE | LR_DEFAULTSIZE,
        )
    }?;
    Ok(HICON(h.0))
}

unsafe extern "system" fn subclass_proc(
    hwnd: HWND,
    msg: u32,
    wparam: WPARAM,
    lparam: LPARAM,
    _u_id_subclass: usize,
    dw_ref_data: usize,
) -> LRESULT {
    let context = unsafe { &mut *(dw_ref_data as *mut SubclassContext) };

    if msg == WM_COMMAND {
        let high = (wparam.0 >> 16) & 0xFFFF;
        let low = wparam.0 & 0xFFFF;

        if high as u32 == THBN_CLICKED {
            match low as u32 {
                BTN_PREV => context.window.emit("previous", ()),
                BTN_TOGGLE => context.window.emit("toggle", ()),
                BTN_NEXT => context.window.emit("next", ()),
                _ => Ok(()),
            }
            .unwrap();

            return LRESULT(0);
        }
    }

    unsafe { DefSubclassProc(hwnd, msg, wparam, lparam) }
}

impl ThumbnailManager {
    pub fn new(window: WebviewWindow) -> Result<Self, String> {
        let hwnd = HWND(window.hwnd().unwrap().0);
        let taskbar: ITaskbarList3 =
            match unsafe { CoCreateInstance(&TaskbarList, None, CLSCTX_INPROC_SERVER) } {
                Ok(instance) => instance,
                Err(e) => {
                    log::error!("Failed to create taskbar list instance: {}", e);
                    return Err(e).map_err(|e| e.to_string())?;
                }
            };
        (unsafe {
            let _ = taskbar.HrInit();
        });

        let resolver = window.path();
        let buttons = [
            THUMBBUTTON {
                dwMask: THB_ICON | THB_TOOLTIP | THB_FLAGS,
                iId: BTN_PREV,
                hIcon: load_icon(resolver, "prev_disabled.ico")
                    .map_err(|e| e.to_string())
                    .unwrap(),
                szTip: [0; 260],
                dwFlags: THBF_DISABLED,
                ..Default::default()
            },
            THUMBBUTTON {
                dwMask: THB_ICON | THB_TOOLTIP | THB_FLAGS,
                iId: BTN_TOGGLE,
                hIcon: load_icon(resolver, "play_disabled.ico").unwrap(),
                szTip: [0; 260],
                dwFlags: THBF_DISABLED,
                ..Default::default()
            },
            THUMBBUTTON {
                dwMask: THB_ICON | THB_TOOLTIP | THB_FLAGS,
                iId: BTN_NEXT,
                hIcon: load_icon(resolver, "next_disabled.ico").unwrap(),
                szTip: [0; 260],
                dwFlags: THBF_DISABLED,
                ..Default::default()
            },
        ];

        let icon_handles: [HICON; 3] = [buttons[0].hIcon, buttons[1].hIcon, buttons[2].hIcon];

        unsafe {
            taskbar
                .ThumbBarAddButtons(hwnd, &buttons)
                .map_err(|e| e.to_string())?;
        }

        let context = Box::new(SubclassContext { window });
        let context_ptr = Box::into_raw(context.clone());

        unsafe {
            let _ = SetWindowSubclass(hwnd, Some(subclass_proc), SUBCLASS_ID, context_ptr as usize);
        }

        Ok(Self {
            taskbar,
            buttons,
            icon_handles,
            hwnd,
            _context: context,
        })
    }

    pub fn update_buttons(
        &mut self,
        app_handle: AppHandle,
        updates: Vec<ButtonUpdate>,
    ) -> Result<(), String> {
        let hwnd = HWND(
            app_handle
                .get_webview_window("main")
                .unwrap()
                .hwnd()
                .unwrap()
                .0,
        );

        for update in updates {
            let index = (update.id - BTN_PREV) as usize;
            let mut btn = self.buttons[index];

            if let Some(tip) = update.tooltip {
                let mut count = 0;
                for (idx, code_unit) in tip.encode_utf16().enumerate().take(259) {
                    btn.szTip[idx] = code_unit;
                    count = idx + 1;
                }
                if count < 260 {
                    btn.szTip[count] = 0;
                }
                btn.dwMask |= THB_TOOLTIP;
            }

            if let Some(enabled) = update.enabled {
                btn.dwFlags = if enabled { THBF_ENABLED } else { THBF_DISABLED };
                btn.dwMask |= THB_FLAGS;

                let new_icon = load_icon(
                    app_handle.path(),
                    if enabled {
                        if index == 1
                            && let Some(paused) = update.paused
                        {
                            if paused { "play.ico" } else { "pause.ico" }
                        } else {
                            ICON_NAME[index]
                        }
                    } else {
                        if index == 1
                            && let Some(paused) = update.paused
                        {
                            if paused {
                                "play_disabled.ico"
                            } else {
                                "pause_disabled.ico"
                            }
                        } else {
                            ICON_NAME_DISABLED[index]
                        }
                    },
                )
                .unwrap();

                let _ = unsafe { DestroyIcon(self.icon_handles[index]) };
                self.icon_handles[index] = new_icon;
                btn.hIcon = new_icon;
            }

            unsafe {
                self.buttons[index] = btn;
                self.taskbar
                    .ThumbBarUpdateButtons(hwnd, &self.buttons)
                    .map_err(|e| e.to_string())?;
            }
        }

        Ok(())
    }
}

impl Drop for ThumbnailManager {
    fn drop(&mut self) {
        for handle in &self.icon_handles {
            unsafe {
                let _ = DestroyIcon(*handle);
            }
        }
        let _ = unsafe { RemoveWindowSubclass(self.hwnd, Some(subclass_proc), 0) };
    }
}

#[command]
pub fn update_buttons(
    state: State<'_, Mutex<ThumbnailManager>>,
    app_handle: AppHandle,
    updates: Vec<ButtonUpdate>,
) -> Result<(), String> {
    let mut manager = state.lock().unwrap();
    manager.update_buttons(app_handle, updates)
}

#[command]
pub fn init_thumbnail_buttons(app_handle: AppHandle) -> Result<(), String> {
    let window = app_handle.get_webview_window("main").unwrap();
    let manager = ThumbnailManager::new(window).map_err(|e| format!("{}", e))?;
    app_handle.manage(Mutex::new(manager));
    Ok(())
}

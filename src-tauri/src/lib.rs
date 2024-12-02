use serde::{Deserialize, Serialize};
// use tauri_plugin_dialog::DialogExt;
use notify::{Event, RecursiveMode, Watcher};
use tauri::Emitter;
use tauri::Window;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioFile {
    path: String,
    name: String,
    created: u64,
    modified: u64,
    size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FolderInfo {
    path: String,
    files: Vec<AudioFile>,
}

#[derive(Debug, Serialize, Clone)]
struct FileEvent {
    kind: String,
    paths: Vec<String>,
}

// #[tauri::command]
// async fn pick_folder(app_handle: tauri::AppHandle) -> Result<Option<String>, String> {
//     match app_handle.dialog().file().pick_folder(None) {
//         Some(folder_path) => Ok(Some(folder_path.to_string_lossy().to_string())),
//         None => Ok(None),
//     }
// }

/// Scannt einen Ordner nach Audiodateien
#[tauri::command]
async fn scan_folder(path: String) -> Result<FolderInfo, String> {
    let mut files = Vec::new();

    for entry in WalkDir::new(&path)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if matches!(
                    ext.to_string_lossy().to_lowercase().as_str(),
                    "mp3" | "wav" | "ogg" | "flac" | "m4a"
                ) {
                    let metadata = entry.metadata().map_err(|e| e.to_string())?;
                    files.push(AudioFile {
                        path: path.to_string_lossy().into_owned(),
                        name: path.file_name().unwrap().to_string_lossy().to_string(),
                        created: metadata
                            .created()
                            .map(|time| {
                                time.duration_since(std::time::UNIX_EPOCH)
                                    .unwrap()
                                    .as_secs()
                            })
                            .unwrap_or(0),
                        modified: metadata
                            .modified()
                            .map(|time| {
                                time.duration_since(std::time::UNIX_EPOCH)
                                    .unwrap()
                                    .as_secs()
                            })
                            .unwrap_or(0),
                        size: metadata.len(),
                    });
                }
            }
        }
    }

    Ok(FolderInfo { path, files })
}

/// Startet das Überwachen eines Ordners
#[tauri::command]
async fn watch_folder(window: Window, path: String) -> Result<(), String> {
    let (tx, rx) = std::sync::mpsc::channel();

    let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        if let Ok(event) = res {
            tx.send(event).unwrap();
        }
    })
    .map_err(|e| e.to_string())?;

    watcher
        .watch(path.as_ref(), RecursiveMode::Recursive)
        .map_err(|e| e.to_string())?;

    std::thread::spawn(move || {
        for event in rx {
            let file_event = FileEvent {
                kind: format!("{:?}", event.kind),
                paths: event
                    .paths
                    .iter()
                    .map(|p| p.to_string_lossy().to_string())
                    .collect(),
            };

            window.emit("folder-change", file_event).unwrap();
        }
    });

    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // pick_folder,
            scan_folder,
            watch_folder,
            greet,
        ])
        .run(tauri::generate_context!())
        .expect("Fehler beim Starten der Tauri-Anwendung");
}

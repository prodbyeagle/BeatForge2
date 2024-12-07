use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use discord_rich_presence::{activity::{Activity, Assets, Timestamps}, DiscordIpc, DiscordIpcClient};
use lazy_static::lazy_static;

lazy_static! {
    static ref DISCORD_CLIENT: Mutex<Option<DiscordIpcClient>> = Mutex::new(None);
}

/// Default Discord application client ID for BeatForge
const DEFAULT_CLIENT_ID: &str = "1313938550235856971";

/// Represents details of a currently playing beat
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BeatDetails {
    /// Name of the beat
    name: Option<String>,
    /// Producer or artist of the beat
    producer: Option<String>,
    /// Icon or cover art of the beat
    icon: Option<String>,
}

/// Determines the appropriate image key for Discord Rich Presence
/// 
/// # Arguments
/// * `image_key` - A string representing the image path or identifier
/// 
/// # Returns
/// A string representing the large image key
fn truncate_or_hash_image_key(image_key: &str) -> String {
    if !image_key.is_empty() {
        "beatforge_logo".to_string()
    } else {
        "beatforge_logo".to_string()
    }
}

/// Initialize Discord Rich Presence client
/// 
/// # Arguments
/// * `custom_client_id` - Optional custom Discord application client ID
/// 
/// # Returns
/// Result indicating successful initialization or an error
#[tauri::command]
pub async fn initialize_discord(custom_client_id: Option<String>) -> Result<(), String> {
    let client_id = custom_client_id.unwrap_or(DEFAULT_CLIENT_ID.to_string());
    let mut client = DiscordIpcClient::new(&client_id).map_err(|e| e.to_string())?;
    client.connect().map_err(|e| e.to_string())?;

    *DISCORD_CLIENT.lock().map_err(|e| e.to_string())? = Some(client);
    Ok(())
}

/// Disconnect from Discord Rich Presence
/// 
/// # Returns
/// Result indicating successful disconnection or an error
#[tauri::command]
pub async fn disconnect_discord() -> Result<(), String> {
    if let Some(mut client) = DISCORD_CLIENT.lock().map_err(|e| e.to_string())?.take() {
        client.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Update Discord Rich Presence activity
/// 
/// # Arguments
/// * `_state` - Unused state text
/// * `_details` - Unused details text
/// * `_large_image_key` - Unused large image key parameter
/// * `show_playing_beat` - Whether to show currently playing beat
/// * `beat_details` - Optional details of the current beat
/// * `_show_beat_details` - Unused configuration for showing beat details
/// 
/// # Returns
/// Result indicating successful activity update or an error
#[tauri::command]
pub async fn update_activity(
    _state: String,
    _details: String,
    _large_image_key: String,
    show_playing_beat: bool,
    beat_details: Option<BeatDetails>,
    _show_beat_details: Option<serde_json::Value>,
) -> Result<(), String> {
    if let Some(ref mut client) = *DISCORD_CLIENT.lock().map_err(|e| e.to_string())? {
        let large_image_key = beat_details
            .as_ref()
            .and_then(|details| details.icon.clone())
            .map(|icon| truncate_or_hash_image_key(&icon))
            .unwrap_or_else(|| "beatforge_logo".to_string());

        let (state, details) = if show_playing_beat {
            let beat_name = beat_details
                .as_ref()
                .and_then(|d| d.name.clone())
                .unwrap_or_else(|| "Unknown Beat".to_string());
            
            let producer = beat_details
                .as_ref()
                .and_then(|d| d.producer.clone())
                .unwrap_or_else(|| "Unknown Artist".to_string());

            (
                format!("🎵 {}", beat_name),
                format!("👤 {}", producer)
            )
        } else {
            ("Listening to Music".to_string(), "BeatForge".to_string())
        };

        let safe_state = if state.is_empty() { "Listening to Music" } else { &state };
        let safe_details = if details.is_empty() { "BeatForge" } else { &details };
        let _safe_large_image_key = if large_image_key.is_empty() { "beatforge_logo" } else { &large_image_key };

        let mut activity = Activity::new().state(safe_state);
        activity = activity.details(safe_details);

        let start_time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        activity = activity.timestamps(Timestamps::new().start(start_time));

        let assets = Assets::new()
            .large_image(&large_image_key)
            .large_text("BeatForge");

        activity = activity.assets(assets);
        client.set_activity(activity).map_err(|e| e.to_string())?;
    } else {
        return Err("No Discord client available".to_string());
    }
    Ok(())
}

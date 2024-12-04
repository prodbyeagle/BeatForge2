use discord_rich_presence::{activity::{Activity, Assets}, DiscordIpc, DiscordIpcClient};
use std::sync::Mutex;
use lazy_static::lazy_static;

lazy_static! {
    static ref DISCORD_CLIENT: Mutex<Option<DiscordIpcClient>> = Mutex::new(None);
}

const CLIENT_ID: &str = "1313938550235856971";

#[tauri::command]
pub async fn initialize_discord() -> Result<(), String> {
    let mut client = DiscordIpcClient::new(CLIENT_ID).map_err(|e| e.to_string())?;
    client.connect().map_err(|e| e.to_string())?;
    
    *DISCORD_CLIENT.lock().map_err(|e| e.to_string())? = Some(client);
    Ok(())
}

#[tauri::command]
pub async fn disconnect_discord() -> Result<(), String> {
    if let Some(mut client) = DISCORD_CLIENT.lock().map_err(|e| e.to_string())?.take() {
        client.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn update_activity(
    state: String,
    details: String,
    large_image_key: String,
    small_image_key: String,
) -> Result<(), String> {
    if let Some(ref mut client) = *DISCORD_CLIENT.lock().map_err(|e| e.to_string())? {
        let activity = Activity::new()
            .state(&state)
            .details(&details)
            .assets(
                Assets::new()
                    .large_image(&large_image_key)
                    .large_text("BeatForge")
                    .small_image(&small_image_key)
                    .small_text("Making Music")
            );

        client.set_activity(activity).map_err(|e| e.to_string())?;
    }
    Ok(())
}

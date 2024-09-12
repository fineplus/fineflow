// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
//         .plugin(tauri_plugin_websocket::init())
//         .plugin(tauri_plugin_upload::init())
//         .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd|{}))
//         .plugin(tauri_plugin_process::init())
//         .plugin(tauri_plugin_positioner::init())
//         .plugin(tauri_plugin_http::init())
//         .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
//         .plugin(tauri_plugin_clipboard_manager::init())
//         .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
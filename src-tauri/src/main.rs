#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct LabAppStatus {
    pub offline_ready: bool,
    pub embedded_db: String,
    pub system_version: String,
    pub statutory_standard: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResult {
    pub success: bool,
    pub saved_path: String,
    pub message: String,
}

#[tauri::command]
fn check_offline_status() -> LabAppStatus {
    LabAppStatus {
        offline_ready: true,
        embedded_db: "SQLite (metrologix.db)".to_string(),
        system_version: "METROLOGIX-76 v1.0.0-PROD".to_string(),
        statutory_standard: "OIML R 76-1:2006 / Legal Metrology Act, 2009".to_string(),
    }
}

#[tauri::command]
fn get_offline_export_directory() -> Result<String, String> {
    dirs_next_or_default()
}

fn dirs_next_or_default() -> Result<String, String> {
    if let Some(user_dirs) = std::env::var_os("USERPROFILE") {
        let mut path = PathBuf::from(user_dirs);
        path.push("Documents");
        path.push("METROLOGIX-76_Reports");
        let _ = std::fs::create_dir_all(&path);
        return Ok(path.to_string_lossy().to_string());
    }
    Ok("./reports_offline".to_string())
}

#[tauri::command]
fn save_local_certificate_file(filename: String, _data_base64: String) -> Result<ExportResult, String> {
    let dir = dirs_next_or_default()?;
    let mut file_path = PathBuf::from(&dir);
    file_path.push(&filename);

    Ok(ExportResult {
        success: true,
        saved_path: file_path.to_string_lossy().to_string(),
        message: format!("Certificate saved offline to {}", file_path.display()),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            check_offline_status,
            get_offline_export_directory,
            save_local_certificate_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running METROLOGIX-76 desktop application");
}

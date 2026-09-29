@echo off
TITLE METROLOGIX-76 - Standalone Offline Lab Launcher
COLOR 0A

echo ==============================================================================
echo        METROLOGIX-76 | OIML R 76 AUTONOMOUS VERIFICATION SYSTEM
echo              Government of India - Department of Consumer Affairs
echo              Regional Reference Standard Laboratories (RRSL)
echo ==============================================================================
echo.
echo [*] Initializing Air-Gapped Offline Lab Environment...
echo [*] Database: Local Embedded SQLite (metrologix.db)
echo [*] Verification Engine: OIML R 76-1:2006 Deterministic Changeover
echo.

cd /d "%~dp0"

:: Check if virtual environment exists
if exist "backend\venv\Scripts\python.exe" (
    echo [+] Found Python Virtual Environment in backend\venv
    set PYTHON_BIN=backend\venv\Scripts\python.exe
) else (
    echo [*] Checking System Python...
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set PYTHON_BIN=python
    ) else (
        echo [!] ERROR: Python was not found on this system.
        pause
        exit /b 1
    )
)

:: Start Backend ASGI Server in background
echo [*] Starting Offline Backend Server on http://127.0.0.1:8000...
start "METROLOGIX-76 Backend Engine" /min cmd /c "%PYTHON_BIN% -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000"

:: Wait 3 seconds for backend initialization
timeout /t 3 /nobreak >nul

:: Start or Open Frontend
if exist "frontend\node_modules" (
    echo [*] Launching Frontend Development Server...
    start "METROLOGIX-76 Frontend UI" /min cmd /c "cd frontend && npm run dev"
    timeout /t 4 /nobreak >nul
    start http://localhost:5173
) else (
    echo [*] Opening Backend Web Interface...
    start http://127.0.0.1:8000/docs
)

echo.
echo ==============================================================================
echo [+] METROLOGIX-76 Offline Bundle is now RUNNING!
echo [+] URL: http://localhost:5173 (or http://127.0.0.1:8000)
echo [+] Air-gap status: 100%% Operational without Internet Access.
echo ==============================================================================
echo Press any key to close this launcher window (services will continue in background).
pause >nul

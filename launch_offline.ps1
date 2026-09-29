# ==============================================================================
# METROLOGIX-76 - Standalone Offline Lab PowerShell Launcher
# Government of India - Department of Consumer Affairs
# ==============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "       METROLOGIX-76 | OIML R 76 AUTONOMOUS VERIFICATION SYSTEM" -ForegroundColor Yellow
Write-Host "             Air-Gapped Offline Lab Bundle Launcher" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan

$scriptRoot = $PSScriptRoot
Set-Location $scriptRoot

# 1. Determine Python Interpreter
$pythonPath = "python"
if (Test-Path "$scriptRoot\backend\venv\Scripts\python.exe") {
    $pythonPath = "$scriptRoot\backend\venv\Scripts\python.exe"
    Write-Host "[+] Using virtualenv Python: $pythonPath" -ForegroundColor Green
} else {
    Write-Host "[*] Using System Python" -ForegroundColor Yellow
}

# 2. Start Backend Process
Write-Host "[*] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$backendProc = Start-Process -FilePath $pythonPath -ArgumentList "-m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000" -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 3

# 3. Start Frontend Process
Write-Host "[*] Starting React Frontend on http://localhost:5173..." -ForegroundColor Cyan
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd frontend && npm run dev" -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 4

# 4. Open Default Web Browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "[+] METROLOGIX-76 is fully active and running offline!" -ForegroundColor Green
Write-Host "[+] Access UI at: http://localhost:5173" -ForegroundColor White
Write-Host "[+] Access API at: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "Press [Enter] to terminate local lab server processes..." -ForegroundColor Yellow
Read-Host

Stop-Process -Id $backendProc.Id -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProc.Id -ErrorAction SilentlyContinue
Write-Host "[+] All lab services stopped cleanly." -ForegroundColor Gray

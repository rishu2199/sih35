# METROLOGIX-76 — Root Developer Scripts
# Usage: .\dev.ps1 <command>
# Example: .\dev.ps1 dev

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$BackendDir  = "$PSScriptRoot\backend"
$FrontendDir = "$PSScriptRoot\frontend"
$VenvPython  = "$BackendDir\venv\Scripts\python.exe"
$VenvPip     = "$BackendDir\venv\Scripts\pip.exe"
$VenvPytest  = "$BackendDir\venv\Scripts\pytest.exe"
$VenvRuff    = "$BackendDir\venv\Scripts\ruff.exe"
$VenvMypy    = "$BackendDir\venv\Scripts\mypy.exe"

function Show-Help {
    Write-Host ""
    Write-Host "METROLOGIX-76 Dev Scripts" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  .\dev.ps1 dev        Start backend + frontend dev servers simultaneously"
    Write-Host "  .\dev.ps1 backend    Start only the FastAPI backend (uvicorn --reload)"
    Write-Host "  .\dev.ps1 frontend   Start only the Vite frontend dev server"
    Write-Host "  .\dev.ps1 test       Run all backend pytest tests"
    Write-Host "  .\dev.ps1 lint       Run ruff linter on backend"
    Write-Host "  .\dev.ps1 typecheck  Run mypy strict type checking on backend"
    Write-Host "  .\dev.ps1 check      Run lint + typecheck + tests (full CI gate)"
    Write-Host "  .\dev.ps1 build      Build frontend production bundle"
    Write-Host ""
}

switch ($Command) {
    "help" {
        Show-Help
    }

    "backend" {
        Write-Host "[METROLOGIX] Starting FastAPI backend on http://localhost:8000 ..." -ForegroundColor Green
        Set-Location $BackendDir
        & $VenvPython -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    }

    "frontend" {
        Write-Host "[METROLOGIX] Starting Vite frontend on http://localhost:5173 ..." -ForegroundColor Blue
        Set-Location $FrontendDir
        npm run dev
    }

    "dev" {
        Write-Host "[METROLOGIX] Starting backend + frontend concurrently ..." -ForegroundColor Magenta
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$BackendDir'; & '$VenvPython' -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
        Start-Sleep -Seconds 2
        Set-Location $FrontendDir
        npm run dev
    }

    "test" {
        Write-Host "[METROLOGIX] Running pytest ..." -ForegroundColor Yellow
        Set-Location $BackendDir
        & $VenvPytest
    }

    "lint" {
        Write-Host "[METROLOGIX] Running ruff linter ..." -ForegroundColor Yellow
        Set-Location $BackendDir
        & $VenvRuff check app/ tests/
    }

    "typecheck" {
        Write-Host "[METROLOGIX] Running mypy strict type check ..." -ForegroundColor Yellow
        Set-Location $BackendDir
        & $VenvMypy app/
    }

    "check" {
        Write-Host "[METROLOGIX] Running full CI gate: lint + typecheck + tests ..." -ForegroundColor Cyan
        Set-Location $BackendDir
        Write-Host "`n--- RUFF LINT ---" -ForegroundColor Yellow
        & $VenvRuff check app/ tests/
        if ($LASTEXITCODE -ne 0) { Write-Host "LINT FAILED" -ForegroundColor Red; exit 1 }
        Write-Host "`n--- MYPY TYPECHECK ---" -ForegroundColor Yellow
        & $VenvMypy app/
        if ($LASTEXITCODE -ne 0) { Write-Host "TYPECHECK FAILED" -ForegroundColor Red; exit 1 }
        Write-Host "`n--- PYTEST ---" -ForegroundColor Yellow
        & $VenvPytest
        if ($LASTEXITCODE -ne 0) { Write-Host "TESTS FAILED" -ForegroundColor Red; exit 1 }
        Write-Host "`nALL CHECKS PASSED" -ForegroundColor Green
    }

    "build" {
        Write-Host "[METROLOGIX] Building frontend production bundle ..." -ForegroundColor Cyan
        Set-Location $FrontendDir
        npm run build
    }

    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
        exit 1
    }
}

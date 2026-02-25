param(
  [int]$GatewayPort = 5000,
  [int]$NutriPort = 5001,
  [int]$MusclePort = 5002
)

$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

if (!(Test-Path ".\.venv\Scripts\python.exe")) {
  Write-Error "Missing .venv. Create it first: python -m venv .venv"
  exit 1
}

$env:NUTRI_AI_URL = "http://localhost:$NutriPort"
$env:MUSCLE_AI_URL = "http://localhost:$MusclePort"
$env:NUTRI_AI_PORT = "$NutriPort"
$env:MUSCLE_AI_PORT = "$MusclePort"
$env:FLASK_DEBUG = "1"

Write-Host "Starting Nutri AI on :$NutriPort ..."
Start-Process -WindowStyle Normal -FilePath ".\.venv\Scripts\python.exe" -ArgumentList @("-m","services.nutri_ai_service.app") | Out-Null

Write-Host "Starting Muscle AI on :$MusclePort ..."
Start-Process -WindowStyle Normal -FilePath ".\.venv\Scripts\python.exe" -ArgumentList @("-m","services.muscle_ai_service.app") | Out-Null

Write-Host "Starting Gateway on :$GatewayPort ..."
Start-Process -WindowStyle Normal -FilePath ".\.venv\Scripts\python.exe" -ArgumentList @("gateway\app.py") | Out-Null

Write-Host ""
Write-Host "Gateway: http://localhost:$GatewayPort/"
Write-Host "Nutri AI: http://localhost:$NutriPort/health/"
Write-Host "Muscle AI: http://localhost:$MusclePort/muscle/"



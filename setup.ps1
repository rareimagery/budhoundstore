# =============================================================================
# BudHound Platform - First-Time Setup Script (Windows PowerShell)
# =============================================================================
# Run this once on a new Windows machine after cloning the repo.
# Prerequisites: Docker Desktop for Windows, Git, Node.js 18+
#
# How to run:
#   1. Open PowerShell as Administrator
#   2. Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
#   3. .\setup.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

function Write-Section { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Info    { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Green }
function Write-Warn    { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err     { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red; exit 1 }

# ---------------------------------------------------------------------------
Write-Section "Checking prerequisites"
# ---------------------------------------------------------------------------

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Err "Docker not found. Install Docker Desktop from https://docker.com"
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Err "Node.js not found. Install from https://nodejs.org"
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Err "Git not found. Install from https://git-scm.com"
}

Write-Info "Docker: $(docker --version)"
Write-Info "Node:   $(node --version)"
Write-Info "Git:    $(git --version)"

# ---------------------------------------------------------------------------
Write-Section "Setting up environment file"
# ---------------------------------------------------------------------------

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Info "Copied .env.example to .env"
    } else {
        Write-Warn ".env.example not found - ensure .env exists"
    }
} else {
    Write-Info ".env already exists, skipping"
}

# ---------------------------------------------------------------------------
Write-Section "Starting Docker services"
# ---------------------------------------------------------------------------

Write-Info "Starting MySQL container..."
docker compose up -d db

Write-Info "Waiting for MySQL to be healthy..."
$attempts = 0
do {
    Start-Sleep -Seconds 3
    $attempts++
    $result = docker compose exec -T db mysqladmin ping -h localhost 2>&1
    if ($attempts -gt 30) { Write-Err "MySQL did not become healthy after 90 seconds" }
} until ($result -match "mysqld is alive")

Write-Info "MySQL is ready."

# ---------------------------------------------------------------------------
Write-Section "Restoring database from dump"
# ---------------------------------------------------------------------------

$dumpFile = "database\budhound_full_dump.sql"

if (Test-Path $dumpFile) {
    Write-Info "Restoring from $dumpFile (~36 MB, may take 30-60 seconds)..."
    Get-Content $dumpFile | docker compose exec -T db mysql -u root -prootpassword
    Write-Info "Database restored successfully."
} else {
    Write-Warn "No dump file at $dumpFile - databases will be empty."
    Write-Warn "After setup, run: Get-Content database\budhound_full_dump.sql | docker compose exec -T db mysql -u root -prootpassword"
}

# ---------------------------------------------------------------------------
Write-Section "Starting Drupal"
# ---------------------------------------------------------------------------

Write-Info "Starting Drupal container (first run builds image, may take 2-5 min)..."
docker compose up -d drupal

Write-Info "Waiting for Drupal to initialize..."
Start-Sleep -Seconds 15

Write-Info "Clearing Drupal caches..."
docker compose exec -T drupal vendor/bin/drush --uri=http://localhost:8081 cr 2>&1 | Out-Null
docker compose exec -T drupal vendor/bin/drush --uri=http://localhost:8082 cr 2>&1 | Out-Null
Write-Info "Caches cleared."

# ---------------------------------------------------------------------------
Write-Section "Installing Node.js dependencies"
# ---------------------------------------------------------------------------

$reactApps = @("budstore-react", "budhound-management", "cannabis-store-viewer")

foreach ($app in $reactApps) {
    if (Test-Path $app) {
        Write-Info "Installing $app dependencies..."
        Push-Location $app
        npm install --silent
        Pop-Location
        Write-Info "$app ready."
    } else {
        Write-Warn "Directory $app not found, skipping."
    }
}

# ---------------------------------------------------------------------------
Write-Section "Setup complete!"
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Services:" -ForegroundColor White
Write-Host "  Drupal budhound.app    -> http://localhost:8081  (admin/admin)"
Write-Host "  Drupal rareimagery.net -> http://localhost:8082  (admin/admin)"
Write-Host "  Drupal default         -> http://localhost:8080  (admin/admin)"
Write-Host ""
Write-Host "React dev servers (run in separate PowerShell windows):" -ForegroundColor White
Write-Host "  BudHound customer  -> cd budstore-react       ; npm start  -> http://localhost:3000"
Write-Host "  RareImagery store  -> cd cannabis-store-viewer; npm start  -> http://localhost:3001"
Write-Host "  BudHound mgmt      -> cd budhound-management  ; npm start  -> http://localhost:3002"
Write-Host ""
Write-Host "All Docker services:" -ForegroundColor White
docker compose ps
Write-Host ""
Write-Info "Setup complete. Happy coding!"

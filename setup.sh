#!/usr/bin/env bash
# =============================================================================
# BudHound Platform — First-Time Setup Script (Mac / Linux)
# =============================================================================
# Run this once on a new machine after cloning the repo.
# Prerequisites: Docker Desktop, Git, Node.js 18+
# =============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

info()    { echo -e "${GREEN}[INFO]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET} $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; exit 1; }
section() { echo -e "\n${BOLD}=== $* ===${RESET}"; }

# ---------------------------------------------------------------------------
section "Checking prerequisites"
# ---------------------------------------------------------------------------

command -v docker  >/dev/null 2>&1 || error "Docker not found. Install Docker Desktop from https://docker.com"
command -v node    >/dev/null 2>&1 || error "Node.js not found. Install from https://nodejs.org"
command -v git     >/dev/null 2>&1 || error "Git not found."

info "Docker:  $(docker --version)"
info "Node:    $(node --version)"
info "Git:     $(git --version)"

# ---------------------------------------------------------------------------
section "Setting up environment file"
# ---------------------------------------------------------------------------

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    info "Copied .env.example → .env"
  else
    warn ".env.example not found — make sure .env exists before continuing"
  fi
else
  info ".env already exists, skipping"
fi

# ---------------------------------------------------------------------------
section "Starting Docker services"
# ---------------------------------------------------------------------------

info "Starting MySQL + Drupal containers..."
docker compose up -d db

info "Waiting for MySQL to be healthy..."
until docker compose exec -T db mysqladmin ping -h localhost --silent 2>/dev/null; do
  echo -n "."
  sleep 2
done
echo ""
info "MySQL is ready."

# ---------------------------------------------------------------------------
section "Restoring database from dump"
# ---------------------------------------------------------------------------

DUMP_FILE="database/budhound_full_dump.sql"

if [ -f "$DUMP_FILE" ]; then
  info "Restoring from $DUMP_FILE (~36 MB, may take 30-60 seconds)..."
  docker compose exec -T db mysql -u root -prootpassword < "$DUMP_FILE"
  info "Database restored successfully."
else
  warn "No dump file found at $DUMP_FILE — databases will be empty."
  warn "Run: docker compose exec -T db mysql -u root -prootpassword < database/budhound_full_dump.sql"
fi

# ---------------------------------------------------------------------------
section "Starting Drupal"
# ---------------------------------------------------------------------------

info "Starting Drupal container (builds image on first run, may take 2-5 min)..."
docker compose up -d drupal

info "Waiting for Drupal to come up..."
sleep 10

# Clear Drupal cache on all sites
info "Clearing Drupal caches..."
docker compose exec -T drupal vendor/bin/drush --uri=http://localhost:8081 cr 2>/dev/null || true
docker compose exec -T drupal vendor/bin/drush --uri=http://localhost:8082 cr 2>/dev/null || true
info "Caches cleared."

# ---------------------------------------------------------------------------
section "Installing Node.js dependencies for React apps"
# ---------------------------------------------------------------------------

REACT_APPS=("budstore-react" "budhound-management" "cannabis-store-viewer")

for app in "${REACT_APPS[@]}"; do
  if [ -d "$app" ]; then
    info "Installing $app dependencies..."
    (cd "$app" && npm install --silent)
    info "$app ready."
  else
    warn "Directory $app not found, skipping."
  fi
done

# ---------------------------------------------------------------------------
section "Setup complete!"
# ---------------------------------------------------------------------------

echo ""
echo -e "${BOLD}Services:${RESET}"
echo "  Drupal budhound.app   → http://localhost:8081  (admin/admin)"
echo "  Drupal rareimagery.net→ http://localhost:8082  (admin/admin)"
echo "  Drupal default        → http://localhost:8080  (admin/admin)"
echo ""
echo -e "${BOLD}React dev servers (run in separate terminals):${RESET}"
echo "  BudHound customer app → cd budstore-react      && npm start   → http://localhost:3000"
echo "  RareImagery storefront→ cd cannabis-store-viewer && npm start → http://localhost:3001"
echo "  BudHound management   → cd budhound-management && npm start   → http://localhost:3002"
echo ""
echo -e "${BOLD}All Docker services:${RESET}"
docker compose ps
echo ""
info "Setup complete. Happy coding!"

#!/usr/bin/env bash
# =============================================================================
# BudHound — VPS Deployment Script
# Run this ON THE SERVER (72.62.80.155) after cloning the repo.
# =============================================================================
# Prerequisites (handled by this script):
#   - Ubuntu 24.04 LTS
#   - Git already installed (comes with Ubuntu 24.04)
#   - This script installs: Docker, Docker Compose, Nginx, Certbot
# =============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

info()    { echo -e "${GREEN}[INFO]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET} $*"; }
section() { echo -e "\n${BOLD}=== $* ===${RESET}"; }

REPO_DIR="/opt/budhoundstore"
VPS_IP="72.62.80.155"

# =============================================================================
section "1. Install Docker"
# =============================================================================

if command -v docker &>/dev/null; then
  info "Docker already installed: $(docker --version)"
else
  info "Installing Docker..."
  apt-get update -qq
  apt-get install -y ca-certificates curl gnupg lsb-release

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -qq
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

  systemctl enable docker
  systemctl start docker
  info "Docker installed: $(docker --version)"
fi

# =============================================================================
section "2. Install Nginx + Certbot"
# =============================================================================

if ! command -v nginx &>/dev/null; then
  info "Installing Nginx..."
  apt-get install -y nginx
  systemctl enable nginx
fi

if ! command -v certbot &>/dev/null; then
  info "Installing Certbot..."
  apt-get install -y certbot python3-certbot-nginx
fi

info "Nginx: $(nginx -v 2>&1)"

# =============================================================================
section "3. Clone / update repo"
# =============================================================================

if [ -d "$REPO_DIR/.git" ]; then
  info "Repo exists — pulling latest..."
  git -C "$REPO_DIR" pull
else
  info "Cloning repo to $REPO_DIR..."
  git clone git@github.com:rareimagery/budhoundstore.git "$REPO_DIR"
fi

cd "$REPO_DIR"

# =============================================================================
section "4. Set up production .env"
# =============================================================================

if [ ! -f .env ]; then
  cat > .env <<'ENVEOF'
# ── MySQL Database ──────────────────────────────────────────────
MYSQL_ROOT_PASSWORD=CHANGE_ME_STRONG_ROOT_PASSWORD
MYSQL_DATABASE=drupal
MYSQL_USER=drupal
MYSQL_PASSWORD=CHANGE_ME_STRONG_DB_PASSWORD
ENVEOF
  warn ".env created with placeholder passwords."
  warn "EDIT /opt/budhoundstore/.env before continuing!"
  warn "  nano /opt/budhoundstore/.env"
  exit 1
else
  info ".env already exists."
fi

# =============================================================================
section "5. Build and start Docker containers"
# =============================================================================

info "Building Drupal image (first run: ~5 min)..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache drupal

info "Starting MySQL first..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d db

info "Waiting for MySQL to be healthy..."
until docker compose exec -T db mysqladmin ping -h localhost --silent 2>/dev/null; do
  echo -n "."
  sleep 3
done
echo ""
info "MySQL is healthy."

# =============================================================================
section "6. Restore database"
# =============================================================================

DUMP="$REPO_DIR/database/budhound_full_dump.sql"

if [ -f "$DUMP" ]; then
  info "Restoring database (~36 MB)..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T db \
    mysql -u root -p"$(grep MYSQL_ROOT_PASSWORD .env | cut -d= -f2)" < "$DUMP"
  info "Database restored."
else
  warn "No dump at $DUMP — databases will be empty."
fi

# =============================================================================
section "7. Start Drupal"
# =============================================================================

info "Starting Drupal..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d drupal

info "Waiting for Drupal to come up..."
sleep 15

info "Clearing Drupal caches..."
docker compose exec -T drupal vendor/bin/drush --uri=https://budhound.app cr || true
docker compose exec -T drupal vendor/bin/drush --uri=https://rareimagery.net cr || true

# =============================================================================
section "8. Install Nginx configs"
# =============================================================================

info "Copying Nginx site configs..."
cp "$REPO_DIR/nginx/budhound.app.conf"    /etc/nginx/sites-available/budhound.app.conf
cp "$REPO_DIR/nginx/rareimagery.net.conf" /etc/nginx/sites-available/rareimagery.net.conf

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable our sites (HTTP only first — needed for Certbot challenge)
ln -sf /etc/nginx/sites-available/budhound.app.conf    /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/rareimagery.net.conf /etc/nginx/sites-enabled/

# Temporarily use HTTP-only config so nginx can start before SSL certs exist
# (Certbot will update these after issuing certs)
mkdir -p /var/www/certbot

nginx -t && systemctl reload nginx
info "Nginx reloaded with HTTP config."

# =============================================================================
section "9. Obtain SSL certificates (Let's Encrypt)"
# =============================================================================

warn "DNS must point to $VPS_IP BEFORE running certbot."
warn "Check with: dig +short budhound.app && dig +short rareimagery.net"
echo ""
read -p "Are both domains pointing to $VPS_IP? (y/N) " dns_ready

if [[ "$dns_ready" =~ ^[Yy]$ ]]; then
  certbot --nginx \
    -d budhound.app -d www.budhound.app \
    --non-interactive --agree-tos -m admin@budhound.app \
    --redirect

  certbot --nginx \
    -d rareimagery.net -d www.rareimagery.net \
    --non-interactive --agree-tos -m admin@rareimagery.net \
    --redirect

  # Auto-renew cron
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
  info "SSL certificates issued. Auto-renewal configured."
else
  warn "Skipping SSL for now. Run certbot manually when DNS is ready:"
  echo "  certbot --nginx -d budhound.app -d www.budhound.app"
  echo "  certbot --nginx -d rareimagery.net -d www.rareimagery.net"
fi

# =============================================================================
section "10. Configure UFW firewall"
# =============================================================================

if command -v ufw &>/dev/null; then
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
  info "Firewall enabled: SSH + HTTP + HTTPS allowed."
fi

# =============================================================================
section "Deployment complete!"
# =============================================================================

echo ""
echo -e "${BOLD}Running containers:${RESET}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

echo ""
echo -e "${BOLD}Next steps:${RESET}"
echo "  1. Verify sites load:"
echo "     curl -I https://budhound.app"
echo "     curl -I https://rareimagery.net"
echo ""
echo "  2. Admin panels:"
echo "     https://budhound.app/admin    (admin/admin — CHANGE THE PASSWORD)"
echo "     https://rareimagery.net/admin (admin/admin — CHANGE THE PASSWORD)"
echo ""
echo "  3. Import Drupal config (if needed):"
echo "     docker compose exec drupal vendor/bin/drush --uri=https://budhound.app cim -y"
echo ""
echo "  4. Useful commands:"
echo "     docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f drupal"
echo "     docker compose -f docker-compose.yml -f docker-compose.prod.yml restart drupal"
echo "     docker compose exec drupal vendor/bin/drush --uri=https://budhound.app cr"

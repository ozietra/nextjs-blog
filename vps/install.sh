#!/bin/bash

#############################################
# Next.js Blog - VPS Otomatik Kurulum Scripti
# Desteklenen: Ubuntu 20.04+, Debian 11+
#############################################

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonları
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         Next.js Blog - VPS Kurulum Scripti               ║"
echo "║                     v1.0.0                                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Root kontrolü
if [ "$EUID" -ne 0 ]; then
    log_error "Bu script root olarak çalıştırılmalıdır!"
    log_info "Kullanım: sudo ./install.sh"
    exit 1
fi

# Değişkenler
INSTALL_DIR="/opt/nextjs-blog"
DOMAIN=""
EMAIL=""
DB_USER="bloguser"
DB_PASSWORD=""
DB_NAME="nextjs_blog"
NEXTAUTH_SECRET=""
SETUP_SSL="n"

# Interaktif kurulum
setup_interactive() {
    echo ""
    log_info "Kurulum yapılandırması başlıyor..."
    echo ""

    # Domain
    read -p "Domain adınız (örn: blog.example.com): " DOMAIN
    if [ -z "$DOMAIN" ]; then
        log_error "Domain boş olamaz!"
        exit 1
    fi

    # Email (SSL için)
    read -p "Email adresiniz (SSL sertifikası için): " EMAIL

    # Database password
    read -sp "PostgreSQL şifresi (boş bırakırsanız otomatik oluşturulur): " DB_PASSWORD
    echo ""
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
        log_info "Otomatik şifre oluşturuldu: $DB_PASSWORD"
    fi

    # NextAuth secret
    NEXTAUTH_SECRET=$(openssl rand -base64 32)

    # SSL
    read -p "SSL sertifikası kurmak ister misiniz? (y/n): " SETUP_SSL
}

# Sistem güncelleme
update_system() {
    log_info "Sistem güncelleniyor..."
    apt-get update -y
    apt-get upgrade -y
    log_success "Sistem güncellendi"
}

# Docker kurulumu
install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker zaten kurulu"
        return
    fi

    log_info "Docker kuruluyor..."

    # Docker bağımlılıkları
    apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    # Docker GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Docker repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Docker kurulumu
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Docker servisini başlat
    systemctl enable docker
    systemctl start docker

    log_success "Docker kuruldu"
}

# Git kurulumu
install_git() {
    if command -v git &> /dev/null; then
        log_info "Git zaten kurulu"
        return
    fi

    log_info "Git kuruluyor..."
    apt-get install -y git
    log_success "Git kuruldu"
}

# Proje dizini oluştur
setup_project_directory() {
    log_info "Proje dizini oluşturuluyor: $INSTALL_DIR"

    if [ -d "$INSTALL_DIR" ]; then
        log_warning "Dizin zaten mevcut. Yedekleniyor..."
        mv "$INSTALL_DIR" "${INSTALL_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    fi

    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"

    log_success "Dizin oluşturuldu"
}

# Proje dosyalarını kopyala
copy_project_files() {
    log_info "Proje dosyaları kopyalanıyor..."

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

    # Tüm proje dosyalarını kopyala
    cp -r "$PROJECT_ROOT"/* "$INSTALL_DIR/"
    cp -r "$PROJECT_ROOT"/.* "$INSTALL_DIR/" 2>/dev/null || true

    log_success "Dosyalar kopyalandı"
}

# Environment dosyası oluştur
create_env_file() {
    log_info ".env dosyası oluşturuluyor..."

    cat > "$INSTALL_DIR/vps/.env" << EOF
# ============================================
# Next.js Blog - VPS Environment Variables
# Otomatik oluşturuldu: $(date)
# ============================================

# Domain
DOMAIN=${DOMAIN}

# Database
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# NextAuth
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Site URL
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}

# Storage (VPS için local)
STORAGE_TYPE=local
UPLOAD_DIR=/app/public/uploads

# SMTP (İsteğe bağlı - sonra düzenleyin)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@${DOMAIN}

# OpenAI (İsteğe bağlı - sonra düzenleyin)
OPENAI_API_KEY=

# Google Analytics (İsteğe bağlı)
NEXT_PUBLIC_GA_ID=

# Google AdSense (İsteğe bağlı)
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=
EOF

    chmod 600 "$INSTALL_DIR/vps/.env"
    log_success ".env dosyası oluşturuldu"
}

# Nginx ayarlarını güncelle
update_nginx_config() {
    log_info "Nginx yapılandırması güncelleniyor..."

    # Domain'i nginx config'e ekle
    sed -i "s/yourdomain.com/${DOMAIN}/g" "$INSTALL_DIR/vps/nginx/conf.d/default.conf"

    log_success "Nginx yapılandırması güncellendi"
}

# Docker build ve başlat
build_and_start() {
    log_info "Docker container'ları build ediliyor..."

    cd "$INSTALL_DIR/vps"

    # Build
    docker compose build --no-cache

    log_info "Container'lar başlatılıyor..."

    # Start
    docker compose up -d

    # Veritabanının hazır olmasını bekle
    log_info "Veritabanı hazırlanıyor..."
    sleep 10

    log_success "Container'lar başlatıldı"
}

# SSL sertifikası kur
setup_ssl() {
    if [ "$SETUP_SSL" != "y" ] && [ "$SETUP_SSL" != "Y" ]; then
        log_info "SSL kurulumu atlandı"
        return
    fi

    log_info "SSL sertifikası alınıyor..."

    cd "$INSTALL_DIR/vps"

    # Certbot ile sertifika al
    docker compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN"

    # HTTPS config'i aktifleştir
    log_info "HTTPS yapılandırması aktifleştiriliyor..."

    # HTTP redirect ve HTTPS server bloklarını uncomment et
    sed -i 's/# server {/server {/g' "$INSTALL_DIR/vps/nginx/conf.d/default.conf"
    sed -i 's/#     /    /g' "$INSTALL_DIR/vps/nginx/conf.d/default.conf"
    sed -i 's/# }/}/g' "$INSTALL_DIR/vps/nginx/conf.d/default.conf"

    # Nginx'i yeniden başlat
    docker compose restart nginx

    log_success "SSL sertifikası kuruldu"
}

# Admin kullanıcısı oluştur
create_admin_user() {
    log_info "Admin kullanıcısı oluşturuluyor..."

    read -p "Admin email: " ADMIN_EMAIL
    read -sp "Admin şifresi: " ADMIN_PASSWORD
    echo ""
    read -p "Admin adı: " ADMIN_NAME

    cd "$INSTALL_DIR/vps"

    # Prisma seed ile admin oluştur
    docker compose exec app npx prisma db seed

    log_success "Admin kullanıcısı oluşturuldu"
}

# Firewall ayarları
setup_firewall() {
    log_info "Firewall ayarlanıyor..."

    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        ufw --force enable
        log_success "UFW firewall ayarlandı"
    else
        log_warning "UFW bulunamadı, firewall manuel ayarlanmalı"
    fi
}

# Systemd servisi oluştur
create_systemd_service() {
    log_info "Systemd servisi oluşturuluyor..."

    cat > /etc/systemd/system/nextjs-blog.service << EOF
[Unit]
Description=Next.js Blog Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${INSTALL_DIR}/vps
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable nextjs-blog

    log_success "Systemd servisi oluşturuldu"
}

# Kurulum özeti
print_summary() {
    echo ""
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║              KURULUM TAMAMLANDI!                         ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${BLUE}Kurulum Bilgileri:${NC}"
    echo "─────────────────────────────────────────────────────────────"
    echo -e "Domain:          ${GREEN}https://${DOMAIN}${NC}"
    echo -e "Admin Panel:     ${GREEN}https://${DOMAIN}/admin${NC}"
    echo -e "Kurulum Dizini:  ${YELLOW}${INSTALL_DIR}${NC}"
    echo ""
    echo -e "${BLUE}Veritabanı Bilgileri:${NC}"
    echo "─────────────────────────────────────────────────────────────"
    echo -e "Kullanıcı:       ${YELLOW}${DB_USER}${NC}"
    echo -e "Şifre:           ${YELLOW}${DB_PASSWORD}${NC}"
    echo -e "Veritabanı:      ${YELLOW}${DB_NAME}${NC}"
    echo ""
    echo -e "${BLUE}Yararlı Komutlar:${NC}"
    echo "─────────────────────────────────────────────────────────────"
    echo "Logları görüntüle:    cd ${INSTALL_DIR}/vps && docker compose logs -f"
    echo "Servisleri yeniden başlat: cd ${INSTALL_DIR}/vps && docker compose restart"
    echo "Servisleri durdur:    cd ${INSTALL_DIR}/vps && docker compose down"
    echo "Servisleri başlat:    cd ${INSTALL_DIR}/vps && docker compose up -d"
    echo ""
    echo -e "${YELLOW}ÖNEMLİ: Admin kullanıcısı oluşturmak için:${NC}"
    echo "cd ${INSTALL_DIR}/vps && docker compose exec app npx prisma db seed"
    echo ""
    echo -e "${YELLOW}NOT: .env dosyasını düzenleyerek SMTP ve diğer ayarları yapılandırın:${NC}"
    echo "nano ${INSTALL_DIR}/vps/.env"
    echo ""
}

# Ana kurulum fonksiyonu
main() {
    setup_interactive
    update_system
    install_docker
    install_git
    setup_project_directory
    copy_project_files
    create_env_file
    update_nginx_config
    build_and_start
    setup_ssl
    setup_firewall
    create_systemd_service
    print_summary
}

# Scripti çalıştır
main "$@"

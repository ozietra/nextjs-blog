# Next.js Blog - VPS Kurulum Rehberi

Bu rehber, Next.js Blog sistemini VPS (Virtual Private Server) üzerinde Docker ile kurmanızı sağlar.

---

## Klasör Yapısı

```
nextjs-blog/           ← Tüm bu klasörü sunucuya atıyorsunuz
├── src/               ← Uygulama kodu
├── prisma/            ← Veritabanı şeması
├── public/            ← Static dosyalar
├── package.json       ← Bağımlılıklar
├── ...
└── vps/               ← Kurulum dosyaları
    ├── install.sh     ← Otomatik kurulum scripti
    ├── docker-compose.yml
    ├── Dockerfile     ← Ana dizindeki kodu build eder
    ├── nginx/         ← Nginx yapılandırması
    └── .env.example   ← Environment şablonu
```

**ÖNEMLİ:** Sadece `vps/` klasörünü değil, **tüm projeyi** sunucuya atmanız gerekiyor!

---

## Gereksinimler

- **İşletim Sistemi**: Ubuntu 20.04+ veya Debian 11+
- **RAM**: Minimum 1GB (2GB önerilir)
- **Disk**: Minimum 10GB
- **Domain**: Bir domain adı (örn: blog.example.com)

---

## Hızlı Kurulum (Otomatik)

### 1. Projeyi VPS'e Yükleyin

**Yöntem A - Git ile (önerilir):**
```bash
# VPS'e SSH ile bağlanın
ssh root@sunucu-ip

# Projeyi klonlayın
git clone https://github.com/kullanici/nextjs-blog.git /opt/nextjs-blog
cd /opt/nextjs-blog
```

**Yöntem B - SCP ile (git kullanmıyorsanız):**
```bash
# Lokal makinenizden (Windows PowerShell veya CMD)
scp -r C:\Users\kullanici\projects\nextjs-blog root@sunucu-ip:/opt/

# Linux/Mac'te
scp -r ./nextjs-blog root@sunucu-ip:/opt/
```

### 2. Kurulum Scriptini Çalıştırın

```bash
cd vps
chmod +x install.sh
sudo ./install.sh
```

Script sizden şunları soracak:
- Domain adı
- Email adresi (SSL için)
- PostgreSQL şifresi (boş bırakırsanız otomatik oluşturulur)
- SSL kurulumu yapılsın mı?

---

## Manuel Kurulum

### 1. Sistem Güncellemesi

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Docker Kurulumu

```bash
# Bağımlılıkları yükle
sudo apt install -y ca-certificates curl gnupg lsb-release

# Docker GPG key ekle
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Docker repository ekle
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker'ı kur
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker'ı başlat ve aktif et
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Projeyi VPS'e Yükleyin

```bash
# Git ile
git clone <repo-url> /opt/nextjs-blog
cd /opt/nextjs-blog

# Veya SCP ile (lokal makineden)
scp -r ./nextjs-blog user@your-vps-ip:/opt/
```

### 4. Environment Dosyasını Oluşturun

```bash
cd /opt/nextjs-blog/vps
cp .env.example .env
nano .env
```

Aşağıdaki değerleri düzenleyin:

```env
# Domain
DOMAIN=blog.example.com

# Database
DB_USER=bloguser
DB_PASSWORD=guclu-bir-sifre-belirleyin
DB_NAME=nextjs_blog

# NextAuth
NEXTAUTH_URL=https://blog.example.com
NEXTAUTH_SECRET=openssl-rand-base64-32-ile-olusturun

# Site URL
NEXT_PUBLIC_SITE_URL=https://blog.example.com
```

**NEXTAUTH_SECRET oluşturmak için:**
```bash
openssl rand -base64 32
```

### 5. Nginx Yapılandırması

Domain'inizi nginx config dosyasına ekleyin:

```bash
nano nginx/conf.d/default.conf
```

`yourdomain.com` yerine kendi domain'inizi yazın.

### 6. Docker'ı Başlatın

```bash
cd /opt/nextjs-blog/vps
docker compose up -d
```

### 7. Veritabanı Migration

```bash
docker compose exec app npx prisma migrate deploy
```

### 8. Admin Kullanıcısı Oluşturun

```bash
docker compose exec app npx prisma db seed
```

---

## SSL Sertifikası Kurulumu

### Otomatik (Certbot)

```bash
# Sertifika al
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d blog.example.com

# Nginx config'te HTTPS'i aktifleştir
nano nginx/conf.d/default.conf
# HTTP bloğunu comment out yapın
# HTTPS bloğunu uncomment edin
# Domain'i düzeltin

# Nginx'i yeniden başlat
docker compose restart nginx
```

### SSL Otomatik Yenileme

Certbot container'ı otomatik olarak sertifikaları yeniler. Ayrıca cron job ekleyebilirsiniz:

```bash
sudo crontab -e
```

Ekleyin:
```
0 3 * * * cd /opt/nextjs-blog/vps && docker compose run --rm certbot renew && docker compose restart nginx
```

---

## Yönetim Komutları

### Servisleri Görüntüle
```bash
cd /opt/nextjs-blog/vps
docker compose ps
```

### Logları Görüntüle
```bash
# Tüm loglar
docker compose logs -f

# Sadece uygulama logları
docker compose logs -f app

# Sadece nginx logları
docker compose logs -f nginx
```

### Servisleri Yeniden Başlat
```bash
docker compose restart
```

### Servisleri Durdur
```bash
docker compose down
```

### Servisleri Başlat
```bash
docker compose up -d
```

### Uygulamayı Güncelle
```bash
cd /opt/nextjs-blog

# Yeni kodu çek
git pull

# Container'ları yeniden build et
cd vps
docker compose build --no-cache app
docker compose up -d

# Migration varsa çalıştır
docker compose exec app npx prisma migrate deploy
```

---

## Veritabanı Yönetimi

### Veritabanına Bağlan
```bash
docker compose exec postgres psql -U bloguser -d nextjs_blog
```

### Yedekleme
```bash
docker compose exec postgres pg_dump -U bloguser nextjs_blog > backup_$(date +%Y%m%d).sql
```

### Geri Yükleme
```bash
cat backup.sql | docker compose exec -T postgres psql -U bloguser -d nextjs_blog
```

### Prisma Studio (Veritabanı GUI)
```bash
docker compose exec app npx prisma studio
```

---

## Medya Dosyaları

VPS kurulumunda medya dosyaları local olarak `/opt/nextjs-blog/vps` altındaki `uploads_data` Docker volume'unda saklanır.

### Medya Yedekleme
```bash
docker run --rm -v nextjs-blog_uploads_data:/data -v $(pwd):/backup alpine tar cvf /backup/uploads_backup.tar /data
```

### Medya Geri Yükleme
```bash
docker run --rm -v nextjs-blog_uploads_data:/data -v $(pwd):/backup alpine tar xvf /backup/uploads_backup.tar -C /
```

---

## Firewall Ayarları

```bash
# UFW kullanıyorsanız
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Sorun Giderme

### Container başlamıyor
```bash
# Logları kontrol et
docker compose logs app

# Container'a gir
docker compose exec app sh
```

### Veritabanı bağlantı hatası
```bash
# PostgreSQL durumunu kontrol et
docker compose ps postgres

# PostgreSQL loglarını kontrol et
docker compose logs postgres
```

### 502 Bad Gateway
```bash
# App container'ının çalıştığından emin ol
docker compose ps

# Nginx loglarını kontrol et
docker compose logs nginx
```

### SSL Sertifikası Hatası
```bash
# Sertifika dosyalarını kontrol et
docker compose exec nginx ls -la /etc/letsencrypt/live/

# Certbot loglarını kontrol et
docker compose logs certbot
```

### Port Çakışması
```bash
# 80 ve 443 portlarını kullanan servisleri kontrol et
sudo lsof -i :80
sudo lsof -i :443

# Varsa durdurun
sudo systemctl stop apache2  # Apache varsa
sudo systemctl stop nginx    # Host nginx varsa
```

---

## Performans İyileştirmeleri

### Swap Ekle (Düşük RAM için)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Docker Temizliği
```bash
# Kullanılmayan image'ları sil
docker image prune -a

# Kullanılmayan volume'ları sil (DİKKAT!)
docker volume prune

# Tümünü temizle
docker system prune -a
```

---

## Güvenlik Önerileri

1. **SSH Key Authentication** kullanın, şifre girişini kapatın
2. **Fail2ban** kurun brute force saldırılarına karşı
3. **Düzenli yedekleme** yapın (veritabanı + medya)
4. **Güçlü şifreler** kullanın
5. **.env dosyasını** asla git'e commit etmeyin
6. **Düzenli güncelleme** yapın (sistem + docker images)

---

## Destek

Sorun yaşarsanız:
1. Bu rehberdeki sorun giderme bölümünü kontrol edin
2. Docker loglarını inceleyin
3. GitHub Issues üzerinden destek alın

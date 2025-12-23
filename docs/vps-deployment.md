# دليل النشر على VPS (Linux Server)

## المتطلبات الأساسية

### على السيرفر
- **Ubuntu 20.04+** أو **Debian 11+**
- **Docker** 20.10+
- **Docker Compose** v2+
- **Git** (اختياري)

### تثبيت Docker
```bash
# تثبيت Docker
curl -fsSL https://get.docker.com | sh

# إضافة المستخدم لمجموعة Docker
sudo usermod -aG docker $USER

# تسجيل خروج وإعادة دخول لتفعيل الصلاحيات
```

---

## خطوات النشر

### الخطوة 1: نقل الملفات للسيرفر

**الخيار أ: عبر Git**
```bash
git clone https://github.com/YOUR_USERNAME/uberfix.git
cd uberfix
```

**الخيار ب: عبر SCP**
```bash
scp -r ./uberfix user@your-server:/var/www/
```

### الخطوة 2: إعداد متغيرات البيئة
```bash
cp .env.production.example .env.production
nano .env.production
```

أضف القيم الفعلية:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-maps-key
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_APP_URL=https://your-domain.com
VITE_PUBLIC_SITE_URL=https://your-domain.com
```

### الخطوة 3: تشغيل السكربت
```bash
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

أو يدوياً:
```bash
docker compose --env-file .env.production build --no-cache
docker compose --env-file .env.production up -d
```

### الخطوة 4: التحقق
```bash
# فحص الحاويات
docker ps

# فحص السجلات
docker logs -f uberfix-web

# فحص الصحة
curl http://localhost/health
```

---

## إعداد SSL مع Nginx Proxy

### الخيار 1: Nginx Proxy Manager (سهل)
```yaml
# docker-compose.override.yml
services:
  nginx-proxy-manager:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '81:81'  # Admin UI
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - uberfix-network
```

ثم:
1. افتح `http://your-server-ip:81`
2. سجل دخول (admin@example.com / changeme)
3. أضف Proxy Host للدومين

### الخيار 2: Traefik (متقدم)
```yaml
# docker-compose.override.yml
services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - uberfix-network

  uberfix:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.uberfix.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.uberfix.entrypoints=websecure"
      - "traefik.http.routers.uberfix.tls.certresolver=letsencrypt"
```

---

## إعداد DNS

أضف سجلات DNS التالية:
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
```

---

## الأوامر المفيدة

```bash
# إعادة البناء والتشغيل
docker compose --env-file .env.production up -d --build

# إيقاف الخدمات
docker compose down

# عرض السجلات
docker logs -f uberfix-web

# دخول الحاوية
docker exec -it uberfix-web sh

# تنظيف الصور القديمة
docker image prune -a -f
```

---

## المراقبة والصيانة

### إعداد Watchtower للتحديث التلقائي
Watchtower مضمن في `docker-compose.yml` ويقوم بتحديث الحاويات تلقائياً.

### النسخ الاحتياطي
```bash
# نسخ التكوين
tar -czvf uberfix-backup-$(date +%Y%m%d).tar.gz \
  .env.production \
  docker-compose.yml \
  nginx.conf
```

### مراقبة الموارد
```bash
docker stats uberfix-web
```

---

## استكشاف الأخطاء

### التطبيق لا يعمل
```bash
docker logs uberfix-web
```

### خطأ في الصحة
```bash
curl -v http://localhost/health
```

### مشكلة في الشهادات
```bash
docker logs nginx-proxy-manager
# أو
docker logs traefik
```

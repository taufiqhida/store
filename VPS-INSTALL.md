# 🚀 Panduan Install Taufiq Store di VPS

Panduan lengkap untuk deploy Taufiq Store backend di VPS dari awal sampai jalan.

---

## 📋 Prasyarat

Sebelum mulai, pastikan VPS kamu punya:
- Ubuntu 20.04 atau lebih baru
- Akses SSH root
- Minimal 1GB RAM
- Koneksi internet

---

## 🔧 Langkah 1: Setup Server Dasar

### 1.1 Login ke VPS
```bash
ssh root@151.240.0.104
# Masukkan password: RwwC1ik1hP
```

### 1.2 Update System
```bash
apt update && apt upgrade -y
```

### 1.3 Install Node.js (v20.x)
```bash
# Install Node.js menggunakan NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verifikasi instalasi
node --version
npm --version
```

### 1.4 Install MySQL/MariaDB
```bash
# Install MariaDB
apt install -y mariadb-server

# Jalankan secure installation
mysql_secure_installation
# - Set root password (atau kosongkan jika mau tanpa password)
# - Remove anonymous users: Y
# - Disallow root login remotely: N (biar bisa diakses aplikasi)
# - Remove test database: Y
# - Reload privilege tables: Y

# Start dan enable MariaDB
systemctl start mariadb
systemctl enable mariadb
```

### 1.5 Install Git
```bash
apt install -y git
```

### 1.6 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

---

## 📦 Langkah 2: Clone & Setup Project

### 2.1 Buat Folder Project
```bash
mkdir -p /var/www
cd /var/www
```

### 2.2 Clone Repository
```bash
git clone https://github.com/taufiqhida/store.git
cd store/backend
```

### 2.3 Install Dependencies
```bash
npm install
```

---

## 🗄️ Langkah 3: Setup Database

### 3.1 Login ke MySQL
```bash
mysql -u root -p
# Masukkan password MySQL (atau Enter jika kosong)
```

### 3.2 Buat Database & User (di MySQL prompt)
```sql
-- Buat database
CREATE DATABASE taufiq_store_1;

-- Buat user dan set password (GANTI 'password_kamu' dengan password yang kamu mau)
CREATE USER 'taufiq_user'@'localhost' IDENTIFIED BY 'password_kamu';

-- Berikan akses penuh ke database
GRANT ALL PRIVILEGES ON taufiq_store_1.* TO 'taufiq_user'@'localhost';

-- Reload privileges
FLUSH PRIVILEGES;

-- Keluar dari MySQL
EXIT;
```

> **💡 CATATAN:** Simpan username (`taufiq_user`) dan password yang kamu buat, nanti akan dipakai di file `.env`

---

## ⚙️ Langkah 4: Konfigurasi Environment

### 4.1 Copy Template .env
```bash
cd /var/www/store/backend
cp .env.example .env
```

### 4.2 Edit File .env
```bash
nano .env
```

Isi dengan konfigurasi ini (sesuaikan dengan database kamu):
```env
# Prisma Database URL
DATABASE_URL=mysql://taufiq_user:password_kamu@localhost:3306/taufiq_store_1

# Raw SQL Connection (untuk seed)
DB_HOST=localhost
DB_USER=taufiq_user
DB_PASSWORD=password_kamu
DB_NAME=taufiq_store_1

# Server Port
PORT=3000

# JWT Secret (ganti dengan random string yang aman)
JWT_SECRET=taufiq_store_secret_production_2026_secure_key
```

**Simpan file:** `CTRL + X`, lalu `Y`, lalu `Enter`

> ⚠️ **PENTING:** Ganti `password_kamu` dengan password yang kamu buat di step 3.2!

---

## 🌱 Langkah 5: Seed Database

### 5.1 Generate Prisma Client
```bash
npx prisma generate
```

### 5.2 Jalankan Seed Script
```bash
node prisma/seed-raw.js
```

**Output yang diharapkan:**
```
🌱 Seeding database with raw SQL...
🧹 Clearing existing data...
✅ Tables cleared
✅ Categories created
✅ Products created
✅ Variants created
✅ Payment methods created
✅ Store settings created
✅ Super Admin created (username: admin, password: admin123)
🎉 Seeding completed!
```

> ✅ **Selamat!** Database kamu sudah terisi dengan:
> - Super Admin: `admin` / `admin123`
> - 8 Products dengan variants
> - 3 Payment methods
> - Store settings

---

## 🚀 Langkah 6: Jalankan Backend

### 6.1 Test Jalankan Manual (untuk testing)
```bash
npm start
```

Kalau berhasil, akan muncul:
```
Server running on http://localhost:3000
```

Test dengan CTRL + C untuk stop, lalu lanjut ke langkah berikutnya.

### 6.2 Jalankan dengan PM2 (Production)
```bash
# Jalankan dengan PM2
pm2 start src/index.js --name taufiq-store-backend

# Lihat status
pm2 status

# Lihat logs
pm2 logs taufiq-store-backend

# Save PM2 process (biar auto-start saat reboot)
pm2 save
pm2 startup
```

---

## 🔍 Langkah 7: Verifikasi

### 7.1 Cek Status Backend
```bash
pm2 status
```

Output yang diharapkan:
```
┌────┬────────────────────────┬─────────┬─────────┐
│ id │ name                   │ status  │ cpu     │
├────┼────────────────────────┼─────────┼─────────┤
│ 0  │ taufiq-store-backend   │ online  │ 0%      │
└────┴────────────────────────┴─────────┴─────────┘
```

### 7.2 Test API Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Kalau berhasil, akan dapat response JSON dengan token.

---

## 🌐 Langkah 8: Setup Nginx (Optional - untuk akses dari luar)

### 8.1 Install Nginx
```bash
apt install -y nginx
```

### 8.2 Buat Konfigurasi Nginx
```bash
nano /etc/nginx/sites-available/taufiq-store
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name 151.240.0.104;  # Ganti dengan domain kamu jika ada

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 8.3 Aktifkan Konfigurasi
```bash
# Buat symbolic link
ln -s /etc/nginx/sites-available/taufiq-store /etc/nginx/sites-enabled/

# Test konfigurasi
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 8.4 Test dari Browser
Buka browser dan akses:
```
http://151.240.0.104/api/admin/login
```

---

## 🔄 Langkah 9: Update Code (untuk update selanjutnya)

Kalau ada update code dari GitHub:

```bash
cd /var/www/store
git pull origin main
cd backend
npm install
npx prisma generate
pm2 restart taufiq-store-backend
```

---

## 📝 Perintah-Perintah Berguna

### PM2 Commands
```bash
pm2 status                          # Lihat status semua process
pm2 logs taufiq-store-backend       # Lihat logs
pm2 restart taufiq-store-backend    # Restart aplikasi
pm2 stop taufiq-store-backend       # Stop aplikasi
pm2 delete taufiq-store-backend     # Hapus dari PM2
```

### Database Commands
```bash
mysql -u taufiq_user -p taufiq_store_1              # Login ke database
node prisma/seed-raw.js                             # Seed ulang database
npx prisma db pull                                  # Pull schema dari database
```

### Git Commands
```bash
git pull origin main                # Pull update terbaru
git status                          # Lihat status perubahan
git log --oneline -5                # Lihat 5 commit terakhir
```

---

## 🆘 Troubleshooting

### Backend tidak jalan
```bash
# Cek logs
pm2 logs taufiq-store-backend

# Cek port sudah terpakai atau belum
netstat -tulpn | grep 3000

# Restart backend
pm2 restart taufiq-store-backend
```

### Database connection error
```bash
# Cek MySQL jalan atau tidak
systemctl status mariadb

# Cek .env file sudah benar
cat /var/www/store/backend/.env

# Test koneksi database
mysql -u taufiq_user -p -h localhost taufiq_store_1
```

### Seed error
```bash
# Cek DATABASE_URL dan DB_* di .env sudah benar
# Pastikan database sudah dibuat
# Jalankan ulang seed
node prisma/seed-raw.js
```

---

## 🎯 Credential Default

### Admin Dashboard
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** SUPER_ADMIN

> ⚠️ **PENTING:** Ganti password admin setelah login pertama kali!

---

## ✅ Checklist Install

- [ ] Node.js terinstall (v20.x)
- [ ] MariaDB terinstall dan running
- [ ] Git terinstall
- [ ] PM2 terinstall
- [ ] Repository di-clone ke `/var/www/store`
- [ ] Dependencies terinstall (`npm install`)
- [ ] Database dibuat (`taufiq_store_1`)
- [ ] User database dibuat
- [ ] File `.env` dikonfigurasi dengan benar
- [ ] Prisma Client di-generate
- [ ] Database di-seed
- [ ] Backend jalan dengan PM2
- [ ] API bisa diakses (test login berhasil)
- [ ] Nginx dikonfigurasi (optional)

---

## 📞 Support

Jika ada masalah:
1. Cek logs: `pm2 logs taufiq-store-backend`
2. Cek database: `mysql -u taufiq_user -p`
3. Cek .env file: pastikan kredensial benar
4. Restart: `pm2 restart taufiq-store-backend`

---

**🎉 Selamat! Backend Taufiq Store sudah jalan di VPS!**

Repository: https://github.com/taufiqhida/store

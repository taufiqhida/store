# 🛍️ Taufiq Store - E-Commerce Platform

Modern e-commerce web application dengan fitur multi-admin dan role-based access control (RBAC).

## ✨ Features

### Customer Features
- 🏪 Product browsing dengan kategori
- 🛒 Shopping cart & checkout
- 💳 Multiple payment methods
- ⚡ Flash sale products
- 💬 Customer testimonials
- 📰 Articles & blog

### Admin Features
- 📊 Dashboard dengan analytics
- 📦 Product & category management
- 💰 Order management
- 💳 Payment method configuration
- 🏷️ Discount codes
- ⚡ Flash sale management
- 💬 Testimonial moderation
- 📰 Article publishing
- **👥 Multi-Admin System**
  - Multiple admin accounts
  - Role-based permissions (Super Admin / Admin)
  - Granular access control per menu
  - Soft delete & restore admin users
  - Permission-based UI filtering

## 🚀 Tech Stack

**Frontend:**
- Vue 3 (Composition API)
- Vue Router
- Axios
- Vite

**Backend:**
- Node.js + Express
- MySQL + Prisma ORM
- JWT Authentication
- bcryptjs for password hashing

## 📋 Prerequisites

Sebelum instalasi, pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) (v16 atau lebih baru)
- [MySQL](https://www.mysql.com/) (v8.0 atau lebih baru)
- npm atau yarn package manager

## 📥 Installation

### 1. Clone Repository

```bash
git clone https://github.com/taufiqhida/store.git
cd store
```

### 2. Setup Database

Buat database MySQL baru:

```sql
CREATE DATABASE taufiq_store;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit file `.env` di folder backend:

```env
DATABASE_URL="mysql://username:password@localhost:3306/taufiq_store"
JWT_SECRET="your-secret-key-here-change-this-in-production"
PORT=3000
```

**Ganti:**
- `username` dengan MySQL username Anda
- `password` dengan MySQL password Anda
- `taufiq_store` dengan nama database yang Anda buat
- `your-secret-key-here-change-this-in-production` dengan secret key yang aman

```bash
# Push database schema
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed super admin (default credentials)
node seed-super-admin.js

# Start backend server
npm start
```

Backend akan berjalan di `http://localhost:3000`

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit file `.env` di folder frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

```bash
# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 🔐 Default Admin Credentials

Setelah menjalankan seed script, gunakan credentials berikut untuk login:

- **Username:** `admin`
- **Password:** `password123`

> ⚠️ **PENTING:** Segera ubah password default setelah login pertama kali!

## 🎯 Usage

### Customer Access
- Buka browser: `http://localhost:5173`
- Browse produk, tambah ke cart, checkout

### Admin Access
1. Buka: `http://localhost:5173/admin/login`
2. Login dengan credentials default
3. Akses dashboard untuk mengelola:
   - Orders
   - Products & Categories
   - Payment Methods
   - Discounts & Flash Sales
   - Testimonials
   - Articles
   - **Admin Users** (Super Admin only)

### Multi-Admin Management

**Membuat Admin Baru:**
1. Login sebagai Super Admin
2. Klik tab **👥 Admin Users**
3. Klik **➕ Tambah Admin**
4. Isi form:
   - Username
   - Password
   - Nama lengkap
   - Email (optional)
   - **Role:** Admin atau Super Admin
   - **Permissions:** Pilih menu yang bisa diakses
5. Klik **Simpan**

**Permission Types:**
- `orders` - Kelola pesanan
- `products` - Kelola produk
- `categories` - Kelola kategori
- `payments` - Kelola metode pembayaran
- `discounts` - Kelola diskon
- `flashsales` - Kelola flash sale
- `testimonials` - Kelola testimoni
- `articles` - Kelola artikel
- `settings` - Kelola pengaturan toko
- `admin_users` - Kelola admin users (Super Admin only)

**Soft Delete & Restore:**
- Klik 🗑️ untuk nonaktifkan admin
- Klik ♻️ untuk mengaktifkan kembali
- Admin yang nonaktif tidak bisa login

## 📁 Project Structure

```
taufiq/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Database connection
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT authentication
│   │   └── routes/
│   │       ├── admin.js           # Admin routes
│   │       ├── auth.js            # Admin user management
│   │       ├── categories.js
│   │       ├── products.js
│   │       ├── orders.js
│   │       └── ...
│   ├── seed-super-admin.js        # Super admin seeder
│   └── server.js                  # Express server
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/             # Admin components
    │   │   │   ├── AdminHeader.vue
    │   │   │   ├── AdminTabs.vue
    │   │   │   ├── ProductsTab.vue
    │   │   │   ├── AdminUsersTab.vue
    │   │   │   └── ...
    │   │   └── modals/            # Modal components
    │   │       ├── ProductModal.vue
    │   │       ├── AdminUserModal.vue
    │   │       └── ...
    │   ├── composables/
    │   │   └── usePermissions.js  # Permission management
    │   ├── services/
    │   │   └── api.js             # API client
    │   ├── views/
    │   │   ├── Home.vue           # Customer homepage
    │   │   ├── AdminLogin.vue
    │   │   └── AdminDashboard.vue
    │   └── router/
    │       └── index.js           # Vue Router config
    └── ...
```

## 🔧 Development

### Database Management

```bash
# Open Prisma Studio (Database GUI)
cd backend
npx prisma studio

# Reset database (⚠️ akan hapus semua data!)
npx prisma db push --force-reset

# Seed super admin lagi
node seed-super-admin.js
```

### Build for Production

**Backend:**
```bash
cd backend
# Already production-ready, just ensure .env is configured
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Output akan ada di folder dist/
```

## 📝 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get current admin info

### Admin User Management (Super Admin only)
- `GET /api/admin/users` - Get all admin users
- `POST /api/admin/users` - Create admin user
- `PUT /api/admin/users/:id` - Update admin user
- `DELETE /api/admin/users/:id` - Soft delete admin
- `POST /api/admin/users/:id/restore` - Restore admin

### Products & Categories
- `GET /api/products` - Get all products
- `GET /api/categories` - Get all categories
- `POST /api/admin/products` - Create product (auth required)
- `PUT /api/admin/products/:id` - Update product (auth required)
- `DELETE /api/admin/products/:id` - Delete product (auth required)

### Orders
- `POST /api/orders` - Create order
- `GET /api/admin/orders` - Get all orders (auth required)
- `PUT /api/admin/orders/:id` - Update order status (auth required)

_Dan masih banyak endpoint lainnya..._

## 🐛 Troubleshooting

### Database Connection Error
- Pastikan MySQL service berjalan
- Check credentials di `.env`
- Pastikan database sudah dibuat

### Port Already in Use
- Frontend: Edit `vite.config.js` untuk ganti port
- Backend: Edit `PORT` di `.env`

### Admin Users Tab Tidak Muncul
- Pastikan login sebagai Super Admin
- Check localStorage: `adminRole` harus `SUPER_ADMIN`
- Clear browser cache dan login ulang

### Permission Not Working
- Logout dan login ulang
- Check browser console untuk errors
- Verify `adminPermissions` dan `adminRole` di localStorage

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

**Taufiq Hida**
- GitHub: [@taufiqhida](https://github.com/taufiqhida)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by best practices in e-commerce platforms
- Multi-admin system for scalable team management

---

**⭐ Jika project ini membantu, jangan lupa kasih star di GitHub!**

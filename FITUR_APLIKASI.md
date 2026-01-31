# 📋 DOKUMENTASI FITUR TAUFIQ STORE

## 🌐 Status Aplikasi
- **Backend**: ✅ Berjalan di http://localhost:3000
- **Frontend**: ✅ Berjalan di http://localhost:5173
- **Database**: MySQL (taufiq_store_1)

---

## 🎯 FITUR UTAMA

### 1️⃣ **HALAMAN PUBLIC (Customer)**

#### 🏠 Hero Section
- Landing page dengan animasi menarik
- Menampilkan nama toko dan tagline
- Preview testimoni pelanggan
- Tombol "Masuk Toko" untuk melanjutkan belanja

#### 🛍️ Katalog Produk
- **Grid produk** dengan tampilan card yang menarik
- **Filter kategori** - Filter produk berdasarkan kategori
- **Search produk** - Pencarian produk by nama
- **Pagination** - Navigasi halaman produk (12 produk per halaman)
- **Badge produk** - Label khusus pada produk (New, Hot, Promo, dll)
- **Rating & review** - Tampilan rating dan jumlah review
- **Harga tercoret** - Untuk produk dengan diskon
- **Status stock** - Indikator ketersediaan produk

#### ⚡ Flash Sale
- Tampilan countdown timer untuk setiap flash sale
- Diskon dalam bentuk persentase
- Badge flash sale pada produk
- Periode aktif flash sale (start date - end date)

#### 🛒 Keranjang Belanja (Shopping Cart)
- **Add to cart** - Tambah produk ke keranjang
- **Cart slider** - Panel samping untuk melihat isi keranjang
- **Update quantity** - Ubah jumlah item di keranjang
- **Remove item** - Hapus item dari keranjang
- **Subtotal calculation** - Kalkulasi otomatis total belanja
- **Unique code** - Kode unik untuk identifikasi pembayaran
- **Booking code** - Kode pemesanan untuk keranjang
- **Toast notification** - Notifikasi saat produk ditambahkan ke cart

#### 🛍️ Product Detail Modal
- **Pilih varian produk** - Pilihan size, warna, dll
- **Quantity selector** - Pilih jumlah pembelian
- **Metode pembayaran** - Pilih metode pembayaran (Transfer Bank, E-Wallet, QRIS, COD)
- **Payment fee** - Biaya admin (fixed atau percentage)
- **Kode diskon** - Input dan validasi kode diskon
- **Discount calculation** - Kalkulasi otomatis potongan harga
- **Min purchase validation** - Validasi minimal pembelian untuk diskon
- **Max discount** - Batas maksimal potongan
- **Buyer message** - Catatan dari pembeli
- **Total calculation** - Kalkulasi: subtotal - diskon + biaya admin + kode unik

#### 💬 Sistem Testimoni
- **Submit testimoni** - Form kirim testimoni dengan:
  - Order code (kode pemesanan)
  - Nama pelanggan
  - Isi testimoni
  - Rating (1-5 bintang)
- **View testimonials** - Tampilan testimoni yang sudah disetujui
- **Rating summary** - Average rating dan total reviews
- **Approval system** - Testimoni harus disetujui admin dahulu

#### 💳 Checkout & Order
- **Direct checkout** - Checkout langsung dari product modal
- **Cart checkout** - Checkout multiple items dari keranjang
- **WhatsApp integration** - Otomatis buka WhatsApp dengan detail pesanan
- **Order code** - Generate kode unik untuk setiap pesanan
- **Order success modal** - Konfirmasi pesanan berhasil
- **Copy order code** - Salin kode pesanan

#### 📰 Artikel/Blog
- Daftar artikel yang dipublikasi
- Detail artikel dengan slug URL
- Thumbnail artikel
- Tanggal publikasi

#### 🏪 Site Mode
- **Live Mode** - Toko beroperasi normal
- **Coming Soon Mode** - Halaman coming soon dengan countdown
- **Maintenance Mode** - Halaman maintenance dengan estimasi selesai

#### 📱 Floating WhatsApp Button
- Tombol floating untuk chat langsung ke WhatsApp toko
- Menampilkan nomor WhatsApp dari settings

#### 🎨 Design Elements
- Responsive design (mobile, tablet, desktop)
- Dark/Light mode toggle
- Smooth animations & transitions
- Loading states
- Error handling

---

### 2️⃣ **DASHBOARD ADMIN**

#### 🔐 Login Admin
- Username & password authentication
- JWT token untuk session
- Redirect ke dashboard setelah login

#### 📊 Analytics Dashboard
- Total pesanan
- Total revenue
- Pending orders
- Completed orders
- Cancelled orders
- Order statistics

#### 📋 Manajemen Pesanan (Orders)
- **View orders** - Daftar semua pesanan
- **Order detail** - Detail lengkap pesanan:
  - Kode pesanan
  - Nama produk & varian
  - Quantity & harga
  - Metode pembayaran
  - Customer info
  - Total pembayaran
  - Status pesanan
  - Waktu pemesanan
- **Update status** - Ubah status:
  - PENDING (Menunggu Konfirmasi)
  - CONFIRMED (Dikonfirmasi) 
  - PROCESSING (Diproses)
  - SHIPPED (Dikirim)
  - DELIVERED (Selesai)
  - CANCELLED (Dibatalkan)
- **Delete order** - Hapus pesanan
- **Filter & search** - Cari dan filter pesanan
- **Pagination** - 10 pesanan per halaman

#### 📦 Manajemen Produk (Products)
- **Add product** - Tambah produk baru
- **Edit product** - Edit data produk
- **Delete product** - Hapus produk
- **Product fields**:
  - Nama produk
  - Slug (URL-friendly)
  - Deskripsi
  - Gambar produk
  - Badge (New, Hot, Promo, dll)
  - Kategori
  - Status aktif/nonaktif
- **Product variants**:
  - Nama varian (Size M, L, XL, dll)
  - Harga varian
  - Harga asli (untuk coret harga)
  - Warranty option
  - Stock status
- **Image upload** - Upload gambar produk
- **Pagination** - 10 produk per halaman

#### 📁 Manajemen Kategori (Categories)
- **Add category** - Tambah kategori baru
- **Edit category** - Edit nama kategori
- **Delete category** - Hapus kategori
- **Category fields**:
  - Nama kategori
  - Slug (URL-friendly)

#### 💳 Manajemen Pembayaran (Payments)
- **Add payment** - Tambah metode pembayaran
- **Edit payment** - Edit data pembayaran
- **Delete payment** - Hapus metode
- **Payment fields**:
  - Nama metode (BCA, Mandiri, OVO, QRIS, dll)
  - Icon (emoji atau upload image)
  - Account info (Nomor rekening/HP)
  - Fee type (Fixed atau Percentage)
  - Fee amount
  - Currency (IDR, USD, dll)
  - QRIS image (untuk QRIS payment)
  - Status aktif/nonaktif

#### 🏷️ Manajemen Diskon (Discounts)
- **Add discount** - Tambah kode diskon
- **Edit discount** - Edit data diskon
- **Delete discount** - Hapus diskon
- **Discount fields**:
  - Kode diskon (PROMO10, DISKON50K, dll)
  - Nama diskon
  - Type (Fixed amount atau Percentage)
  - Nilai diskon
  - Max discount (batas maksimal potongan)
  - Min purchase (minimal belanja)
  - Apply to (All products atau specific products)
  - Product selection (untuk diskon tertentu)
  - Usage limit (batas pemakaian)
  - Expiry date (tanggal kadaluarsa)
  - Status aktif/nonaktif

#### ⚡ Manajemen Flash Sale
- **Add flash sale** - Tambah flash sale
- **Edit flash sale** - Edit data flash sale
- **Delete flash sale** - Hapus flash sale
- **Flash sale fields**:
  - Title (judul flash sale)
  - Description
  - Product (pilih produk)
  - Variant (opsional, pilih varian tertentu)
  - Discount percent (persentase diskon)
  - Start date & time
  - End date & time
  - Status aktif/nonaktif

#### 💬 Manajemen Testimoni
- **View testimonials** - Semua testimoni (approved & pending)
- **Approve testimonial** - Setujui testimoni
- **Reject testimonial** - Tolak testimoni
- **Delete testimonial** - Hapus testimoni
- **Testimonial info**:
  - Order code
  - Nama customer
  - Isi testimoni
  - Rating (1-5 bintang)
  - Status (Approved/Pending)
  - Tanggal submit

#### 📰 Manajemen Artikel
- **Add article** - Tambah artikel baru
- **Edit article** - Edit artikel
- **Delete article** - Hapus artikel
- **Article fields**:
  - Title
  - Slug (URL-friendly)
  - Content (rich text)
  - Thumbnail image
  - Publish status

#### ⚙️ Settings (Pengaturan Toko)
- **Store info**:
  - Nama toko
  - Tagline
  - Deskripsi
  - Nomor WhatsApp
  - Alamat
- **Site mode**:
  - Live (normal)
  - Coming Soon (dengan tanggal target)
  - Maintenance (dengan pesan & estimasi selesai)
- **Coming soon settings**:
  - Message
  - Target date
- **Maintenance settings**:
  - Message
  - End date

#### 🔑 Update Credentials
- Update username admin
- Update password admin
- Validasi current password

#### 📤 Image Upload
- Upload gambar produk
- Upload gambar artikel
- Upload QRIS payment
- Supported formats: JPG, PNG, GIF, WEBP

---

## 🗂️ STRUKTUR FILE

### Backend (`/backend`)
```
backend/
├── src/
│   ├── index.js              # Entry point
│   ├── routes/               # API routes
│   ├── controllers/          # Business logic
│   └── middleware/           # Auth & validation
├── prisma/
│   └── schema.prisma         # Database schema
├── uploads/                  # Uploaded images
└── .env                      # Environment config
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── App.vue              # Main app component
│   ├── RootApp.vue          # Router wrapper
│   ├── main.js              # Entry point
│   ├── style.css            # Global styles
│   ├── components/
│   │   ├── public/          # Customer components
│   │   │   ├── HeroSection.vue
│   │   │   ├── Navbar.vue
│   │   │   ├── ProductGrid.vue
│   │   │   ├── FlashSaleSection.vue
│   │   │   ├── CartSlider.vue
│   │   │   ├── ProductCheckoutModal.vue
│   │   │   ├── TestimonialSection.vue
│   │   │   ├── TestimonialModal.vue
│   │   │   ├── WhatsAppFloat.vue
│   │   │   ├── ComingSoonPage.vue
│   │   │   ├── MaintenancePage.vue
│   │   │   └── Footer.vue
│   │   ├── admin/           # Admin components
│   │   │   ├── AdminHeader.vue
│   │   │   ├── AdminTabs.vue
│   │   │   ├── OrdersTab.vue
│   │   │   ├── ProductsTab.vue
│   │   │   ├── CategoriesTab.vue
│   │   │   ├── PaymentsTab.vue
│   │   │   ├── DiscountsTab.vue
│   │   │   ├── FlashSalesTab.vue
│   │   │   ├── TestimonialsTab.vue
│   │   │   └── ArticlesTab.vue
│   │   └── modals/          # Modal components
│   │       ├── ProductModal.vue
│   │       ├── CategoryModal.vue
│   │       ├── PaymentModal.vue
│   │       ├── DiscountModal.vue
│   │       ├── FlashSaleModal.vue
│   │       ├── ArticleModal.vue
│   │       ├── SettingsModal.vue
│   │       ├── CredentialsModal.vue
│   │       └── OrderDetailModal.vue
│   ├── views/
│   │   ├── AdminLogin.vue
│   │   ├── AdminDashboard.vue
│   │   ├── ArticleList.vue
│   │   └── ArticleDetail.vue
│   ├── services/
│   │   └── api.js           # API calls
│   └── composables/
│       └── useCart.js       # Cart state management
└── .env                     # Environment config
```

---

## 🔗 API ENDPOINTS

### Public Endpoints
- `GET /api/products` - Daftar produk
- `GET /api/products/:id` - Detail produk
- `GET /api/categories` - Daftar kategori
- `GET /api/payment-methods` - Metode pembayaran
- `GET /api/flash-sales` - Flash sale aktif
- `GET /api/testimonials` - Testimoni approved
- `POST /api/testimonials` - Submit testimoni
- `GET /api/articles` - Daftar artikel
- `GET /api/articles/:slug` - Detail artikel
- `POST /api/orders` - Buat pesanan
- `POST /api/validate-discount` - Validasi kode diskon
- `GET /api/settings` - Settings toko

### Admin Endpoints (Require Auth)
- `POST /api/admin/login` - Login admin
- `GET /api/admin/products` - Manage products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- (Dan seterusnya untuk semua resource...)

---

## 🚀 CARA MENJALANKAN

### Backend
```bash
cd backend
npm start
```
Server akan berjalan di: **http://localhost:3000**

### Frontend
```bash
cd frontend
npm run dev
```
App akan berjalan di: **http://localhost:5173**

---

## 🔐 DEFAULT LOGIN ADMIN

**Username**: `admin`  
**Password**: `password123`

---

## 💡 FITUR UNGGULAN

### ✨ Untuk Customer:
1. **Keranjang Belanja** - Belanja multiple produk sekaligus
2. **Flash Sale** - Diskon terbatas dengan countdown
3. **Kode Diskon** - Support multiple jenis diskon
4. **WhatsApp Integration** - Order langsung ke WhatsApp
5. **Testimoni System** - Review produk dengan rating
6. **Responsive Design** - Mobile-friendly
7. **Site Mode** - Coming soon & maintenance mode

### 🎯 Untuk Admin:
1. **Complete Dashboard** - Kelola semua aspek toko
2. **Order Management** - Track dan update status pesanan
3. **Product Management** - CRUD produk dengan variants
4. **Discount System** - Flexible discount rules
5. **Flash Sale** - Time-based promotions
6. **Testimonial Moderation** - Approve/reject reviews
7. **Analytics** - Order statistics
8. **Image Upload** - Easy image management
9. **Settings Control** - Customize toko
10. **Multi Payment** - Support berbagai metode pembayaran

---

## 📱 AKSES APLIKASI

- **Customer App**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin/login
- **API Documentation**: Lihat file `API_DOCUMENTATION.md`

---

## 🎨 TEKNOLOGI YANG DIGUNAKAN

### Frontend:
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Build tool
- **Vue Router** - Routing
- **Axios** - HTTP client

### Backend:
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - ORM (Object-Relational Mapping)
- **MySQL** - Database
- **JWT** - Authentication
- **Multer** - File upload

---

## 📝 CATATAN PENTING

1. ✅ File `.env` frontend sudah diubah ke `http://localhost:3000/api`
2. ✅ Backend dan frontend sudah berjalan
3. 📱 Buka browser dan akses **http://localhost:5173**
4. 🔑 Login admin di **http://localhost:5173/admin/login**
5. 💾 Database: `taufiq_store_1` di MySQL

---

## 🆘 TROUBLESHOOTING

- Jika backend error, cek apakah MySQL sudah running
- Jika frontend tidak connect, pastikan backend sudah running
- Clear browser cache jika ada masalah tampilan
- Cek console browser untuk error messages

---

**Dibuat oleh**: Antigravity AI Assistant  
**Tanggal**: 31 Januari 2026  
**Website**: http://localhost:5173

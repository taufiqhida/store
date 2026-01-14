# API Documentation - Taufiq Store

## Base URL
```
http://localhost:3000/api
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://root:@localhost:3306/taufiq_store_1"
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Authentication

### Admin Login
**POST** `/admin/login`

Request Body:
```json
{
  "username": "admin",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

---

## Public Endpoints

### Products

#### Get All Products
**GET** `/products`

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category ID |
| search | string | Search by product name |

Response:
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "price": 50000,
    "stock": 100,
    "image": "http://localhost:3000/uploads/image.jpg",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Category Name"
    },
    "variants": [...]
  }
]
```

#### Get Product by ID
**GET** `/products/:id`

Response:
```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "price": 50000,
  "stock": 100,
  "image": "http://localhost:3000/uploads/image.jpg",
  "categoryId": 1,
  "variants": [...]
}
```

---

### Categories

#### Get All Categories
**GET** `/categories`

Response:
```json
[
  {
    "id": 1,
    "name": "Category Name",
    "description": "Category description"
  }
]
```

---

### Payment Methods

#### Get All Payment Methods
**GET** `/payment-methods`

Response:
```json
[
  {
    "id": 1,
    "name": "Bank Transfer",
    "accountNumber": "1234567890",
    "accountName": "Store Name",
    "isActive": true
  }
]
```

---

### Flash Sales

#### Get Active Flash Sales
**GET** `/flash-sales`

Response:
```json
[
  {
    "id": 1,
    "productId": 1,
    "variantId": null,
    "discountPercent": 20,
    "startDate": "2026-01-01T00:00:00.000Z",
    "endDate": "2026-01-31T23:59:59.000Z",
    "isActive": true,
    "product": {...}
  }
]
```

---

### Testimonials

#### Get Approved Testimonials
**GET** `/testimonials`

Response:
```json
[
  {
    "id": 1,
    "name": "Customer Name",
    "message": "Great product!",
    "rating": 5,
    "isApproved": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

#### Submit Testimonial
**POST** `/testimonials`

Request Body:
```json
{
  "name": "Customer Name",
  "message": "Great product!",
  "rating": 5
}
```

---

### Articles

#### Get All Published Articles
**GET** `/articles`

Response:
```json
[
  {
    "id": 1,
    "title": "Article Title",
    "slug": "article-title",
    "content": "Article content...",
    "thumbnail": "http://localhost:3000/uploads/article.jpg",
    "isPublished": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

#### Get Article by Slug
**GET** `/articles/:slug`

Response:
```json
{
  "id": 1,
  "title": "Article Title",
  "slug": "article-title",
  "content": "Article content...",
  "thumbnail": "http://localhost:3000/uploads/article.jpg",
  "isPublished": true,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

### Orders

#### Create Order
**POST** `/orders`

Request Body:
```json
{
  "customerName": "John Doe",
  "customerPhone": "081234567890",
  "customerAddress": "Jl. Example No. 123",
  "items": [
    {
      "productId": 1,
      "variantId": null,
      "quantity": 2,
      "price": 50000
    }
  ],
  "paymentMethodId": 1,
  "subtotal": 100000,
  "discountCode": "PROMO10",
  "discountAmount": 10000,
  "total": 90000
}
```

Response:
```json
{
  "success": true,
  "order": {
    "id": 1,
    "invoiceCode": "INV-20260114-001",
    "customerName": "John Doe",
    "total": 90000,
    "status": "PENDING"
  },
  "whatsappUrl": "https://wa.me/..."
}
```

---

### Discounts

#### Validate Discount Code
**POST** `/validate-discount`

Request Body:
```json
{
  "code": "PROMO10",
  "productId": 1,
  "subtotal": 100000
}
```

Response:
```json
{
  "valid": true,
  "discount": {
    "id": 1,
    "code": "PROMO10",
    "type": "PERCENTAGE",
    "value": 10,
    "minPurchase": 50000
  },
  "discountAmount": 10000
}
```

---

### Settings

#### Get Store Settings
**GET** `/settings`

Response:
```json
{
  "storeName": "Taufiq Store",
  "storeDescription": "Your trusted online store",
  "whatsappNumber": "081234567890",
  "address": "Jl. Example No. 123"
}
```

---

## Admin Endpoints

> **Note:** All admin endpoints require `Authorization: Bearer <token>` header

### Products (Admin)

#### Get All Products
**GET** `/admin/products`

#### Create Product
**POST** `/admin/products`

Request Body:
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 50000,
  "stock": 100,
  "categoryId": 1,
  "image": "http://localhost:3000/uploads/image.jpg",
  "variants": [
    {
      "name": "Size M",
      "price": 50000,
      "stock": 50
    }
  ]
}
```

#### Update Product
**PUT** `/admin/products/:id`

#### Delete Product
**DELETE** `/admin/products/:id`

---

### Categories (Admin)

#### Get All Categories
**GET** `/admin/categories`

#### Create Category
**POST** `/admin/categories`

Request Body:
```json
{
  "name": "Category Name",
  "description": "Category description"
}
```

#### Update Category
**PUT** `/admin/categories/:id`

#### Delete Category
**DELETE** `/admin/categories/:id`

---

### Payment Methods (Admin)

#### Get All Payment Methods
**GET** `/admin/payment-methods`

#### Create Payment Method
**POST** `/admin/payment-methods`

Request Body:
```json
{
  "name": "Bank BCA",
  "accountNumber": "1234567890",
  "accountName": "Taufiq Store",
  "isActive": true
}
```

#### Update Payment Method
**PUT** `/admin/payment-methods/:id`

#### Delete Payment Method
**DELETE** `/admin/payment-methods/:id`

---

### Discounts (Admin)

#### Get All Discounts
**GET** `/admin/discounts`

#### Create Discount
**POST** `/admin/discounts`

Request Body:
```json
{
  "code": "PROMO10",
  "type": "PERCENTAGE",
  "value": 10,
  "minPurchase": 50000,
  "maxDiscount": 20000,
  "usageLimit": 100,
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "isActive": true,
  "productId": null
}
```

#### Update Discount
**PUT** `/admin/discounts/:id`

#### Delete Discount
**DELETE** `/admin/discounts/:id`

---

### Flash Sales (Admin)

#### Get All Flash Sales
**GET** `/admin/flash-sales`

#### Create Flash Sale
**POST** `/admin/flash-sales`

Request Body:
```json
{
  "productId": 1,
  "variantId": null,
  "discountPercent": 20,
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2026-01-31T23:59:59.000Z",
  "isActive": true
}
```

#### Update Flash Sale
**PUT** `/admin/flash-sales/:id`

#### Delete Flash Sale
**DELETE** `/admin/flash-sales/:id`

---

### Testimonials (Admin)

#### Get All Testimonials
**GET** `/admin/testimonials`

#### Update Testimonial (Approve/Reject)
**PUT** `/admin/testimonials/:id`

Request Body:
```json
{
  "isApproved": true
}
```

#### Delete Testimonial
**DELETE** `/admin/testimonials/:id`

---

### Articles (Admin)

#### Get All Articles
**GET** `/admin/articles`

#### Create Article
**POST** `/admin/articles`

Request Body:
```json
{
  "title": "Article Title",
  "content": "Article content...",
  "thumbnail": "http://localhost:3000/uploads/article.jpg",
  "isPublished": true
}
```

#### Update Article
**PUT** `/admin/articles/:id`

#### Delete Article
**DELETE** `/admin/articles/:id`

---

### Settings (Admin)

#### Update Settings
**PUT** `/admin/settings`

Request Body:
```json
{
  "storeName": "Taufiq Store",
  "storeDescription": "Your trusted online store",
  "whatsappNumber": "081234567890",
  "address": "Jl. Example No. 123"
}
```

---

### Admin Credentials

#### Update Admin Credentials
**PUT** `/admin/credentials`

Request Body:
```json
{
  "username": "newadmin",
  "password": "newpassword123"
}
```

---

### File Upload

#### Upload Image
**POST** `/admin/upload`

Request: `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| image | File | Image file (jpg, png, gif, webp) |

Response:
```json
{
  "success": true,
  "url": "http://localhost:3000/uploads/filename.jpg"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message here"
}
```

Common HTTP Status Codes:
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

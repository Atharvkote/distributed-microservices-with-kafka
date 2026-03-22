# Multi-Vendor ECommerce Platform - Complete API Documentation

**Last Updated:** March 21, 2026  
**Platform Version:** 1.0.0

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Authentication](#authentication)
3. [Catalog Service](#catalog-service)
4. [Identity Service](#identity-service)
5. [Messaging Service](#messaging-service)
6. [Orders Service](#orders-service)
7. [Payment Service](#payment-service)
8. [Analytics Service](#analytics-service)
9. [Cross-Service Integration](#cross-service-integration)
10. [Common Patterns & Middleware](#common-patterns--middleware)

---

## System Architecture

### Overview
Multi-vendor ecommerce platform using microservices architecture with the following components:

- **Frontend:** React + TypeScript (Vite)
- **Services:** 6 independent microservices (Express.js)
- **Database:** MongoDB (document-oriented)
- **Event Streaming:** Apache Kafka
- **Caching/Queues:** Redis
- **Payment Gateway:** Razorpay
- **File Storage:** Cloudinary
- **Authentication:** JWT (RS256 - RSA)

### Service Ports
All services run on dynamic ports from environment variables. Common pattern:
```
CATALOG_SERVICE_PORT=3001
IDENTITY_SERVICE_PORT=3002
ORDERS_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
MESSAGING_SERVICE_PORT=3005
ANALYTICS_SERVICE_PORT=3006
```

### Key Technologies Across Services
- **Express.js** - HTTP server framework
- **Mongoose** - MongoDB ODM
- **Zod** - Input validation & schema parsing
- **Multer** - File upload handling
- **Cloudinary SDK** - Image management
- **Kafka Client** - Event streaming
- **Socket.IO** - Real-time communication (Messaging)
- **BullMQ** - Queue management (Messaging)
- **JWT (jsonwebtoken)** - Token creation/verification
- **Bcrypt** - Password hashing

---

## Authentication

### JWT Token Details

**Algorithm:** RS256 (RSA with SHA256)  
**Expiry:** 15 minutes  
**Storage Location:**
- Private Key: `services/{service}/keys/jwt_private.pem`
- Public Key: `services/{service}/keys/jwt_public.pem`

### Token Payload Structure
```json
{
  "sub": "userId",
  "email": "user@example.com",
  "full_name": "User Full Name",
  "isVendor": true,
  "vendorId": "vendorId or null",
  "iat": 1626700000,
  "exp": 1626700900,
  "iss": "identity-service"
}
```

### Usage in Requests
```http
Authorization: Bearer <JWT_TOKEN>
```

### Auth Middleware
- Extracts JWT from `Authorization: Bearer` header
- Verifies RS256 signature using public key
- Returns **401 Unauthorized** if missing/invalid
- Attaches to `req.user`:
  ```json
  {
    "id": "userId",
    "isVendor": boolean,
    "email": "user@example.com",
    "full_name": "User Name",
    "vendorId": "vendorId or null"
  }
  ```

### Protected vs Public Routes
- **Public:** No auth required (GET queries, catalog browsing)
- **Vendor/Seller:** Requires `isVendor: true` in JWT
- **User:** Any authenticated user
- **Admin:** Special role (reserved for future)

---

## Catalog Service

**Service Port:** `CATALOG_SERVICE_PORT`  
**Base URL:** `http://localhost:${CATALOG_SERVICE_PORT}`  
**Technologies:** Express.js, MongoDB, Mongoose, Cloudinary, Kafka, Redis

### Overview
Manages products, categories, variants, inventory, and reviews. Implements hierarchical category system and multi-image variant handling with Cloudinary integration.

---

### 1. PRODUCT ENDPOINTS

#### 1.1 Get All Public Products
```http
GET /api/products
```

**Description:** Retrieve paginated list of all active products  
**Authentication:** Not required  
**Query Parameters:**
```
page         : number [default: 1, min: 1]
limit        : number [default: 20, min: 1, max: 100]
brand        : string [optional, exact match]
category     : ObjectId [optional, filter by category]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "title": "iPhone 15 Pro",
      "description": "Latest Apple flagship smartphone",
      "category": "65e9b1c2d3e4f5g6h7i8j9k0",
      "brand": "Apple",
      "vendor": "65d8a0b1c2d3e4f5g6h7i8j9",
      "avgRating": 4.5,
      "ratingCount": 234,
      "tags": ["smartphone", "flagship", "5g"],
      "isActive": true,
      "seo": {
        "slug": "iphone-15-pro-1626700800",
        "metaTitle": "iPhone 15 Pro | Official Store",
        "metaDescription": "Latest Apple flagship"
      },
      "createdAt": "2024-03-15T10:00:00Z",
      "updatedAt": "2024-03-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "pages": 23
  }
}
```

---

#### 1.2 Get Product by ID
```http
GET /api/products/:id
```

**Description:** Get full product details with variants and reviews  
**Authentication:** Not required  
**URL Parameters:**
```
id : ObjectId [required, product ID]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "title": "iPhone 15 Pro",
    "description": "Latest Apple flagship smartphone",
    "category": "65e9b1c2d3e4f5g6h7i8j9k0",
    "brand": "Apple",
    "vendor": {
      "_id": "65d8a0b1c2d3e4f5g6h7i8j9",
      "store_name": "Apple Official",
      "store_logo": "https://res.cloudinary.com/...",
      "ratings": 4.8
    },
    "avgRating": 4.5,
    "ratingCount": 234,
    "variants": [
      {
        "_id": "65f2b3c4d5e6f7g8h9i0j1k2",
        "sku": "IP15P-128GB-BLACK",
        "attributes": { "storage": "128GB", "color": "Black" },
        "price": {
          "mrp": 999,
          "sellingPrice": 849,
          "discountPercent": 15
        },
        "images": [
          {"url": "https://res.cloudinary.com/...", "alt": "Front view"}
        ],
        "isActive": true
      }
    ],
    "seo": {
      "slug": "iphone-15-pro-1626700800",
      "metaTitle": "iPhone 15 Pro",
      "metaDescription": "Latest flagship from Apple"
    }
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "message": "Product not found",
  "error": "PRODUCT_NOT_FOUND"
}
```

---

#### 1.3 Create Product (Vendor Only)
```http
POST /api/products
```

**Description:** Create new product listing  
**Authentication:** Required (Vendor)  
**Request Body:**
```json
{
  "title": "iPhone 15 Pro",
  "description": "Latest Apple flagship smartphone with A17 Pro chip",
  "category": "65e9b1c2d3e4f5g6h7i8j9k0",
  "brand": "Apple",
  "tags": ["smartphone", "flagship", "5g"],
  "seo": {
    "metaTitle": "iPhone 15 Pro | Buy Online",
    "metaDescription": "Latest Apple iPhone 15 Pro with advanced features"
  }
}
```

**Validation Rules:**
- `title`: String, required, min 1 char, max 200 chars
- `description`: String, required, min 1 char, unlimited
- `category`: Valid ObjectId, must exist in Category collection
- `brand`: String, optional, max 100 chars
- `tags`: String array, optional, each tag 1-50 chars
- `seo.metaTitle`: String, optional, max 160 chars
- `seo.metaDescription`: String, optional, max 160 chars

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "vendor": "65d8a0b1c2d3e4f5g6h7i8j9",
    "title": "iPhone 15 Pro",
    "description": "Latest Apple flagship smartphone",
    "category": "65e9b1c2d3e4f5g6h7i8j9k0",
    "brand": "Apple",
    "avgRating": 0,
    "ratingCount": 0,
    "tags": ["smartphone", "flagship", "5g"],
    "isActive": true,
    "seo": {
      "slug": "iphone-15-pro-1626700800",
      "metaTitle": "iPhone 15 Pro | Buy Online",
      "metaDescription": "Latest Apple iPhone 15 Pro"
    },
    "createdAt": "2024-03-21T10:00:00Z",
    "updatedAt": "2024-03-21T10:00:00Z"
  }
}
```

**Kafka Event Published:**
```json
{
  "eventType": "productCreated",
  "productId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "vendorId": "65d8a0b1c2d3e4f5g6h7i8j9",
  "timestamp": "2024-03-21T10:00:00Z"
}
```

**Error Response:** `403 Forbidden`
```json
{
  "success": false,
  "message": "Only vendors can create products",
  "error": "VENDOR_REQUIRED"
}
```

---

#### 1.4 Get Vendor's Product
```http
GET /api/products/vendor/:id
```

**Description:** Get vendor's product with all variants (vendor view)  
**Authentication:** Required (Vendor - must own product)  
**URL Parameters:**
```
id : ObjectId [required, product ID]
```

**Response:** `200 OK` - Same as GET product with additional metadata

**Authorization Check:**
- Must be the vendor who owns this product
- Returns `403 Forbidden` if unauthorized

---

#### 1.5 Update Product
```http
PUT /api/products/:id
```

**Description:** Update product details  
**Authentication:** Required (Vendor - must own)  
**Request Body:**
```json
{
  "title": "iPhone 15 Pro Max",
  "description": "Updated description",
  "brand": "Apple",
  "tags": ["smartphone", "flagship", "5g", "pro-max"]
}
```

**Updatable Fields:**
- `title` - String, max 200 chars
- `description` - String, unlimited
- `brand` - String, max 100 chars
- `tags` - String array
- `seo` - SEO metadata object

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { /* updated product */ }
}
```

**Logic:**
1. Verifies vendor ownership
2. Updates specified fields
3. Regenerates SEO slug if title changes
4. Publishes Kafka event: `productUpdated`
5. Updates MongoDB document

---

#### 1.6 Delete Product
```http
DELETE /api/products/:id
```

**Description:** Soft delete product (marks as inactive)  
**Authentication:** Required (Vendor - must own)  
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Logic:**
1. Sets `isActive: false` (soft delete)
2. Publishes Kafka event: `productDeleted`
3. Variants remain but are hidden

---

### 2. CATEGORY ENDPOINTS

#### 2.1 Get All Categories
```http
GET /api/categories
```

**Description:** Get all active categories with hierarchical structure  
**Authentication:** Not required  
**Query Parameters:**
```
level        : number [optional, 0=root, 1=subcategory, etc]
parentId     : ObjectId [optional, filter by parent]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65e9b1c2d3e4f5g6h7i8j9k0",
      "name": "Electronics",
      "slug": "electronics",
      "parent": null,
      "level": 0,
      "path": "electronics",
      "isActive": true,
      "sortOrder": 1,
      "attributes": [
        {
          "name": "Brand",
          "values": ["Apple", "Samsung", "Google"]
        }
      ],
      "subcategoryCount": 5,
      "productCount": 234
    },
    {
      "_id": "65e9b1c2d3e4f5g6h7i8j9k1",
      "name": "Smartphones",
      "slug": "smartphones",
      "parent": "65e9b1c2d3e4f5g6h7i8j9k0",
      "level": 1,
      "path": "electronics/smartphones",
      "isActive": true,
      "sortOrder": 1,
      "productCount": 150
    }
  ]
}
```

**Data Structure Details:**
- `name`: Category name (required)
- `slug`: URL-friendly identifier (unique, auto-generated)
- `parent`: Parent category ID (null for root)
- `level`: Nesting depth (0=root)
- `path`: Full hierarchical path (e.g., "electronics/smartphones/flagship")
- `isActive`: Whether visible to customers
- `sortOrder`: Display order within level
- `attributes`: Filterable attributes (brand, size, color, etc)
- Computed fields: `subcategoryCount`, `productCount`

---

#### 2.2 Get Single Category
```http
GET /api/categories/:id
```

**Description:** Get category with details and product count  
**Authentication:** Not required  
**URL Parameters:**
```
id : ObjectId [required]
```

**Response:** `200 OK` - Same structure as list

---

#### 2.3 Get Subcategories
```http
GET /api/categories/:id/subcategories
```

**Description:** Get immediate children of category  
**Authentication:** Not required  
**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ /* array of immediate children */ ]
}
```

**Query Logic:**
- Uses MongoDB `$regex` on `path` field
- Pattern: `^parentPath/[^/]+$` (excludes deeper nesting)
- Efficient index: `{path: 1}`

---

#### 2.4 Get Category Breadcrumbs
```http
GET /api/categories/:id/breadcrumbs
```

**Description:** Get hierarchy path from root to category  
**Authentication:** Not required  
**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {"_id": "...", "name": "Electronics", "slug": "electronics"},
    {"_id": "...", "name": "Smartphones", "slug": "smartphones"},
    {"_id": "...", "name": "Flagship", "slug": "flagship"}
  ]
}
```

---

#### 2.5 Create Category (Admin Only)
```http
POST /api/categories
```

**Description:** Create new category with optional hierarchy  
**Authentication:** Required (Admin)  
**Request Body:**
```json
{
  "name": "Flagship Phones",
  "parentId": "65e9b1c2d3e4f5g6h7i8j9k1",
  "sortOrder": 1,
  "attributes": [
    {
      "name": "Screen Size",
      "values": ["6.1\"", "6.7\"", "6.9\""]
    }
  ]
}
```

**Validation:**
- `name`: String, required, min 1, max 100
- `parentId`: Valid ObjectId, optional, parent must be active
- `sortOrder`: Number, optional, default 0
- `attributes`: Array of {name, values[]}

**Logic:**
1. Checks if parent exists and is active
2. Calculates `level = parent.level + 1`
3. Generates SEO `slug` from name
4. Builds `path = parentPath/slug`
5. Ensures unique name within parent
6. Stores with proper indexes

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { /* created category */ }
}
```

---

#### 2.6 Update Category (Admin Only)
```http
PUT /api/categories/:id
```

**Description:** Update category details  
**Authentication:** Required (Admin)  
**Request Body:**
```json
{
  "name": "Updated Category Name",
  "sortOrder": 2,
  "attributes": [ /* updated */ ]
}
```

**Limitations:**
- Cannot change parent (prevents path invalidation)
- Name must remain unique within same parent

---

#### 2.7 Delete Category (Admin Only)
```http
DELETE /api/categories/:id
```

**Description:** Delete category (only if no children/products)  
**Authentication:** Required (Admin)  
**Response:** `200 OK` or `409 Conflict`

**Validation:**
- No child categories exist
- No products in this category
- Returns error if either condition violated

---

### 3. PRODUCT VARIANT ENDPOINTS

#### 3.1 Get Product Variant
```http
GET /api/variants/:id
```

**Description:** Get single variant details  
**Authentication:** Not required  
**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65f2b3c4d5e6f7g8h9i0j1k2",
    "product": "65f1a2b3c4d5e6f7g8h9i0j1",
    "sku": "IP15P-128GB-BLACK",
    "attributes": {
      "storage": "128GB",
      "color": "Black"
    },
    "price": {
      "mrp": 999,
      "sellingPrice": 849,
      "discountPercent": 15
    },
    "weight": {
      "value": 187,
      "unit": "g"
    },
    "images": [
      {
        "url": "https://res.cloudinary.com/demo/image/upload/...",
        "alt": "Front perspective"
      },
      {
        "url": "https://res.cloudinary.com/demo/image/upload/...",
        "alt": "Side view"
      }
    ],
    "isActive": true,
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-20T15:30:00Z"
  }
}
```

---

#### 3.2 Get Product All Variants
```http
GET /api/variants/product/:productId
```

**Description:** Get all variants for a product  
**Authentication:** Not required  
**Query Parameters:**
```
isActive : boolean [optional, default: true]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    { /* variant 1 */ },
    { /* variant 2 */ }
  ]
}
```

---

#### 3.3 Create Product Variant
```http
POST /api/variants
```

**Description:** Create new product variant with up to 3 images  
**Authentication:** Required (Vendor - must own product)  
**Content-Type:** `multipart/form-data`  
**Form Fields:**
```
product              : ObjectId [required, product ID]
sku                  : string [required, unique, 1-100 chars]
attributes           : JSON string [optional, {key: value, ...}]
price[mrp]           : number [required, positive]
price[sellingPrice]  : number [required, positive]
price[discountPercent] : number [optional, 0-100]
weight[value]        : number [optional, positive]
weight[unit]         : string [optional, "g" or "kg"]
images               : file array [optional, max 3 files]
```

**File Validation (Images):**
- Max files: 3
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Max size: 2MB per file
- Uploaded to Cloudinary folder: `/products/{productId}/variants`

**Validation Rules:**
```javascript
{
  product: ObjectId,
  sku: string [min: 1, max: 100, unique],
  attributes: Map<string, string> [optional],
  price: {
    mrp: number [positive],
    sellingPrice: number [positive],
    discountPercent: number [0-100, optional]
  },
  weight: {
    value: number [positive, optional],
    unit: enum["g", "kg", optional]
  }
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3001/api/variants \
  -H "Authorization: Bearer <token>" \
  -F "product=65f1a2b3c4d5e6f7g8h9i0j1" \
  -F "sku=IP15P-128GB-BLACK" \
  -F "attributes={\"storage\":\"128GB\",\"color\":\"Black\"}" \
  -F "price[mrp]=999" \
  -F "price[sellingPrice]=849" \
  -F "price[discountPercent]=15" \
  -F "weight[value]=187" \
  -F "weight[unit]=g" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Variant created successfully",
  "data": {
    "_id": "65f2b3c4d5e6f7g8h9i0j1k2",
    "product": "65f1a2b3c4d5e6f7g8h9i0j1",
    "sku": "IP15P-128GB-BLACK",
    "attributes": {"storage": "128GB", "color": "Black"},
    "price": {
      "mrp": 999,
      "sellingPrice": 849,
      "discountPercent": 15
    },
    "weight": {
      "value": 187,
      "unit": "g"
    },
    "images": [
      {
        "url": "https://res.cloudinary.com/...",
        "alt": "image1.jpg"
      }
    ],
    "isActive": true,
    "createdAt": "2024-03-21T10:00:00Z"
  }
}
```

**Backend Logic:**
1. **Validation:** Zod schema validates input
2. **Authorization:** Checks vendor owns product
3. **Product Verification:** Confirms product exists and is active
4. **Image Upload:** Streams to Cloudinary with optimizations
5. **Database Transaction:** Uses MongoDB session for atomicity
6. **Inventory Creation:** Auto-creates Inventory record with stock=0
7. **Kafka Event:** Publishes `variantCreated` event
8. **Response:** Returns created variant with Cloudinary URLs

**Error Responses:**
```json
{
  "success": false,
  "message": "SKU already exists",
  "error": "DUPLICATE_SKU"
}
```

---

#### 3.4 Update Product Variant
```http
PUT /api/variants/:id
```

**Description:** Update variant (including image replacement)  
**Authentication:** Required (Vendor - must own product)  
**Content-Type:** `multipart/form-data`  
**Form Fields:** Same as create, all optional

**Response:** `200 OK` - Updated variant

**Logic:**
1. Re-uploads only if new images provided
2. Removes old Cloudinary images if replaced
3. Maintains existing images if not specified
4. Updates price, attributes, weight
5. Publishes `variantUpdated` event

---

#### 3.5 Delete Product Variant
```http
DELETE /api/variants/:id
```

**Description:** Delete variant and cascade to inventory  
**Authentication:** Required (Vendor - must own)  
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Variant deleted successfully"
}
```

**Cascade Operations:**
1. Deletes variant from ProductVariant collection
2. Deletes associated Inventory record
3. Publishes `variantDeleted` event

---

### 4. INVENTORY ENDPOINTS

#### 4.1 Get Product Stocks
```http
GET /api/inventory
```

**Description:** Get stock levels for all vendor's products  
**Authentication:** Required (Vendor)  
**Query Parameters:**
```
productId : ObjectId [optional, filter by product]
page      : number [default: 1]
limit     : number [default: 20, max: 100]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f3c4d5e6f7g8h9i0j1k2l3",
      "variant": {
        "_id": "65f2b3c4d5e6f7g8h9i0j1k2",
        "sku": "IP15P-128GB-BLACK",
        "attributes": {"storage": "128GB", "color": "Black"},
        "product": {
          "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
          "title": "iPhone 15 Pro"
        }
      },
      "stock": 45,
      "reserved": 8,
      "available": 37,
      "lowStockThreshold": 5,
      "isLowStock": false,
      "updatedAt": "2024-03-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}
```

**Field Descriptions:**
- `stock`: Total quantity in inventory
- `reserved`: Items held for active carts/pending orders
- `available`: `stock - reserved` (sellable quantity)
- `lowStockThreshold`: Alert threshold (default 5)
- `isLowStock`: `true` if `stock <= lowStockThreshold`

---

#### 4.2 Update Product Stock
```http
PUT /api/inventory/:variantId
```

**Description:** Adjust stock by delta (increase/decrease)  
**Authentication:** Required (Vendor - must own variant's product)  
**Request Body:**
```json
{
  "delta": 10
}
```

**Validation:**
- `delta`: Integer (positive for increase, negative for decrease)
- Result `stock >= 0` (prevents negative stock)
- Optional: `reason` (string, max 200 chars, for audit logs)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "stock": 55,
    "reserved": 8,
    "available": 47,
    "previousStock": 45
  }
}
```

**Logic:**
1. Validates vendor ownership of product
2. Loads current inventory
3. Calculates: `newStock = stock + delta`
4. Validates: `newStock >= 0`
5. Updates database with new stock value
6. Returns old and new values for tracking

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Stock cannot be negative",
  "error": "INVALID_STOCK",
  "details": {
    "currentStock": 5,
    "requestedDelta": -10,
    "wouldResultIn": -5
  }
}
```

---

### 5. REVIEW ENDPOINTS

#### 5.1 Get Product Reviews
```http
GET /api/reviews/product/:productId
```

**Description:** Get all reviews for a product  
**Authentication:** Not required  
**Query Parameters:**
```
rating   : number [optional, 1-5, exact match]
page     : number [default: 1]
limit    : number [default: 10, max: 50]
sort     : string [optional, "newest", "oldest", "helpful"]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f4d5e6f7g8h9i0j1k2l3m4",
      "product": "65f1a2b3c4d5e6f7g8h9i0j1",
      "user": {
        "_id": "65d7e8f9g0h1i2j3k4l5m6n7",
        "full_name": "John Doe",
        "profile_picture": "https://res.cloudinary.com/..."
      },
      "rating": 5,
      "comment": "Excellent product, highly recommended!",
      "isVerifiedPurchase": true,
      "isPinned": true,
      "pinnedBy": {
        "store_name": "Apple Official",
        "store_logo": "https://res.cloudinary.com/..."
      },
      "createdAt": "2024-03-15T10:00:00Z",
      "updatedAt": "2024-03-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 234,
    "pages": 24
  },
  "summary": {
    "averageRating": 4.5,
    "totalReviews": 234,
    "ratingDistribution": {
      "5": 150,
      "4": 60,
      "3": 15,
      "2": 5,
      "1": 4
    }
  }
}
```

**Field Descriptions:**
- `rating`: 1-5 star rating (required)
- `comment`: User's review text (optional)
- `isVerifiedPurchase`: Automatically set if user purchased product
- `isPinned`: Shown at top if vendor pinned (vendor feature)
- `pinnedBy`: Vendor who pinned this review

---

#### 5.2 Add Review (Authenticated User Only)
```http
POST /api/reviews
```

**Description:** Add review for product (one per user per product)  
**Authentication:** Required (Any user)  
**Request Body:**
```json
{
  "product": "65f1a2b3c4d5e6f7g8h9i0j1",
  "rating": 5,
  "comment": "Excellent product! Great quality and fast delivery."
}
```

**Validation:**
- `product`: Valid ObjectId, product must exist
- `rating`: Integer, 1-5 (required)
- `comment`: String, optional, max 500 chars
- User can only have one review per product (enforced at DB level)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "_id": "65f4d5e6f7g8h9i0j1k2l3m4",
    "product": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user": "65d7e8f9g0h1i2j3k4l5m6n7",
    "rating": 5,
    "comment": "Excellent product!",
    "isVerifiedPurchase": true,
    "createdAt": "2024-03-21T10:00:00Z"
  }
}
```

**Backend Logic:**
1. **Validation:** Zod validates input
2. **Duplicate Check:** Queries for existing review by user+product
3. **Verified Purchase:** Checks if user has completed order for product
4. **Creation:** InsertOne to Review collection
5. **Rating Recalculation:** MongoDB aggregation pipeline:
   - Groups reviews by product
   - Calculates: `avgRating = avg(rating)`, `ratingCount = count()`
   - Updates Product document
6. **Kafka Event:** Publishes `reviewCreated` event
7. **Notification:** Alerts vendor of new review

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "message": "You have already reviewed this product",
  "error": "DUPLICATE_REVIEW"
}
```

---

#### 5.3 Get User's Reviews
```http
GET /api/reviews/user
```

**Description:** Get authenticated user's reviews  
**Authentication:** Required  
**Query Parameters:**
```
page : number [default: 1]
limit : number [default: 20, max: 50]
```

**Response:** `200 OK` - List of user's reviews

---

#### 5.4 Update Review
```http
PUT /api/reviews/:id
```

**Description:** Update own review (user or after admin request)  
**Authentication:** Required (Review author)  
**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated comment text"
}
```

**Response:** `200 OK` - Updated review

**Logic:**
1. Verifies author ownership
2. Updates rating and/or comment
3. Recalculates product rating/count
4. Publishes `reviewUpdated` event

---

#### 5.5 Delete Review
```http
DELETE /api/reviews/:id
```

**Description:** Delete own review  
**Authentication:** Required (Review author)  
**Response:** `200 OK`

**Logic:**
1. Deletes review from collection
2. Recalculates product ratings
3. Publishes `reviewDeleted` event

---

#### 5.6 Pin Review (Vendor Only)
```http
POST /api/reviews/:reviewId/pin
```

**Description:** Vendor pins review to top (max 1 per vendor per product)  
**Authentication:** Required (Vendor - owns product being reviewed)  
**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Review pinned successfully"
}
```

**Validation:**
- Review exists and is for vendor's product
- Vendor doesn't already have pinned review on same product
- Creates entry in PinnedReview collection

**PinnedReview Collection:**
```javascript
{
  review: ObjectId (ref: Review),
  given_to_vendor: ObjectId (ref: VendorProfile),
  given_by: ObjectId (ref: User),
  unique compound index: {review: 1, given_to_vendor: 1}
}
```

---

#### 5.7 Unpin Review
```http
DELETE /api/reviews/:reviewId/unpin
```

**Description:** Vendor unpins previously pinned review  
**Authentication:** Required (Vendor who pinned)  
**Response:** `200 OK`

---

## Identity Service

**Service Port:** `IDENTITY_SERVICE_PORT`  
**Base URL:** `http://localhost:${IDENTITY_SERVICE_PORT}`  
**Technologies:** Express.js, MongoDB, Mongoose, Bcrypt, JWT, Cloudinary, Kafka

### Overview
Handles user authentication, registration, profile management, and vendor/seller setup. Uses RS256 JWT for token generation and Bcrypt for password security.

---

### 1. AUTHENTICATION ENDPOINTS

#### 1.1 User Sign Up
```http
POST /api/auth/signup
```

**Description:** Register new user account  
**Authentication:** Not required  
**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+91-9876543210",
  "profile_picture": "https://example.com/image.jpg"
}
```

**Validation:**
- `email`: Valid email format, unique across system
- `password`: Minimum 6 characters
- `full_name`: Required, min 1 char
- `phone`: Optional, format varies by region
- `profile_picture`: Optional, if provided must be valid URL

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "65d7e8f9g0h1i2j3k4l5m6n7",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "phone": "+91-9876543210",
    "profile_picture": "https://example.com/image.jpg",
    "isAuthProviderConfiged": false,
    "createdAt": "2024-03-21T10:00:00Z"
  },
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 900
}
```

**Backend Logic:**
1. **Validation:** Zod validates all fields
2. **Email Uniqueness:** Checks for existing user with email
3. **Password Hashing:** 
   - Generates salt using bcrypt (`BCRYPT_ROUNDS` env var, default 10)
   - Hashes password: `bcrypt.hash(password, salt)`
   - Never stores plain password
4. **User Creation:** Creates doc in Users collection
5. **JWT Generation:** 
   - Algorithm: RS256 (RSA)
   - Private key: `keys/jwt_private.pem`
   - Claims include: sub, email, full_name, isVendor, vendorId
   - Expiry: 15 minutes
6. **Kafka Event:** Publishes `userCreated` event with user ID
7. **Response:** Returns user object + token + expiry

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "message": "Email already registered",
  "error": "EMAIL_EXISTS"
}
```

---

#### 1.2 User Login
```http
POST /api/auth/login
```

**Description:** Authenticate user and return session token  
**Authentication:** Not required  
**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Validation:**
- `email`: Valid format
- `password`: Min 6 chars

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "65d7e8f9g0h1i2j3k4l5m6n7",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "isVendor": false,
    "vendorId": null
  },
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 900
}
```

**Backend Logic:**
1. **Validation:** Zod validates input
2. **User Lookup:** Queries Users collection by email
3. **Password Verification:** Uses bcrypt.compare
   - `bcrypt.compare(inputPassword, storedHash)` returns boolean
4. **Vendor Check:** Looks up VendorProfile for user
5. **JWT Generation:** Same as signup, but sets isVendor based on vendor existence
6. **Kafka Event:** Publishes `userLogin` event
7. **Response:** Token valid for 15 minutes

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS"
}
```

---

#### 1.3 User Logout
```http
POST /api/auth/logout
```

**Description:** Clear user session (client-side implementation)  
**Authentication:** Required  
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Backend Logic:**
1. Extracts user from token
2. Publishes `userLogout` Kafka event
3. Client should delete token from localStorage

**Note:** Token-based auth doesn't have server-side sessions, so logout is primarily for analytics/auditing

---

#### 1.4 Check Authorization
```http
POST /api/auth/check-auth
```

**Description:** Verify token and return user info  
**Authentication:** Required  
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User authenticated",
  "data": {
    "id": "65d7e8f9g0h1i2j3k4l5m6n7",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "isVendor": false,
    "vendorId": null,
    "iat": 1626700000,
    "exp": 1626700900
  }
}
```

---

#### 1.5 OAuth Integration (Placeholder)
```http
POST /api/auth/oAuth
```

**Description:** OAuth authentication (Google, GitHub, etc.) - reserved for future  
**Current Status:** Placeholder endpoint  
**Future Implementation:** Will support Social login integration

---

### 2. USER PROFILE ENDPOINTS

#### 2.1 Get User Profile
```http
GET /api/users/fetch-summary
```

**Description:** Get current authenticated user's profile  
**Authentication:** Required  
**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65d7e8f9g0h1i2j3k4l5m6n7",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "phone": "+91-9876543210",
    "profile_picture": "https://res.cloudinary.com/...",
    "isAuthProviderConfiged": false,
    "address": {
      "residential_address": "123 Main St, Apt 4B",
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "pincode": "400001"
    },
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-20T15:30:00Z"
  }
}
```

---

#### 2.2 Update User Profile
```http
POST /api/users/update-profile/:id
```

**Description:** Update user information  
**Authentication:** Required (Must be own profile or admin)  
**URL Parameters:**
```
id : ObjectId [required, user ID]
```

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "phone": "+91-9876543210",
  "address": {
    "residential_address": "456 Oak Ave, Suite 200",
    "country": "India",
    "state": "Mumbai",
    "city": "Mumbai",
    "pincode": "400001"
  }
}
```

**Validation:**
- `full_name`: String, min 1 char, optional
- `phone`: String, optional
- `address.residential_address`: String, optional
- `address.country`: String, optional
- `address.state`: String, optional
- `address.city`: String, optional
- `address.pincode`: String, 6 digits (regex), optional

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user */ }
}
```

---

#### 2.3 Complete User Profile
```http
POST /api/users/complete-profile/:id
```

**Description:** Complete profile setup (required for checkout)  
**Authentication:** Required (Must be own profile)  
**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+91-9876543210",
  "address": {
    "residential_address": "123 Main St",
    "country": "India",
    "state": "Maharashtra",
    "city": "Mumbai",
    "pincode": "400001"
  }
}
```

**Required Fields (All must be provided):**
- `full_name`: Non-empty string
- `phone`: Min 10 digits
- `address.residential_address`: Required
- `address.country`: Required
- `address.state`: Required
- `address.city`: Required
- `address.pincode`: 6 digits

**Response:** `200 OK` - Fully populated user object

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Incomplete profile data",
  "error": "INCOMPLETE_PROFILE",
  "missingFields": ["address.city", "address.pincode"]
}
```

---

#### 2.4 Update Profile Picture
```http
PATCH /api/users/update-profile-picture
```

**Description:** Upload/change profile picture  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`  
**Form Fields:**
```
profilePicture : file [required, image only]
```

**File Validation:**
- Allowed: `image/jpeg`, `image/png`, `image/webp`
- Max size: 2MB
- Uploaded to Cloudinary: `/users/profile-pictures/{userId}`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile picture updated",
  "data": {
    "profile_picture": "https://res.cloudinary.com/...",
    "updatedAt": "2024-03-21T10:00:00Z"
  }
}
```

**Logic:**
1. Saves current profile_picture URL
2. Uploads new image to Cloudinary
3. Deletes old image from Cloudinary if exists
4. Updates user document
5. Returns new URL

---

#### 2.5 Delete User Profile
```http
POST /api/users/delete-profile/:id
```

**Description:** Permanently delete user account (hard delete)  
**Authentication:** Required (Must be own account)  
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

**Cascade Operations:**
1. Deletes user from Users collection
2. Archives or deletes associated data:
   - Orders (if any) - marked as archived
   - Reviews (marked as anonymous)
   - Vendor profile (if exists)
3. Deletes profile picture from Cloudinary
4. Publishes `userDeleted` Kafka event

**Consequences:**
- Cannot login again with same email
- Associated data handling varies (orders stay, reviews anonymized)

---

### 3. VENDOR PROFILE ENDPOINTS

#### 3.1 Create Vendor Profile
```http
POST /api/vendors
```

**Description:** Convert user to vendor/seller  
**Authentication:** Required (Any authenticated user)  
**Request Body:**
```json
{
  "store_id": "apple-official-store",
  "store_name": "Apple Official"
}
```

**Validation:**
- `store_id`: String, min 3 chars, unique, lowercase, alphanumeric + hyphen
- `store_name`: String, min 2 chars, max 100 chars

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Vendor profile created successfully",
  "data": {
    "_id": "65e0a1b2c3d4e5f6g7h8i9j0",
    "user": "65d7e8f9g0h1i2j3k4l5m6n7",
    "store_id": "apple-official-store",
    "store_name": "Apple Official",
    "store_logo": null,
    "bg_banner": null,
    "store_description": "",
    "gst_number": null,
    "ratings": 0,
    "tags": [],
    "createdAt": "2024-03-21T10:00:00Z"
  }
}
```

**Backend Logic:**
1. **Validation:** Zod validates input
2. **Duplicate Check:** Ensures user doesn't already have vendor profile
3. **Store ID Uniqueness:** Checks store_id is globally unique
4. **Creation:** Creates VendorProfile document
5. **JWT Update:** Future logins will have `isVendor: true`
6. **Kafka Event:** Publishes `vendorProfileCreated` event

**Error Response:** `409 Conflict`
```json
{
  "success": false,
  "message": "User already has a vendor profile",
  "error": "VENDOR_PROFILE_EXISTS"
}
```

---

#### 3.2 Get Vendor Profile
```http
GET /api/vendors
```

**Description:** Get authenticated vendor's profile  
**Authentication:** Required (Vendor)  
**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65e0a1b2c3d4e5f6g7h8i9j0",
    "user": {
      "_id": "65d7e8f9g0h1i2j3k4l5m6n7",
      "email": "vendor@apple.com",
      "full_name": "Vendor Manager"
    },
    "store_id": "apple-official-store",
    "store_name": "Apple Official",
    "store_logo": "https://res.cloudinary.com/...",
    "bg_banner": "https://res.cloudinary.com/...",
    "store_description": "Official Apple Store",
    "gst_number": "27AAPCT1234H1Z0",
    "email": "support@appleofficial.com",
    "phone": "+91-8000800800",
    "url": "https://apple-store.example.com",
    "tags": ["electronics", "official", "premium"],
    "ratings": 4.8,
    "outlet_address": {
      "residential_address": "Bandra Kurla Complex",
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "pincode": "400051"
    },
    "bank_account_info": {
      "account_number": "****5678",
      "ifsc": "SBIN0001234",
      "bank_name": "State Bank of India"
    },
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-20T15:30:00Z"
  }
}
```

---

#### 3.3 Get Vendor Profile Summary (Public)
```http
GET /api/vendors/summary/:vendorId
```

**Description:** Get public vendor profile summary  
**Authentication:** Not required  
**URL Parameters:**
```
vendorId : ObjectId [required]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "store_name": "Apple Official",
    "store_logo": "https://res.cloudinary.com/...",
    "bg_banner": "https://res.cloudinary.com/...",
    "ratings": 4.8,
    "tags": ["electronics", "official", "premium"]
  }
}
```

**Data Exposure:**
- Only public-facing fields shown
- No sensitive info (bank details, full address, etc.)
- Uses `getProfileSummary()` method

---

#### 3.4 Update Vendor Profile
```http
PATCH /api/vendors
```

**Description:** Update vendor information  
**Authentication:** Required (Vendor)  
**Request Body:**
```json
{
  "store_name": "Apple Official Store",
  "store_description": "Premium electronics from Apple",
  "gst_number": "27AAPCT1234H1Z0",
  "email": "support@apple.com",
  "phone": "+91-8000800800",
  "url": "https://apple-store.example.com",
  "tags": ["electronics", "official", "premium"],
  "outlet_address": {
    "residential_address": "Bandra Kurla Complex",
    "country": "India",
    "state": "Maharashtra",
    "city": "Mumbai",
    "pincode": "400051"
  },
  "bank_account_info": {
    "account_number": "1234567890",
    "ifsc": "SBIN0001234",
    "bank_name": "State Bank of India"
  }
}
```

**Validation:**
- `store_name`: String, min 2, max 100, optional
- `store_description`: String, optional
- `gst_number`: String, optional
- `email`: Valid email, optional
- `phone`: String, optional
- `url`: Valid URL, optional
- `tags`: String array, optional, auto-lowercased and trimmed
- `outlet_address`: Nested address object, optional fields
- `bank_account_info`: Object with account details, optional

**Response:** `200 OK` - Updated vendor profile

**Logic:**
1. **Validation:** Zod validates all fields
2. **Authorization:** Verifies vendor ownership
3. **Update:** Sets only provided fields
4. **Kafka Event:** Publishes `vendorProfileUpdated` with change details
5. **Response:** Returns complete updated profile

---

#### 3.5 Complete Vendor Profile
```http
PATCH /api/vendors/complete
```

**Description:** Complete mandatory vendor setup  
**Authentication:** Required (Vendor)  
**Request Body:** Same as update, but with required fields

**Required for Completion:**
- `store_name`: Non-empty
- `gst_number`: Valid format
- `outlet_address`: Complete address
- `bank_account_info`: Complete bank details
- `email` and `phone`: Contact info

**Response:** `200 OK` - Fully completed profile  
**Error:** `400 Bad Request` if missing required fields

---

#### 3.6 Update Store Logo
```http
PATCH /api/vendors/logo
```

**Description:** Upload/change store logo  
**Authentication:** Required (Vendor)  
**Content-Type:** `multipart/form-data`  
**Form Fields:**
```
logo : file [required, image only]
```

**File Validation:**
- Allowed: `image/jpeg`, `image/png`, `image/webp`
- Max size: 2MB
- Uploaded to Cloudinary: `/vendors/logos/{vendorId}`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Store logo updated",
  "data": {
    "store_logo": "https://res.cloudinary.com/..."
  }
}
```

**Logic:**
1. Uploads new logo to Cloudinary
2. Deletes old logo if exists
3. Updates vendor document
4. Publishes `vendorLogoUpdated` event

---

#### 3.7 Update Store Banner
```http
PATCH /api/vendors/banner
```

**Description:** Upload/change store banner  
**Authentication:** Required (Vendor)  
**Content-Type:** `multipart/form-data`  
**Form Fields:**
```
banner : file [required, image only]
```

**File Validation:** Same as logo

**Response:** `200 OK` - Updated with `bg_banner` URL

---

#### 3.8 Delete Vendor Profile
```http
DELETE /api/vendors
```

**Description:** Delete vendor profile  
**Authentication:** Required (Vendor)  
**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Vendor profile deleted successfully"
}
```

**Cascade Operations:**
1. Deletes VendorProfile
2. Archives or unpublishes vendor's products
3. Transfers/handles pending orders
4. User account remains (can create new vendor profile later)

---

## Messaging Service

**Service Port:** `MESSAGING_SERVICE_PORT`  
**Base URL:** `http://localhost:${MESSAGING_SERVICE_PORT}`  
**Technologies:** Express.js, MongoDB, Kafka, Socket.IO, BullMQ, Redis

### Overview
Handles real-time notifications and messaging. Integrates with Socket.IO for live updates and implements event sourcing pattern via Kafka. Uses BullMQ for queue management.

---

### 1. NOTIFICATION ENDPOINTS

#### 1.1 Get Notifications
```http
GET /api/notifications/:id
```

**Description:** Retrieve notifications for user  
**Authentication:** Required (Must be own ID or admin)  
**URL Parameters:**
```
id : ObjectId [required, user ID]
```

**Query Parameters:**
```
page       : number [default: 1]
limit      : number [default: 20, max: 100]
type       : string [optional, enum: SYSTEM|ORDER|PAYMENT|INFO|ALERT|WARNING]
isRead     : boolean [optional, filter by read status]
sort       : string [optional, "newest" | "oldest"]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f5e6f7g8h9i0j1k2l3m4n5",
      "type": "ORDER",
      "title": "Order Confirmed",
      "message": "Your order #ORD-123456 has been confirmed",
      "scope": "USER",
      "userId": "65d7e8f9g0h1i2j3k4l5m6n7",
      "isRead": false,
      "sourceEventId": "order_evt_123456",
      "createdAt": "2024-03-21T10:00:00Z"
    },
    {
      "_id": "65f5e6f7g8h9i0j1k2l3m4n6",
      "type": "SYSTEM",
      "title": "Maintenance Alert",
      "message": "System maintenance scheduled for 2:00 AM",
      "scope": "GLOBAL",
      "isRead": true,
      "createdAt": "2024-03-21T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 85,
    "pages": 5
  },
  "unreadCount": 3
}
```

**Field Descriptions:**
- `type`: Category (SYSTEM, ORDER, PAYMENT, INFO, ALERT, WARNING)
- `scope`: "GLOBAL" (all users) or "USER" (specific user)
- `sourceEventId`: Unique event identifier (prevents duplicates)
- `isRead`: User read status

---

### 2. NOTIFICATION MODELS

#### 2.1 Notification Model
```javascript
{
  _id: ObjectId
  type: String [enum: "SYSTEM", "ORDER", "PAYMENT", "INFO", "ALERT", "WARNING", required]
  title: String [default: ""]
  message: String [required]
  scope: String [enum: "GLOBAL", "USER", required]
  userId: String [required if scope === "USER"]
  isRead: Boolean [default: false, indexed]
  sourceEventId: String [unique: true, sparse: true, indexed]
  createdAt: Date [auto, indexed with scope]
  updatedAt: Date [auto]
  
  indexes: {
    {scope: 1, createdAt: -1}
    {userId: 1, scope: 1, createdAt: -1}
    {sourceEventId: 1, unique: true, sparse: true}
    {isRead: 1, userId: 1}
  }
}
```

**Field Explanations:**
- `sourceEventId`: Event UUID (e.g., "order_evt_123456") - ensures exactly-once delivery
- `scope`: "GLOBAL" shows to all, "USER" shows only to userId
- `isRead`: Tracks user engagement
- Compound indexes optimize common queries

---

### 3. NOTIFICATION SERVICES

#### 3.1 Notification Ingest Service
**Purpose:** Receives events from Kafka and processes them into notifications

**Process Flow:**
```
Kafka Event → Validation → Deduplication → Persistence → Socket.IO Emit
```

**Input Event Schema (Zod Validated):**
```javascript
{
  eventId: string [UUID format],
  type: "SYSTEM" | "ORDER" | "PAYMENT" | "INFO" | "ALERT" | "WARNING",
  title: string [1-100 chars],
  message: string [1-1000 chars],
  userId: string [ObjectId, optional, required if scope=USER],
  scope: "GLOBAL" | "USER",
  createdAt: date [ISO format],
  sourceEventId: string [unique identifier]
}
```

**Processing Steps:**

1. **Validation:** Zod schema validation
   - All required fields present
   - Enum values valid
   - String lengths within bounds

2. **Deduplication:** Check sourceEventId
   - Query: `{sourceEventId: value}`
   - If exists: skip processing, return existing

3. **Idempotent Persistence:**
   ```javascript
   db.collection('notifications').insertOne({
     type, title, message, scope, userId, isRead: false,
     sourceEventId, createdAt, updatedAt: now
   })
   ```

4. **Rate Limiting:**
   - Config: `NOTIFICATION_EMIT_RATE_LIMIT` (default: 100/second)
   - Uses Redis for distributed rate limiting
   - Drops events exceeding limit with log

5. **Socket.IO Emission:**
   ```javascript
   if (scope === "GLOBAL") {
     io.emit('notification:global', notification)
   } else {
     io.to(`user:${userId}`).emit('notification:user', notification)
   }
   ```

6. **Logging:**
   - Level: INFO
   - Context: {eventId, type, sourceEventId, userId, timestamp}
   - Errors logged at ERROR level with full stack

---

### 4. KAFKA EVENT TOPICS

**Notifications Service subscribes to:**

| Topic | Event Type | Source | Payload |
|-------|-----------|--------|---------|
| `order-events` | orderCreated, orderConfirmed, orderShipped | Orders | {orderId, customerId, status} |
| `payment-events` | paymentSuccess, paymentFailed | Payment | {orderId, paymentId, status} |
| `user-events` | userCreated, userLogin, userLogout | Identity | {userId, email} |
| `vendor-events` | vendorCreated, vendorApproved | Identity | {vendorId, storeName} |

---

### 5. SOCKET.IO INTEGRATION

#### 5.1 Connection Setup
```javascript
// Client-side
const socket = io('http://localhost:3005', {
  auth: { token: jwtToken }
})

socket.on('connect', () => {
  console.log('Connected to notifications')
})
```

#### 5.2 Socket Events
```javascript
// Listening for notifications
socket.on('notification:global', (notification) => {
  // System-wide notification received
})

socket.on('notification:user', (notification) => {
  // User-specific notification received
})

socket.on('notification:update', (notificationId, isRead) => {
  // User marked notification as read
})
```

#### 5.3 Redis Adapter (Multi-instance)
```javascript
// For production with multiple server instances
io.adapter(redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
}))
// Allows cross-instance broadcasting
```

---

## Orders Service

**Service Port:** `ORDERS_SERVICE_PORT`  
**Base URL:** `http://localhost:${ORDERS_SERVICE_PORT}`  
**Technologies:** Express.js, MongoDB, Kafka, Mongoose, CQRS Pattern

### Overview
Manages order lifecycle. Implements CQRS pattern with read models (ProductReadModel, VariantReadModel) to maintain consistency even when catalog changes.

---

### 1. ORDER ENDPOINTS

#### 1.1 Create Order
```http
POST /api/orders
```

**Description:** Create new order  
**Authentication:** Required  
**Request Body:**
```json
{
  "customerId": "65d7e8f9g0h1i2j3k4l5m6n7",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+91-9876543210",
  "shippingAddress": {
    "street": "123 Main Street, Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "items": [
    {
      "productId": "65f1a2b3c4d5e6f7g8h9i0j1",
      "variantId": "65f2b3c4d5e6f7g8h9i0j1k2",
      "quantity": 1,
      "price": 849.00
    }
  ],
  "notes": "Please deliver between 9 AM to 6 PM"
}
```

**Validation Schema (Zod):**
```javascript
{
  customerId: ObjectId (validated),
  customerName: string [min: 1, max: 100],
  customerEmail: string [email, optional],
  customerPhone: string [optional],
  shippingAddress: {
    street: string [min: 1, max: 200],
    city: string [min: 1, max: 100],
    state: string [min: 1, max: 100],
    postalCode: string [min: 1, max: 20],
    country: string [min: 1, max: 100]
  },
  items: [
    {
      productId: ObjectId,
      variantId: ObjectId [optional],
      quantity: number [min: 1, max: 1000],
      price: number [optional]
    }
  ] [min: 1 item],
  notes: string [max: 500, optional]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "65f6f7g8h9i0j1k2l3m4n5o6",
    "orderNumber": "ORD-65f6f7g8h",
    "customerId": "65d7e8f9g0h1i2j3k4l5m6n7",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+91-9876543210",
    "shippingAddress": {
      "street": "123 Main Street, Apartment 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India"
    },
    "items": [
      {
        "productId": "65f1a2b3c4d5e6f7g8h9i0j1",
        "productTitle": "iPhone 15 Pro",
        "productBrand": "Apple",
        "productCategory": "65e9b1c2d3e4f5g6h7i8j9k0",
        "variantId": "65f2b3c4d5e6f7g8h9i0j1k2",
        "variantSku": "IP15P-128GB-BLACK",
        "quantity": 1,
        "price": 849.00,
        "priceDetails": {
          "mrp": 999,
          "sellingPrice": 849,
          "discountPercent": 15
        }
      }
    ],
    "total": 849.00,
    "status": "PENDING",
    "payment": {
      "status": "PENDING",
      "method": null,
      "transactionId": null,
      "paidAt": null
    },
    "notes": "Please deliver between 9 AM to 6 PM",
    "createdAt": "2024-03-21T10:00:00Z"
  }
}
```

**Backend Logic:**

1. **Validation:** Zod validates complete schema
2. **Item Enrichment:** For each item:
   ```javascript
   const variant = await VariantReadModel.findById(variantId)
   const product = await ProductReadModel.findById(variant.productId)
   // Enrich with product/variant metadata
   ```
3. **Validation of Items:**
   - Variant exists in read model
   - Variant belongs to specified product
   - Quantity is valid
4. **Total Calculation:**
   ```javascript
   const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
   ```
5. **Database Insertion:**
   ```javascript
   const order = new Order({
     customerId, customerName, customerEmail, customerPhone,
     shippingAddress, items, total,
     status: 'PENDING',
     payment: { status: 'PENDING' },
     notes, syncedFromReadModel: false
   })
   await order.save()
   ```
6. **Kafka Event:** Publishes `orderCreated` event
   ```json
   {
     "eventType": "orderCreated",
     "orderId": "65f6f7g8h9i0j1k2l3m4n5o6",
     "customerId": "65d7e8f9g0h1i2j3k4l5m6n7",
     "total": 849.00,
     "itemCount": 1,
     "timestamp": "2024-03-21T10:00:00Z"
   }
   ```
7. **Response:** Returns created order with auto-generated orderNumber

---

#### 1.2 List Orders
```http
GET /api/orders
```

**Description:** Get orders with filtering  
**Authentication:** Required  
**Query Parameters:**
```
customerId : ObjectId [optional]
status     : string [optional, enum values below]
page       : number [default: 1, min: 1]
limit      : number [default: 20, min: 1, max: 100]
```

**Status Enum Values:**
- `PENDING` - Initial state, awaiting confirmation
- `CONFIRMED` - Vendor confirmed order
- `PROCESSING` - Being prepared for shipment
- `SHIPPED` - In transit
- `DELIVERED` - Reached customer
- `CANCELLED` - Customer/vendor cancelled
- `REFUNDED` - Payment refunded

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f6f7g8h9i0j1k2l3m4n5o6",
      "orderNumber": "ORD-65f6f7g8h",
      "customerId": "65d7e8f9g0h1i2j3k4l5m6n7",
      "customerName": "John Doe",
      "status": "PROCESSING",
      "total": 849.00,
      "payment": { "status": "PAID" },
      "itemCount": 1,
      "createdAt": "2024-03-21T10:00:00Z",
      "updatedAt": "2024-03-21T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Filters Applied:**
- If `customerId`: Match customerId
- If `status`: Match order status
- Sorted by createdAt descending
- Pagination: offset = (page-1)*limit

---

#### 1.3 Get Order by ID
```http
GET /api/orders/:id
```

**Description:** Get complete order details  
**Authentication:** Required  
**URL Parameters:**
```
id : ObjectId [required, order ID]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65f6f7g8h9i0j1k2l3m4n5o6",
    "orderNumber": "ORD-65f6f7g8h",
    "customerId": "65d7e8f9g0h1i2j3k4l5m6n7",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+91-9876543210",
    "shippingAddress": { /* ... */ },
    "items": [
      {
        "productId": "65f1a2b3c4d5e6f7g8h9i0j1",
        "productTitle": "iPhone 15 Pro",
        "variantId": "65f2b3c4d5e6f7g8h9i0j1k2",
        "variantSku": "IP15P-128GB-BLACK",
        "quantity": 1,
        "price": 849.00,
        "priceDetails": { /* ... */ }
      }
    ],
    "total": 849.00,
    "status": "PROCESSING",
    "payment": {
      "status": "PAID",
      "method": "razorpay",
      "transactionId": "pay_123456789"
    },
    "notes": "Please deliver between 9 AM to 6 PM",
    "createdAt": "2024-03-21T10:00:00Z",
    "updatedAt": "2024-03-21T10:30:00Z"
  }
}
```

**Logic:**
1. Queries Order by _id
2. Enriches items with current data from read models
3. Returns complete order details with payment info

---

#### 1.4 Update Order Status
```http
PATCH /api/orders/:id/status
```

**Description:** Change order status workflow  
**Authentication:** Required (Vendor/Admin who manages order)  
**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Validation:**
- `status`: Must be valid enum value
- State transition rules:
  - PENDING → CONFIRMED, CANCELLED
  - CONFIRMED → PROCESSING, CANCELLED
  - PROCESSING → SHIPPED, CANCELLED
  - SHIPPED → DELIVERED
  - DELIVERED → (no more changes)
  - CANCELLED → (no more changes)
  - REFUNDED → (final state)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "_id": "65f6f7g8h9i0j1k2l3m4n5o6",
    "status": "CONFIRMED",
    "updatedAt": "2024-03-21T10:30:00Z"
  }
}
```

**Kafka Event Published:**
```json
{
  "eventType": "orderStatusChanged",
  "orderId": "65f6f7g8h9i0j1k2l3m4n5o6",
  "oldStatus": "PENDING",
  "newStatus": "CONFIRMED",
  "timestamp": "2024-03-21T10:30:00Z"
}
```

---

#### 1.5 Generate Payment Intent
```http
POST /api/orders/:id/payment-intent
```

**Description:** Create payment order via Payment Service  
**Authentication:** Required  
**Request Body:**
```json
{
  "amount": 849.00,
  "currency": "INR"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_123456789",
    "amount": 84900,
    "currency": "INR",
    "receipt": "ORD-65f6f7g8h"
  }
}
```

**Logic:**
1. Calls Payment Service API
2. Creates payment order in Razorpay
3. Returns order details for frontend checkout

---

#### 1.6 Update Payment Status
```http
PATCH /api/orders/:id/payment
```

**Description:** Update payment status after checkout  
**Authentication:** Required  
**Request Body:**
```json
{
  "paymentStatus": "PAID",
  "transactionId": "pay_123456789",
  "paymentMethod": "razorpay"
}
```

**Validation:**
- `paymentStatus`: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
- `transactionId`: String, optional but recommended for PAID
- `paymentMethod`: String, optional

**Response:** `200 OK` - Updated order with payment info

---

### 2. PRODUCT READ MODEL ENDPOINTS

#### 2.1 Search Products
```http
GET /api/products/search
```

**Description:** Full-text search products in read model  
**Authentication:** Not required  
**Query Parameters:**
```
query    : string [optional, full-text search]
category : ObjectId [optional]
brand    : string [optional]
page     : number [default: 1]
limit    : number [default: 20, max: 100]
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "productId": "65f1a2b3c4d5e6f7g8h9i0j1",
      "vendor": "65d8a0b1c2d3e4f5g6h7i8j9",
      "title": "iPhone 15 Pro",
      "description": "Latest Apple flagship",
      "category": "65e9b1c2d3e4f5g6h7i8j9k0",
      "brand": "Apple",
      "tags": ["smartphone", "flagship", "5g"],
      "avgRating": 4.5,
      "isActive": true,
      "lastSyncedAt": "2024-03-20T15:30:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

**Search Logic:**
- If `query` provided: MongoDB text search on `{title: "text", description: "text"}`
- Text score sorting (relevance)
- Optional filters by category, brand
- Only active products shown

---

#### 2.2 Get Product Details
```http
GET /api/products/:productId
```

**Description:** Get product with all variants from read models  
**Authentication:** Not required  
**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "productId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "vendor": "65d8a0b1c2d3e4f5g6h7i8j9",
    "title": "iPhone 15 Pro",
    "description": "Latest Apple flagship smartphone",
    "category": "65e9b1c2d3e4f5g6h7i8j9k0",
    "brand": "Apple",
    "tags": ["smartphone", "flagship"],
    "avgRating": 4.5,
    "isActive": true,
    "variants": [
      {
        "_id": "65f2b3c4d5e6f7g8h9i0j1k2",
        "variantId": "65f2b3c4d5e6f7g8h9i0j1k2",
        "sku": "IP15P-128GB-BLACK",
        "attributes": {"storage": "128GB", "color": "Black"},
        "price": { /* ... */ },
        "images": [ /* ... */ ],
        "isActive": true
      }
    ]
  }
}
```

---

#### 2.3 Get Variant Details
```http
GET /api/variants/:variantId
```

**Description:** Get variant with parent product info  
**Authentication:** Not required  
**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65f2b3c4d5e6f7g8h9i0j1k2",
    "variantId": "65f2b3c4d5e6f7g8h9i0j1k2",
    "productId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "sku": "IP15P-128GB-BLACK",
    "attributes": {"storage": "128GB", "color": "Black"},
    "price": {
      "mrp": 999,
      "sellingPrice": 849,
      "discountPercent": 15
    },
    "weight": {
      "value": 187,
      "unit": "g"
    },
    "images": [ /* ... */ ],
    "isActive": true,
    "product": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "title": "iPhone 15 Pro",
      "brand": "Apple"
    }
  }
}
```

---

### 3. CQRS PATTERN EXPLANATION

**What is CQRS?**  
Command Query Responsibility Segregation - Separates read and write models

**Implementation in Orders Service:**

**Write Model (Canonical Source):**
- MongoDB `Order` collection (customer purchases)
- Only Orders Service writes directly

**Read Models (Denormalized Snapshots):**
- `ProductReadModel` - Product snapshot at order time
- `VariantReadModel` - Variant snapshot at order time

**Data Flow:**
```
1. Catalog Service creates/updates Product/Variant
2. Publishes Kafka event: productUpdated, variantUpdated
3. Orders Service subscribes to Kafka
4. Orders Service updates ProductReadModel, VariantReadModel
5. When order created, uses read models (not live catalog)
6. Old product price preserved even if catalog changes later
```

**Benefits:**
- **Consistency:** Order reflects product state at purchase time
- **Independence:** Orders don't depend on catalog availability
- **Performance:** Read models are optimized for queries
- **Audit Trail:** Historical snapshots preserved

**Indexes on Read Models:**
```javascript
// ProductReadModel
indexes: {
  {productId: 1, unique: true},
  {vendor: 1},
  {isActive: 1},
  {category: 1},
  {brand: 1}
}

// VariantReadModel
indexes: {
  {variantId: 1, unique: true},
  {productId: 1},
  {sku: 1, unique: true},
  {isActive: 1}
}
```

---

## Payment Service

**Service Port:** `PAYMENT_SERVICE_PORT`  
**Base URL:** `http://localhost:${PAYMENT_SERVICE_PORT}`  
**Technologies:** Express.js, MongoDB, Razorpay API, Crypto, Kafka

### Overview
Integrates with Razorpay for payment processing. Handles payment order creation, signature verification, webhook processing, and publishes events.

---

### 1. PAYMENT ENDPOINTS

#### 1.1 Create Payment Order
```http
POST /api/payment/create
```

**Description:** Create Razorpay order for checkout  
**Authentication:** Required  
**Request Body:**
```json
{
  "orderId": "ORD-65f6f7g8h",
  "amount": 849.00,
  "currency": "INR"
}
```

**Validation (Zod):**
```javascript
{
  orderId: string [min: 1, max: 100],
  amount: number [positive, required],
  currency: string [3 chars, default: "INR", optional]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "razorpayOrderId": "order_1A2b3C4d5E6f7G8h",
    "amount": 84900,
    "amountInCurrency": 849.00,
    "currency": "INR",
    "receipt": "ORD-65f6f7g8h",
    "createdAt": "2024-03-21T10:00:00Z"
  }
}
```

**Backend Logic:**

1. **Validation:** Zod validates input
2. **Amount Conversion:** `amountInPaise = Math.round(amount * 100)`
   - Razorpay requires amount in paise (1 paise = 0.01 INR)
   - Example: 849.00 INR = 84900 paise
3. **Razorpay API Call:**
   ```javascript
   const razorpayOrder = await razorpayInstance.orders.create({
     amount: amountInPaise,
     currency,
     receipt: orderId,
     notes: { orderId }
   })
   ```
4. **Database Upsert:**
   ```javascript
   const payment = await Payment.findOneAndUpdate(
     { orderId },
     {
       orderId, razorpayOrderId: razorpayOrder.id,
       amount, currency, status: 'CREATED'
     },
     { upsert: true, new: true }
   )
   ```
5. **Duplicate Prevention:**
   - Uses Razorpay `receipt` (must be unique per order)
   - Prevents duplicate successful payments

6. **Response:** Returns order ready for frontend

---

#### 1.2 Verify Payment (Frontend Signature)
```http
POST /api/payment/verify
```

**Description:** Verify frontend-signed payment and mark as SUCCESS  
**Authentication:** Required  
**Request Body:**
```json
{
  "orderId": "ORD-65f6f7g8h",
  "razorpayOrderId": "order_1A2b3C4d5E6f7G8h",
  "razorpayPaymentId": "pay_1K2l3M4n5O6p7Q8r",
  "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d838f92b0d"
}
```

**Signature Source:** Frontend generates HMAC-SHA256 signature

**Validation (Zod):**
```javascript
{
  orderId: string [min: 1],
  razorpayOrderId: string [min: 1],
  razorpayPaymentId: string [min: 1],
  razorpaySignature: string [min: 1]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "_id": "65f7g8h9i0j1k2l3m4n5o6p7",
    "orderId": "ORD-65f6f7g8h",
    "razorpayOrderId": "order_1A2b3C4d5E6f7G8h",
    "razorpayPaymentId": "pay_1K2l3M4n5O6p7Q8r",
    "amount": 849.00,
    "currency": "INR",
    "status": "SUCCESS",
    "updatedAt": "2024-03-21T10:05:00Z"
  }
}
```

**Signature Verification Process:**

```javascript
// Frontend generates signature
const message = `${razorpayOrderId}|${razorpayPaymentId}`
const signature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(message)
  .digest('hex')
// Sends signature to backend

// Backend verifies
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest('hex')

if (expectedSignature !== receivedSignature) {
  throw new Error('Signature mismatch - payment verification failed')
}
```

**Backend Logic:**

1. **Validation:** Zod validates input
2. **Signature Verification:** HMAC-SHA256 check (see above)
3. **State Transition Validation:**
   - Current status must be 'CREATED' or 'PENDING'
   - Cannot transition SUCCESS → anything
4. **Database Update:**
   ```javascript
   await Payment.findOneAndUpdate(
     { orderId },
     {
       razorpayPaymentId, razorpayOrderId,
       status: 'SUCCESS'
     },
     { new: true }
   )
   ```
5. **Kafka Event:** Publishes `paymentSuccess`
   ```json
   {
     "eventType": "paymentSuccess",
     "orderId": "ORD-65f6f7g8h",
     "razorpayPaymentId": "pay_1K2l3M4n5O6p7Q8r",
     "amount": 849.00,
     "timestamp": "2024-03-21T10:05:00Z"
   }
   ```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Signature verification failed",
  "error": "INVALID_SIGNATURE"
}
```

---

#### 1.3 Razorpay Webhook
```http
POST /webhook/razorpay
```

**Description:** Webhook receiver for Razorpay payment events  
**Authentication:** Signature verification (no Bearer token)  
**Headers:**
```
X-Razorpay-Signature: <webhook_signature>
```

**Supported Events:**
- `payment.captured` - Payment completed successfully
- `payment.failed` - Payment transaction failed

**Webhook Payload Example (payment.captured):**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": "payment",
      "id": "pay_1K2l3M4n5O6p7Q8r",
      "status": "captured",
      "amount": 84900,
      "currency": "INR",
      "notes": {
        "orderId": "ORD-65f6f7g8h"
      }
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Webhook processed",
  "eventId": "evt_1A2b3C4d5E6f7G8h"
}
```

**Webhook Signature Verification:**

```javascript
// Razorpay sends:
// X-Razorpay-Signature: <computed_signature>

// Backend computes:
const crypto = require('crypto')
const sha = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
sha.update(JSON.stringify(body)) // raw body as string
const expectedSignature = sha.digest('hex')

// Verify match
if (expectedSignature !== headerSignature) {
  throw new Error('Webhook signature verification failed')
}
```

**Webhook Processing Logic:**

1. **Signature Verification:** As above
2. **Event Extraction:**
   ```javascript
   const event = payload.event
   const payment = payload.payload.payment
   const orderId = payment.notes.orderId
   ```
3. **Find Payment Record:**
   ```javascript
   const paymentRecord = await Payment.findOne({ orderId })
   ```
4. **Event Handling:**
   - `payment.captured`:
     - Sets status: 'SUCCESS'
     - Records razorpayPaymentId
     - Publishes `paymentSuccess` event
   - `payment.failed`:
     - Sets status: 'FAILED'
     - Publishes `paymentFailed` event
5. **Idempotency:**
   - Checks if payment already processed
   - Only updates if status changes
   - Prevents duplicate Kafka events
6. **Logging:** Every webhook logged with timestamp

**Error Handling:**
- Returns 500 if verification fails
- Returns 400 for invalid event format
- Always responds (Razorpay retries otherwise)

---

### 2. PAYMENT MODEL

```javascript
{
  _id: ObjectId
  orderId: String [unique: true, indexed, required]
  razorpayOrderId: String [indexed, sparse]
  razorpayPaymentId: String [indexed, sparse]
  amount: Number [required, min: 0]
  currency: String [default: "INR", uppercase]
  status: String [enum: "CREATED", "PENDING", "SUCCESS", "FAILED", default: "CREATED"]
  timestamps: { createdAt, updatedAt }
  
  indexes: {
    {orderId: 1, unique: true},
    {razorpayOrderId: 1},
    {razorpayPaymentId: 1},
    {status: 1},
    {createdAt: -1}
  }
}
```

**Field Explanations:**
- `orderId`: Links to Orders Service (string format: "ORD-...")
- `razorpayOrderId`: Razorpay's order ID (received from API)
- `razorpayPaymentId`: Razorpay's payment ID (from webhook/verification)
- `amount`: In base currency (not paise)
- `status`: Payment state (CREATED→PENDING→SUCCESS or FAILED)

---

### 3. RAZORPAY INTEGRATION DETAILS

#### 3.1 Configuration
```javascript
// Environment Variables Required
RAZORPAY_KEY_ID=rzp_live_1A2b3C4d5E6f7G8h // Public key
RAZORPAY_KEY_SECRET=your_secret_key        // Private key  
RAZORPAY_WEBHOOK_SECRET=webhook_secret     // Webhook signature secret
```

#### 3.2 Amount Handling
```javascript
// Client-side: Display in currency units
displayPrice = 849.00 // INR

// Backend conversion:
razorpayAmount = Math.round(displayPrice * 100) // paise
// 849.00 * 100 = 84900 paise

// Webhook receives in paise:
amount = 84900
displayAmount = Math.round(amount / 100) // Back to currency
```

#### 3.3 Payment Status Transitions
```
CREATED
  ├─→ PENDING (after payment.captured initiated)
  │     ├─→ SUCCESS (payment.captured webhook)
  │     └─→ FAILED (payment.failed webhook)
  └─→ FAILED (immediate failure)

Final States:
  SUCCESS → No more transitions
  FAILED → No more transitions
```

---

## Analytics Service

**Service Port:** `ANALYTICS_SERVICE_PORT`  
**Current Status:** Minimal/Placeholder Implementation  
**Technologies:** Express.js

### Overview
Currently a basic Express server. Intended for metrics collection, aggregation, and reporting.

---

### 1. CURRENT ENDPOINTS

#### 1.1 Health Check
```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "service": "analytics-service",
  "uptime": 3600,
  "timestamp": "2024-03-21T10:00:00Z"
}
```

#### 1.2 Root Endpoint
```http
GET /
```

**Response:** `200 OK`
```text
Hello World!
```

---

### 2. FUTURE IMPLEMENTATION ROADMAP

**Planned Features:**

1. **Kafka Event Collection:**
   - Subscribe to all service topics
   - Aggregate events by type
   - Store time-series data

2. **Metrics Endpoints:**
   ```http
   GET /api/analytics/orders
   GET /api/analytics/revenue
   GET /api/analytics/vendors
   GET /api/analytics/products
   ```

3. **Dashboard Metrics:**
   - Total orders/revenue by time period
   - Top products/vendors
   - User engagement metrics
   - Payment success rates
   - Category-wise sales

4. **Prometheus Metrics:**
   ```
   GET /metrics
   ```
   - Expose system metrics for monitoring
   - Request counts, latencies, errors

5. **Real-time Updates:**
   - WebSocket connection for live dashboards
   - Event streaming to analytics consumers

---

## Cross-Service Integration

### 1. AUTHENTICATION FLOW

**JWT Token Lifecycle:**

```
1. User signup/login (Identity Service)
   ├─ Generate RS256 token (15 min expiry)
   └─ Return to client

2. Client stores token (localStorage)

3. Client sends with requests
   └─ Authorization: Bearer <token>

4. Each service:
   ├─ Extract token from header
   ├─ Verify signature using public key
   ├─ Attach user data to req.user
   └─ Proceed with request or return 401

5. Token expiry:
   └─ Client must re-login to get new token
```

**Public Key Distribution:**
- All services share: `keys/jwt_public.pem`
- Located in each service's directory
- Used for RS256 signature verification only

### 2. KAFKA EVENT TOPICS & FLOWS

**Event-Driven Architecture:**

```
Topic: user-events
├─ userCreated {userId, email, fullName}
├─ userLogin {userId, timestamp}
├─ userLogout {userId, timestamp}
└─ userDeleted {userId}
  └─→ Consumed by: Notifications, Analytics

Topic: vendor-events
├─ vendorProfileCreated {vendorId, storeId, userId}
├─ vendorProfileUpdated {vendorId, changes}
└─ vendorDeleted {vendorId}
  └─→ Consumed by: Catalog, Orders, Notifications

Topic: product-events
├─ productCreated {productId, vendorId, title}
├─ productUpdated {productId, changes}
└─ productDeleted {productId}
  └─→ Consumed by: Orders (updates ProductReadModel), Notifications

Topic: variant-events
├─ variantCreated {variantId, productId, sku}
├─ variantUpdated {variantId, changes}
└─ variantDeleted {variantId}
  └─→ Consumed by: Orders (updates VariantReadModel)

Topic: order-events
├─ orderCreated {orderId, customerId, total}
├─ orderStatusChanged {orderId, oldStatus, newStatus}
└─ orderCancelled {orderId, reason}
  └─→ Consumed by: Payment, Messaging (notifications)

Topic: payment-events
├─ paymentSuccess {orderId, razorpayPaymentId, amount}
├─ paymentFailed {orderId, reason}
└─ paymentRefunded {orderId}
  └─→ Consumed by: Orders (update payment status), Notifications

Topic: review-events
├─ reviewCreated {reviewId, productId, rating}
├─ reviewUpdated {reviewId, changes}
└─ reviewDeleted {reviewId}
  └─→ Consumed by: Catalog (recalculates product rating)

Topic: notification-events
└─ notificationEmitted {type, userId, message}
  └─→ Consumed by: Messaging (ingest to notifications)
```

### 3. DATA SYNCHRONIZATION PATTERNS

#### CQRS Pattern (Orders Service)
```
Catalog Service (Write)
  ├─ Creates Product/Variant
  └─ Publishes event

Orders Service (Read)
  ├─ Subscribes to events
  ├─ Updates ProductReadModel
  ├─ Updates VariantReadModel
  └─ Uses read models for orders
```

#### Eventual Consistency
```
Service A                Service B
├─ Publishes event       └─ Subscribes (async)
└─ Returns immediately      └─ Updates local state (eventually)

Guarantees:
├─ Atomicity per service
├─ Eventual consistency across services
└─ No distributed transactions
```

### 4. SERVICE DEPENDENCIES MATRIX

| Service | Depends On | Consumed By |
|---------|-----------|-------------|
| Identity | - | Catalog, Orders, Messaging, Auth (all) |
| Catalog | Identity | Orders, Messaging |
| Orders | Identity, Catalog (reads), Payment | Messaging, Analytics |
| Payment | Orders (reads) | Orders, Messaging |
| Messaging | All services | User (WebSocket) |
| Analytics | All services (Kafka) | Admin Dashboard |

---

## Common Patterns & Middleware

### 1. REQUEST VALIDATION PATTERN

**All endpoints use Zod for schema validation:**

```javascript
// Schema definition
const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.string().refine(isValidObjectId, {
    message: 'Invalid product ID'
  }),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional()
})

// Middleware usage
app.post('/products', validateRequest({ body: createProductSchema }), handler)

// Validation in handler
const data = createProductSchema.parse(req.body)
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

### 2. PAGINATION PATTERN

**All list endpoints support pagination:**

```javascript
// Query params
?page=1&limit=20

// Response
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "pages": 23
  }
}
```

**Constraints:**
- Min page: 1
- Default limit: 20
- Max limit: 100
- Total: Count of matching records
- Pages: Math.ceil(total / limit)

### 3. FILE UPLOAD PATTERN

**Images uploaded to Cloudinary:**

```javascript
// Middle-uploaded files
app.post('/upload',
  authorizeVendor,
  upload.single('image'),
  cloudinaryUpload,
  handler
)

// Cloudinary response
{
  "secure_url": "https://res.cloudinary.com/...",
  "url": "http://res.cloudinary.com/...",
  "public_id": "products/123/var456",
  "width": 1024,
  "height": 768,
  "format": "jpg"
}
```

**Validation:**
- Max size: 2MB
- Allowed types: JPEG, PNG, WebP
- Stored with folder structure
- Returns public URLs for display

### 4. ERROR RESPONSE PATTERN

**Consistent error structure:**

```javascript
// Validation error
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "errors": [ /* field errors */ ]
}

// Resource not found
{
  "success": false,
  "message": "Product not found",
  "error": "RESOURCE_NOT_FOUND"
}

// Authorization error
{
  "success": false,
  "message": "Access denied",
  "error": "FORBIDDEN",
  "details": "Only vendors can create products"
}

// Server error
{
  "success": false,
  "message": "Internal server error",
  "error": "INTERNAL_ERROR",
  "timestamp": "2024-03-21T10:00:00Z"
}
```

### 5. RATE LIMITING

**Global and endpoint-specific limits:**

```javascript
// Redis-based rate limiting
const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 100,              // 100 requests
  duration: 60,             // per 60 seconds
  blockDurationSeconds: 90  // block for 90 seconds if exceeded
})

// Applied to auth endpoints (stricter)
app.post('/auth/login', authLimiter(10, 60), handler)

// Applied to product list (relaxed)
app.get('/products', relaxedLimiter(1000, 60), handler)
```

### 6. LOGGING PATTERN

**Structured logging across services:**

```javascript
logger.info('Product created', {
  productId: '65f1a2b3c4d5e6f7g8h9i0j1',
  vendorId: '65d8a0b1c2d3e4f5g6h7i8j9',
  title: 'iPhone 15 Pro',
  timestamp: new Date().toISOString()
})

// Log levels: error, warn, info, debug
logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack
})
```

### 7. TRANSACTION PATTERN

**MongoDB transactions for atomicity:**

```javascript
const session = await mongoose.startSession()
session.startTransaction()

try {
  const variant = await ProductVariant.create([variantData], {session})
  const inventory = await Inventory.create([inventoryData], {session})
  
  await session.commitTransaction()
} catch(err) {
  await session.abortTransaction()
  throw err
} finally {
  session.endSession()
}
```

### 8. IDEMPOTENCY PATTERN

**Key-based idempotency for critical operations:**

```javascript
// For payment verification
const idempotencyKey = `${orderId}-${razorpayPaymentId}`

// Check if already processed
const existing = await Payment.findOne({
  sourceEventId: idempotencyKey
})

if (existing) {
  return existing // Return cached result
}

// Process and store
const result = await processPayment()
result.sourceEventId = idempotencyKey
await result.save()

return result
```

---

## Authentication Scenarios

### Scenario 1: User Buys as Customer

1. **Signup (Identity Service)**
   ```
   POST /auth/signup → JWT with {isVendor: false}
   ```

2. **Browse Products (Catalog Service)**
   ```
   GET /products → No auth required
   ```

3. **Place Order (Orders Service)**
   ```
   POST /orders → Requires auth, uses userId
   ```

4. **Checkout (Payment Service)**
   ```
   POST /payment/create → Uses order data
   ```

### Scenario 2: Vendor Creates and Sells

1. **Signup (Identity Service)**
   ```
   POST /auth/signup → Registers user
   ```

2. **Create Vendor Profile (Identity Service)**
   ```
   POST /vendors → JWT updated to {isVendor: true}
   ```

3. **List Products (Catalog Service)**
   ```
   GET /products/vendor/:id → Requires auth + vendor check
   ```

4. **Create Product (Catalog Service)**
   ```
   POST /products → Requires {isVendor: true}
   ```

5. **Upload Images (Catalog Service)**
   ```
   POST /variants → Multipart with images + auth
   ```

### Scenario 3: Payment Webhook Callback

1. **Razorpay completes payment**
   ```
   POST /webhook/razorpay
   ├─ Signature verification (no JWT needed)
   └─ Updates payment status
   ```

2. **Publishes Kafka event**
   ```
   paymentSuccess → Orders Service picks up
   ```

3. **Orders updates payment status**
   ```
   PATCH /orders/:id/payment
   ```

---

## Error Codes Reference

| Status | Code | Message | Cause |
|--------|------|---------|-------|
| 400 | VALIDATION_ERROR | Validation failed | Invalid input schema |
| 400 | INCOMPLETE_PROFILE | Missing required fields | Profile not fully setup |
| 401 | INVALID_CREDENTIALS | Invalid credentials | Wrong password/email |
| 401 | UNAUTHORIZED | Unauthorized | Missing/invalid token |
| 403 | FORBIDDEN | Access denied | Insufficient permissions |
| 403 | VENDOR_REQUIRED | Only vendors allowed | User not vendor |
| 404 | NOT_FOUND | Resource not found | Product/Order doesn't exist |
| 409 | DUPLICATE_KEY | Already exists | Email/SKU duplicate |
| 409 | DUPLICATE_REVIEW | Already reviewed | One review per user per product |
| 409 | CONFLICT | Conflict | State/business logic conflict |
| 422 | UNPROCESSABLE | Cannot process | Invalid state transition |
| 429 | RATE_LIMITED | Too many requests | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error | Unexpected error |

---

**End of API Documentation**

---

## APPENDIX: Environment Variables

### Required Variables (All Services)

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Keys (copy same keys to all services)
JWT_PRIVATE_KEY_PATH=./keys/jwt_private.pem
JWT_PUBLIC_KEY_PATH=./keys/jwt_public.pem

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=ecommerce-services

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Service Ports
CATALOG_SERVICE_PORT=3001
IDENTITY_SERVICE_PORT=3002
ORDERS_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
MESSAGING_SERVICE_PORT=3005
ANALYTICS_SERVICE_PORT=3006

# Logging
LOG_LEVEL=info

# Bcrypt
BCRYPT_ROUNDS=10
```

### Payment Service Variables

```bash
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=webhook_secret
```

### Messaging Service Variables

```bash
NOTIFICATION_EMIT_RATE_LIMIT=100
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

---

**Document Version:** 1.0.0  
**Last Updated:** March 21, 2026  
**Author:** Multi-Vendor ECommerce Team

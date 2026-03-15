# Multi-Vendor E-Commerce API Documentation

This document provides comprehensive API documentation for all microservices in the Multi-Vendor E-Commerce platform. Each endpoint is detailed with its HTTP method, path, connected controller function, authentication requirements, and description.

## Table of Contents
1. [Catalog Service](#catalog-service)
2. [Identity Service](#identity-service)
3. [Messaging Service](#messaging-service)
4. [Orders Service](#orders-service)
5. [Payment Service](#payment-service)
6. [Analytics Service](#analytics-service)

---

## Catalog Service

The Catalog Service manages product catalogs, categories, variants, inventory, and reviews. All endpoints are prefixed with `/catalog` in the API gateway routing.

### Product Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/` | `getPublicProducts` (productController) | No | Retrieves all public products with optional pagination, filtering, and sorting. Supports query parameters like `page`, `limit`, `category`, `search`. |
| GET | `/:id` | `getPublicProductById` (productController) | No | Fetches detailed information for a specific product by its ID, including variants and reviews. |
| POST | `/` | `createProduct` (productController) | Yes | Allows vendors to create new products. Requires product data in request body and handles image uploads via multipart/form-data. |
| GET | `/vendor/:id` | `getVendorProduct` (productController) | Yes | Returns all products belonging to a specific vendor. Only accessible by the vendor themselves or admins. |
| PUT | `/:id` | `updateProduct` (productController) | Yes | Updates product details. Vendor must own the product. Supports partial updates. |
| DELETE | `/:id` | `deleteProduct` (productController) | Yes | Deletes a product. Vendor must own the product. Also removes associated variants and inventory. |

**Controller Location**: `services/catalog-service/controllers/productController.js`

### Category Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/` | `getAllCategories` (categoryController) | No | Returns all product categories in a hierarchical structure. |
| GET | `/:id` | `getCategoryById` (categoryController) | No | Gets detailed information about a specific category. |
| GET | `/:id/subcategories` | `getSubCategories` (categoryController) | No | Retrieves all subcategories under a parent category. |
| GET | `/:id/breadcrumbs` | `getCategoryBreadcrumbs` (categoryController) | No | Provides breadcrumb navigation data for category hierarchy. |
| POST | `/` | `createCategory` (categoryController) | Yes | Creates a new category. Requires admin privileges. |
| PUT | `/:id` | `updateCategory` (categoryController) | Yes | Updates category information. Admin only. |
| DELETE | `/:id` | `deleteCategory` (categoryController) | Yes | Deletes a category and moves products to parent category. Admin only. |

**Controller Location**: `services/catalog-service/controllers/categoryController.js`

### Variant Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/:id` | `getProductVariant` (variantController) | No | Retrieves details of a specific product variant. |
| GET | `/product/:productId` | `getProductAllVariant` (variantController) | No | Gets all variants for a given product. |
| POST | `/` | `createProductVariant` (variantController) | Yes | Creates a new variant for a product. Supports up to 3 images. Vendor must own the product. |
| PUT | `/:id` | `updateProductVariant` (variantController) | Yes | Updates variant details including images. Vendor must own the product. |
| DELETE | `/:id` | `deleteProductVariant` (variantController) | Yes | Deletes a product variant. Vendor must own the product. |

**Controller Location**: `services/catalog-service/controllers/variantController.js`
**Middleware**: Image upload handling with `multer` (up to 3 images per variant)

### Inventory Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/` | `getProductStocks` (inventoryController) | Yes | Returns current stock levels for all products owned by the vendor. |
| PUT | `/:variantId` | `updateProductStock` (inventoryController) | Yes | Updates stock quantity for a specific variant. Vendor must own the product. |

**Controller Location**: `services/catalog-service/controllers/inventoryController.js`

### Review Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/product/:productId` | `getReviews` (reviewController) | No | Fetches all reviews for a specific product with pagination. |
| POST | `/` | `addReview` (reviewController) | Yes | Allows authenticated users to submit a review for a product they've purchased. |
| GET | `/user` | `getReviewsByUser` (reviewController) | Yes | Returns all reviews submitted by the current user. |
| PUT | `/:id` | `updateReview` (reviewController) | Yes | Updates a review. User must be the review author. |
| DELETE | `/:id` | `deleteReview` (reviewController) | Yes | Deletes a review. User must be the review author. |
| POST | `/:reviewId/pin` | `pinReview` (reviewController) | Yes | Pins a review as helpful. Vendor must own the product. |
| DELETE | `/:reviewId/unpin` | `deletePinReview` (reviewController) | Yes | Unpins a previously pinned review. Vendor must own the product. |

**Controller Location**: `services/catalog-service/controllers/reviewController.js`

---

## Identity Service

The Identity Service handles user authentication, profile management, and vendor operations. All endpoints are prefixed with `/auth` in the API gateway routing.

### Authentication Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| POST | `/login` | `LoginController` (userAuthController) | No | Authenticates user with email/password. Returns JWT token on success. |
| POST | `/signup` | `SignUpController` (userAuthController) | No | Registers a new user account. Validates input and creates user profile. |
| POST | `/logout` | `LogOutController` (userAuthController) | No | Invalidates the current session token. |
| POST | `/oAuth` | `OauthController` (userAuthController) | No | Handles OAuth authentication (Google, Facebook, etc.). |
| POST | `/check-auth` | `CheckAuthorization` (userAuthController) | Yes | Verifies if the provided JWT token is valid and returns user info. |

**Controller Location**: `services/identity-service/controllers/userAuthController.js`
**Rate Limiting**: 10 attempts per 15 minutes per IP address

### User Profile Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| POST | `/update-profile/:id` | `updateProfile` (userProfileController) | Yes | Updates user profile information. User can only update their own profile. |
| POST | `/delete-profile/:id` | `deleteProfile` (userProfileController) | Yes | Permanently deletes user account and all associated data. |
| PATCH | `/update-profile-picture` | `updateProfilePicture` (userProfileController) | Yes | Uploads or updates user's profile picture. |
| GET | `/fetch-summary` | `getUserProfile` (userProfileController) | Yes | Retrieves current user's profile summary. |
| DELETE | `/complete-profile/:id` | `completeProfile` (userProfileController) | Yes | Marks user profile as complete after filling optional fields. |

**Controller Location**: `services/identity-service/controllers/userProfileController.js`

### Vendor Profile Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| POST | `/` | `createVendorProfile` (vendorProfileController) | Yes | Creates a vendor profile for an existing user. |
| GET | `/` | `getVendorProfile` (vendorProfileController) | Yes | Retrieves the current user's vendor profile. |
| GET | `/summary/:vendorId` | `getVendorProfileSummary` (vendorProfileController) | No | Gets public summary of a vendor's profile (for customers). |
| PATCH | `/` | `updateVendorProfile` (vendorProfileController) | Yes | Updates vendor profile information. |
| PATCH | `/complete` | `completeVendorProfile` (vendorProfileController) | Yes | Completes vendor onboarding process. |
| PATCH | `/logo` | `updateLogo` (vendorProfileController) | Yes | Uploads vendor logo image. |
| PATCH | `/banner` | `updateBanner` (vendorProfileController) | Yes | Uploads vendor banner image. |
| DELETE | `/` | `deleteVendorProfile` (vendorProfileController) | Yes | Deletes vendor profile and associated products. |

**Controller Location**: `services/identity-service/controllers/vendorProfileController.js`
**File Upload**: Single file upload for logo and banner using multer middleware

---

## Messaging Service

The Messaging Service handles notifications and real-time communication. All endpoints are prefixed with `/messages` in the API gateway routing.

### Notification Endpoints

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/:id` | `getNotifications` (notificationController) | Yes | Retrieves notifications for a specific user or conversation. |

**Controller Location**: `services/messaging-service/controllers/notificationController.js`

---

## Orders Service

The Orders Service is currently in bootstrap phase with minimal implementation. Only basic health check endpoints are available.

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/health` | N/A | No | Health check endpoint for service monitoring. |
| GET | `/` | N/A | No | Welcome endpoint returning basic service information. |

**Status**: Business logic and controllers not yet implemented. Socket.IO and Redis configured for future real-time order updates.

---

## Payment Service

The Payment Service is currently in bootstrap phase with minimal implementation. Only basic health check endpoints are available.

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/health` | N/A | No | Health check endpoint for service monitoring. |
| GET | `/` | N/A | No | Welcome endpoint returning basic service information. |

**Status**: Business logic and controllers not yet implemented. Infrastructure for payments (MongoDB, Redis, Socket.IO) is ready.

---

## Analytics Service

The Analytics Service has minimal implementation currently.

| Method | Path | Controller | Auth | Description |
|--------|------|------------|------|-------------|
| GET | `/` | N/A | No | Basic welcome endpoint returning "Hello World". |

**Status**: Service bootstrap complete but analytics features not implemented.

---

## Global Middleware and Features

All services include the following global middleware:

- **Security**: Helmet.js for XSS protection and security headers
- **CORS**: Configured for frontend origins (localhost:5173, localhost:9090)
- **Rate Limiting**: General limit of 100 requests per 30 seconds per IP
- **Request Logging**: All requests logged with method, URL, body, and IP
- **Error Handling**: Global error handler with structured error responses
- **Authentication**: JWT-based auth middleware for protected routes

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Tokens are issued upon successful login and must be included in all authenticated requests.

## Error Responses

All services return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

## Success Responses

Successful responses follow this structure:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```
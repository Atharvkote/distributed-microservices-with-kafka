# Frontend Documentation - VenDeX Multi-Vendor E-Commerce Platform

## Table of Contents
1. [Overview](#overview)
2. [Pages](#pages)
3. [Components](#components)
4. [Layouts](#layouts)
5. [Hooks](#hooks)
6. [Store & State Management](#store--state-management)
7. [Project Structure](#project-structure)

---

## Overview

**Project Name:** Multi-Vendor E-Commerce Platform (VenDeX)  
**Framework:** React + TypeScript  
**Build Tool:** Vite  
**Styling:** Tailwind CSS  
**UI Library:** Custom Shadcn/UI components  
**State Management:** Zustand (for cart, auth, UI)  
**API Layer:** Custom API service wrapper  

The frontend is a comprehensive e-commerce platform with distinct interfaces for three user roles:
- **Customers:** Browse products, manage cart, checkout, track orders
- **Vendors:** Manage products, inventory, orders, and earnings
- **Admins:** Monitor platform, manage vendors, moderate products, view analytics

---

## Pages

Pages are organized by user role and functionality. All pages use lazy loading for optimal performance.

### Authentication Pages

#### **LoginPage** (`pages/auth/LoginPage.tsx`)
- **Route:** `/login`
- **Purpose:** User authentication for customers, vendors, and admins
- **Features:**
  - Email/password input fields
  - Show/hide password toggle
  - "Remember me" checkbox
  - Pre-filled demo credentials for testing
  - Integration with Zustand auth store
  - Role-based redirect after authentication
- **Components Used:** Card, Input, Label, Button, Checkbox, Icon (LogIn, Mail, Lock, Eye)
- **Status:** Accessible only when not authenticated

---

### Customer Pages

#### **LandingPage** (`pages/LandingPage.tsx`)
- **Route:** `/`
- **Purpose:** Homepage with featured products and categories
- **Features:**
  - Hero section with animated light rays background
  - Category overview (Electronics, Fashion, Home & Decor, Sports)
  - Featured products showcase (first 4 products)
  - Call-to-action buttons for browsing
  - Animated background effects (ClickSpark, LightRays)
- **Key Data:** Featured products fetched from API
- **Visual Effects:** 
  - Background light rays animation
  - Click ripple effects
  - Gradient overlays
  - Hero banner with gradient background

#### **ProductListingPage** (`pages/ProductListingPage.tsx`)
- **Route:** `/products`
- **Purpose:** Browse and filter all products
- **Features:**
  - Product grid layout with responsive cards
  - Advanced filtering sidebar:
    - Category selection (multi-select)
    - Price range slider (0-500)
    - Rating filter (1-5 stars)
  - Search functionality with debounce (300ms)
  - Sorting options (relevance, price, rating, newest)
  - Pagination (12 items per page)
  - Mobile-friendly filter sheet
  - Skeleton loading states
  - Empty and error states
- **Components Used:** 
  - ProductCard (displays each product)
  - FilterSidebar (filtering UI)
  - Select, Input, Sheet (for filters on mobile)
  - Pagination components
- **State Management:** 
  - Search state with debounce
  - Filter state
  - Pagination state
  - Loading/error states
- **Performance:** Debounced search, lazy pagination

#### **ProductDetailPage** (`pages/ProductDetailPage.tsx`)
- **Route:** `/products/:id`
- **Purpose:** Detailed product view with purchase options
- **Features:**
  - Product image gallery
  - Product specifications (name, price, stock, rating)
  - Vendor information with avatar
  - Quantity selector (minus/plus buttons)
  - Add to cart functionality
  - Product reviews and ratings section
  - Detailed description with tabs:
    - Description tab
    - Reviews tab
    - Shipping info tab
  - Customer testimonials
  - Related products section
- **Components Used:** 
  - Avatar (vendor info)
  - Tabs (for product info sections)
  - Badge (price, stock status)
  - Button, Input variants
  - Skeleton (for loading)
  - Star ratings
- **State Management:**
  - Product data state
  - Quantity selection
  - Loading/error states
- **Integration:** 
  - Cart store (useCartStore) for adding items
  - API call to fetch product by ID

#### **CartPage** (`pages/CartPage.tsx`)
- **Route:** `/cart`
- **Purpose:** Review and manage shopping cart items
- **Features:**
  - Display all cart items with details
  - Item quantity adjustment
  - Remove item from cart
  - Clear entire cart option
  - Cart summary with total
  - Subtotal, tax, and shipping display
  - Proceed to checkout button
  - Empty cart state with navigation to products
  - Item count display
- **Components Used:**
  - CartItem (individual item display)
  - CheckoutSummary (order totals)
  - Button variations
  - Icons (ShoppingCart, Trash2, ArrowLeft)
- **State Management:** Zustand cart store (useCartStore)
- **Responsive:** 
  - 2-column layout on desktop (items + summary)
  - Single column on mobile

#### **CheckoutPage** (`pages/CheckoutPage.tsx`)
- **Route:** `/checkout`
- **Purpose:** Multi-step checkout process
- **Features:**
  - Three-step checkout flow:
    1. **Shipping Step:** Address, phone, shipping method
    2. **Payment Step:** Payment method selection (credit card, PayPal, etc.)
    3. **Confirm Step:** Order review and confirmation
  - Step indicator with progress visualization
  - Clickable step navigation (can go back to completed steps)
  - Order summary sidebar
  - Form validation for each step
  - Checkout summary component
  - Security badges (HTTPS, secure payment indicators)
- **Components Used:**
  - Card, CardContent, CardHeader
  - Input, Label, Select, TextArea
  - Button with loading states
  - Separator
  - Icons (CreditCard, MapPin, CheckCircle2, Lock)
  - CheckoutSummary component
- **State Management:**
  - Current step state
  - Form data per step
  - Loading state during checkout
- **Flow Control:** Step validation before allowing progression

#### **OrderHistoryPage** (`pages/OrderHistoryPage.tsx`)
- **Route:** `/orders` (Protected - customers only)
- **Purpose:** View customer's order history
- **Features:**
  - Table view of all orders
  - Status filtering:
    - All Orders
    - Pending
    - Processing
    - Shipped
    - Delivered
    - Cancelled
  - Order details:
    - Order ID
    - Order date
    - Status badge
    - Total amount
    - Item count
  - Searchable order list
  - Empty state when no orders exist
  - Error handling with retry
  - Loading skeletons
  - Status color coding
- **Components Used:**
  - OrderTable (displays orders)
  - Select (status filter)
  - TableSkeleton, ErrorState, EmptyState
  - Badge (status indicators)
- **State Management:**
  - Orders list
  - Status filter state
  - Loading/error states
  - Debounce hook for search

#### **ProfilePage** (`pages/ProfilePage.tsx`)
- **Route:** `/profile` (Protected)
- **Purpose:** User profile management and settings
- **Features:**
  - Profile header with avatar and basic info
  - Avatar upload capability (camera icon)
  - Tabbed interface:
    1. **Account Tab:**
       - Name, email, phone fields
       - Avatar display and upload
       - User role badge
    2. **Address Tab:**
       - Primary address management
       - Multiple address options
       - Edit/delete address
    3. **Preferences Tab:**
       - Email notifications toggle
       - Marketing communications toggle
       - Wishlist visibility
    4. **Security Tab:**
       - Password change form
       - Two-factor authentication option
       - Active sessions list
  - Edit and save functionality
  - Form validation
- **Components Used:**
  - Card, CardContent, CardHeader, CardTitle
  - Avatar with fallback
  - Tabs, TabsContent, TabsList, TabsTrigger
  - Input, Label, Button
  - Switch (for toggles)
  - Separator, Badge, Switch
  - Icons (User, MapPin, Bell, Shield, Camera)
- **State Management:** useAuthStore for user data
- **User Data:** Retrieved from auth store

---

### Vendor Pages

#### **VendorDashboard** (`pages/vendor/VendorDashboard.tsx`)
- **Route:** `/vendor/dashboard` (Protected - vendors only)
- **Purpose:** Vendor's main dashboard with key metrics and recent orders
- **Features:**
  - **Metric Cards** (4 columns):
    - Total Revenue (with trend arrow)
    - Total Orders
    - Active Products
    - Total Customers
  - **Analytics Chart:** Sales trend visualization
  - **Recent Orders Table:** Latest 5 orders from vendor's store
  - **Order Status Summary:** Breakdown of order statuses
  - Welcome message with vendor name
  - Loading skeletons for content
  - Error state with retry option
  - Responsive grid layout
- **Components Used:**
  - MetricCard (KPI display)
  - AnalyticsChart (sales trends)
  - OrderTable (recent orders)
  - Card, CardContent, CardHeader, CardTitle
  - Badge (for status), Icons (DollarSign, ShoppingCart, Package, Users, ArrowUpRight)
  - ErrorState, EmptyState
  - Skeleton
- **State Management:**
  - Orders state
  - Analytics data state
  - Loading/error states
- **API Calls:**
  - `api.orders.getAll()` - Fetch vendor's orders
  - `api.analytics.getOverview()` - Fetch sales analytics

#### **ProductManagement** (`pages/vendor/ProductManagement.tsx`)
- **Route:** `/vendor/products`
- **Purpose:** Manage vendor's product catalog
- **Features:**
  - Product table with columns:
    - Product image
    - Product name
    - Category
    - Price
    - Stock quantity
    - Status (active/inactive)
    - Actions (edit, delete, view)
  - Search by product name (debounced)
  - Add new product button
  - Edit product functionality
  - Delete product with confirmation
  - Bulk actions option
  - Filter by status
  - Pagination
  - Skeleton loading
  - Empty state when no products
- **Components Used:**
  - ProductTable (main display)
  - Input (search)
  - Select (status filter)
  - Button variations
  - DropdownMenu (actions)
  - Dialog (for confirmations)
  - Icons (Plus, Edit, Trash2, Eye)
  - TableSkeleton, ErrorState, EmptyState
- **State Management:**
  - Products list
  - Search term
  - Filter state
  - Loading/error states
- **Navigation:** "Add Product" button directs to AddProductPage

#### **AddProductPage** (`pages/vendor/AddProductPage.tsx`)
- **Route:** `/vendor/products/new`
- **Purpose:** Create new product listing
- **Features:**
  - Form sections:
    1. **Basic Information:**
       - Product name
       - Description
       - Category select
       - Sub-category select
    2. **Pricing:**
       - Cost price
       - Selling price
       - Discount percentage
       - Final price (calculated)
    3. **Inventory:**
       - Stock quantity
       - SKU
       - Warehouse location
    4. **Media:**
       - Product images upload (drag-and-drop)
       - Image preview
       - Thumbnail selection
    5. **Additional Details:**
       - Shipping weight
       - Dimensions (L x W x H)
       - Warranty info
       - Return policy
  - Save draft option
  - Publish button
  - Validation for required fields
  - Back navigation button
- **Components Used:**
  - Card, CardContent, CardHeader, CardTitle
  - Input, Label, TextArea
  - Select, SelectContent, SelectItem, SelectTrigger, SelectValue
  - Button variations
  - Separator
  - Upload area with icons
  - Icons (Upload, Image, Save, ArrowLeft)
- **Form Features:** Input validation, error messages, helpful placeholders
- **File Handling:** Image upload with preview

#### **OrderManagement** (`pages/vendor/OrderManagement.tsx`)
- **Route:** `/vendor/orders`
- **Purpose:** Manage orders received by vendor
- **Features:**
  - Order table with details:
    - Order ID
    - Customer name
    - Order date
    - Status (pending, processing, shipped, delivered)
    - Total amount
    - Actions
  - Status filter dropdown
  - Search by order ID or customer
  - Update order status
  - Mark as shipped
  - Generate shipping label
  - View order details
  - Pagination
  - Status color coding
- **Components Used:**
  - OrderTable
  - Input (search)
  - Select (status filter)
  - Button variations
  - DropdownMenu (actions)
  - Badge (status)
  - Icons (Eye, Truck, CheckCircle2, AlertCircle)
  - TableSkeleton, ErrorState
- **State Management:**
  - Orders list
  - Status filter
  - Search state
  - Loading/error states
- **Integration:** API calls for fetching and updating orders

#### **InventoryPage** (`pages/vendor/InventoryPage.tsx`)
- **Route:** `/vendor/inventory`
- **Purpose:** Manage product inventory and stock levels
- **Features:**
  - Inventory table with:
    - Product name
    - SKU
    - Current stock
    - Stock level badge:
      - Critical (≤10): red
      - Low (11-30): orange/yellow
      - In Stock (>30): green
    - Reorder level
    - Warehouse location
    - Actions (edit, reorder)
  - Search by product name (debounced)
  - Stock status indicators with progress bars
  - Low stock warnings
  - Bulk reorder functionality
  - Update stock levels
  - Add to inventory
  - Stock history view
  - Alert for items below reorder level
- **Components Used:**
  - Table, TableBody, TableCell, TableHead, TableHeader, TableRow
  - Input (search)
  - Progress (stock level visualization)
  - Badge (stock status)
  - Button variations
  - Icons (Warehouse, Search, AlertTriangle, Edit)
  - TableSkeleton, ErrorState, EmptyState
- **State Management:**
  - Products list with stock info
  - Search state
  - Loading/error states
- **Calculations:** Stock level categorization, low stock alerts

#### **EarningsPage** (`pages/vendor/EarningsPage.tsx`)
- **Route:** `/vendor/earnings`
- **Purpose:** View vendor's financial data and earnings
- **Features:**
  - **Earnings Overview:**
    - Total earnings
    - Month-to-date earnings
    - Pending payouts
    - Last payout date
  - **Analytics Charts:**
    - Earnings trend graph
    - Revenue by category
    - Sales performance
  - **Payout History:**
    - Payout date
    - Amount
    - Status (completed, pending, failed)
    - Transaction ID
  - **Filters:**
    - Date range picker
    - Payment method filter
    - Status filter
  - **Payment Methods:**
    - Bank account details
    - Add/edit payment method
    - Primary payment method selection
  - **Finances Breakdown:**
    - Gross sales
    - Commissions paid
    - Net earnings
- **Components Used:**
  - MetricCard (earnings display)
  - AnalyticsChart (trends)
  - Table (payout history)
  - Card, CardContent, CardHeader, CardTitle
  - Badge, Button variations
  - Icons (DollarSign, TrendingUp, Wallet, Bank)
  - DatePicker (for date range)
- **State Management:**
  - Earnings data
  - Payout history
  - Filter states
  - Loading states

---

### Admin Pages

#### **AdminDashboard** (`pages/admin/AdminDashboard.tsx`)
- **Route:** `/admin/dashboard` (Protected - admins only)
- **Purpose:** Platform-wide overview and key metrics
- **Features:**
  - **Admin Metrics (4 columns):**
    - Total Revenue
    - Total Orders
    - Active Vendors
    - Total Users
  - **Platform Analytics:**
    - Revenue trend chart
    - Order trend chart
    - User growth
  - **Top Vendors List:**
    - Vendor name with avatar
    - Revenue generated
    - Number of products
    - Status badge
    - Rating/reputation score
  - **Alert Section:**
    - Pending vendor approvals
    - Flagged products for moderation
    - Failed transactions
  - Responsive grid layout
  - Loading skeletons
  - Error handling with retry
- **Components Used:**
  - MetricCard (KPIs)
  - AnalyticsChart (trends)
  - Card, CardContent, CardHeader, CardTitle
  - Avatar, AvatarFallback, AvatarImage
  - Badge (status indicators)
  - ErrorState, Skeleton
  - Icons (DollarSign, ShoppingCart, Store, Users, AlertCircle, ArrowUpRight)
- **State Management:**
  - Analytics data
  - Vendors list
  - Loading/error states
- **API Integration:**
  - `api.analytics.getOverview()` - Platform analytics
  - `api.vendors.getAll()` - List of vendors

#### **VendorManagement** (`pages/admin/VendorManagement.tsx`)
- **Route:** `/admin/vendors`
- **Purpose:** Admin management of vendor accounts
- **Features:**
  - Vendor table with:
    - Vendor avatar and name
    - Email address
    - Store name
    - Status (pending approval, active, suspended)
    - Rating (stars)
    - Product count
    - Revenue generated
    - Registration date
    - Actions (approve, suspend, view details)
  - Status filter options:
    - All Vendors
    - Pending Approval
    - Active
    - Suspended
  - Search by vendor name or email
  - Approve vendor dialog with optional notes
  - Suspend/unsuspend vendor
  - View vendor details panel
  - Bulk actions (select multiple)
  - Pagination
  - Success/error notifications
- **Components Used:**
  - Table components
  - Avatar with initial fallback
  - Badge (status)
  - Button variations
  - Input (search)
  - Select (status filter)
  - Dialog (approve vendor)
  - DropdownMenu (actions)
  - Icons (Star, Search, CheckCircle2, XCircle, Store, MoreHorizontal, Eye)
  - TableSkeleton, ErrorState, EmptyState
  - Toast (notifications)
- **State Management:**
  - Vendors list
  - Status filter
  - Selected vendor (for approval dialog)
  - Loading states
  - Approval loading state
- **Actions:**
  - Approve vendor
  - Suspend vendor
  - View vendor profile

#### **ProductModeration** (`pages/admin/ProductModeration.tsx`)
- **Route:** `/admin/products`
- **Purpose:** Review and moderate product listings
- **Features:**
  - Product table with:
    - Product image
    - Product name
    - Vendor name
    - Category
    - Status (pending review, approved, rejected, flagged)
    - Submission date
    - Actions (approve, reject, view details)
  - Status filter:
    - All Products
    - Pending Review
    - Approved
    - Rejected
    - Flagged for Review
  - Search by product name or ID
  - Review dialog with:
    - Product details
    - Images gallery
    - Vendor information
    - Description and specs
    - Approval/rejection buttons
    - Notes textarea for rejection reasons
  - Reasons for rejection:
    - Poor quality images
    - Misleading description
    - Policy violation
    - Duplicate listing
    - Other (with custom reason)
  - Bulk approval/rejection
  - View product details
  - Pagination
- **Components Used:**
  - Table components
  - Badge (status)
  - Button variations
  - Input (search)
  - Select (status filter)
  - Dialog (review product)
  - TextArea (rejection notes)
  - Label
  - DropdownMenu (actions)
  - Icons (Eye, CheckCircle2, XCircle, Shield)
  - TableSkeleton, ErrorState, EmptyState
  - Toast (notifications)
- **State Management:**
  - Products list
  - Status filter
  - Selected product (for review)
  - Review dialog state
  - Loading/approving states
- **Actions:**
  - Approve product
  - Reject product with reason
  - Flag for manual review

#### **OrderMonitoring** (`pages/admin/OrderMonitoring.tsx`)
- **Route:** `/admin/orders`
- **Purpose:** Monitor all orders across platform
- **Features:**
  - Order analytics cards:
    - Total Orders
    - Pending Orders
    - Processing Orders
    - Shipped Orders
    - Delivered Orders
  - Order table with:
    - Order ID
    - Customer name
    - Vendor name
    - Order date
    - Status
    - Total amount
    - Actions
  - Status filter dropdown
  - Search by order ID or customer
  - Date range filter
  - View order details (customer info, items, timeline)
  - Mark as delivered/shipped
  - Refund management
  - Dispute handling
  - Export orders
  - Pagination
  - Real-time status updates
- **Components Used:**
  - MetricCard (order counts)
  - OrderTable
  - Input (search)
  - Select (status filter)
  - Button variations
  - DropdownMenu (actions)
  - Badge (status)
  - Icons (ClipboardList, ShoppingCart, Clock, Truck, CheckCircle2, Search)
  - TableSkeleton, ErrorState, EmptyState
  - Toast (notifications)
- **State Management:**
  - Orders list
  - Status filter
  - Search state
  - Loading/error states
- **Analytics:** Order count by status

#### **RevenueAnalytics** (`pages/admin/RevenueAnalytics.tsx`)
- **Route:** `/admin/analytics`
- **Purpose:** Detailed revenue and business analytics
- **Features:**
  - **Revenue Overview:**
    - Total platform revenue
    - Commission collected
    - Vendor payouts
    - Net revenue
  - **Analytics Charts:**
    - Revenue trend graph (daily/weekly/monthly views)
    - Revenue by category bar chart
    - Revenue by vendor pie chart
    - Order count trend
  - **Filters:**
    - Date range picker
    - Category filter
    - Vendor filter
    - Payment method filter
  - **Detailed Reports:**
    - Top performing categories
    - Top vendors by revenue
    - Payment method breakdown
    - Refund statistics
    - Average order value
  - **Export Options:**
    - PDF report
    - CSV export
    - Custom report builder
  - **KPI Cards:**
    - Revenue growth %
    - Order growth %
    - Average order value
    - Conversion rate
- **Components Used:**
  - MetricCard (KPIs)
  - AnalyticsChart (multiple chart types)
  - Card, CardContent, CardHeader, CardTitle
  - Select (filters)
  - DatePicker (date range)
  - Button variations
  - Icons (TrendingUp, BarChart3, PieChart)
- **State Management:**
  - Revenue data
  - Chart data
  - Filter states
  - Loading states
- **Data Processing:** Calculations for trends, growth rates, averages

---

## Components

Components are reusable UI elements organized by functionality and type.

### Layout Components

#### **MainLayout** (`components/layout/MainLayout.tsx`)
- **Purpose:** Main layout for customer-facing pages
- **Features:**
  - Sticky navbar with:
    - Logo/branding (VenDeX)
    - Navigation links (Home, Products, My Orders)
    - Search button
    - Wishlist button
    - Cart button with item count badge
    - User dropdown menu (if authenticated)
    - Mobile menu toggle
  - User dropdown menu items:
    - Profile
    - Settings
    - Vendor Dashboard (if vendor role)
    - Admin Dashboard (if admin role)
    - Logout
  - Footer section
  - Responsive design:
    - Desktop: Full navbar
    - Mobile: Hamburger menu with MobileMenu component
  - Outlet for child routes
- **Styling:** Glass effect, gradient primary buttons, brand glow on hover
- **State Integration:**
  - useCartStore: For cart count
  - useAuthStore: For user authentication status
  - useUIStore: For mobile menu toggle
- **Responsive:** Hamburger menu on mobile, full nav on desktop

#### **DashboardLayout** (`components/layout/DashboardLayout.tsx`)
- **Purpose:** Layout for vendor and admin dashboards
- **Props:** `variant: 'vendor' | 'admin'`
- **Features:**
  - Two-column layout:
    - **Left Sidebar:** Navigation menu (variant-specific)
      - Vendor links: Dashboard, Products, Orders, Inventory, Earnings
      - Admin links: Dashboard, Vendors, Products, Orders, Analytics
    - **Main Content:**
      - Top bar with search and user menu
      - Breadcrumb navigation
      - ScrollArea for content
  - Collapsible sidebar on mobile
  - MobileMenu for small screens
  - Breadcrumb trail showing current location
  - Outlet for child routes
- **Components Used:** Sidebar, TopBar, Breadcrumbs, MobileMenu, ScrollArea
- **Responsive:** Full sidebar on desktop, hamburger on mobile

#### **AuthLayout** (`components/layout/AuthLayout.tsx`)
- **Purpose:** Layout for authentication pages
- **Features:**
  - Centered card-based layout
  - Background styling
  - Optional branding section
  - Outlet for auth pages
- **Use:** Wraps LoginPage and other auth pages
- **Styling:** Minimal, focused design

### Navigation Components

#### **Sidebar** (`components/layout/Sidebar.tsx`)
- **Purpose:** Vertical navigation menu for dashboards
- **Features:**
  - Collapsible design
  - Variant support (vendor/admin)
  - Navigation menu items with icons
  - Active link highlighting
  - Responsive collapse/expand
  - Logo area
  - Logout button
- **Vendor Menu Items:**
  - Dashboard
  - Products
  - Orders
  - Inventory
  - Earnings
- **Admin Menu Items:**
  - Dashboard
  - Vendors
  - Products
  - Orders
  - Analytics
- **State:** Sidebar open/closed state
- **Accessibility:** Keyboard navigation support

#### **TopBar** (`components/layout/TopBar.tsx`)
- **Purpose:** Top navigation bar for dashboards
- **Props:**
  - `showSearch?: boolean` - Toggle search field
  - `showCart?: boolean` - Toggle cart button
- **Features:**
  - Hamburger menu toggle (mobile)
  - Breadcrumb area
  - Search input (conditional)
  - User profile dropdown
  - Notifications button
  - Settings button
  - Dark/light mode toggle
  - Cart button (if showCart is true)

#### **Breadcrumbs** (`components/layout/Breadcrumbs.tsx`)
- **Purpose:** Show navigation path
- **Features:**
  - Dynamic breadcrumb generation based on route
  - Clickable breadcrumb links
  - Current page highlighting
  - Mobile responsive (truncate long paths)
  - Separator between items
- **Integration:** Uses React Router location

#### **MobileMenu** (`components/layout/MobileMenu.tsx`)
- **Purpose:** Mobile navigation menu
- **Props:** `variant: 'vendor' | 'admin'` (for dashboard pages)
- **Features:**
  - Sheet/drawer component
  - Icons for menu items
  - Smooth slide-in animation
  - Tap outside to close
  - Active link indication
  - User info section
  - Logout button
- **Integration:** useUIStore for open/close state

#### **Footer** (`components/layout/Footer.tsx`)
- **Purpose:** Footer section with company/platform info
- **Features:**
  - Company info section
  - Quick links
  - Categories section
  - Support/help links
  - Social media links
  - Contact information
  - Copyright notice
  - Newsletter signup
- **Usage:** Displayed in MainLayout

### Product Components

#### **ProductCard** (`components/product/ProductCard.tsx`)
- **Purpose:** Individual product item display
- **Props:** Product data
- **Features:**
  - Product image with hover zoom effect
  - Product name (truncated)
  - Price display
  - Vendor name/link
  - Star rating (avg. rating)
  - Review count
  - Stock availability badge
  - Quick view button
  - Add to cart button
  - Wishlist button (heart icon)
  - Sale badge (if on sale)
- **Styling:** Card with glass effect, gradient on hover
- **Interactions:**
  - Hover: Image zoom, button reveal
  - Click: Navigate to product detail page
  - Add to cart: Toast notification
- **Responsive:** Grid layout adapts to screen size

#### **ProductTable** (`components/product/ProductTable.tsx`)
- **Purpose:** Display products in table format (for vendors/admins)
- **Props:** Product list, actions handlers
- **Features:** (Vendor view)
  - Table with columns:
    - Image
    - Name
    - Category
    - Price
    - Stock
    - Status
    - Actions (Edit, Delete, View)
  - Action buttons with dropdown menu
  - Delete confirmation dialog
  - Status badge styling
  - Click row to view details
  - Responsive horizontal scroll on mobile
- **State Management:** Edit/delete modals state
- **Features:** (Admin moderation)
  - Similar table with approval/rejection actions

#### **FilterSidebar** (`components/product/FilterSidebar.tsx`)
- **Purpose:** Product filtering interface
- **Props:**
  - `onFilterChange?: (filters: FilterState) => void`
  - `className?: string`
- **Features:**
  - **Category Filter:**
    - Multi-select checkboxes
    - Categories: Electronics, Fashion, Home & Decor, Sports, Food & Drink, Books, Beauty
    - Collapse/expand
  - **Price Range Filter:**
    - Slider component (0-500)
    - Min/Max inputs
    - Visual range indicator
  - **Rating Filter:**
    - Star selector (1-5 stars)
    - Shows products with rating >= selected
  - **Clear Filters Button:**
    - Reset all to defaults
  - **Apply Button:** Trigger onFilterChange callback
- **Styling:** Card with glass effect
- **Mobile:** Displayed in Sheet on small screens
- **TypeScript Interface:**
  ```typescript
  interface FilterState {
    categories: string[];
    priceRange: [number, number];
    minRating: number;
  }
  ```

### Order Components

#### **CartItem** (`components/order/CartItem.tsx`)
- **Purpose:** Individual item in shopping cart
- **Props:** Cart item data, handlers (update, remove)
- **Features:**
  - Product image
  - Product name
  - Vendor name
  - Unit price
  - Quantity selector (with +/- buttons)
  - Line total (quantity × price)
  - Remove button
  - Stock availability check
- **Styling:** Card format with hover effect
- **Interactions:**
  - Change quantity: Updates cart total
  - Remove: With confirmation toast

#### **CartItemsComponent/CheckoutSummary** (`components/order/CheckoutSummary.tsx`)
- **Purpose:** Order summary in cart and checkout
- **Features:**
  - Subtotal calculation
  - Shipping cost
  - Tax calculation
  - Discount/coupon input
  - Total amount (prominently displayed)
  - Proceed to checkout button
  - Continue shopping link
  - Sticky on desktop (sidebar)
  - Order row breakdown
- **Styling:** Card with gradient background on buttons
- **Calculations:** Real-time total updates

#### **OrderTable** (`components/order/OrderTable.tsx`)
- **Purpose:** Display orders in table format
- **Props:** Order list, variant (customer/vendor/admin)
- **Features:**
  - Responsive table with columns:
    - Order ID (link to details)
    - Date
    - Status (badge with color coding)
    - Items count
    - Total amount
    - Actions (View, Track, Download Invoice)
  - Status color scheme:
    - Pending: Yellow/orange
    - Processing: Blue
    - Shipped: Cyan
    - Delivered: Green
    - Cancelled: Red
  - Click row to view details
  - Action buttons/dropdown
  - Pagination (if needed)
  - Responsive horizontal scroll on mobile
- **Admin variant:** Additional columns (customer, vendor)
- **Vendor variant:** Customer info column

### Dashboard Components

#### **MetricCard** (`components/dashboard/MetricCard.tsx`)
- **Purpose:** Display KPI metrics
- **Props:**
  - `title: string` - Metric name
  - `value: number | string` - Main value
  - `subtext?: string` - Secondary info
  - `icon?: React.ReactNode` - Icon component
  - `trend?: 'up' | 'down' | 'flat'` - Trend indicator
  - `trendValue?: string` - Trend percentage
  - `className?: string`
- **Features:**
  - Icon display (top right)
  - Title and value display
  - Trend indicator (arrow + percentage)
  - Loading skeleton option
  - Responsive layout
  - Glass effect styling
- **Styling:** Gradient background, color-coded trends
- **Use Cases:**
  - Revenue metrics
  - Order counts
  - Customer metrics
  - Conversion rates

#### **AnalyticsChart** (`components/analytics/AnalyticsChart.tsx`)
- **Purpose:** Display data visualization charts
- **Props:**
  - `data: AnalyticsData[]` - Time-series data points
  - `title?: string` - Chart title
  - `type?: 'line' | 'bar' | 'area'` - Chart type
  - `timeRange?: 'daily' | 'weekly' | 'monthly'` - Time grouping
- **Features:**
  - Line chart for trends (default)
  - Bar chart for comparisons
  - Area chart for cumulative data
  - Time range selector buttons
  - Responsive sizing
  - Tooltip on hover
  - Grid lines
  - Legend
- **Data Format:**
  ```typescript
  interface AnalyticsData {
    date: string;
    value: number;
    label?: string;
  }
  ```
- **Use Cases:**
  - Sales trends
  - Revenue growth
  - Order count trends
  - Vendor performance

### Common/Shared Components

#### **EmptyState** (`components/common/EmptyState.tsx`)
- **Purpose:** Display when data list is empty
- **Props:**
  - `title?: string`
  - `description?: string`
  - `icon?: React.ReactNode`
  - `action?: { label: string; onClick: () => void }`
  - `className?: string`
- **Features:**
  - Large icon display
  - Title and description
  - Optional action button
  - Commonly used icons (ShoppingCart, FileText, Users, etc.)
- **Use Cases:**
  - No products found
  - No orders yet
  - No vendors
  - Empty search results
- **Styling:** Centered layout with muted colors

#### **ErrorState** (`components/common/ErrorState.tsx`)
- **Purpose:** Display when data fetch fails
- **Props:**
  - `title?: string` - Default: "Something went wrong"
  - `description?: string`
  - `onRetry: () => void` - Retry handler
  - `className?: string`
- **Features:**
  - Error icon (AlertCircle)
  - Error message
  - Retry button
  - Optional contact support link
- **Styling:** Alert-style card with red tones
- **Use Cases:**
  - API call failures
  - Permission denied
  - Network errors
  - Server errors

#### **ClickSpark** (`components/shared/ClickSpark.tsx`)
- **Purpose:** Animated click particle effect
- **Props:**
  - `sparkColor?: string` - Particle color
  - `sparkSize?: number` - Size of particles
  - `sparkRadius?: number` - Spread radius
  - `sparkCount?: number` - Number of particles
  - `duration?: number` - Animation duration (ms)
  - `easing?: string` - CSS easing function
  - `extraScale?: number` - Scale multiplier
  - `children: React.ReactNode`
- **Features:**
  - Triggers on any click within children
  - Customizable particle appearance
  - Fade out animation
  - Lightweight performance
- **Use Cases:**
  - Interactive feedback
  - Enhanced UX on buttons/links
  - Application-wide effect wrapper
- **Application:** Wraps entire AppRouter in App.tsx

#### **LightRays** (`components/shared/LightRays.tsx`)
- **Purpose:** Animated light ray background effect
- **Props:**
  - `raysOrigin?: string` - Origin point ("top-center", "bottom-left", etc.)
  - `raysColor?: string` - Ray color (hex)
  - `raysSpeed?: number` - Animation speed
  - `lightSpread?: number` - Spread distance
  - `rayLength?: number` - Length multiplier
  - `followMouse?: boolean` - Follow cursor
  - `mouseInfluence?: number` - Mouse effect strength (0-1)
  - `noiseAmount?: number` - Noise distortion
  - `distortion?: number` - Additional distortion
  - `pulsating?: boolean` - Pulse animation
  - `fadeDistance?: number` - Fade distance
  - `saturation?: number` - Color saturation
  - `className?: string`
- **Features:**
  - WebGL-based rendering
  - Smooth animations
  - Mouse tracking option
  - Customizable colors and effects
- **Use Cases:**
  - Background effect on landing page
  - Hero sections
  - Premium feel
- **Performance:** GPU-accelerated

### UI Components

The `components/ui/` folder contains reusable shadcn/ui styled components:

#### Primitive Components
- **Button** - Variants, sizes, disabled states
- **Input** - Text input with focus states
- **Label** - Form label styling
- **Textarea** - Multi-line text input
- **Select** - Dropdown select component
- **Checkbox** - Checkbox input
- **Radio-Group** - Radio button group
- **Switch** - Toggle switch
- **Badge** - Status/tag badges
- **Card** - Card container (CardContent, CardHeader, CardTitle, CardDescription)
- **Separator** - Horizontal divider
- **Avatar** - User avatar with AvatarImage, AvatarFallback

#### Complex Components
- **Dialog** - Modal dialog (DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter)
- **Alert-Dialog** - Confirmation dialog
- **Dropdown-Menu** - Dropdown menu (DropdownMenuContent, DropdownMenuItem, etc.)
- **Sheet** - Slide-out panel
- **Tabs** - Tab interface (TabsList, TabsTrigger, TabsContent)
- **Accordion** - Collapsible sections
- **Popover** - Hover/click popup
- **Tooltip** - Hover tooltip
- **Pagination** - Page navigation
- **Table** - Data table (TableHeader, TableBody, TableRow, TableCell)
- **Skeleton** - Loading skeleton
- **TableSkeleton** - Table-specific loading skeleton
- **Progress** - Progress bar
- **Slider** - Range slider
- **Scroll-Area** - Scrollable container
- **Calendar** - Date picker
- **Breadcrumb** - Breadcrumb navigation
- **Alert** - Alert message
- **Context-Menu** - Right-click menu
- **Menubar** - Menu bar
- **Canvas-menu** - Custom menu

#### Notification
- **Sonner** - Toast notifications (sonner.tsx wrapper)
- Used throughout with: `toast.error()`, `toast.success()`, `toast.loading()`, `toast.promise()`

---

## Layouts

### Layout Structure

1. **MainLayout** - Customer-facing pages with navbar and footer
2. **DashboardLayout** - Vendor/Admin dashboards with sidebar and topbar
3. **AuthLayout** - Authentication pages (centered card layout)

### CSS Architecture

- **Tailwind CSS** - Utility-first styling
- **Custom Classes:**
  - `.glass` - Frosted glass effect
  - `.glass-strong` - Stronger glass effect
  - `.gradient-primary` - Primary gradient
  - `.gradient-dark` - Dark gradient background
  - `.brand-glow` - Branding glow effect
  - `.neon-glow` - Neon glow on hover
  - `.status-active` - Green status styling
  - `.status-pending` - Yellow status styling
  - `.status-rejected` - Red status styling

---

## Hooks

Custom React hooks for shared logic:

### **useDebounce** (`hooks/useDebounce.ts`)
- **Purpose:** Debounce value changes
- **Signature:** `useDebounce<T>(value: T, delay: number): T`
- **Returns:** Debounced value
- **Use Cases:**
  - Search input (300-500ms delay)
  - API request triggers
  - Filter changes
- **Examples:**
  ```typescript
  const debouncedSearch = useDebounce(search, 300);
  ```

### **usePagination** (`hooks/usePagination.ts`)
- **Purpose:** Manage pagination state and calculations
- **Signature:**
  ```typescript
  usePagination(options: {
    totalItems: number;
    itemsPerPage?: number; // default: 12
    initialPage?: number; // default: 1
  })
  ```
- **Returns:**
  ```typescript
  {
    currentPage: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    hasNext: boolean;
    hasPrev: boolean;
  }
  ```
- **Use Cases:**
  - Product listing pagination
  - Order history pagination
  - Admin tables with pagination

### **use-mobile** / **useIsMobile** (`hooks/use-mobile.ts`)
- **Purpose:** Detect mobile viewport
- **Signature:** `useIsMobile(): boolean`
- **Returns:** True if viewport width < 768px
- **Use Cases:**
  - Conditional rendering (mobile menu vs. navbar)
  - Layout adjustments
  - Component visibility

---

## Store & State Management

State management uses **Zustand** for scalable, simple stores:

### **useAuthStore** (`store/authStore.ts`)
- **Purpose:** Manage authentication state
- **State:**
  ```typescript
  {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  ```
- **Methods:**
  - `login(email, password): Promise<void>`
  - `logout(): void`
  - `register(userData): Promise<void>`
  - `refreshToken(): Promise<void>`
  - `setUser(user): void`
- **Persistence:** LocalStorage for token
- **Integration:** Used in MainLayout, ProtectedRoute, all dashboard pages

### **useCartStore** (`store/cartStore.ts`)
- **Purpose:** Manage shopping cart state
- **State:**
  ```typescript
  {
    items: CartItem[];
    totalPrice: number;
  }
  ```
- **Methods:**
  - `addItem(product, quantity): void`
  - `removeItem(productId): void`
  - `updateQuantity(productId, quantity): void`
  - `clearCart(): void`
  - `totalItems(): number` - Type calculation method
  - `getTotalPrice(): number`
- **Persistence:** LocalStorage for cart items
- **Integration:** Used in ProductCard, CartPage, CheckoutPage, MainLayout

### **useUIStore** (`store/uiStore.ts`)
- **Purpose:** Manage UI state (theme, menus, modals)
- **State:**
  ```typescript
  {
    isMobileMenuOpen: boolean;
    theme: 'dark' | 'light';
    isModalOpen: boolean;
  }
  ```
- **Methods:**
  - `toggleMobileMenu(): void`
  - `setMobileMenuOpen(open): void`
  - `toggleTheme(): void`
  - `setTheme(theme): void`
  - `openModal(): void`
  - `closeModal(): void`
- **Persistence:** LocalStorage for theme preference
- **Integration:** Used in MainLayout, DashboardLayout, MobileMenu

---

## Project Structure

```
client/
├── src/
│   ├── App.tsx                 # Root component with ClickSpark wrapper
│   ├── main.tsx               # React DOM render
│   ├── index.css              # Global styles
│   │
│   ├── components/            # Reusable components
│   │   ├── analytics/         # Analytics visualization components
│   │   │   └── AnalyticsChart.tsx
│   │   ├── common/            # Common state components
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   ├── dashboard/         # Dashboard-specific components
│   │   │   └── MetricCard.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── order/             # Order-related components
│   │   │   ├── CartItem.tsx
│   │   │   ├── CheckoutSummary.tsx
│   │   │   └── OrderTable.tsx
│   │   ├── product/           # Product-related components
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── ProductTable.tsx
│   │   ├── shared/            # Shared interactive components
│   │   │   ├── ClickSpark.tsx
│   │   │   └── LightRays.tsx
│   │   ├── ui/                # Primitive UI components (shadcn/ui)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-group.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── TableSkeleton.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── tooltip.tsx
│   │   ├── vendor/            # Vendor-specific components
│   │   │   └── VendorCard.tsx
│   │   └── utils/             # Utility components
│   │
│   ├── pages/                 # Page components (route-level)
│   │   ├── LandingPage.tsx
│   │   ├── ProductListingPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrderHistoryPage.tsx
│   │   ├── ProfilePage.tsx
│   │   │
│   │   ├── admin/             # Admin pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── OrderMonitoring.tsx
│   │   │   ├── ProductModeration.tsx
│   │   │   ├── RevenueAnalytics.tsx
│   │   │   └── VendorManagement.tsx
│   │   │
│   │   ├── auth/              # Authentication pages
│   │   │   └── LoginPage.tsx
│   │   │
│   │   └── vendor/            # Vendor pages
│   │       ├── AddProductPage.tsx
│   │       ├── EarningsPage.tsx
│   │       ├── InventoryPage.tsx
│   │       ├── OrderManagement.tsx
│   │       ├── ProductManagement.tsx
│   │       └── VendorDashboard.tsx
│   │
│   ├── routes/                # Routing configuration
│   │   ├── AppRouter.tsx      # Main router with lazy loading
│   │   └── ProtectedRoute.tsx # Route protection wrapper
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.ts
│   │   ├── useDebounce.ts
│   │   └── usePagination.ts
│   │
│   ├── store/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/              # API and external services
│   │   └── api.ts            # API client wrapper
│   │
│   ├── lib/                   # Utilities and helpers
│   │   ├── utils.ts          # clsx/cn utility
│   │   └── ...
│   │
│   ├── assets/                # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── vite-env.d.ts          # Vite environment types
│
├── index.html                 # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── tailwind.config.js        # Tailwind CSS config
├── package.json              # Dependencies
└── README.md                 # Project readme
```

---

## Key Technologies

| Technology | Purpose |
|------------|---------|
| **React 18+** | UI library and component framework |
| **TypeScript** | Type safety and better DX |
| **Vite** | Fast build tool and dev server |
| **React Router v6** | Client-side routing |
| **Zustand** | Lightweight state management |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/UI** | Pre-built accessible UI components |
| **Lucide React** | Icon library |
| **Sonner** | Toast notifications |
| **Axios** (via API wrapper) | HTTP requests |

---

## API Integration

The frontend uses a centralized API service (`services/api.ts`) that provides:

### API Methods
- `auth.login(email, password)`
- `auth.register(userData)`
- `auth.logout()`
- `products.getAll()`
- `products.getById(id)`
- `products.create(data)`
- `products.update(id, data)`
- `products.delete(id)`
- `orders.getAll()`
- `orders.getById(id)`
- `orders.create(cartItems)`
- `orders.update(id, data)`
- `vendors.getAll()`
- `vendors.getById(id)`
- `vendors.approve(id)`
- `vendors.suspend(id)`
- `analytics.getOverview()`
- `analytics.getSales(dateRange)`

### Error Handling
- Centralized error handling in API wrapper
- Auto-refresh token on 401
- Toast notifications for user feedback
- Proper error propagation to components

---

## Authentication & Authorization

### Protected Routes
- `ProtectedRoute` component wraps dashboard pages
- Role-based access control:
  - **customer:** Orders, Profile, Dashboard (future)
  - **vendor:** All vendor routes (/vendor/*)
  - **admin:** All admin routes (/admin/*)

### Token Management
- JWT token stored in localStorage
- Auto-refresh on expiration
- Logout clears token and user data

### Route Structure
```
/                    # Public (Customer pages)
/login              # Public (Auth)
/cart               # Protected (customer)
/checkout           # Protected (customer)
/profile            # Protected (any role)
/vendor/*           # Protected (vendor role)
/admin/*            # Protected (admin role)
```

---

## Performance Optimizations

1. **Code Splitting:** Lazy loading pages with React.lazy() and Suspense
2. **Pagination:** Customers products use 12-item pages
3. **Debouncing:** Search inputs debounced at 300ms
4. **Memoization:** useMemo for filtered lists, useCallback for event handlers
5. **Image Optimization:** Product images optimized by backend
6. **CSS-in-JS:** Minimal Tailwind CSS with custom utility classes
7. **Bundle Size:** Tree-shaking unused components
8. **State Optimization:** Zustand for minimal re-renders

---

## Styling & Design System

### Color Scheme
- **Primary:** Purple/Magenta gradient
- **Background:** Dark with subtle gradients
- **Foreground:** Light text
- **Accent:** Secondary purple tones
- **Status Colors:**
  - Green: Success/Delivered
  - Blue: Processing/Information
  - Yellow: Pending/Warning
  - Red: Error/Cancelled

### Typography
- **Headings:** Bold, large sizes (h1: 2xl, h2: xl, h3: lg)
- **Body:** Regular weight, readable size
- **Labels:** Small, medium weight
- **Mono:** For technical content

### Spacing
- Uses Tailwind spacing scale (4px units)
- Consistent padding/margin throughout
- 8px, 16px, 24px, 32px common values

### Effects
- **Glass Effect:** Frosted glass with backdrop blur
- **Gradients:** From primary colors
- **Shadows:** Subtle, elevation-based
- **Hover States:** Scale, glow, color change
- **Animations:** Smooth transitions (300-400ms)

---

## Notable Features

1. **Dark Mode:** Application uses dark theme exclusively
2. **Responsive Design:** Mobile-first approach
3. **Real-time Filters:** Instant filtering with debounce
4. **Toast Notifications:** User feedback for actions
5. **Skeleton Loading:** Better perceived performance
6. **Empty/Error States:** User-friendly fallbacks
7. **Multi-step Forms:** Checkout with step validation
8. **Analytics Charts:** Visual data representation
9. **Role-based UI:** Content adjusts based on user role
10. **Accessibility:** ARIA labels, semantic HTML, keyboard navigation

---

## Development Guidelines

### Adding New Pages
1. Create page in `pages/[category]/PageName.tsx`
2. Add route in `AppRouter.tsx` with lazy loading
3. Use appropriate layout (MainLayout, DashboardLayout, or AuthLayout)
4. Implement error and loading states
5. Update breadcrumb if needed

### Adding New Components
1. Create in `components/[category]/ComponentName.tsx`
2. Define TypeScript interfaces for props
3. Use shadcn/ui components as building blocks
4. Export from component file
5. Add to relevant component index if needed

### Styling Guidelines
1. Use Tailwind utilities as primary styling method
2. Use custom classes for repeated patterns
3. Maintain consistent spacing and sizing
4. Support both light and dark modes
5. Test responsive behavior at 640px, 768px, 1024px breakpoints

---

## Common Patterns

### Fetch and Display
```typescript
const [data, setData] = useState<T[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(false);

useEffect(() => {
  setLoading(true);
  api.endpoint.getAll()
    .then(setData)
    .catch(() => setError(true))
    .finally(() => setLoading(false));
}, []);

if (error) return <ErrorState onRetry={refresh} />;
if (loading) return <Skeleton />;
if (data.length === 0) return <EmptyState />;
```

### Search with Debounce
```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

const filtered = useMemo(
  () => items.filter(item => 
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  ),
  [items, debouncedSearch]
);
```

### Protected Route
```typescript
<Route element={
  <ProtectedRoute allowedRoles={['customer']}>
    <ComponentName />
  </ProtectedRoute>
} />
```

---

This documentation provides a comprehensive overview of the VenDeX frontend application, all pages, components, and their functionality. For implementation details, refer to the source files.

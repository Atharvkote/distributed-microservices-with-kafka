# Multi-Vendor E-Commerce Platform - System Overview and Setup

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Services Description](#services-description)
3. [Infrastructure Components](#infrastructure-components)
4. [API Documentation](#api-documentation)
5. [Setup Instructions](#setup-instructions)
6. [How It Works](#how-it-works)

## Architecture Overview

The Multi-Vendor E-Commerce platform is built using a microservices architecture deployed in Docker containers orchestrated via Docker Compose. The system consists of multiple independent services that communicate through REST APIs and Apache Kafka for event-driven messaging.

### Key Components:
- **API Gateway**: Kong Gateway for routing and load balancing
- **Microservices**: 6 core services (Identity, Catalog, Order, Payment, Messaging, Analytics)
- **Message Broker**: Apache Kafka for inter-service communication
- **Cache/Database**: Redis for caching, MongoDB for data persistence
- **Workers**: Background job processors for email and notifications
- **Frontend**: React-based client application

## Services Description

### 1. Identity Service (Port: 3001)
- **Purpose**: User authentication and authorization
- **Technology**: Node.js, Express, MongoDB, JWT
- **Features**:
  - User registration and login
  - Vendor profile management
  - OAuth integration
  - Session management

### 2. Catalog Service (Port: 3002)
- **Purpose**: Product catalog management
- **Technology**: Node.js, Express, MongoDB, Redis
- **Features**:
  - Product CRUD operations
  - Category management
  - Inventory tracking
  - Product reviews and ratings
  - Image upload (Cloudinary integration)

### 3. Order Service (Port: 3004)
- **Purpose**: Order processing and lifecycle management
- **Technology**: Node.js, Express, MongoDB, Kafka
- **Features**:
  - Order creation and tracking
  - Order status updates
  - Integration with payment service

### 4. Payment Service (Port: 3005)
- **Purpose**: Payment processing
- **Technology**: Node.js, Express, MongoDB
- **Features**:
  - Payment gateway integration
  - Transaction processing
  - Payment status tracking

### 5. Messaging Service (Port: 3002)
- **Purpose**: Real-time messaging and notifications
- **Technology**: Node.js, Express, Socket.IO, Redis
- **Features**:
  - Real-time chat between users and vendors
  - Notification system
  - WebSocket connections

### 6. Analytics Service (Port: 3000)
- **Purpose**: Business analytics and reporting
- **Technology**: Node.js, Express, MongoDB
- **Features**:
  - Sales analytics
  - User behavior tracking
  - Performance metrics

### Supporting Services

#### Mail Worker
- **Purpose**: Email notifications
- **Technology**: Node.js, Kafka consumer
- **Features**: Order confirmations, password resets, marketing emails

#### Notification Worker
- **Purpose**: Push notifications
- **Technology**: Node.js, Kafka consumer
- **Features**: Real-time alerts, order updates

## Infrastructure Components

### Docker Setup
The entire system runs in Docker containers defined in multiple compose files:

- **app.compose.yml**: Main application services and Kong gateway
- **deps.compose.yml**: Supporting services (Redis, monitoring stack)
- **kafka.compose.yml**: Kafka cluster with 3 brokers in KRaft mode

### Kafka Configuration
- **Cluster**: 3-node Kafka cluster using KRaft (Kafka Raft) mode
- **Ports**: 9094, 9095, 9096 for external access
- **Topics**: Used for event-driven communication between services
- **Consumers**: Services subscribe to relevant topics for cross-service updates

### Redis Setup
- **Purpose**: Caching, rate limiting, session storage
- **Port**: 6379
- **Integration**: Used by services for performance optimization

### Kong Gateway
- **Configuration**: Declarative configuration via kong-manifest.yml
- **Routes**:
  - `/auth` → Identity Service
  - `/analytics` → Analytics Service
  - `/messages` → Messaging Service
  - `/payments` → Payment Service
  - `/orders` → Order Service
- **Features**: Load balancing, rate limiting, authentication

## API Documentation

### Authentication Endpoints (Identity Service)
All protected endpoints require JWT token in Authorization header.

#### Public Endpoints:
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/oAuth` - OAuth authentication
- `POST /auth/check-auth` - Verify authentication status

#### User Profile Endpoints:
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `DELETE /profile` - Delete user account

#### Vendor Profile Endpoints:
- `POST /vendor/profile` - Create vendor profile
- `GET /vendor/profile` - Get vendor profile
- `PUT /vendor/profile` - Update vendor profile

### Catalog Endpoints (Catalog Service)

#### Public Endpoints:
- `GET /catalog` - Get all public products
- `GET /catalog/:id` - Get product by ID

#### Vendor Endpoints (Require Authentication):
- `POST /catalog` - Create new product
- `GET /catalog/vendor/:id` - Get vendor's products
- `PUT /catalog/:id` - Update product
- `DELETE /catalog/:id` - Delete product

#### Category Endpoints:
- `GET /categories` - Get all categories
- `POST /categories` - Create category (Admin/Vendor)
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

#### Inventory Endpoints:
- `GET /inventory/:productId` - Get product inventory
- `PUT /inventory/:productId` - Update inventory

#### Review Endpoints:
- `GET /reviews/:productId` - Get product reviews
- `POST /reviews/:productId` - Add review
- `PUT /reviews/:reviewId` - Update review
- `DELETE /reviews/:reviewId` - Delete review

### Order Endpoints (Order Service)
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status

### Payment Endpoints (Payment Service)
- `POST /payments` - Process payment
- `GET /payments/:orderId` - Get payment status
- `POST /payments/refund` - Process refund

### Messaging Endpoints (Messaging Service)
- `GET /messages/:conversationId` - Get conversation messages
- `POST /messages` - Send message
- `WebSocket /socket.io` - Real-time messaging

### Analytics Endpoints (Analytics Service)
- `GET /analytics/sales` - Sales analytics
- `GET /analytics/users` - User analytics
- `GET /analytics/products` - Product performance

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- pnpm package manager
- Git

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Multi-Vendor-ECommerce
   ```

2. **Environment Variables**:
   Create `.env` files in each service directory with required variables:
   - Database URLs (MongoDB)
   - Redis URL
   - Kafka broker URLs
   - JWT secrets
   - Cloudinary credentials
   - Email service credentials

### Docker Setup

1. **Start Infrastructure**:
   ```bash
   # Start Redis
   docker-compose -f docker/deps.compose.yml up -d redis

   # Start Kafka cluster
   docker-compose -f docker/kafka.compose.yml up -d
   ```

2. **Build and Start Services**:
   ```bash
   # Build all services
   docker-compose -f docker/app.compose.yml build

   # Start all services
   docker-compose -f docker/app.compose.yml up -d
   ```

3. **Verify Setup**:
   ```bash
   # Check service health
   docker-compose -f docker/app.compose.yml ps

   # Check Kong admin API
   curl http://localhost:8001/services
   ```

### Local Development Setup

1. **Install Dependencies**:
   ```bash
   # Root dependencies
   pnpm install

   # Client dependencies
   cd client && pnpm install

   # Service dependencies
   cd services/catalog-service && pnpm install
   # Repeat for other services
   ```

2. **Start Services Locally**:
   ```bash
   # Start infrastructure (Redis, Kafka)
   docker-compose -f docker/deps.compose.yml up -d
   docker-compose -f docker/kafka.compose.yml up -d

   # Start individual services
   cd services/catalog-service && pnpm run dev
   # Repeat for other services
   ```

3. **Start Client**:
   ```bash
   cd client && pnpm run dev
   ```

### Kafka Setup Details

The Kafka cluster uses KRaft mode (no ZooKeeper required):

- **Brokers**: 3 nodes for high availability
- **Cluster ID**: kraft-cluster-123
- **Listeners**:
  - INTERNAL: For inter-broker communication
  - EXTERNAL: For client connections
  - CONTROLLER: For Raft consensus

**Topics Configuration**:
- Auto-create topics enabled
- Replication factor: 3
- Partitions: Configurable per topic

### Monitoring Setup (Optional)

Uncomment monitoring services in `deps.compose.yml`:
- **Prometheus**: Metrics collection (Port 9090)
- **Grafana**: Dashboard visualization (Port 3000)
- **Loki**: Log aggregation (Port 3100)

## How It Works

### Request Flow

1. **Client Request**: User interacts with React frontend
2. **API Gateway**: Kong routes request to appropriate service
3. **Service Processing**: Service handles business logic
4. **Database Operations**: MongoDB for data persistence
5. **Cache**: Redis for performance optimization
6. **Event Publishing**: Kafka for cross-service communication
7. **Background Jobs**: Workers process async tasks

### Data Flow Example (Product Purchase)

1. User browses products (Catalog Service)
2. User adds to cart and checks out (Order Service)
3. Payment processing (Payment Service)
4. Order confirmation email (Mail Worker via Kafka)
5. Real-time order status (Messaging Service)
6. Analytics update (Analytics Service)

### Authentication Flow

1. User registers/logs in (Identity Service)
2. JWT token issued
3. Token included in subsequent requests
4. Services validate token via middleware
5. User profile data shared via Kafka events

### Real-time Communication

- **WebSocket**: Socket.IO for real-time messaging
- **Redis Adapter**: For scaling across multiple instances
- **Kafka Integration**: Events trigger notifications

### Scalability Features

- **Horizontal Scaling**: Services can be scaled independently
- **Load Balancing**: Kong distributes traffic
- **Caching**: Redis reduces database load
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Message Queues**: Asynchronous processing for better performance

### Security Measures

- **JWT Authentication**: Stateless authentication
- **Rate Limiting**: Prevents DDoS attacks
- **CORS**: Configured for allowed origins
- **Helmet**: Security headers
- **Input Validation**: Zod schemas for data validation
- **Encryption**: Password hashing with bcrypt

This comprehensive setup provides a robust, scalable e-commerce platform with modern architecture patterns and best practices.
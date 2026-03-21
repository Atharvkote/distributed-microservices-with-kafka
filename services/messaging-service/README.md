# Messaging Service Documentation

## Overview

The Messaging Service is a critical component of the Multi-Vendor E-Commerce platform responsible for handling real-time communications, notifications, and event-driven messaging. It provides both synchronous (WebSocket-based) and asynchronous (Kafka-based) messaging capabilities to ensure users and vendors receive timely updates about their activities.

## Architecture

### Technology Stack
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Real-time Communication**: Socket.IO with Redis adapter for scaling
- **Message Queue**: Apache Kafka for event-driven architecture
- **Job Queue**: BullMQ with Redis for email processing
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based middleware
- **Logging**: Winston with Loki integration
- **Monitoring**: Prometheus client for metrics
- **Security**: Helmet, CORS, rate limiting (Redis-backed)

### Key Components

#### 1. Real-Time Messaging (Socket.IO)
- WebSocket connections for instant notifications
- Redis adapter for horizontal scaling across multiple instances
- Room-based messaging (user-specific rooms)
- Heartbeat mechanism for connection health monitoring

#### 2. Event Processing (Kafka)
- Consumer for auth-related events (user/vendor lifecycle)
- Event registry pattern for extensible message handling
- Topics: `auth`, `order`, `payment` (order/payment handlers prepared but commented)

#### 3. Notification System
- Persistent notification storage in MongoDB
- REST API for notification retrieval with pagination
- Scope-based notifications (GLOBAL, USER-specific)
- Real-time delivery via WebSocket

#### 4. Email Processing (BullMQ)
- Asynchronous email job queuing
- Retry mechanisms with exponential backoff
- Integration with mail worker service

## API Endpoints

### Base URL
```
http://localhost:3003
```

### Health Check
```http
GET /
```
**Response**: Welcome message confirming service availability

```http
GET /health
```
**Response**: "OK" (200 status)

### Notifications API

#### Get User Notifications
```http
GET /notification/:userId?page=1&limit=20
```

**Parameters:**
- `userId` (path): User identifier
- `page` (query, optional): Page number (default: 1, min: 1)
- `limit` (query, optional): Items per page (default: 20, max: 100)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "data": [
    {
      "_id": "notification_id",
      "type": "SYSTEM|ORDER|PAYMENT|INFO",
      "title": "Notification Title",
      "message": "Notification content",
      "scope": "GLOBAL|USER",
      "userId": "user_id",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true
  }
}
```

**Error Responses:**
- `400`: Missing user ID
- `401`: Unauthorized (invalid/missing JWT)
- `500`: Internal server error

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3003', {
  auth: {
    token: 'jwt_token'
  }
});
```

### Client Events

#### Register User
```javascript
socket.emit('register-user', userId);
```
Joins the user-specific room for targeted notifications.

### Server Events

#### Notification
```javascript
socket.on('notification', (payload) => {
  console.log('New notification:', payload);
});
```

**Payload Structure:**
```json
{
  "type": "SYSTEM|ORDER|PAYMENT|INFO",
  "title": "Notification Title",
  "message": "Notification content",
  "userId": "user_id"
}
```

## Kafka Event Processing

### Consumed Topics

#### Auth Topic
**Group ID**: `MS-consumer-group`

**Events:**
- `USER_CREATED`: Triggers welcome email and notification
- `USER_UPDATED`: Triggers profile update email and notification
- `USER_DELETED`: Triggers account deletion email
- `VP_CREATED`: Triggers vendor welcome email and notification
- `VP_UPDATED`: Triggers vendor profile update email and notification
- `VP_DELETED`: Triggers vendor deletion email

**Event Format:**
```json
{
  "eventType": "USER_CREATED",
  "payload": {
    "userId": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Future Topics (Prepared)
- **Order Topic**: Order lifecycle events
- **Payment Topic**: Payment status updates

## Data Models

### Notification Schema
```javascript
{
  type: {
    type: String,
    enum: ["SYSTEM", "ORDER", "PAYMENT", "INFO"],
    required: true
  },
  title: String,
  message: {
    type: String,
    required: true
  },
  scope: {
    type: String,
    enum: ["GLOBAL", "USER"],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: function() { return this.scope === "USER"; }
  },
  isRead: {
    type: Boolean,
    default: false
  }
}
```

**Indexes:**
- `{ scope: 1, createdAt: -1 }`
- `{ userId: 1, scope: 1, createdAt: -1 }`

## Configuration

### Environment Variables

#### Required
```env
SERVER_PORT=3003
NODE_ENV=development|production
MONGODB_URI=mongodb://username:password@host:port/database
REDIS_URL=redis://host:port
KAFKA_BROKERS=broker1:9092,broker2:9092,broker3:9092
```

#### Optional (Cloudinary for future use)
```env
CLOUNDINARY_CLOUD_NAME=your_cloud_name
CLOUNDINARY_API_KEY=your_api_key
CLOUNDINARY_API_SECRET=your_api_secret
```

### Rate Limiting

#### Global Rate Limit
- **Points**: 100 requests
- **Duration**: 30 seconds
- **Block Duration**: 15 minutes on exceed

#### Auth Rate Limit
- **Points**: 10 requests
- **Duration**: 15 minutes
- **Block Duration**: 15 minutes on exceed

## Security Features

### Authentication
- JWT-based authentication middleware
- Token validation on protected routes
- Socket.IO authentication via connection auth

### Authorization
- User-specific notification access
- Scope-based notification filtering

### Protection
- Helmet for HTTP security headers
- CORS configuration with allowed origins
- Redis-backed rate limiting
- Request logging and monitoring

## Monitoring & Logging

### Logging
- **Winston Logger**: Structured logging with multiple transports
- **Loki Integration**: Log aggregation and querying
- **Component-specific loggers**: kafka, redis, socketio, mongodb

### Metrics
- **Prometheus Client**: Application metrics collection
- Health check endpoints for service monitoring

### Log Levels
- ERROR: Critical errors
- WARN: Warnings and non-critical issues
- INFO: General information and events
- DEBUG: Detailed debugging information

## Deployment

### Docker Configuration
```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3003
CMD ["npm", "start"]
```

### Docker Compose Integration
Part of the main application compose stack with dependencies on:
- MongoDB
- Redis
- Kafka cluster
- Kong Gateway (for routing)

## Development

### Local Setup
1. Install dependencies: `npm install`
2. Configure environment variables (copy `.env.example` to `.env`)
3. Start development server: `npm run dev`
4. For production: `npm start`

### Testing
```bash
npm test
```
*Note: Test scripts need to be implemented*

### Code Structure
```
messaging-service/
├── configs/           # Database and service configurations
├── controllers/       # Request handlers
├── kafka/            # Event processing
│   ├── handlers/     # Event-specific handlers
│   └── event-registry.js
├── middleware/       # Authentication and validation
├── models/          # MongoDB schemas
├── routes/          # API route definitions
├── socket-handlers/ # WebSocket event handlers
├── utils/           # Utilities and helpers
├── server.js        # Main application entry point
└── package.json     # Dependencies and scripts
```

## Integration Points

### Service Dependencies
- **Identity Service**: User/vendor authentication events
- **Order Service**: Order status notifications (future)
- **Payment Service**: Payment status notifications (future)
- **Mail Worker**: Email delivery processing
- **Kong Gateway**: API routing and load balancing

### External Services
- **MongoDB**: Notification persistence
- **Redis**: Caching, rate limiting, Socket.IO scaling
- **Kafka**: Event consumption
- **Cloudinary**: Media storage (prepared for future use)

## Future Enhancements

### Planned Features
1. **Real-time Chat**: Direct messaging between users and vendors
2. **Push Notifications**: Mobile push notification support
3. **Notification Preferences**: User-configurable notification settings
4. **Bulk Notifications**: Admin broadcast capabilities
5. **Notification Templates**: Dynamic content generation
6. **Analytics**: Notification delivery and engagement metrics

### Scalability Improvements
- Message archiving and cleanup policies
- Notification batching for high-volume scenarios
- Geographic distribution with Redis Cluster
- Kafka topic partitioning for better throughput

## Troubleshooting

### Common Issues

#### Socket.IO Connection Issues
- Verify Redis connectivity for adapter
- Check CORS configuration
- Ensure JWT token is valid

#### Kafka Consumer Lag
- Monitor consumer group lag
- Check broker connectivity
- Verify topic existence and permissions

#### Rate Limiting Blocks
- Clear Redis keys for testing
- Adjust rate limit configurations
- Monitor Redis memory usage

#### Email Queue Failures
- Check BullMQ dashboard
- Verify Redis connectivity
- Monitor mail worker service health

### Logs Location
- Application logs: Winston transports
- Kafka logs: Integrated with Winston
- Socket.IO logs: Component-specific logger

### Health Checks
- Application health: `/health`
- Database connectivity: MongoDB connection logs
- Message queue: Kafka consumer logs
- Cache: Redis connection logs

## Contributing

### Code Standards
- ES6+ syntax with modules
- Async/await for asynchronous operations
- Proper error handling and logging
- JSDoc comments for functions
- Consistent naming conventions

### Testing Requirements
- Unit tests for controllers and handlers
- Integration tests for Kafka consumers
- WebSocket connection tests
- API endpoint tests with authentication

### Documentation Updates
- Update this README for API changes
- Document new event types and handlers
- Maintain changelog for version updates</content>
<parameter name="filePath">c:\Project\Multi-Vendor-ECommerce\services\messaging-service\README.md
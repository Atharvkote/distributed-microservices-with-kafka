# Notification System Documentation

## Overview

The notification system is a distributed, event-driven architecture that handles real-time user notifications across the platform. It spans three main components:

1. **Messaging Service** - Receives and emits notifications via Socket.IO
2. **Notification Worker** - Processes notification jobs from BullMQ queue
3. **Redis Pub/Sub** - Event broker for inter-service communication

## Architecture Flow

```
┌─────────────────┐
│  Identity       │
│  Service        │  Kafka: USER_CREATED
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Messaging Service      │
├─────────────────────────┤
│ 1. Kafka Consumer       │ ◄─── Consumes USER_CREATED event
│ 2. Auth Handler         │ ──► Queues notification job
│ 3. Notification Queue   │
└────────┬────────────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
    Redis Queue                         Redis Pub/Sub
  (notificationQueue)                  (notification-events)
         │                                     │
         ▼                                     │
┌─────────────────────────┐                   │
│ Notification Worker     │                   │
├─────────────────────────┤                   │
│ 1. BullMQ Processing    │                   │
│ 2. Validation (Zod)     │                   │
│ 3. Publish to Pub/Sub   │ ──────────────────┘
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Messaging Service       │
├─────────────────────────┤
│ 1. Redis Subscriber     │ ◄─── Listens to pub/sub
│ 2. Notification Ingest  │ ──► Process & persist
│ 3. Socket.IO Broadcaster│ ──► Emit to client
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ MongoDB                 │
│ Notifications Collection│
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ React Client            │
│ Socket.IO Listener      │
└─────────────────────────┘
```

## Data Flow Step-by-Step

### 1. Event Triggering (Identity Service)
```
User Registration → publishUserCreated() → Kafka Topic: "auth"
  └─ Payload:
     - userId: "507f1f77bcf86cd799439011" (ObjectId as string)
     - email: "user@example.com"
     - name: "John Doe"
```

### 2. Event Processing (Messaging Service - Kafka Handler)
```
Kafka Consumer → Event Registry → handleUserCreation()
  ├─ Queue email job (if Redis available)
  ├─ Call userNotification() for immediate notification
  └─ Queue notification job to notificationQueue
```

### 3. Queue Processing (Notification Worker)
```
BullMQ Worker processes "send-notification" job
  ├─ Validate with Zod schema
  ├─ Create eventId for idempotency
  ├─ Publish to Redis Pub/Sub: "notification-events"
  └─ Log job completion/failure
```

### 4. Ingest Processing (Messaging Service - Subscriber)
```
Redis Subscriber listens to "notification-events"
  ├─ Parse message
  ├─ Check for duplicates (by sourceEventId)
  ├─ Persist to MongoDB
  ├─ Check rate limits
  ├─ Emit via Socket.IO to user:${userId}
  └─ Log emission
```

### 5. Client Reception (React)
```
Socket.IO Client listens to "notification" event
  ├─ Register with server via "register-user" event
  ├─ Receive notification payload
  └─ Update UI
```

## Key Components

### 1. Notification Model (MongoDB)
```javascript
{
  type: "INFO" | "ALERT" | "WARNING",
  title: string,
  message: string,
  scope: "GLOBAL" | "USER",
  userId: string (ObjectId as string),
  isRead: boolean,
  sourceEventId: string (unique, indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Notification Queue (BullMQ)
- **Queue Name**: `notificationQueue`
- **Job Name**: `send-notification`
- **Job Payload**:
  ```javascript
  {
    type: "INFO" | "ALERT" | "WARNING",
    title?: string,
    message: string,
    userId: string,
    createdAt?: Date
  }
  ```

### 3. Notification Event (Redis Pub/Sub)
- **Channel**: `notification-events` (configurable via `NOTIFICATION_EVENT_CHANNEL`)
- **Event Payload**:
  ```javascript
  {
    eventId: string, // unique identifier
    userId: string, // receiver
    type: "INFO" | "ALERT" | "WARNING",
    title?: string,
    message: string,
    createdAt: string (ISO format)
  }
  ```

### 4. Socket.IO Event (Client)
- **Event**: `notification`
- **Payload**:
  ```javascript
  {
    _id: string, // MongoDB _id
    type: "INFO" | "ALERT" | "WARNING",
    title?: string,
    message: string,
    userId: string,
    isRead: boolean,
    scope: "GLOBAL" | "USER",
    createdAt: string (ISO format)
  }
  ```

## Environment Configuration

Required environment variables:

```env
# Redis
REDIS_URL=redis://localhost:6379

# Notification system
NOTIFICATION_EVENT_CHANNEL=notification-events
NOTIFICATION_EMIT_RATE_LIMIT=0  # 0 = unlimited
NOTIFICATION_WORKER_CONCURRENCY=5
```

## Error Handling

### At Each Stage:

1. **Identity Service**: Logs Kafka publish errors
2. **Messaging Service (Kafka Handler)**: 
   - Logs queue errors
   - Continues even if queue is unavailable
3. **Notification Worker**: 
   - Retries up to 5 times (exponential backoff, 3s delay)
   - Logs failures without throwing
4. **Messaging Service (Subscriber)**: 
   - Validates with Zod
   - Skips malformed events
   - Handles rate limits gracefully
   - Logs individual errors per event
5. **Client**: 
   - Socket.IO handles connection errors
   - Client gracefully handles missing notifications

## Testing the System

### 1. Start All Services
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: MongoDB
mongod

# Terminal 3: Kafka (if using Kafka)
docker-compose up kafka

# Terminal 4: Notification Worker
cd workers/notification-worker
npm install
npm run dev

# Terminal 5: Messaging Service
cd services/messaging-service
npm install
npm run dev

# Terminal 6: Identity Service
cd services/identity-service
npm install
npm run dev

# Terminal 7: React Client
cd client
npm install
npm run dev
```

### 2. Manual Testing

#### Test User Registration Flow:
```bash
# Call Identity Service to create a user
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

#### Expected Results:
1. User created in MongoDB
2. `USER_CREATED` event published to Kafka
3. Email queued in email-queue (BullMQ)
4. Notification queued in notificationQueue (BullMQ)
5. Notification Worker processes the job
6. Event published to Redis Pub/Sub channel
7. Messaging Service receives and ingests notification
8. Notification persisted in MongoDB
9. Socket.IO emits to connected client

#### Verify in Messaging Service logs:
```
[Notification Worker] :: ... Notification job completed
[Redis Server] :: ... Notification event published
[Messaging Service] :: ... Notification event received
[Messaging Service] :: ... Notification persisted
[Messaging Service] :: ... Notification emitted
```

### 3. Check MongoDB Collections:
```javascript
// In MongoDB:
db.notifications.findOne({ userId: "507f1f77bcf86cd799439011" })
```

### 4. Monitor with Redis CLI:
```bash
redis-cli

# Subscribe to notification events
SUBSCRIBE notification-events
```

## Troubleshooting

### "Cannot access 'redisClient' before initialization"
- **Cause**: Circular module import
- **Fix**: Ensure notification queue is initialized in server.js, not in separate file
- **Status**: ✅ FIXED

### Notifications not appearing on client
1. Check Socket.IO connection
2. Verify client registers user with `register-user` event
3. Check Redis pub/sub: `redis-cli SUBSCRIBE notification-events`
4. Check Notification Worker logs for job failures

### Worker not processing jobs
1. Verify Redis connection: `redis-cli PING`
2. Check NOTIFICATION_WORKER_CONCURRENCY setting
3. Review worker error logs in `workers/notification-worker/logs/`
4. Check bullmq queue stats: `NotificationQueue.getJobs()`

### Duplicate notifications appearing
1. Check sourceEventId uniqueness (ensures idempotency)
2. Review Notification Worker concurrency setting
3. Check for multiple worker instances

## Performance Optimization

### Rate Limiting
```env
NOTIFICATION_EMIT_RATE_LIMIT=10  # Max 10 per second per user
```

### Worker Concurrency
```env
NOTIFICATION_WORKER_CONCURRENCY=10  # Process up to 10 jobs in parallel
```

### Database Indexes
Already created on:
- `scope` + `createdAt` (GLOBAL notifications retrieval)
- `userId` + `scope` + `createdAt` (User notifications retrieval)
- `sourceEventId` (Deduplication)

## Security

1. **User ID Validation**: All notifications require valid userId
2. **Scope Enforcement**: Only GLOBAL or USER scope allowed
3. **Auth Middleware**: All notification routes protected
4. **Input Validation**: Zod schema validation at worker
5. **Event ID Tracking**: sourceEventId prevents replay attacks

## Future Enhancements

1. **Notification Templates**: Store reusable notification templates
2. **User Preferences**: Allow users to mute notification types
3. **Read Receipts**: Track which notifications users have seen
4. **Batch Notifications**: Group multiple events into single notification
5. **Notification Categories**: Organize by type (order, payment, etc)
6. **Scheduled Notifications**: Send at specific times
7. **Notification Archive**: Keep notifications beyond retention period
8. **Multi-channel**: Push notifications, email, SMS, etc

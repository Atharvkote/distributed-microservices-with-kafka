# Kubernetes Cluster

## Overview

This Kubernetes cluster is designed to deploy a multi-vendor e-commerce platform using a microservices architecture. The platform consists of several independent services that communicate with each other, along with supporting infrastructure for messaging, cache/queues, database access, and external load balancing.

## Architecture

The cluster includes the following components:

### Core Services

1. **Identity Service** (`identity-service`)
   - Handles user authentication, authorization, and accounts
   - Port: 3001
   - Replicas: 3

2. **Catalog Service** (`catalog-service`)
   - Manages product catalog, categories, and inventory
   - Port: 3003
   - Replicas: 3

3. **Order Service** (`order-service`)
   - Processes orders and manages order lifecycle
   - Port: 3004
   - Replicas: 3

4. **Payment Service** (`payment-service`)
   - Handles payment processing, transaction records, and Razorpay integrations
   - Port: 3005
   - Replicas: 3

5. **Messaging Service** (`messaging-service`)
   - Manages real-time messaging, notification sockets, and conversations
   - Port: 3002
   - Replicas: 3

6. **Analytics Service** (`analytics-service`)
   - Provides request logging and dashboard analytics capabilities
   - Port: 3000
   - Replicas: 3

### Supporting Components

- **Kong Gateway**: API Gateway running in database-less mode, managing reverse proxying, CORS, and routing to the microservices.
- **Kafka**: Single-replica KRaft broker for event-driven inter-service communications.
- **Redis**: In-memory data store for service rate limiting and BullMQ event queues.
- **Workers**:
  - **Mail Worker**: Listens to email queues to send notification/welcome emails.
  - **Notification Worker**: Listens to events to deliver push notifications.

## Deployment Structure

### Deployments (`deployments/`)
- `configmap.yml`: Shared ConfigMap for central non-sensitive variables.
- `secret.yml`: Shared Kubernetes Secret for MongoDB URIs, credentials, and API keys.
- `redis-deployment.yml` / `kafka-deployment.yml`: Infrastructure deployments.
- `kong-configmap.yml` / `kong-deployment.yml`: Declarative API Gateway configuration.
- `identity-deployment.yml` / `catalog-deployment.yml` / `order-deployment.yml` / `payment-deployment.yml` / `messaging-deployment.yml` / `analytics-deployment.yml`: Microservice applications.
- `mail-worker-deployment.yml` / `notification-worker-deployment.yml`: Background workers.

### Services (`services/`)
- ClusterIP services routing port 80 to respective container ports for all microservices, Redis, Kafka, and Kong Gateway.

### Ingress (`ingress/`)
- `alb-ingress.yaml`: Internet-facing Application Load Balancer routing all traffic (`/`) to `kong-service:8000`.

## Deployment Instructions

1. **Verify your Cluster Config**:
   Ensure you have configured `kubectl` to point to your target Kubernetes cluster.

2. **Apply Configurations and Deployments**:
   ```bash
   # Apply secrets, configmaps, and deployments
   kubectl apply -f deployments/
   ```

3. **Apply Services**:
   ```bash
   # Apply internal networking/ports mapping
   kubectl apply -f services/
   ```

4. **Apply Ingress**:
   ```bash
   # Apply ALB/Ingress controller routing
   kubectl apply -f ingress/
   ```

5. **Verify Cluster State**:
   ```bash
   kubectl get pods -o wide
   kubectl get svc
   kubectl get ingress
   ```

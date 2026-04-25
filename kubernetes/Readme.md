# Kubernetes Cluster


> [!WARNING]
> This Cluster is still under active development.


## Overview

This Kubernetes cluster is designed to deploy a multi-vendor e-commerce platform using a microservices architecture. The platform consists of several independent services that communicate with each other, along with supporting infrastructure for messaging, analytics, and external integrations.

## Architecture

The cluster includes the following components:

### Core Services

1. **Catalog Service** (`catalog-service`)
   - Manages product catalog, categories, and inventory
   - Port: 3002
   - Replicas: 3

2. **Identity Service** (`identity-service`)
   - Handles user authentication and authorization
   - Manages vendor and customer accounts
   - Port: 3001 (assumed based on typical setup)

3. **Order Service** (`orders-service`)
   - Processes orders and manages order lifecycle
   - Port: 3003 (assumed)

4. **Payment Service** (`payment-service`)
   - Handles payment processing and transactions
   - Port: 3004 (assumed)

5. **Messaging Service** (`messaging-service`)
   - Manages real-time messaging and notifications
   - Port: 3005 (assumed)

6. **Analytics Service** (`analytics-service`)
   - Provides analytics and reporting capabilities
   - Port: 3006 (assumed)

### Supporting Components

- **Kong Gateway**: API gateway for routing and managing external traffic
- **Kafka**: Message broker for inter-service communication
- **Prometheus**: Monitoring and alerting
- **Workers**:
  - Mail Worker: Handles email notifications
  - Notification Worker: Manages push notifications

## Deployment Structure

### Deployments
Each service has a corresponding Deployment manifest in the `deployments/` directory:
- `analytics-deployment.yml`
- `catalog-deployment.yml`
- `identity-deployment.yml`
- `messaging-deployment.yml`
- `order-deployment.yml`
- `payment-deployment.yml`

All deployments are configured with:
- 3 replicas for high availability
- Rolling update strategy
- Resource limits and requests (to be defined)

### Services
Each service exposes internal cluster networking via Service manifests in the `services/` directory:
- Type: ClusterIP
- Port mapping: 80 (service port) → container port

### Ingress
- **ALB Ingress** (`ingress/alb-ingress.yaml`): Internet-facing Application Load Balancer
- Routes external traffic to services based on path prefixes
- Current routing: `/catalog` → catalog-service

## Prerequisites

Before deploying to Kubernetes:

1. **Kubernetes Cluster**: Ensure you have access to a Kubernetes cluster (EKS, GKE, AKS, or local)
2. **kubectl**: Install and configure kubectl
3. **Docker Images**: Build and push service images to a registry (e.g., Docker Hub, ECR)
4. **Secrets**: Create Kubernetes secrets for database connections, API keys, etc.
5. **ConfigMaps**: Set up configuration maps for environment-specific settings
6. **Storage**: Configure persistent volumes if needed for databases

## Deployment Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd Multi-Vendor-ECommerce/kubernetes
   ```

2. **Update Image Tags**:
   Edit deployment files to use your actual image tags:
   ```yaml
   image: your-registry/catalog-service:v1.0.0
   ```

3. **Apply Manifests**:
   ```bash
   # Apply all deployments
   kubectl apply -f deployments/

   # Apply all services
   kubectl apply -f services/

   # Apply ingress
   kubectl apply -f ingress/
   ```

4. **Verify Deployment**:
   ```bash
   kubectl get pods
   kubectl get services
   kubectl get ingress
   ```

## Configuration

### Environment Variables
Each service requires specific environment variables. Create ConfigMaps and Secrets accordingly.

### Resource Allocation
Update resource requests and limits in deployment files based on your cluster capacity.

### Scaling
Adjust replica counts in deployment files for production workloads.

## Networking

- **Internal Communication**: Services communicate via ClusterIP services
- **External Access**: Traffic enters through ALB Ingress
- **Service Discovery**: DNS-based service discovery within the cluster

## Monitoring and Logging

- **Prometheus**: Configured for metrics collection
- **Logs**: Centralized logging to be implemented
- **Health Checks**: Readiness and liveness probes configured in deployments

## Security

- **Network Policies**: Implement network policies to restrict traffic between pods
- **Secrets Management**: Use Kubernetes secrets for sensitive data
- **RBAC**: Configure role-based access control for cluster resources

## Troubleshooting

### Common Issues

1. **Pod Pending**: Check resource availability and node capacity
2. **Image Pull Errors**: Verify image registry access and tags
3. **Service Unreachable**: Check service selectors and pod labels
4. **Ingress Not Working**: Verify ALB annotations and target group health

### Useful Commands

```bash
# Check pod status
kubectl get pods -o wide

# View pod logs
kubectl logs <pod-name>

# Describe resources
kubectl describe deployment <deployment-name>
kubectl describe service <service-name>

# Scale deployments
kubectl scale deployment <deployment-name> --replicas=5
```

# Kong API Gateway Configuration

This directory contains the configurations and deployment manifests for the Kong API Gateway. Kong acts as the single entry point for all client requests, routing them to the appropriate microservices based on request paths.

## 1. Routing Table

Kong is configured declaratively using the rules defined in `kong-manifest.yml`. Incoming paths are routed to upstreams as follows:

| Ingress Path | Destination Upstream | Target Port | Service Description |
| ------------ | -------------------- | ----------- | ------------------- |
| `/auth/*`    | `auth-service`       | `3001`      | Identity Service    |
| `/orders/*`  | `orders-service`     | `3002`      | Orders Service      |
| `/catalog/*` | `catalog-service`    | `3003`      | Catalog Service     |
| `/payments/*`| `payment-service`    | `3004`      | Payment Service     |
| `/messages/*`| `messaging-service`  | `3005`      | Messaging Service   |

## 2. Ingress & Strip Path Settings

All routes are configured with:
- `strip_path: true`: Kong strips the route prefix (e.g. `/orders`) from the path before passing the request to the upstream microservice. For instance, a client request to `/orders/create` becomes `/create` when it reaches the `orders-service`.
- `protocols: ["http", "https"]`: Support for standard TLS/HTTP routing.

## 3. Running Kong in Docker Compose

When launching via Docker Compose, Kong operates in **db-less mode**, loading configurations directly from `kong-manifest.yml` mounted as a volume.
- The default external proxy port is bound to `8000`.
- The admin API is exposed internally on port `8001`.

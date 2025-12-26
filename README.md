# Mutli-Vendor E-Commerce Website <i>(Micro Servies Architecture)</i>

> [!IMPORTANT]
> This project is still under active development.

# API Sever Architecture Diagram

```mermaid
graph TD

    4["User<br>External Actor"]
    5["Kong API Gateway<br>API Gateway"]
    6["MongoDB<br>Database"]
    subgraph 1["Backend Microservices"]
        10["Analytics Service<br>Node.js/Express"]
        11["Catalog Service<br>Node.js/Express"]
        12["Messaging Service<br>Node.js/Express"]
        13["Orders Service<br>Node.js/Express"]
        14["Payment Service<br>Node.js/Express"]
        subgraph 2["Identity Service<br>Node.js/Express"]
            15["server.js<br>Node.js/Express"]
            16["Routes<br>Node.js/Express"]
            17["Controllers<br>Node.js/Express"]
            18["auth.middleware.js<br>Node.js"]
            19["generateToken.js<br>Node.js"]
            20["mongodb.config.js<br>Node.js"]
            %% Edges at this level (grouped by source)
            15["server.js<br>Node.js/Express"] -->|defines| 16["Routes<br>Node.js/Express"]
            15["server.js<br>Node.js/Express"] -->|configures| 20["mongodb.config.js<br>Node.js"]
            16["Routes<br>Node.js/Express"] -->|uses| 17["Controllers<br>Node.js/Express"]
            16["Routes<br>Node.js/Express"] -->|applies| 18["auth.middleware.js<br>Node.js"]
            17["Controllers<br>Node.js/Express"] -->|generates| 19["generateToken.js<br>Node.js"]
        end
    end
    subgraph 3["Client Application"]
        7["main.jsx<br>React/JavaScript"]
        8["App.jsx<br>React/JavaScript"]
        9["Client Components<br>React/JavaScript"]
        %% Edges at this level (grouped by source)
        7["main.jsx<br>React/JavaScript"] -->|renders| 8["App.jsx<br>React/JavaScript"]
        8["App.jsx<br>React/JavaScript"] -->|uses| 9["Client Components<br>React/JavaScript"]
    end
    %% Edges at this level (grouped by source)
    5["Kong API Gateway<br>API Gateway"] -->|routes to| 2["Identity Service<br>Node.js/Express"]
    5["Kong API Gateway<br>API Gateway"] -->|routes to| 10["Analytics Service<br>Node.js/Express"]
    5["Kong API Gateway<br>API Gateway"] -->|routes to| 11["Catalog Service<br>Node.js/Express"]
    5["Kong API Gateway<br>API Gateway"] -->|routes to| 12["Messaging Service<br>Node.js/Express"]
    5["Kong API Gateway<br>API Gateway"] -->|routes to| 13["Orders Service<br>Node.js/Express"]
    5["Kong API Gateway<br>API Gateway"] -->|routes to| 14["Payment Service<br>Node.js/Express"]
    4["User<br>External Actor"] -->|accesses| 3["Client Application"]
    3["Client Application"] -->|requests via| 5["Kong API Gateway<br>API Gateway"]
    2["Identity Service<br>Node.js/Express"] -->|persists data to| 6["MongoDB<br>Database"]
    10["Analytics Service<br>Node.js/Express"] -->|persists data to| 6["MongoDB<br>Database"]
    11["Catalog Service<br>Node.js/Express"] -->|persists data to| 6["MongoDB<br>Database"]
    12["Messaging Service<br>Node.js/Express"] -->|persists data to| 6["MongoDB<br>Database"]
    13["Orders Service<br>Node.js/Express"] -->|persists data to| 6["MongoDB<br>Database"]
    14["Payment Service<br>Node.js/Express"] -->|persists data to| 6["MongoDB<br>Database"]

```

```mermaid
flowchart LR

%% =========================
%% MICROSERVICES
%% =========================
subgraph Services["Microservices"]
    PaymentService["Payment Service<br>(Producer + Consumer)"]
    OrderService["Order Service<br>(Producer + Consumer)"]
    EmailService["Email Service<br>(Producer + Consumer)"]
    AnalyticsService["Analytics Service<br>(Read-heavy Consumer)"]
end

%% =========================
%% PRODUCERS
%% =========================
PaymentService --> PayProducer["Kafka Producer"]
OrderService --> OrderProducer["Kafka Producer"]
EmailService --> EmailProducer["Kafka Producer"]

%% =========================
%% KAFKA CLUSTER
%% =========================
subgraph KafkaCluster["Kafka Cluster (KRaft Mode)"]

    %% -------- Broker 1 --------
    subgraph Broker1["Broker 1<br>Controller (Leader)"]
        P0["payment-successful<br>Partition 0"]
        O0["order-successful<br>Partition 0"]
        E0["email-successful<br>Partition 0"]
    end

    %% -------- Broker 2 --------
    subgraph Broker2["Broker 2<br>Controller (Follower)"]
        P1["payment-successful<br>Partition 1"]
        O1["order-successful<br>Partition 1"]
        E1["email-successful<br>Partition 1"]
    end

    %% -------- Broker 3 --------
    subgraph Broker3["Broker 3<br>Controller (Follower)"]
        P2["payment-successful<br>Partition 2"]
        O2["order-successful<br>Partition 2"]
        E2["email-successful<br>Partition 2"]
    end
end

%% =========================
%% PRODUCER ROUTING
%% =========================
PayProducer --> P0
PayProducer --> P1
PayProducer --> P2

OrderProducer --> O0
OrderProducer --> O1
OrderProducer --> O2

EmailProducer --> E0
EmailProducer --> E1
EmailProducer --> E2

%% =========================
%% CONSUMER GROUPS
%% =========================
subgraph OrderCG["Consumer Group: order-service"]
    OrderConsumer["Order Consumer"]
end

subgraph EmailCG["Consumer Group: email-service"]
    EmailConsumer["Email Consumer"]
end

subgraph AnalyticsCG["Consumer Group: analytics-service"]
    AnalyticsConsumer["Analytics Consumer"]
end

%% =========================
%% CONSUME EVENTS
%% =========================
P0 --> OrderConsumer
P1 --> OrderConsumer
P2 --> OrderConsumer

O0 --> EmailConsumer
O1 --> EmailConsumer
O2 --> EmailConsumer

E0 --> AnalyticsConsumer
E1 --> AnalyticsConsumer
E2 --> AnalyticsConsumer

%% =========================
%% DATABASE LAYER
%% =========================
subgraph Database["Database Layer"]
    PrimaryDB["Primary Database<br>(Read / Write)"]
    ReplicaDB1["Read Replica DB 1"]
    ReplicaDB2["Read Replica DB 2"]
end

PrimaryDB --> ReplicaDB1
PrimaryDB --> ReplicaDB2

PaymentService --> PrimaryDB
OrderService --> PrimaryDB
EmailService --> PrimaryDB

AnalyticsService -->|read-only| ReplicaDB1
AnalyticsService -->|read-only| ReplicaDB2

%% =========================
%% KRaft METADATA
%% =========================
KRaft["KRaft Metadata Quorum<br>(No ZooKeeper)"]
Broker1 --> KRaft
Broker2 --> KRaft
Broker3 --> KRaft

%% =========================
%% STYLING
%% =========================
style PaymentService fill:#2563EB,color:#ffffff
style OrderService fill:#2563EB,color:#ffffff
style EmailService fill:#2563EB,color:#ffffff
style AnalyticsService fill:#0EA5E9,color:#ffffff

style PayProducer fill:#10B981,color:#ffffff
style OrderProducer fill:#10B981,color:#ffffff
style EmailProducer fill:#10B981,color:#ffffff

style OrderConsumer fill:#F59E0B,color:#ffffff
style EmailConsumer fill:#F59E0B,color:#ffffff
style AnalyticsConsumer fill:#F59E0B,color:#ffffff

style PrimaryDB fill:#EF4444,color:#ffffff
style ReplicaDB1 fill:#FB7185,color:#ffffff
style ReplicaDB2 fill:#FB7185,color:#ffffff

style KRaft fill:#8B5CF6,color:#ffffff

```

## Kafka Cluster

```mermaid
flowchart TB

subgraph Kafka["Kafka Cluster (KRaft Mode)"]
direction TB

    subgraph B1["Broker 1"]
    direction LR
        B1Role["Controller<br>Leader"]

        subgraph B1Pay["payment-successful"]
        direction LR
            B1P0["P0"]
            B1P1["P1"]
            B1P2["P2 (L)"]
        end

        subgraph B1Ord["order-successful"]
        direction LR
            B1O0["P0 (L)"]
            B1O1["P1"]
            B1O2["P2"]
        end

        subgraph B1Em["email-successful"]
        direction LR
            B1E0["P0"]
            B1E1["P1 (L)"]
            B1E2["P2"]
        end
    end

    subgraph B2["Broker 2"]
    direction LR
        B2Role["Controller<br>Follower"]

        subgraph B2Pay["payment-successful"]
        direction LR
            B2P0["P0"]
            B2P1["P1 (L)"]
            B2P2["P2"]
        end

        subgraph B2Ord["order-successful"]
        direction LR
            B2O0["P0"]
            B2O1["P1"]
            B2O2["P2 (L)"]
        end

        subgraph B2Em["email-successful"]
        direction LR
            B2E0["P0 (L)"]
            B2E1["P1"]
            B2E2["P2"]
        end
    end

    subgraph B3["Broker 3"]
    direction LR
        B3Role["Controller<br>Follower"]

        subgraph B3Pay["payment-successful"]
        direction LR
            B3P0["P0"]
            B3P1["P1"]
            B3P2["P2 (L)"]
        end

        subgraph B3Ord["order-successful"]
        direction LR
            B3O0["P0"]
            B3O1["P1 (L)"]
            B3O2["P2"]
        end

        subgraph B3Em["email-successful"]
        direction LR
            B3E0["P0"]
            B3E1["P1"]
            B3E2["P2 (L)"]
        end
    end
end

%% ===== Styling =====
style B1 fill:#1F2937,color:#ffffff
style B2 fill:#1F2937,color:#ffffff
style B3 fill:#1F2937,color:#ffffff

style B1Role fill:#22C55E,color:#ffffff,stroke:#ffffff
style B2Role fill:#64748B,color:#ffffff,stroke:#ffffff
style B3Role fill:#64748B,color:#ffffff,stroke:#ffffff

style B1Pay fill:#111827,color:#ffffff
style B1Ord fill:#111827,color:#ffffff
style B1Em  fill:#111827,color:#ffffff
style B2Pay fill:#111827,color:#ffffff
style B2Ord fill:#111827,color:#ffffff
style B2Em  fill:#111827,color:#ffffff
style B3Pay fill:#111827,color:#ffffff
style B3Ord fill:#111827,color:#ffffff
style B3Em  fill:#111827,color:#ffffff

classDef partition fill:#8B5CF6,color:#ffffff,stroke:#ffffff,stroke-width:1px;

class B1P0 partition
class B1P1 partition
class B1P2 partition
class B1O0 partition
class B1O1 partition
class B1O2 partition
class B1E0 partition
class B1E1 partition
class B1E2 partition

class B2P0 partition
class B2P1 partition
class B2P2 partition
class B2O0 partition
class B2O1 partition
class B2O2 partition
class B2E0 partition
class B2E1 partition
class B2E2 partition

class B3P0 partition
class B3P1 partition
class B3P2 partition
class B3O0 partition
class B3O1 partition
class B3O2 partition
class B3E0 partition
class B3E1 partition
class B3E2 partition

```


## Docker Enviromnet 

![Images](https://res.cloudinary.com/dgz7hqbl9/image/upload/v1764528871/Screenshot_2025-12-01_000521_kfbt0k.png)

## CI/CD Pipline (Jenkins)

![Image](https://res.cloudinary.com/dgz7hqbl9/image/upload/v1764528871/Screenshot_2025-11-30_232159_ybjm3x.png)

### Stage Diagram

![Image](https://res.cloudinary.com/dgz7hqbl9/image/upload/v1764528871/Screenshot_2025-12-01_000802_algvb6.png)


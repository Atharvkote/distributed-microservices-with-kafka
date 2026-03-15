# Mutli-Vendor E-Commerce Website <i>(Micro Servies Architecture)</i>

> [!IMPORTANT]
> This project is still under active development.

# API Sever Architecture Diagram

```mermaid
graph TB

%% =========================
%% CLIENT & GATEWAY
%% =========================
U["User"]
C["Client App<br>React"]
K["Kong API Gateway"]

U --> C --> K

%% =========================
%% CORE SERVICES (2×2 GRID)
%% =========================
subgraph CORE["Core Microservices (Vertical · 2×2 Grid)"]
direction LR

%% -------- Identity --------
subgraph ID["Identity Service"]
direction TB
IDS["server.js"]
IDR["Routes"]
IDC["Controllers"]
IDM["Auth Middleware"]
IDU["Utils"]
IDDB["Primary DB"]
IDDBR["Replica DB"]

IDS --> IDR --> IDC --> IDU
IDR --> IDM
IDC --> IDDB --> IDDBR
end

%% -------- Catalog --------
subgraph CAT["Catalog Service"]
direction TB
CS["server.js"]
CR["Routes"]
CC["Controllers"]
CM["Middleware"]
CU["Utils"]
CDB["Primary DB"]
CDBR["Replica DB"]

CS --> CR --> CC --> CU
CR --> CM
CC --> CDB --> CDBR
end

%% -------- Orders --------
subgraph ORD["Orders Service"]
direction TB
OS["server.js"]
OR["Routes"]
OC["Controllers"]
OM["Middleware"]
OU["Utils"]
ODB["Primary DB"]
ODBR["Replica DB"]

OS --> OR --> OC --> OU
OR --> OM
OC --> ODB --> ODBR
end

%% -------- Payment --------
subgraph PAY["Payment Service"]
direction TB
PS["server.js"]
PR["Routes"]
PC["Controllers"]
PM["Middleware"]
PU["Utils"]
PDB["Primary DB"]
PDBR["Replica DB"]

PS --> PR --> PC --> PU
PR --> PM
PC --> PDB --> PDBR
end
end

%% =========================
%% MESSAGING SERVICE
%% =========================
subgraph MSG["Messaging Service (Real-Time)"]
direction TB
MS["server.js"]
MAPI["REST APIs"]
MSOCK["Socket.IO Server"]
MREDIS["Redis Adapter"]
MDB["Primary DB"]
MDBR["Replica DB"]

MS --> MAPI
MS --> MSOCK --> MREDIS
MSOCK --> MDB --> MDBR
end

%% =========================
%% ANALYTICS SERVICE (ASIDE)
%% =========================
subgraph ANA["Analytics Service (Read Optimized)"]
direction TB
AS["server.js"]
AR["Routes"]
AC["Controllers"]
ADB["Analytics DB Primary"]
ADBR["Analytics DB Replica"]

AS --> AR --> AC
AC --> ADB --> ADBR

%% Reads from replicas
AC --> IDDBR
AC --> CDBR
AC --> ODBR
AC --> PDBR
AC --> MDBR
end

%% =========================
%% GATEWAY ROUTING
%% =========================
K --> ID
K --> CAT
K --> ORD
K --> PAY
K --> MSG
K --> ANA


%% =========================
%% STYLING (style NodeId)
%% =========================

%% Client & Gateway
style U fill:#1f2937,color:#ffffff
style C fill:#1f2937,color:#ffffff
style K fill:#111827,color:#ffffff

%% Services
style IDS fill:#2563EB,color:#ffffff
style IDR fill:#2563EB,color:#ffffff
style IDC fill:#2563EB,color:#ffffff
style IDM fill:#2563EB,color:#ffffff
style IDU fill:#2563EB,color:#ffffff

style CS fill:#2563EB,color:#ffffff
style CR fill:#2563EB,color:#ffffff
style CC fill:#2563EB,color:#ffffff
style CM fill:#2563EB,color:#ffffff
style CU fill:#2563EB,color:#ffffff

style OS fill:#2563EB,color:#ffffff
style OR fill:#2563EB,color:#ffffff
style OC fill:#2563EB,color:#ffffff
style OM fill:#2563EB,color:#ffffff
style OU fill:#2563EB,color:#ffffff

style PS fill:#2563EB,color:#ffffff
style PR fill:#2563EB,color:#ffffff
style PC fill:#2563EB,color:#ffffff
style PM fill:#2563EB,color:#ffffff
style PU fill:#2563EB,color:#ffffff

%% Messaging
style MS fill:#f97316,color:#ffffff
style MAPI fill:#f97316,color:#ffffff
style MSOCK fill:#f97316,color:#ffffff
style MREDIS fill:#f97316,color:#ffffff

%% Analytics
style AS fill:#0EA5E9,color:#ffffff
style AR fill:#0EA5E9,color:#ffffff
style AC fill:#0EA5E9,color:#ffffff

%% Databases
style IDDB fill:#EF4444,color:#ffffff
style CDB fill:#EF4444,color:#ffffff
style ODB fill:#EF4444,color:#ffffff
style PDB fill:#EF4444,color:#ffffff
style MDB fill:#EF4444,color:#ffffff
style ADB fill:#EF4444,color:#ffffff

style IDDBR fill:#FB7185,color:#ffffff
style CDBR fill:#FB7185,color:#ffffff
style ODBR fill:#FB7185,color:#ffffff
style PDBR fill:#FB7185,color:#ffffff
style MDBR fill:#FB7185,color:#ffffff
style ADBR fill:#FB7185,color:#ffffff

```

## Kafka Event Routing

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

## ER Diagram

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string email
        string password
        string full_name

    }

    VENDOR_PROFILES {
        ObjectId _id PK
        ObjectId user FK
        string store_name
        string profile_picture_url
        string banner_url
        
    }

    CATEGORIES {
        ObjectId _id PK
        string name
        string slug
        ObjectId parent FK
        number level
        string path
        boolean isActive
        number sortOrder
        string attributes
    }

    PRODUCTS {
        ObjectId _id PK
        ObjectId vendor FK
        ObjectId category FK
        string title
        string description
        string brand
        boolean isActive
        number avgRating
        number ratingCount
        string tags
        string seo
        string createdAt
        string updatedAt
    }

    PRODUCT_VARIANTS {
        ObjectId _id PK
        ObjectId product FK
        string sku
        string attributes
        string price
        string weight
        string images
        boolean isActive
    }

    INVENTORY {
        ObjectId _id PK
        ObjectId variant FK
        number stock
        number reserved
        number lowStockThreshold
    }

    REVIEWS {
        ObjectId _id PK
        ObjectId product FK
        ObjectId user FK
        number rating
        string comment
        boolean isVerifiedPurchase
        string createdAt
    }

    PINNED_REVIEWS {
        ObjectId _id PK
        ObjectId review FK
        ObjectId vendor FK
        ObjectId user FK
        string createdAt
    }

    %% RELATIONSHIPS
    USERS ||--|| VENDOR_PROFILES : owns
    VENDOR_PROFILES ||--o{ PRODUCTS : owns
    CATEGORIES ||--o{ PRODUCTS : classifies
    CATEGORIES ||--o{ CATEGORIES : parent_of
    PRODUCTS ||--o{ PRODUCT_VARIANTS : has
    PRODUCT_VARIANTS ||--|| INVENTORY : tracked_by
    PRODUCTS ||--o{ REVIEWS : receives
    USERS ||--o{ REVIEWS : writes
    REVIEWS ||--o| PINNED_REVIEWS : pinned
    VENDOR_PROFILES ||--o{ PINNED_REVIEWS : showcases
    USERS ||--o{ PINNED_REVIEWS : pins

```

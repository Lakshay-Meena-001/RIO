import { createKnowledgeNode } from "../../factory.js";

const node = (data) => createKnowledgeNode(data);

const systemDesignSoftwareArchitectureNodes = [
  // ============================================================
  // PHASE 1 — SYSTEM DESIGN FOUNDATION
  // ============================================================

  node({
    id: "system-design-fundamentals",
    title: "System Design Fundamentals",
    category: "system-design",
    importance: "critical",
    description:
      "Understand system design, architectural decomposition, components, boundaries, data flow and engineering trade-offs.",
    whyItMatters:
      "System design requires reasoning about complete systems rather than individual functions or classes.",
    prerequisites: [],
    enables: [
      "requirements-engineering",
      "capacity-estimation",
      "system-design-thinking",
    ],
    alternatives: [],
    related: ["software-architecture"],
    metadata: {
      phase: "system-design-foundation",
      primary: true,
    },
  }),

  node({
    id: "system-design-thinking",
    title: "System Design Thinking",
    category: "system-design",
    importance: "critical",
    description:
      "Develop the habit of starting from requirements and constraints before choosing technologies or architectures.",
    whyItMatters:
      "Good architecture is a consequence of requirements and trade-offs, not a collection of popular technologies.",
    prerequisites: ["system-design-fundamentals"],
    enables: ["requirements-engineering", "architecture-decision-making"],
    alternatives: [],
    related: ["system-design-case-studies"],
    metadata: {
      phase: "system-design-foundation",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 2 — REQUIREMENTS & ESTIMATION
  // ============================================================

  node({
    id: "requirements-engineering",
    title: "Requirements Engineering",
    category: "system-design",
    importance: "critical",
    description:
      "Identify functional requirements, non-functional requirements, constraints, assumptions and system boundaries.",
    whyItMatters:
      "Without clear requirements, architectural decisions cannot be evaluated correctly.",
    prerequisites: ["system-design-fundamentals", "system-design-thinking"],
    enables: ["capacity-estimation", "architecture-decision-making"],
    alternatives: [],
    related: ["architecture-communication"],
    metadata: {
      phase: "requirements-and-estimation",
      primary: true,
    },
  }),

  node({
    id: "capacity-estimation",
    title: "Back-of-the-Envelope Estimation",
    category: "system-design",
    importance: "critical",
    description:
      "Estimate users, requests per second, storage, bandwidth, throughput and growth.",
    whyItMatters:
      "Rough capacity estimates help determine whether a proposed architecture can handle expected workloads.",
    prerequisites: ["requirements-engineering"],
    enables: ["scalability", "system-performance", "database-scaling"],
    alternatives: [],
    related: ["cost-aware-architecture"],
    metadata: {
      phase: "requirements-and-estimation",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 3 — NETWORKING
  // ============================================================

  node({
    id: "networking-fundamentals",
    title: "Networking Fundamentals",
    category: "networking",
    importance: "critical",
    description:
      "Understand IP networking, TCP, UDP, DNS, HTTP, TLS, latency and network boundaries.",
    whyItMatters:
      "Distributed systems communicate over networks where latency, failure and bandwidth matter.",
    prerequisites: ["system-design-fundamentals"],
    enables: ["http-protocol", "dns", "tls"],
    alternatives: [],
    related: [],
    metadata: {
      phase: "networking-for-system-design",
      primary: true,
    },
  }),

  node({
    id: "http-protocol",
    title: "HTTP & HTTPS",
    category: "networking",
    importance: "critical",
    description:
      "Understand HTTP methods, headers, status codes, connections, caching semantics and HTTPS.",
    whyItMatters:
      "HTTP is a primary communication protocol for modern application architectures.",
    prerequisites: ["networking-fundamentals"],
    enables: ["api-design"],
    alternatives: [],
    related: ["rest-api-design"],
    metadata: {
      phase: "networking-for-system-design",
      primary: true,
    },
  }),

  node({
    id: "dns",
    title: "DNS",
    category: "networking",
    importance: "high",
    description:
      "Understand domain resolution, records, caching, TTLs and DNS-based routing.",
    whyItMatters:
      "DNS is often the first infrastructure component involved when clients reach distributed systems.",
    prerequisites: ["networking-fundamentals"],
    enables: ["cloud-system-architecture"],
    alternatives: [],
    related: ["cdn"],
    metadata: {
      phase: "networking-for-system-design",
    },
  }),

  node({
    id: "tls",
    title: "TLS",
    category: "networking",
    importance: "high",
    description:
      "Understand encryption in transit, certificates, certificate authorities and secure connections.",
    whyItMatters:
      "Production systems must protect data while it moves between clients and services.",
    prerequisites: ["networking-fundamentals"],
    enables: ["system-security"],
    alternatives: [],
    related: [],
    metadata: {
      phase: "networking-for-system-design",
    },
  }),

  // ============================================================
  // PHASE 4 — API DESIGN
  // ============================================================

  node({
    id: "api-design",
    title: "API Design",
    category: "api",
    importance: "critical",
    description:
      "Design API contracts, resources, operations, errors, pagination, filtering and versioning.",
    whyItMatters:
      "APIs define boundaries between clients, services and systems.",
    prerequisites: ["http-protocol"],
    enables: ["rest-api-design", "api-pagination", "api-versioning"],
    alternatives: ["graphql", "grpc"],
    related: [],
    metadata: {
      phase: "api-design",
      primary: true,
    },
  }),

  node({
    id: "rest-api-design",
    title: "REST API Design",
    category: "api",
    importance: "critical",
    description:
      "Design resource-oriented APIs using HTTP semantics, predictable contracts and stateless communication.",
    whyItMatters:
      "REST remains one of the most common service and client communication styles.",
    prerequisites: ["api-design"],
    enables: ["system-security", "microservices-architecture"],
    alternatives: ["graphql", "grpc"],
    related: ["api-versioning"],
    metadata: {
      phase: "api-design",
      primary: true,
    },
  }),

  node({
    id: "graphql",
    title: "GraphQL",
    category: "api",
    importance: "medium",
    description:
      "Understand schemas, queries, mutations, resolvers and client-driven data retrieval.",
    whyItMatters:
      "GraphQL can be useful when clients require flexible data retrieval across related resources.",
    prerequisites: ["api-design"],
    enables: [],
    alternatives: ["rest-api-design"],
    related: ["api-gateway"],
    metadata: {
      phase: "api-design",
      optional: true,
    },
  }),

  node({
    id: "grpc",
    title: "gRPC",
    category: "api",
    importance: "high",
    description:
      "Understand strongly typed service contracts and efficient service-to-service communication.",
    whyItMatters:
      "gRPC is useful for internal distributed services where typed contracts and efficient communication matter.",
    prerequisites: ["api-design"],
    enables: ["microservices-architecture"],
    alternatives: ["rest-api-design"],
    related: ["protobuf"],
    metadata: {
      phase: "api-design",
      optional: true,
    },
  }),

  node({
    id: "protobuf",
    title: "Protocol Buffers Awareness",
    category: "api",
    importance: "medium",
    description:
      "Understand schema-based serialization used by systems such as gRPC.",
    whyItMatters:
      "Schema-based serialization provides compact and strongly typed service contracts.",
    prerequisites: ["grpc"],
    enables: [],
    alternatives: [],
    related: ["microservices-architecture"],
    metadata: {
      phase: "api-design",
      optional: true,
    },
  }),

  node({
    id: "api-pagination",
    title: "API Pagination & Filtering",
    category: "api",
    importance: "high",
    description: "Design pagination, filtering, sorting and cursor-based APIs.",
    whyItMatters:
      "Large result sets must be transferred incrementally to protect services and clients.",
    prerequisites: ["api-design"],
    enables: ["system-performance"],
    alternatives: [],
    related: ["database-indexing"],
    metadata: {
      phase: "api-design",
    },
  }),

  node({
    id: "api-versioning",
    title: "API Versioning",
    category: "api",
    importance: "high",
    description:
      "Manage API evolution, backward compatibility and client migration.",
    whyItMatters:
      "Production APIs often need to evolve without breaking existing consumers.",
    prerequisites: ["api-design"],
    enables: ["microservices-architecture"],
    alternatives: [],
    related: ["architecture-decision-making"],
    metadata: {
      phase: "api-design",
    },
  }),

  // ============================================================
  // PHASE 5 — DATABASE FUNDAMENTALS
  // ============================================================

  node({
    id: "database-fundamentals",
    title: "Database Fundamentals",
    category: "database",
    importance: "critical",
    description:
      "Understand relational databases, NoSQL systems, schemas, indexes, queries and transactions.",
    whyItMatters:
      "Data persistence is one of the central architectural decisions in almost every system.",
    prerequisites: ["system-design-fundamentals"],
    enables: [
      "relational-databases",
      "nosql-databases",
      "database-indexing",
      "database-transactions",
    ],
    alternatives: [],
    related: ["data-modeling"],
    metadata: {
      phase: "database-fundamentals",
      primary: true,
    },
  }),

  node({
    id: "relational-databases",
    title: "Relational Databases",
    category: "database",
    importance: "critical",
    description:
      "Understand tables, relationships, SQL, constraints and relational data modeling.",
    whyItMatters:
      "Relational databases provide strong consistency and structured querying for many workloads.",
    prerequisites: ["database-fundamentals"],
    enables: ["database-transactions", "database-indexing"],
    alternatives: ["nosql-databases"],
    related: ["postgresql"],
    metadata: {
      phase: "database-fundamentals",
      primary: true,
    },
  }),

  node({
    id: "nosql-databases",
    title: "NoSQL Databases",
    category: "database",
    importance: "high",
    description:
      "Understand document, key-value, wide-column and graph database models.",
    whyItMatters:
      "Different access patterns and scalability requirements can favor NoSQL models.",
    prerequisites: ["database-fundamentals"],
    enables: ["database-scaling"],
    alternatives: ["relational-databases"],
    related: ["document-databases", "key-value-databases"],
    metadata: {
      phase: "database-fundamentals",
    },
  }),

  node({
    id: "data-modeling",
    title: "Data Modeling",
    category: "database",
    importance: "critical",
    description:
      "Model entities, relationships, access patterns and data ownership.",
    whyItMatters:
      "Poor data modeling creates performance, correctness and scalability problems.",
    prerequisites: ["relational-databases", "nosql-databases"],
    enables: ["database-indexing", "database-scaling"],
    alternatives: [],
    related: ["domain-driven-design"],
    metadata: {
      phase: "database-fundamentals",
    },
  }),

  node({
    id: "database-indexing",
    title: "Database Indexing",
    category: "database",
    importance: "critical",
    description:
      "Understand indexes, composite indexes, query patterns and index trade-offs.",
    whyItMatters:
      "Indexes can dramatically improve read performance when aligned with access patterns.",
    prerequisites: ["relational-databases", "data-modeling"],
    enables: ["database-scaling", "system-performance"],
    alternatives: [],
    related: [],
    metadata: {
      phase: "database-fundamentals",
    },
  }),

  node({
    id: "database-transactions",
    title: "Database Transactions",
    category: "database",
    importance: "critical",
    description:
      "Understand ACID properties, isolation, atomicity and transaction boundaries.",
    whyItMatters:
      "Transactions protect correctness when multiple database operations must behave as one unit.",
    prerequisites: ["relational-databases"],
    enables: ["consistency-models", "distributed-transactions"],
    alternatives: [],
    related: [],
    metadata: {
      phase: "database-fundamentals",
    },
  }),

  node({
    id: "postgresql",
    title: "PostgreSQL",
    category: "database",
    importance: "high",
    description:
      "Use PostgreSQL as a representative production relational database.",
    whyItMatters:
      "A concrete relational database makes system-design database concepts practical.",
    prerequisites: ["relational-databases"],
    enables: [],
    alternatives: [],
    related: ["database-scaling"],
    metadata: {
      phase: "database-fundamentals",
      optional: true,
    },
  }),

  node({
    id: "document-databases",
    title: "Document Databases",
    category: "database",
    importance: "high",
    description:
      "Understand document-oriented data models, denormalization and access-pattern-driven schemas.",
    whyItMatters:
      "Document databases can simplify certain high-scale or flexible-schema workloads.",
    prerequisites: ["nosql-databases"],
    enables: ["database-scaling"],
    alternatives: ["relational-databases"],
    related: [],
    metadata: {
      phase: "database-fundamentals",
      optional: true,
    },
  }),

  node({
    id: "key-value-databases",
    title: "Key-Value Databases",
    category: "database",
    importance: "high",
    description:
      "Understand key-value access patterns and distributed key-value storage.",
    whyItMatters:
      "Key-value stores are useful for extremely fast lookups and distributed workloads.",
    prerequisites: ["nosql-databases"],
    enables: ["distributed-databases"],
    alternatives: [],
    related: ["caching"],
    metadata: {
      phase: "database-fundamentals",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 6 — DATABASE SCALING
  // ============================================================

  node({
    id: "database-scaling",
    title: "Database Scaling",
    category: "database",
    importance: "critical",
    description:
      "Scale databases through replication, partitioning, sharding and workload-aware architecture.",
    whyItMatters:
      "Database bottlenecks often become the limiting factor in high-scale systems.",
    prerequisites: [
      "database-indexing",
      "database-transactions",
      "data-modeling",
    ],
    enables: ["replication", "partitioning", "sharding"],
    alternatives: [],
    related: ["distributed-databases"],
    metadata: {
      phase: "database-scaling",
      primary: true,
    },
  }),

  node({
    id: "replication",
    title: "Database Replication",
    category: "database",
    importance: "critical",
    description:
      "Understand primary-replica architectures, replication lag, failover and read scaling.",
    whyItMatters:
      "Replication improves availability and can distribute read workloads.",
    prerequisites: ["database-scaling"],
    enables: ["high-availability", "read-scaling"],
    alternatives: [],
    related: ["consistency-models"],
    metadata: {
      phase: "database-scaling",
    },
  }),

  node({
    id: "read-scaling",
    title: "Read Scaling",
    category: "database",
    importance: "high",
    description:
      "Scale read-heavy workloads using replicas, caching and workload separation.",
    whyItMatters:
      "Read-heavy systems require different scaling strategies from write-heavy systems.",
    prerequisites: ["replication"],
    enables: ["system-performance"],
    alternatives: [],
    related: ["caching"],
    metadata: {
      phase: "database-scaling",
    },
  }),

  node({
    id: "partitioning",
    title: "Database Partitioning",
    category: "database",
    importance: "high",
    description:
      "Split large datasets into manageable partitions based on access patterns or key ranges.",
    whyItMatters:
      "Partitioning can improve manageability and query performance for large datasets.",
    prerequisites: ["database-scaling"],
    enables: ["sharding"],
    alternatives: [],
    related: ["data-intensive-systems"],
    metadata: {
      phase: "database-scaling",
    },
  }),

  node({
    id: "sharding",
    title: "Database Sharding",
    category: "database",
    importance: "critical",
    description:
      "Distribute database data across multiple nodes using shard keys and partitioning strategies.",
    whyItMatters:
      "Sharding can allow a database workload to scale beyond a single machine.",
    prerequisites: ["partitioning", "database-scaling"],
    enables: ["distributed-databases", "data-intensive-systems"],
    alternatives: [],
    related: [],
    metadata: {
      phase: "database-scaling",
    },
  }),

  node({
    id: "distributed-databases",
    title: "Distributed Databases",
    category: "database",
    importance: "high",
    description:
      "Understand distributed storage, replication, partitioning and consistency trade-offs.",
    whyItMatters:
      "Distributed databases combine data scalability with distributed-system trade-offs.",
    prerequisites: ["sharding", "replication"],
    enables: ["advanced-distributed-systems"],
    alternatives: [],
    related: ["consistency-models"],
    metadata: {
      phase: "database-scaling",
    },
  }),

  // ============================================================
  // PHASE 7 — CACHING
  // ============================================================

  node({
    id: "caching",
    title: "Caching",
    category: "performance",
    importance: "critical",
    description:
      "Understand cache-aside, write-through, write-back, TTLs, invalidation and distributed caching.",
    whyItMatters:
      "Caching reduces latency and protects expensive backend resources.",
    prerequisites: ["database-indexing", "http-protocol"],
    enables: ["redis", "distributed-caching", "cdn"],
    alternatives: [],
    related: ["cache-invalidation"],
    metadata: {
      phase: "caching",
      primary: true,
    },
  }),

  node({
    id: "redis",
    title: "Redis",
    category: "infrastructure",
    importance: "critical",
    description:
      "Use Redis for caching, counters, ephemeral state, distributed locks and lightweight messaging.",
    whyItMatters:
      "Redis is a common building block in production distributed systems.",
    prerequisites: ["caching"],
    enables: ["distributed-caching", "rate-limiting", "realtime-systems"],
    alternatives: ["memcached"],
    related: ["message-queues"],
    metadata: {
      phase: "caching",
      primary: true,
    },
  }),

  node({
    id: "memcached",
    title: "Memcached Awareness",
    category: "infrastructure",
    importance: "medium",
    description:
      "Understand Memcached as a simple distributed caching alternative.",
    whyItMatters: "Memcached is still relevant in some caching architectures.",
    prerequisites: ["caching"],
    enables: [],
    alternatives: ["redis"],
    related: ["distributed-caching"],
    metadata: {
      phase: "caching",
      optional: true,
    },
  }),

  node({
    id: "distributed-caching",
    title: "Distributed Caching",
    category: "performance",
    importance: "critical",
    description:
      "Design caches across multiple application instances while handling consistency, invalidation and failure.",
    whyItMatters:
      "A cache shared by multiple servers introduces distributed-system concerns.",
    prerequisites: ["redis"],
    enables: ["scalability", "high-availability"],
    alternatives: [],
    related: ["cache-invalidation"],
    metadata: {
      phase: "caching",
    },
  }),

  node({
    id: "cache-invalidation",
    title: "Cache Invalidation",
    category: "performance",
    importance: "critical",
    description:
      "Understand TTLs, invalidation strategies, stale data and cache consistency.",
    whyItMatters:
      "Incorrect invalidation can make cached systems return stale or incorrect information.",
    prerequisites: ["caching"],
    enables: ["distributed-caching"],
    alternatives: [],
    related: ["consistency-models"],
    metadata: {
      phase: "caching",
    },
  }),

  // ============================================================
  // PHASE 8 — LOAD BALANCING & PROXIES
  // ============================================================

  node({
    id: "reverse-proxy",
    title: "Reverse Proxy",
    category: "networking",
    importance: "high",
    description:
      "Understand reverse proxies, request routing, TLS termination and upstream services.",
    whyItMatters:
      "Reverse proxies provide a common boundary between clients and backend services.",
    prerequisites: ["http-protocol"],
    enables: ["load-balancer"],
    alternatives: [],
    related: ["api-gateway"],
    metadata: {
      phase: "load-balancing-and-proxies",
    },
  }),

  node({
    id: "load-balancer",
    title: "Load Balancing",
    category: "scalability",
    importance: "critical",
    description:
      "Distribute requests across healthy service instances using appropriate routing strategies.",
    whyItMatters:
      "Load balancing enables horizontal scaling and improves availability.",
    prerequisites: ["reverse-proxy", "capacity-estimation"],
    enables: ["scalability", "high-availability"],
    alternatives: [],
    related: ["health-checks"],
    metadata: {
      phase: "load-balancing-and-proxies",
      primary: true,
    },
  }),

  node({
    id: "health-checks",
    title: "Health Checks",
    category: "reliability",
    importance: "critical",
    description:
      "Detect unhealthy instances using liveness, readiness and dependency checks.",
    whyItMatters:
      "Traffic should not be sent to instances that cannot safely serve requests.",
    prerequisites: ["load-balancer"],
    enables: ["fault-tolerance", "high-availability"],
    alternatives: [],
    related: ["observability"],
    metadata: {
      phase: "load-balancing-and-proxies",
    },
  }),

  node({
    id: "api-gateway",
    title: "API Gateway",
    category: "architecture",
    importance: "high",
    description:
      "Understand centralized API routing, authentication, rate limiting and request transformation.",
    whyItMatters:
      "API gateways can provide a controlled entry point to multiple backend services.",
    prerequisites: ["reverse-proxy", "api-design"],
    enables: ["microservices-architecture", "rate-limiting"],
    alternatives: [],
    related: ["load-balancer"],
    metadata: {
      phase: "load-balancing-and-proxies",
    },
  }),

  // ============================================================
  // PHASE 9 — STORAGE & CDN
  // ============================================================

  node({
    id: "object-storage",
    title: "Object Storage",
    category: "storage",
    importance: "critical",
    description:
      "Understand scalable object storage for files, media, backups and large immutable objects.",
    whyItMatters:
      "Large files should usually be stored outside transactional databases.",
    prerequisites: ["system-design-fundamentals"],
    enables: ["cdn", "cloud-system-architecture"],
    alternatives: [],
    related: ["data-intensive-systems"],
    metadata: {
      phase: "storage-and-cdn",
      primary: true,
    },
  }),

  node({
    id: "cdn",
    title: "Content Delivery Network",
    category: "networking",
    importance: "critical",
    description:
      "Use geographically distributed edge caching to serve content closer to users.",
    whyItMatters:
      "CDNs reduce latency and origin load for static and cacheable content.",
    prerequisites: ["object-storage", "dns"],
    enables: ["scalability"],
    alternatives: [],
    related: ["caching"],
    metadata: {
      phase: "storage-and-cdn",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 10 — MESSAGE QUEUES & EVENTS
  // ============================================================

  node({
    id: "message-queues",
    title: "Message Queues",
    category: "messaging",
    importance: "critical",
    description:
      "Understand producers, consumers, acknowledgements, retries, ordering and delivery guarantees.",
    whyItMatters:
      "Queues decouple workloads and allow asynchronous processing.",
    prerequisites: ["system-design-fundamentals", "api-design"],
    enables: ["background-jobs", "event-driven-architecture"],
    alternatives: ["rabbitmq", "kafka", "cloud-messaging"],
    related: [],
    metadata: {
      phase: "message-queues-and-events",
      primary: true,
    },
  }),

  node({
    id: "rabbitmq",
    title: "RabbitMQ",
    category: "messaging",
    importance: "high",
    description:
      "Understand RabbitMQ queues, exchanges, routing and acknowledgements.",
    whyItMatters:
      "RabbitMQ is a practical message-broker option for application workflows.",
    prerequisites: ["message-queues"],
    enables: [],
    alternatives: ["kafka", "cloud-messaging"],
    related: ["background-jobs"],
    metadata: {
      phase: "message-queues-and-events",
      optional: true,
    },
  }),

  node({
    id: "kafka",
    title: "Apache Kafka",
    category: "messaging",
    importance: "critical",
    description:
      "Understand topics, partitions, producers, consumers, offsets, retention and event streaming.",
    whyItMatters:
      "Kafka is a major building block for high-throughput event-driven architectures.",
    prerequisites: ["message-queues"],
    enables: ["event-driven-architecture", "data-intensive-systems"],
    alternatives: ["rabbitmq", "cloud-messaging"],
    related: ["stream-processing"],
    metadata: {
      phase: "message-queues-and-events",
      primary: true,
    },
  }),

  node({
    id: "cloud-messaging",
    title: "Cloud Messaging Services",
    category: "messaging",
    importance: "medium",
    description: "Understand managed cloud queues and messaging services.",
    whyItMatters: "Managed messaging can reduce operational overhead.",
    prerequisites: ["message-queues"],
    enables: [],
    alternatives: ["rabbitmq", "kafka"],
    related: ["cloud-system-architecture"],
    metadata: {
      phase: "message-queues-and-events",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 11 — BACKGROUND PROCESSING
  // ============================================================

  node({
    id: "background-jobs",
    title: "Background Jobs",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Design worker processes, job scheduling, retries, idempotency and long-running tasks.",
    whyItMatters:
      "Slow or unreliable work should not block synchronous user requests.",
    prerequisites: ["message-queues"],
    enables: ["reliability-patterns", "event-driven-architecture"],
    alternatives: [],
    related: [],
    metadata: {
      phase: "background-processing",
      primary: true,
    },
  }),

  node({
    id: "idempotency",
    title: "Idempotency",
    category: "reliability",
    importance: "critical",
    description:
      "Design operations that can safely be retried without creating unintended duplicate effects.",
    whyItMatters:
      "Retries are common in distributed systems and can otherwise cause duplicate writes or actions.",
    prerequisites: ["background-jobs"],
    enables: ["reliability-patterns", "distributed-transactions"],
    alternatives: [],
    related: ["api-design"],
    metadata: {
      phase: "background-processing",
    },
  }),

  node({
    id: "scheduled-jobs",
    title: "Scheduled Jobs",
    category: "backend",
    importance: "medium",
    description:
      "Design recurring and delayed work using schedulers and workers.",
    whyItMatters:
      "Many production systems need periodic cleanup, billing, reporting or maintenance tasks.",
    prerequisites: ["background-jobs"],
    enables: [],
    alternatives: [],
    related: ["cloud-system-architecture"],
    metadata: {
      phase: "background-processing",
    },
  }),

  // ============================================================
  // PHASE 12 — CONSISTENCY & TRANSACTIONS
  // ============================================================

  node({
    id: "consistency-models",
    title: "Consistency Models",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Understand strong consistency, eventual consistency, read-after-write and consistency trade-offs.",
    whyItMatters:
      "Distributed systems often trade consistency guarantees for availability, latency or scalability.",
    prerequisites: ["database-transactions", "distributed-databases"],
    enables: ["distributed-transactions", "distributed-systems-foundation"],
    alternatives: [],
    related: ["cap-theorem"],
    metadata: {
      phase: "consistency-and-transactions",
      primary: true,
    },
  }),

  node({
    id: "distributed-transactions",
    title: "Distributed Transactions",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand the difficulty of maintaining transactional guarantees across multiple services or databases.",
    whyItMatters:
      "Microservices frequently require workflows that span independent data stores.",
    prerequisites: [
      "database-transactions",
      "consistency-models",
      "idempotency",
    ],
    enables: ["saga-pattern", "advanced-distributed-systems"],
    alternatives: [],
    related: [],
    metadata: {
      phase: "consistency-and-transactions",
    },
  }),

  node({
    id: "saga-pattern",
    title: "Saga Pattern",
    category: "distributed-systems",
    importance: "high",
    description:
      "Coordinate multi-step distributed workflows using local transactions and compensating actions.",
    whyItMatters:
      "Sagas provide a practical alternative to global distributed transactions in many microservice architectures.",
    prerequisites: ["distributed-transactions"],
    enables: ["microservices-architecture"],
    alternatives: [],
    related: ["event-driven-architecture"],
    metadata: {
      phase: "consistency-and-transactions",
    },
  }),

  // ============================================================
  // PHASE 13 — DISTRIBUTED SYSTEMS FOUNDATION
  // ============================================================

  node({
    id: "distributed-systems-foundation",
    title: "Distributed Systems Foundation",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Understand distributed-system failures, replication, partitions, availability and coordination.",
    whyItMatters:
      "System design at scale requires reasoning about independent machines that can fail independently.",
    prerequisites: ["consistency-models", "networking-fundamentals"],
    enables: ["cap-theorem", "distributed-failure-models", "replication"],
    alternatives: [],
    related: ["distributed-databases"],
    metadata: {
      phase: "distributed-systems-foundation",
      primary: true,
    },
  }),

  node({
    id: "cap-theorem",
    title: "CAP Theorem",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Understand consistency, availability and partition tolerance during network partitions.",
    whyItMatters:
      "CAP provides a foundational framework for discussing distributed-system trade-offs.",
    prerequisites: ["distributed-systems-foundation"],
    enables: ["architecture-decision-making", "advanced-distributed-systems"],
    alternatives: [],
    related: ["consistency-models"],
    metadata: {
      phase: "distributed-systems-foundation",
    },
  }),

  node({
    id: "distributed-failure-models",
    title: "Distributed Failure Models",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Understand network failures, partial failures, process crashes, timeouts and delayed messages.",
    whyItMatters:
      "Distributed systems fail partially rather than always failing completely.",
    prerequisites: ["distributed-systems-foundation"],
    enables: ["fault-tolerance", "advanced-distributed-systems"],
    alternatives: [],
    related: ["timeouts-retries"],
    metadata: {
      phase: "distributed-systems-foundation",
    },
  }),

  // ============================================================
  // PHASE 14 — RELIABILITY
  // ============================================================

  node({
    id: "reliability-patterns",
    title: "Reliability Patterns",
    category: "reliability",
    importance: "critical",
    description:
      "Use retries, timeouts, circuit breakers, bulkheads and graceful degradation.",
    whyItMatters:
      "Reliability patterns prevent failures in one dependency from cascading through a system.",
    prerequisites: ["distributed-failure-models", "background-jobs"],
    enables: ["fault-tolerance", "high-availability"],
    alternatives: [],
    related: ["observability"],
    metadata: {
      phase: "reliability-and-fault-tolerance",
      primary: true,
    },
  }),

  node({
    id: "timeouts-retries",
    title: "Timeouts & Retries",
    category: "reliability",
    importance: "critical",
    description:
      "Design bounded timeouts and controlled retries with backoff and jitter.",
    whyItMatters: "Unbounded waits and aggressive retries can amplify outages.",
    prerequisites: ["distributed-failure-models"],
    enables: ["reliability-patterns"],
    alternatives: [],
    related: ["idempotency"],
    metadata: {
      phase: "reliability-and-fault-tolerance",
    },
  }),

  node({
    id: "circuit-breaker",
    title: "Circuit Breaker",
    category: "reliability",
    importance: "high",
    description:
      "Prevent repeated calls to unhealthy dependencies and allow systems to recover.",
    whyItMatters:
      "Circuit breakers reduce cascading failures in distributed architectures.",
    prerequisites: ["timeouts-retries", "reliability-patterns"],
    enables: ["fault-tolerance"],
    alternatives: [],
    related: ["health-checks"],
    metadata: {
      phase: "reliability-and-fault-tolerance",
    },
  }),

  node({
    id: "fault-tolerance",
    title: "Fault Tolerance",
    category: "reliability",
    importance: "critical",
    description:
      "Design redundancy, isolation and recovery mechanisms for component failures.",
    whyItMatters:
      "Reliable systems assume that individual components will eventually fail.",
    prerequisites: ["reliability-patterns", "health-checks", "circuit-breaker"],
    enables: ["high-availability", "production-system-architecture"],
    alternatives: [],
    related: ["disaster-recovery"],
    metadata: {
      phase: "reliability-and-fault-tolerance",
    },
  }),

  // ============================================================
  // PHASE 15 — OBSERVABILITY
  // ============================================================

  node({
    id: "observability",
    title: "Observability",
    category: "observability",
    importance: "critical",
    description:
      "Understand logs, metrics, traces, health signals, correlation IDs and production diagnostics.",
    whyItMatters:
      "You cannot reliably operate distributed systems without visibility into their behavior.",
    prerequisites: ["distributed-failure-models", "fault-tolerance"],
    enables: ["distributed-tracing", "production-system-architecture"],
    alternatives: [],
    related: ["monitoring"],
    metadata: {
      phase: "observability",
      primary: true,
    },
  }),

  node({
    id: "monitoring",
    title: "Monitoring & Metrics",
    category: "observability",
    importance: "critical",
    description:
      "Track latency, throughput, errors, resource usage and service health.",
    whyItMatters:
      "Metrics provide quantitative signals about system health and performance.",
    prerequisites: ["observability"],
    enables: ["alerting"],
    alternatives: [],
    related: ["system-performance"],
    metadata: {
      phase: "observability",
    },
  }),

  node({
    id: "distributed-tracing",
    title: "Distributed Tracing",
    category: "observability",
    importance: "high",
    description:
      "Trace requests across services using spans, trace IDs and context propagation.",
    whyItMatters:
      "Tracing helps identify latency and failures that cross multiple services.",
    prerequisites: ["observability"],
    enables: ["production-system-architecture"],
    alternatives: ["opentelemetry"],
    related: ["microservices-architecture"],
    metadata: {
      phase: "observability",
    },
  }),

  node({
    id: "opentelemetry",
    title: "OpenTelemetry",
    category: "observability",
    importance: "high",
    description:
      "Understand vendor-neutral instrumentation for metrics, logs and traces.",
    whyItMatters:
      "OpenTelemetry provides a common observability instrumentation model.",
    prerequisites: ["observability", "distributed-tracing"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["monitoring"],
    metadata: {
      phase: "observability",
      optional: true,
    },
  }),

  node({
    id: "alerting",
    title: "Alerting",
    category: "observability",
    importance: "high",
    description:
      "Design actionable alerts based on service-level signals and failure conditions.",
    whyItMatters: "Poor alerts create noise while missing important failures.",
    prerequisites: ["monitoring"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["sre"],
    metadata: {
      phase: "observability",
    },
  }),

  // ============================================================
  // PHASE 16 — SECURITY
  // ============================================================

  node({
    id: "system-security",
    title: "System Security",
    category: "security",
    importance: "critical",
    description:
      "Apply authentication, authorization, encryption, secrets management and threat modeling to system architecture.",
    whyItMatters:
      "Security must be designed into system boundaries and data flows.",
    prerequisites: ["api-design", "tls"],
    enables: ["threat-modeling", "secure-architecture"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: {
      phase: "system-security",
      primary: true,
    },
  }),

  node({
    id: "threat-modeling",
    title: "Threat Modeling",
    category: "security",
    importance: "critical",
    description:
      "Identify assets, trust boundaries, threats, attack paths and mitigations.",
    whyItMatters:
      "Threat modeling makes security risks explicit during architecture design.",
    prerequisites: ["system-security"],
    enables: ["secure-architecture"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: {
      phase: "system-security",
    },
  }),

  node({
    id: "secure-architecture",
    title: "Secure Architecture",
    category: "security",
    importance: "critical",
    description:
      "Design defense-in-depth security controls across application, identity, network and data boundaries.",
    whyItMatters:
      "Security architecture prevents isolated controls from becoming disconnected or ineffective.",
    prerequisites: ["threat-modeling", "system-security"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: {
      phase: "system-security",
    },
  }),

  node({
    id: "zero-trust",
    title: "Zero Trust",
    category: "security",
    importance: "high",
    description:
      "Design security around continuous verification, least privilege and explicit trust boundaries.",
    whyItMatters:
      "Modern distributed environments cannot rely solely on traditional network perimeters.",
    prerequisites: ["secure-architecture"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["identity-and-access"],
    metadata: {
      phase: "system-security",
      optional: true,
    },
  }),

  node({
    id: "identity-and-access",
    title: "Identity & Access Architecture",
    category: "security",
    importance: "critical",
    description:
      "Design authentication, authorization, service identity and least-privilege access.",
    whyItMatters:
      "Identity is a major security boundary in modern distributed systems.",
    prerequisites: ["system-security"],
    enables: ["microservices-architecture", "cloud-system-architecture"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: {
      phase: "system-security",
    },
  }),

  // ============================================================
  // PHASE 17 — SCALABILITY
  // ============================================================

  node({
    id: "scalability",
    title: "Scalability",
    category: "scalability",
    importance: "critical",
    description:
      "Understand vertical scaling, horizontal scaling, stateless services and workload distribution.",
    whyItMatters:
      "Scalable architecture allows systems to handle increasing workloads.",
    prerequisites: [
      "capacity-estimation",
      "load-balancer",
      "distributed-caching",
    ],
    enables: ["horizontal-scaling", "database-scaling"],
    alternatives: [],
    related: ["high-availability"],
    metadata: {
      phase: "scalability",
      primary: true,
    },
  }),

  node({
    id: "horizontal-scaling",
    title: "Horizontal Scaling",
    category: "scalability",
    importance: "critical",
    description:
      "Scale application capacity by adding service instances and distributing workloads.",
    whyItMatters:
      "Horizontal scaling is a foundational pattern for highly available services.",
    prerequisites: ["scalability"],
    enables: ["high-availability", "cloud-system-architecture"],
    alternatives: [],
    related: ["load-balancer"],
    metadata: {
      phase: "scalability",
    },
  }),

  // ============================================================
  // PHASE 18 — HIGH AVAILABILITY
  // ============================================================

  node({
    id: "high-availability",
    title: "High Availability",
    category: "reliability",
    importance: "critical",
    description:
      "Design redundant components, failover, health checks and multi-zone architectures.",
    whyItMatters:
      "High availability minimizes service disruption when infrastructure components fail.",
    prerequisites: ["horizontal-scaling", "fault-tolerance", "replication"],
    enables: ["disaster-recovery", "production-system-architecture"],
    alternatives: [],
    related: ["load-balancer"],
    metadata: {
      phase: "high-availability",
      primary: true,
    },
  }),

  node({
    id: "disaster-recovery",
    title: "Disaster Recovery",
    category: "reliability",
    importance: "critical",
    description:
      "Design backups, restore procedures, failover strategies and recovery objectives.",
    whyItMatters:
      "Availability alone does not protect systems from catastrophic failures or data loss.",
    prerequisites: ["high-availability"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["backup-strategy"],
    metadata: {
      phase: "high-availability",
    },
  }),

  node({
    id: "backup-strategy",
    title: "Backup Strategy",
    category: "reliability",
    importance: "high",
    description:
      "Design backup frequency, retention, restore testing and recovery workflows.",
    whyItMatters:
      "Backups are useful only when restoration is reliable and tested.",
    prerequisites: ["disaster-recovery"],
    enables: [],
    alternatives: [],
    related: ["object-storage"],
    metadata: {
      phase: "high-availability",
    },
  }),

  // ============================================================
  // PHASE 19 — MICROSERVICES
  // ============================================================

  node({
    id: "microservices-architecture",
    title: "Microservices Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Design independently deployable services with clear ownership, communication and data boundaries.",
    whyItMatters:
      "Microservices can enable independent scaling and deployment but introduce significant distributed complexity.",
    prerequisites: [
      "api-design",
      "distributed-systems-foundation",
      "identity-and-access",
    ],
    enables: [
      "service-discovery",
      "event-driven-architecture",
      "microservice-resilience",
    ],
    alternatives: ["modular-monolith", "service-oriented-architecture"],
    related: ["domain-driven-design"],
    metadata: {
      phase: "microservices-architecture",
      primary: true,
    },
  }),

  node({
    id: "modular-monolith",
    title: "Modular Monolith",
    category: "architecture",
    importance: "critical",
    description:
      "Design a single deployable application with strong internal module boundaries.",
    whyItMatters:
      "A modular monolith can provide architectural structure without immediately paying distributed-system costs.",
    prerequisites: ["software-architecture"],
    enables: ["microservices-architecture"],
    alternatives: [],
    related: ["domain-driven-design"],
    metadata: {
      phase: "microservices-architecture",
    },
  }),

  node({
    id: "service-oriented-architecture",
    title: "Service-Oriented Architecture",
    category: "architecture",
    importance: "medium",
    description:
      "Understand service-oriented decomposition and communication as an alternative architectural style.",
    whyItMatters:
      "Some enterprise systems use service-oriented architectures rather than independently deployed microservices.",
    prerequisites: ["microservices-architecture"],
    enables: [],
    alternatives: ["microservices-architecture"],
    related: ["api-design"],
    metadata: {
      phase: "microservices-architecture",
      optional: true,
    },
  }),

  node({
    id: "service-discovery",
    title: "Service Discovery",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand how distributed services locate one another dynamically.",
    whyItMatters:
      "Dynamic service environments require reliable service-location mechanisms.",
    prerequisites: ["microservices-architecture"],
    enables: ["cloud-system-architecture"],
    alternatives: [],
    related: ["load-balancer"],
    metadata: {
      phase: "microservices-architecture",
    },
  }),

  node({
    id: "microservice-resilience",
    title: "Microservice Resilience",
    category: "reliability",
    importance: "critical",
    description:
      "Apply timeouts, retries, circuit breakers, bulkheads and graceful degradation between services.",
    whyItMatters: "Service dependencies create cascading-failure risks.",
    prerequisites: ["microservices-architecture", "reliability-patterns"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["distributed-tracing"],
    metadata: {
      phase: "microservices-architecture",
    },
  }),

  // ============================================================
  // PHASE 20 — EVENT DRIVEN
  // ============================================================

  node({
    id: "event-driven-architecture",
    title: "Event-Driven Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Design event producers, consumers, brokers, schemas, ordering, delivery guarantees and replay.",
    whyItMatters:
      "Events allow services to communicate asynchronously and reduce tight coupling.",
    prerequisites: ["message-queues", "kafka", "microservices-architecture"],
    enables: ["event-sourcing", "stream-processing"],
    alternatives: [],
    related: ["distributed-transactions"],
    metadata: {
      phase: "event-driven-architecture",
      primary: true,
    },
  }),

  node({
    id: "event-sourcing",
    title: "Event Sourcing",
    category: "architecture",
    importance: "high",
    description: "Store state changes as an append-only sequence of events.",
    whyItMatters:
      "Event sourcing can provide strong auditability and temporal reconstruction of domain state.",
    prerequisites: ["event-driven-architecture"],
    enables: ["advanced-distributed-systems"],
    alternatives: [],
    related: ["cqrs"],
    metadata: {
      phase: "event-driven-architecture",
      optional: true,
    },
  }),

  node({
    id: "cqrs",
    title: "CQRS",
    category: "architecture",
    importance: "high",
    description:
      "Separate command and query responsibilities when different read and write models are beneficial.",
    whyItMatters:
      "CQRS can optimize complex read/write workloads but adds architectural complexity.",
    prerequisites: ["event-driven-architecture"],
    enables: ["advanced-distributed-systems"],
    alternatives: [],
    related: ["event-sourcing"],
    metadata: {
      phase: "event-driven-architecture",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 21 — REALTIME
  // ============================================================

  node({
    id: "realtime-systems",
    title: "Realtime Systems",
    category: "realtime",
    importance: "high",
    description:
      "Design WebSocket connections, pub/sub, fan-out, connection management and realtime scaling.",
    whyItMatters:
      "Realtime workloads require different communication and scaling strategies from standard request-response APIs.",
    prerequisites: ["api-design", "distributed-caching"],
    enables: ["websockets", "realtime-scaling"],
    alternatives: [],
    related: ["message-queues"],
    metadata: {
      phase: "realtime-systems",
      primary: true,
    },
  }),

  node({
    id: "websockets",
    title: "WebSockets",
    category: "realtime",
    importance: "critical",
    description:
      "Maintain bidirectional persistent connections between clients and servers.",
    whyItMatters:
      "WebSockets are a common foundation for chat, collaboration and live updates.",
    prerequisites: ["realtime-systems"],
    enables: ["realtime-scaling"],
    alternatives: ["server-sent-events"],
    related: ["pub-sub"],
    metadata: {
      phase: "realtime-systems",
      primary: true,
    },
  }),

  node({
    id: "server-sent-events",
    title: "Server-Sent Events",
    category: "realtime",
    importance: "medium",
    description: "Stream server-generated updates to clients over HTTP.",
    whyItMatters:
      "SSE is simpler than WebSockets for one-way realtime updates.",
    prerequisites: ["realtime-systems"],
    enables: ["realtime-scaling"],
    alternatives: ["websockets"],
    related: ["http-protocol"],
    metadata: {
      phase: "realtime-systems",
      optional: true,
    },
  }),

  node({
    id: "pub-sub",
    title: "Publish / Subscribe",
    category: "messaging",
    importance: "critical",
    description:
      "Distribute events to multiple subscribers through a publish-subscribe model.",
    whyItMatters:
      "Pub/sub is useful for realtime fan-out and loosely coupled event distribution.",
    prerequisites: ["realtime-systems", "message-queues"],
    enables: ["realtime-scaling"],
    alternatives: [],
    related: ["redis"],
    metadata: {
      phase: "realtime-systems",
    },
  }),

  node({
    id: "realtime-scaling",
    title: "Realtime Scaling",
    category: "realtime",
    importance: "high",
    description:
      "Scale persistent connections across multiple application instances using shared state or pub/sub.",
    whyItMatters:
      "Realtime systems become difficult when connections are distributed across servers.",
    prerequisites: ["websockets", "pub-sub"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["load-balancer"],
    metadata: {
      phase: "realtime-systems",
    },
  }),

  // ============================================================
  // PHASE 22 — SEARCH
  // ============================================================

  node({
    id: "search-systems",
    title: "Search Systems",
    category: "data-systems",
    importance: "high",
    description:
      "Understand indexing, inverted indexes, relevance, filtering, ranking and distributed search.",
    whyItMatters:
      "Search is a common specialized workload that databases alone may not efficiently support at scale.",
    prerequisites: ["database-indexing", "distributed-systems-foundation"],
    enables: ["inverted-index", "search-autocomplete"],
    alternatives: [],
    related: ["elasticsearch"],
    metadata: {
      phase: "search-systems",
      primary: true,
    },
  }),

  node({
    id: "inverted-index",
    title: "Inverted Index",
    category: "search",
    importance: "high",
    description:
      "Understand the core index structure used for efficient text retrieval.",
    whyItMatters:
      "Inverted indexes are fundamental to modern text-search systems.",
    prerequisites: ["search-systems"],
    enables: ["search-autocomplete"],
    alternatives: [],
    related: ["elasticsearch"],
    metadata: {
      phase: "search-systems",
    },
  }),

  node({
    id: "elasticsearch",
    title: "Elasticsearch / OpenSearch",
    category: "search",
    importance: "high",
    description:
      "Understand distributed search engines, indexing, shards, replicas and query execution.",
    whyItMatters:
      "Distributed search engines provide scalable search and analytics capabilities.",
    prerequisites: ["inverted-index"],
    enables: ["search-autocomplete"],
    alternatives: ["database-full-text-search"],
    related: ["observability"],
    metadata: {
      phase: "search-systems",
      optional: true,
    },
  }),

  node({
    id: "database-full-text-search",
    title: "Database Full-Text Search",
    category: "search",
    importance: "medium",
    description:
      "Use relational or document databases for search workloads when requirements remain within database capabilities.",
    whyItMatters: "A separate search system is not always justified.",
    prerequisites: ["search-systems"],
    enables: [],
    alternatives: ["elasticsearch"],
    related: ["database-indexing"],
    metadata: {
      phase: "search-systems",
      optional: true,
    },
  }),

  node({
    id: "search-autocomplete",
    title: "Search Autocomplete",
    category: "search",
    importance: "high",
    description:
      "Design low-latency autocomplete using prefix indexes, caching and ranking.",
    whyItMatters:
      "Autocomplete combines search, caching and latency-sensitive architecture.",
    prerequisites: ["inverted-index", "caching"],
    enables: ["system-design-case-studies"],
    alternatives: [],
    related: ["rate-limiting"],
    metadata: {
      phase: "search-systems",
    },
  }),

  // ============================================================
  // PHASE 23 — RATE LIMITING
  // ============================================================

  node({
    id: "rate-limiting",
    title: "Rate Limiting",
    category: "reliability",
    importance: "critical",
    description:
      "Protect services using quotas, throttling and distributed request limiting.",
    whyItMatters:
      "Rate limiting protects systems from overload and abusive traffic.",
    prerequisites: ["api-design", "redis"],
    enables: ["system-security", "scalability"],
    alternatives: [],
    related: ["api-gateway"],
    metadata: {
      phase: "rate-limiting",
      primary: true,
    },
  }),

  node({
    id: "token-bucket",
    title: "Token Bucket",
    category: "algorithms",
    importance: "high",
    description: "Understand token-bucket rate limiting and burst handling.",
    whyItMatters:
      "Token bucket is a practical rate-limiting strategy for controlling request bursts.",
    prerequisites: ["rate-limiting"],
    enables: ["distributed-rate-limiting"],
    alternatives: ["leaky-bucket", "sliding-window"],
    related: ["redis"],
    metadata: {
      phase: "rate-limiting",
    },
  }),

  node({
    id: "leaky-bucket",
    title: "Leaky Bucket",
    category: "algorithms",
    importance: "medium",
    description:
      "Understand leaky-bucket traffic shaping and request smoothing.",
    whyItMatters:
      "Leaky bucket provides a different traffic-shaping behavior from token bucket.",
    prerequisites: ["rate-limiting"],
    enables: [],
    alternatives: ["token-bucket"],
    related: ["distributed-rate-limiting"],
    metadata: {
      phase: "rate-limiting",
      optional: true,
    },
  }),

  node({
    id: "sliding-window",
    title: "Sliding Window Rate Limiting",
    category: "algorithms",
    importance: "medium",
    description:
      "Understand fixed and sliding-window request-counting strategies.",
    whyItMatters: "Window-based approaches provide practical request quotas.",
    prerequisites: ["rate-limiting"],
    enables: [],
    alternatives: ["token-bucket"],
    related: ["redis"],
    metadata: {
      phase: "rate-limiting",
      optional: true,
    },
  }),

  node({
    id: "distributed-rate-limiting",
    title: "Distributed Rate Limiting",
    category: "reliability",
    importance: "high",
    description:
      "Coordinate rate limits across multiple application instances.",
    whyItMatters:
      "A local limiter is insufficient when requests can reach many service instances.",
    prerequisites: ["token-bucket", "distributed-caching"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["api-gateway"],
    metadata: {
      phase: "rate-limiting",
    },
  }),

  // ============================================================
  // PHASE 24 — DISTRIBUTED IDS
  // ============================================================

  node({
    id: "distributed-id-generation",
    title: "Distributed ID Generation",
    category: "distributed-systems",
    importance: "high",
    description:
      "Design unique identifiers that work across distributed services and machines.",
    whyItMatters:
      "Distributed applications cannot always rely on a single database sequence.",
    prerequisites: ["distributed-systems-foundation", "scalability"],
    enables: ["system-design-case-studies"],
    alternatives: [],
    related: ["snowflake-ids"],
    metadata: {
      phase: "distributed-id-generation",
      primary: true,
    },
  }),

  node({
    id: "snowflake-ids",
    title: "Snowflake-Style IDs",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand time-ordered distributed identifiers composed from timestamp and worker information.",
    whyItMatters:
      "Snowflake-style IDs provide globally unique identifiers without a centralized sequence.",
    prerequisites: ["distributed-id-generation"],
    enables: [],
    alternatives: ["uuid", "ulid"],
    related: [],
    metadata: {
      phase: "distributed-id-generation",
    },
  }),

  node({
    id: "uuid",
    title: "UUID",
    category: "distributed-systems",
    importance: "high",
    description: "Understand globally unique identifiers and their trade-offs.",
    whyItMatters:
      "UUIDs are simple and widely used for distributed identifiers.",
    prerequisites: ["distributed-id-generation"],
    enables: [],
    alternatives: ["snowflake-ids"],
    related: ["database-scaling"],
    metadata: {
      phase: "distributed-id-generation",
    },
  }),

  node({
    id: "ulid",
    title: "ULID Awareness",
    category: "distributed-systems",
    importance: "medium",
    description: "Understand time-sortable unique identifiers.",
    whyItMatters:
      "Time-sortable IDs can provide useful ordering properties while remaining decentralized.",
    prerequisites: ["distributed-id-generation"],
    enables: [],
    alternatives: ["snowflake-ids"],
    related: ["uuid"],
    metadata: {
      phase: "distributed-id-generation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 25 — ARCHITECTURAL PATTERNS
  // ============================================================

  node({
    id: "architectural-patterns",
    title: "Architectural Patterns",
    category: "architecture",
    importance: "critical",
    description:
      "Understand monoliths, modular architectures, client-server, event-driven systems, microservices and serverless.",
    whyItMatters:
      "Architectural patterns provide reusable structures for organizing systems.",
    prerequisites: ["system-design-thinking", "software-architecture"],
    enables: ["serverless-architecture", "cloud-system-architecture"],
    alternatives: [],
    related: ["microservices-architecture"],
    metadata: {
      phase: "architectural-patterns",
      primary: true,
    },
  }),

  node({
    id: "client-server",
    title: "Client-Server Architecture",
    category: "architecture",
    importance: "high",
    description: "Understand separation between clients and backend services.",
    whyItMatters:
      "Client-server architecture is foundational to web and distributed applications.",
    prerequisites: ["architectural-patterns"],
    enables: ["api-design"],
    alternatives: [],
    related: ["microservices-architecture"],
    metadata: {
      phase: "architectural-patterns",
    },
  }),

  node({
    id: "layered-architecture",
    title: "Layered Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Organize software into layers with clear responsibilities and dependencies.",
    whyItMatters:
      "Layering provides a simple and maintainable structure for many applications.",
    prerequisites: ["architectural-patterns"],
    enables: ["software-architecture"],
    alternatives: [],
    related: ["modular-monolith"],
    metadata: {
      phase: "architectural-patterns",
    },
  }),

  // ============================================================
  // PHASE 26 — SERVERLESS
  // ============================================================

  node({
    id: "serverless-architecture",
    title: "Serverless Architecture",
    category: "cloud",
    importance: "high",
    description:
      "Understand functions, managed services, triggers, stateless execution and cold starts.",
    whyItMatters:
      "Serverless can reduce infrastructure management for event-driven workloads.",
    prerequisites: ["architectural-patterns", "message-queues"],
    enables: ["cloud-system-architecture"],
    alternatives: [],
    related: ["event-driven-architecture"],
    metadata: {
      phase: "serverless-architecture",
    },
  }),

  node({
    id: "managed-services",
    title: "Managed Services",
    category: "cloud",
    importance: "high",
    description:
      "Understand when managed databases, queues, storage and observability services reduce operational burden.",
    whyItMatters:
      "Managed services allow teams to focus on product capabilities rather than operating every infrastructure component.",
    prerequisites: ["serverless-architecture"],
    enables: ["cloud-system-architecture"],
    alternatives: [],
    related: ["cost-aware-architecture"],
    metadata: {
      phase: "serverless-architecture",
    },
  }),

  // ============================================================
  // PHASE 27 — CLOUD ARCHITECTURE
  // ============================================================

  node({
    id: "cloud-system-architecture",
    title: "Cloud System Architecture",
    category: "cloud",
    importance: "critical",
    description:
      "Combine compute, networking, storage, databases, load balancing, identity, queues and observability in cloud systems.",
    whyItMatters:
      "Most production systems are deployed on cloud infrastructure or cloud-like environments.",
    prerequisites: [
      "horizontal-scaling",
      "object-storage",
      "managed-services",
      "identity-and-access",
    ],
    enables: ["production-system-architecture", "cost-aware-architecture"],
    alternatives: [
      "aws-architecture",
      "gcp-architecture",
      "azure-architecture",
    ],
    related: ["cloud-native"],
    metadata: {
      phase: "cloud-system-architecture",
      primary: true,
    },
  }),

  node({
    id: "aws-architecture",
    title: "AWS Architecture",
    category: "cloud",
    importance: "high",
    description:
      "Map system-design concepts to common AWS compute, storage, database, networking and messaging services.",
    whyItMatters:
      "AWS provides a practical environment for applying cloud architecture concepts.",
    prerequisites: ["cloud-system-architecture"],
    enables: [],
    alternatives: ["gcp-architecture", "azure-architecture"],
    related: ["cost-aware-architecture"],
    metadata: {
      phase: "cloud-system-architecture",
      optional: true,
    },
  }),

  node({
    id: "gcp-architecture",
    title: "GCP Architecture Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand how system-design concepts map to Google Cloud services.",
    whyItMatters: "GCP is a relevant alternative cloud architecture ecosystem.",
    prerequisites: ["cloud-system-architecture"],
    enables: [],
    alternatives: ["aws-architecture"],
    related: ["data-intensive-systems"],
    metadata: {
      phase: "cloud-system-architecture",
      optional: true,
    },
  }),

  node({
    id: "azure-architecture",
    title: "Azure Architecture Awareness",
    category: "cloud",
    importance: "medium",
    description: "Understand how system-design concepts map to Azure services.",
    whyItMatters: "Azure is important in enterprise cloud environments.",
    prerequisites: ["cloud-system-architecture"],
    enables: [],
    alternatives: ["aws-architecture"],
    related: ["identity-and-access"],
    metadata: {
      phase: "cloud-system-architecture",
      optional: true,
    },
  }),

  node({
    id: "cloud-native",
    title: "Cloud-Native Architecture",
    category: "cloud",
    importance: "high",
    description:
      "Understand containers, orchestration, managed services, autoscaling and cloud-native application patterns.",
    whyItMatters:
      "Cloud-native systems optimize architecture around elasticity, automation and managed infrastructure.",
    prerequisites: ["cloud-system-architecture"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["microservices-architecture"],
    metadata: {
      phase: "cloud-system-architecture",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 28 — DATA-INTENSIVE SYSTEMS
  // ============================================================

  node({
    id: "data-intensive-systems",
    title: "Data-Intensive Systems",
    category: "data-systems",
    importance: "critical",
    description:
      "Design systems dominated by large-scale storage, processing, streaming and data movement.",
    whyItMatters:
      "Many modern systems are constrained by data volume, throughput and processing requirements.",
    prerequisites: ["database-scaling", "distributed-databases", "kafka"],
    enables: ["stream-processing", "advanced-distributed-systems"],
    alternatives: [],
    related: ["data-engineering"],
    metadata: {
      phase: "data-intensive-systems",
      primary: true,
    },
  }),

  node({
    id: "stream-processing",
    title: "Stream Processing",
    category: "data-systems",
    importance: "high",
    description: "Process continuously arriving events and data streams.",
    whyItMatters:
      "Streaming architectures support realtime analytics and event-driven processing.",
    prerequisites: ["data-intensive-systems", "kafka"],
    enables: ["advanced-distributed-systems"],
    alternatives: [],
    related: ["event-driven-architecture"],
    metadata: {
      phase: "data-intensive-systems",
    },
  }),

  node({
    id: "data-engineering",
    title: "Data Engineering Awareness",
    category: "data-systems",
    importance: "high",
    description:
      "Understand ingestion, transformation, storage and data-pipeline architecture.",
    whyItMatters:
      "Large systems often depend on reliable data pipelines in addition to transactional services.",
    prerequisites: ["data-intensive-systems"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: [],
    metadata: {
      phase: "data-intensive-systems",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 29 — PERFORMANCE
  // ============================================================

  node({
    id: "system-performance",
    title: "System Performance",
    category: "performance",
    importance: "critical",
    description:
      "Analyze latency, throughput, resource utilization, bottlenecks and performance trade-offs.",
    whyItMatters:
      "Architecture must satisfy latency and throughput requirements under realistic workloads.",
    prerequisites: [
      "capacity-estimation",
      "database-indexing",
      "caching",
      "load-balancer",
    ],
    enables: ["performance-engineering", "production-system-architecture"],
    alternatives: [],
    related: ["observability"],
    metadata: {
      phase: "system-performance",
      primary: true,
    },
  }),

  node({
    id: "performance-engineering",
    title: "Performance Engineering",
    category: "performance",
    importance: "high",
    description:
      "Optimize systems through profiling, load testing, capacity planning and bottleneck analysis.",
    whyItMatters:
      "Performance should be measured and diagnosed rather than guessed.",
    prerequisites: ["system-performance"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["load-testing"],
    metadata: {
      phase: "system-performance",
    },
  }),

  node({
    id: "load-testing",
    title: "Load Testing",
    category: "testing",
    importance: "high",
    description: "Evaluate system behavior under realistic and peak workloads.",
    whyItMatters:
      "Load testing reveals capacity limits and failure behavior before production traffic does.",
    prerequisites: ["system-performance", "observability"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["capacity-estimation"],
    metadata: {
      phase: "system-performance",
    },
  }),

  // ============================================================
  // PHASE 30 — COST
  // ============================================================

  node({
    id: "cost-aware-architecture",
    title: "Cost-Aware Architecture",
    category: "architecture",
    importance: "high",
    description:
      "Balance compute, storage, networking, managed services and operational costs against system requirements.",
    whyItMatters:
      "A technically scalable architecture can still be economically impractical.",
    prerequisites: [
      "capacity-estimation",
      "cloud-system-architecture",
      "system-performance",
    ],
    enables: ["architecture-decision-making"],
    alternatives: [],
    related: ["cloud-system-architecture"],
    metadata: {
      phase: "cost-and-efficiency",
    },
  }),

  // ============================================================
  // PHASE 31 — SOFTWARE ARCHITECTURE
  // ============================================================

  node({
    id: "software-architecture",
    title: "Software Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Design modular software structures, dependencies, boundaries and responsibilities.",
    whyItMatters:
      "Good system design depends on maintainable software structure as well as infrastructure.",
    prerequisites: ["system-design-fundamentals", "layered-architecture"],
    enables: ["modular-monolith", "low-level-design", "domain-driven-design"],
    alternatives: ["clean-architecture", "hexagonal-architecture"],
    related: ["architectural-patterns"],
    metadata: {
      phase: "software-architecture",
      primary: true,
    },
  }),

  node({
    id: "clean-architecture",
    title: "Clean Architecture",
    category: "architecture",
    importance: "high",
    description:
      "Understand dependency direction, use cases, boundaries and separation of infrastructure from domain logic.",
    whyItMatters:
      "Clean architecture provides a structured approach for maintainable application boundaries.",
    prerequisites: ["software-architecture"],
    enables: [],
    alternatives: ["hexagonal-architecture"],
    related: ["domain-driven-design"],
    metadata: {
      phase: "software-architecture",
      optional: true,
    },
  }),

  node({
    id: "hexagonal-architecture",
    title: "Hexagonal Architecture",
    category: "architecture",
    importance: "high",
    description:
      "Separate domain logic from external systems through ports and adapters.",
    whyItMatters:
      "Ports and adapters can improve testability and isolate infrastructure dependencies.",
    prerequisites: ["software-architecture"],
    enables: [],
    alternatives: ["clean-architecture"],
    related: ["domain-driven-design"],
    metadata: {
      phase: "software-architecture",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 32 — LOW LEVEL DESIGN
  // ============================================================

  node({
    id: "low-level-design",
    title: "Low-Level Design",
    category: "low-level-design",
    importance: "critical",
    description:
      "Translate requirements into classes, interfaces, responsibilities, relationships and implementation-level designs.",
    whyItMatters:
      "HLD defines system boundaries while LLD determines how individual components are implemented.",
    prerequisites: ["software-architecture"],
    enables: ["solid-principles", "design-patterns"],
    alternatives: [],
    related: ["object-oriented-design"],
    metadata: {
      phase: "low-level-design",
      primary: true,
    },
  }),

  node({
    id: "object-oriented-design",
    title: "Object-Oriented Design",
    category: "low-level-design",
    importance: "critical",
    description:
      "Model software using classes, interfaces, composition and encapsulation.",
    whyItMatters:
      "Many production systems and LLD interviews rely on object-oriented design principles.",
    prerequisites: ["low-level-design"],
    enables: ["solid-principles"],
    alternatives: [],
    related: ["design-patterns"],
    metadata: {
      phase: "low-level-design",
    },
  }),

  node({
    id: "solid-principles",
    title: "SOLID Principles",
    category: "low-level-design",
    importance: "critical",
    description:
      "Apply single responsibility, open-closed, Liskov substitution, interface segregation and dependency inversion.",
    whyItMatters:
      "SOLID principles help maintain flexible and understandable object-oriented designs.",
    prerequisites: ["object-oriented-design"],
    enables: ["design-patterns"],
    alternatives: [],
    related: ["clean-architecture"],
    metadata: {
      phase: "low-level-design",
    },
  }),

  // ============================================================
  // PHASE 33 — DESIGN PATTERNS
  // ============================================================

  node({
    id: "design-patterns",
    title: "Design Patterns",
    category: "low-level-design",
    importance: "high",
    description:
      "Understand creational, structural and behavioral patterns and when they solve real design problems.",
    whyItMatters:
      "Patterns provide reusable solutions to recurring design problems.",
    prerequisites: ["low-level-design", "solid-principles"],
    enables: ["system-design-case-studies"],
    alternatives: [],
    related: ["object-oriented-design"],
    metadata: {
      phase: "design-patterns",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 34 — DOMAIN-DRIVEN DESIGN
  // ============================================================

  node({
    id: "domain-driven-design",
    title: "Domain-Driven Design",
    category: "architecture",
    importance: "high",
    description:
      "Model complex domains using bounded contexts, entities, value objects, aggregates and domain boundaries.",
    whyItMatters:
      "Strong domain boundaries help determine module and service ownership.",
    prerequisites: ["software-architecture", "object-oriented-design"],
    enables: ["microservices-architecture", "advanced-distributed-systems"],
    alternatives: [],
    related: ["bounded-contexts"],
    metadata: {
      phase: "domain-driven-design",
      optional: true,
    },
  }),

  node({
    id: "bounded-contexts",
    title: "Bounded Contexts",
    category: "architecture",
    importance: "high",
    description:
      "Define explicit domain boundaries with their own models and responsibilities.",
    whyItMatters:
      "Bounded contexts provide a useful foundation for service and module decomposition.",
    prerequisites: ["domain-driven-design"],
    enables: ["microservices-architecture"],
    alternatives: [],
    related: ["modular-monolith"],
    metadata: {
      phase: "domain-driven-design",
    },
  }),

  // ============================================================
  // PHASE 35 — CASE STUDIES
  // ============================================================

  node({
    id: "system-design-case-studies",
    title: "System Design Case Studies",
    category: "system-design",
    importance: "critical",
    description:
      "Apply system-design building blocks to complete real-world system architectures.",
    whyItMatters:
      "Case studies transform isolated concepts into reusable design reasoning.",
    prerequisites: [
      "requirements-engineering",
      "capacity-estimation",
      "api-design",
      "database-scaling",
      "caching",
      "load-balancer",
      "message-queues",
      "observability",
    ],
    enables: ["core-system-design-problems", "architecture-communication"],
    alternatives: [],
    related: ["architecture-decision-making"],
    metadata: {
      phase: "system-design-case-studies",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 36 — CORE INTERVIEW SYSTEMS
  // ============================================================

  node({
    id: "core-system-design-problems",
    title: "Core System Design Problems",
    category: "system-design",
    importance: "critical",
    description:
      "Practice reusable system-design patterns through representative problems such as URL shorteners, feeds, messaging and search.",
    whyItMatters:
      "Interview preparation should develop transferable design patterns rather than memorized answers.",
    prerequisites: ["system-design-case-studies", "design-patterns"],
    enables: ["senior-system-design"],
    alternatives: [],
    related: ["url-shortener", "news-feed", "chat-system"],
    metadata: {
      phase: "core-system-design-problems",
      primary: true,
    },
  }),

  node({
    id: "url-shortener",
    title: "URL Shortener Design",
    category: "system-design-case",
    importance: "high",
    description:
      "Design a scalable URL shortening service covering IDs, storage, caching and redirects.",
    whyItMatters:
      "URL shorteners provide a compact exercise covering IDs, databases, caching and traffic.",
    prerequisites: ["core-system-design-problems"],
    enables: [],
    alternatives: [],
    related: ["distributed-id-generation"],
    metadata: {
      phase: "core-system-design-problems",
    },
  }),

  node({
    id: "news-feed",
    title: "News Feed Design",
    category: "system-design-case",
    importance: "critical",
    description:
      "Design feed generation, fan-out, ranking, caching and high-read workloads.",
    whyItMatters:
      "News feeds expose important trade-offs around fan-out, caching and read/write patterns.",
    prerequisites: ["core-system-design-problems"],
    enables: [],
    alternatives: [],
    related: ["caching", "realtime-systems"],
    metadata: {
      phase: "core-system-design-problems",
    },
  }),

  node({
    id: "chat-system",
    title: "Chat System Design",
    category: "system-design-case",
    importance: "critical",
    description:
      "Design messaging, realtime connections, delivery guarantees, storage and offline behavior.",
    whyItMatters:
      "Chat systems combine realtime communication, persistence, scaling and reliability.",
    prerequisites: ["core-system-design-problems", "realtime-systems"],
    enables: [],
    alternatives: [],
    related: ["websockets"],
    metadata: {
      phase: "core-system-design-problems",
    },
  }),

  // ============================================================
  // PHASE 37 — COMMUNICATION
  // ============================================================

  node({
    id: "architecture-communication",
    title: "Architecture Communication",
    category: "architecture",
    importance: "critical",
    description:
      "Communicate assumptions, requirements, diagrams, trade-offs, alternatives and final architecture decisions.",
    whyItMatters:
      "Senior engineers must communicate architecture clearly to engineers, product teams and stakeholders.",
    prerequisites: [
      "system-design-case-studies",
      "core-system-design-problems",
    ],
    enables: ["architecture-decision-making"],
    alternatives: [],
    related: ["architecture-diagrams"],
    metadata: {
      phase: "architecture-communication",
      primary: true,
    },
  }),

  node({
    id: "architecture-diagrams",
    title: "Architecture Diagrams",
    category: "architecture",
    importance: "high",
    description:
      "Represent components, data flows, dependencies and trust boundaries using architecture diagrams.",
    whyItMatters:
      "Diagrams make complex systems easier to reason about and communicate.",
    prerequisites: ["architecture-communication"],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["architecture-decision-making"],
    metadata: {
      phase: "architecture-communication",
    },
  }),

  // ============================================================
  // PHASE 38 — DECISION MAKING
  // ============================================================

  node({
    id: "architecture-decision-making",
    title: "Architecture Decision Making",
    category: "architecture",
    importance: "critical",
    description:
      "Compare alternatives using scalability, latency, reliability, complexity, security, cost and operational constraints.",
    whyItMatters:
      "Architecture is primarily about choosing appropriate trade-offs.",
    prerequisites: [
      "architecture-communication",
      "cost-aware-architecture",
      "system-performance",
      "system-security",
    ],
    enables: ["production-system-architecture"],
    alternatives: [],
    related: ["architecture-tradeoffs"],
    metadata: {
      phase: "architecture-decision-making",
      primary: true,
    },
  }),

  node({
    id: "architecture-tradeoffs",
    title: "Architecture Trade-offs",
    category: "architecture",
    importance: "critical",
    description:
      "Evaluate competing architecture options instead of treating one solution as universally correct.",
    whyItMatters:
      "Real systems require balancing conflicting goals such as latency, consistency, cost and complexity.",
    prerequisites: ["architecture-decision-making"],
    enables: ["senior-system-design"],
    alternatives: [],
    related: ["cost-aware-architecture"],
    metadata: {
      phase: "architecture-decision-making",
    },
  }),

  // ============================================================
  // PHASE 39 — PRODUCTION ARCHITECTURE
  // ============================================================

  node({
    id: "production-system-architecture",
    title: "Production System Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Combine scalability, reliability, security, observability, deployment, data and cost into complete production architectures.",
    whyItMatters:
      "Production architecture must satisfy operational requirements in addition to functional ones.",
    prerequisites: [
      "architecture-decision-making",
      "high-availability",
      "secure-architecture",
      "observability",
      "cloud-system-architecture",
    ],
    enables: ["advanced-distributed-systems", "senior-system-design"],
    alternatives: [],
    related: ["sre"],
    metadata: {
      phase: "production-system-architecture",
      primary: true,
    },
  }),

  node({
    id: "sre",
    title: "SRE Awareness",
    category: "reliability",
    importance: "high",
    description:
      "Understand service levels, error budgets, incidents and operational reliability practices.",
    whyItMatters:
      "System architects must account for how systems are operated after deployment.",
    prerequisites: ["production-system-architecture"],
    enables: ["senior-system-design"],
    alternatives: [],
    related: ["observability"],
    metadata: {
      phase: "production-system-architecture",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 40 — ADVANCED DISTRIBUTED SYSTEMS
  // ============================================================

  node({
    id: "advanced-distributed-systems",
    title: "Advanced Distributed Systems",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Explore advanced replication, consensus, coordination, distributed transactions and failure-handling concepts.",
    whyItMatters:
      "Senior distributed-system design requires deeper understanding of coordination and failure.",
    prerequisites: [
      "distributed-databases",
      "cap-theorem",
      "distributed-transactions",
      "data-intensive-systems",
      "production-system-architecture",
    ],
    enables: ["senior-system-design"],
    alternatives: [],
    related: ["consensus", "distributed-coordination"],
    metadata: {
      phase: "advanced-distributed-systems",
      primary: true,
    },
  }),

  node({
    id: "consensus",
    title: "Consensus Awareness",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand why distributed systems need consensus and the basic ideas behind consensus algorithms.",
    whyItMatters:
      "Consensus is foundational to coordination systems and strongly consistent distributed state.",
    prerequisites: ["advanced-distributed-systems"],
    enables: [],
    alternatives: [],
    related: ["distributed-coordination"],
    metadata: {
      phase: "advanced-distributed-systems",
      optional: true,
    },
  }),

  node({
    id: "distributed-coordination",
    title: "Distributed Coordination",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand leader election, coordination, distributed locks and coordination-service concepts.",
    whyItMatters:
      "Distributed components sometimes need shared coordination despite independent failure.",
    prerequisites: ["advanced-distributed-systems"],
    enables: ["senior-system-design"],
    alternatives: [],
    related: ["consensus"],
    metadata: {
      phase: "advanced-distributed-systems",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 41 — SENIOR SYSTEM DESIGN
  // ============================================================

  node({
    id: "senior-system-design",
    title: "Senior-Level System Design",
    category: "system-design",
    importance: "critical",
    description:
      "Design complex systems while balancing product requirements, distributed systems, cloud infrastructure, security, reliability and cost.",
    whyItMatters:
      "Senior engineers must reason across technical and product constraints rather than optimize one component in isolation.",
    prerequisites: [
      "production-system-architecture",
      "advanced-distributed-systems",
      "architecture-tradeoffs",
    ],
    enables: ["software-architecture-mastery"],
    alternatives: [],
    related: ["system-design-case-studies", "architecture-decision-making"],
    metadata: {
      phase: "senior-system-design",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 42 — ARCHITECTURE MASTERY
  // ============================================================

  node({
    id: "software-architecture-mastery",
    title: "Software Architecture Mastery",
    category: "architecture",
    importance: "critical",
    description:
      "Integrate HLD, LLD, distributed systems, cloud, security, reliability, observability and organizational constraints.",
    whyItMatters:
      "Architecture mastery requires connecting all system-design disciplines into coherent long-term decisions.",
    prerequisites: [
      "senior-system-design",
      "low-level-design",
      "domain-driven-design",
    ],
    enables: [],
    alternatives: [],
    related: ["software-architecture", "production-system-architecture"],
    metadata: {
      phase: "software-architecture-mastery",
      primary: true,
    },
  }),
];

/**
 * Closed-reference validation.
 *
 * Every prerequisite, enable, alternative and related reference
 * must point to a canonical node inside this roadmap.
 */
const nodeIds = new Set(
  systemDesignSoftwareArchitectureNodes.map((item) => item.id),
);

for (const item of systemDesignSoftwareArchitectureNodes) {
  const references = [
    ...(item.prerequisites || []),
    ...(item.enables || []),
    ...(item.alternatives || []),
    ...(item.related || []),
  ];

  for (const reference of references) {
    if (!nodeIds.has(reference)) {
      throw new Error(
        `[System Design Roadmap] Invalid node reference "${reference}" ` +
          `in node "${item.id}".`,
      );
    }
  }
}

export default systemDesignSoftwareArchitectureNodes;
export { systemDesignSoftwareArchitectureNodes };

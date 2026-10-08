const systemDesignSoftwareArchitecturePhases = [
  // ============================================================
  // PHASE 1 — SYSTEM DESIGN FOUNDATION
  // ============================================================

  {
    id: "system-design-foundation",
    order: 1,
    title: "System Design Foundation",
    description:
      "Understand what system design is, how large systems are decomposed, and how engineering trade-offs are evaluated.",
    goal: "Build the mental model required to reason about software systems before studying individual building blocks.",
    primaryPath:
      "Requirements → Constraints → Components → Data Flow → Trade-offs",
    alternatives: [],
  },

  // ============================================================
  // PHASE 2 — REQUIREMENTS & ESTIMATION
  // ============================================================

  {
    id: "requirements-and-estimation",
    order: 2,
    title: "Requirements & Capacity Estimation",
    description:
      "Translate product requirements into functional requirements, non-functional requirements, constraints and rough capacity estimates.",
    goal: "Learn to define the problem before proposing an architecture.",
    primaryPath:
      "Functional Requirements + Non-Functional Requirements + Back-of-the-Envelope Estimation",
    alternatives: [],
  },

  // ============================================================
  // PHASE 3 — NETWORKING
  // ============================================================

  {
    id: "networking-for-system-design",
    order: 3,
    title: "Networking for System Design",
    description:
      "Understand DNS, HTTP, HTTPS, TCP, TLS, latency, connections, proxies and network boundaries.",
    goal: "Understand how distributed components communicate across networks.",
    primaryPath: "DNS + HTTP/HTTPS + TCP + TLS",
    alternatives: [],
  },

  // ============================================================
  // PHASE 4 — API DESIGN
  // ============================================================

  {
    id: "api-design",
    order: 4,
    title: "API Design",
    description:
      "Design REST APIs, resource models, contracts, pagination, filtering, versioning and error semantics.",
    goal: "Build clear service boundaries and predictable communication contracts.",
    primaryPath: "REST API Design",
    alternatives: ["GraphQL", "gRPC"],
  },

  // ============================================================
  // PHASE 5 — DATABASE FUNDAMENTALS
  // ============================================================

  {
    id: "database-fundamentals",
    order: 5,
    title: "Database Fundamentals",
    description:
      "Understand relational and NoSQL databases, schemas, indexes, transactions and data-modeling trade-offs.",
    goal: "Choose appropriate persistence technologies based on workload requirements.",
    primaryPath: "SQL + Relational Modeling + Transactions",
    alternatives: [
      "Document Databases",
      "Key-Value Stores",
      "Wide-Column Databases",
      "Graph Databases",
    ],
  },

  // ============================================================
  // PHASE 6 — DATABASE SCALING
  // ============================================================

  {
    id: "database-scaling",
    order: 6,
    title: "Database Scaling",
    description:
      "Learn replication, read replicas, partitioning, sharding, indexing, query optimization and database bottleneck analysis.",
    goal: "Understand how databases evolve when traffic and data volume increase.",
    primaryPath: "Indexes → Replication → Partitioning → Sharding",
    alternatives: [],
  },

  // ============================================================
  // PHASE 7 — CACHING
  // ============================================================

  {
    id: "caching",
    order: 7,
    title: "Caching",
    description:
      "Understand caching strategies, cache-aside, write-through, invalidation, TTLs, distributed caches and failure modes.",
    goal: "Reduce latency and backend/database load using appropriate caching strategies.",
    primaryPath: "Redis + Cache-Aside",
    alternatives: ["Memcached", "CDN Caching", "Application-Level Caching"],
  },

  // ============================================================
  // PHASE 8 — LOAD BALANCING & PROXIES
  // ============================================================

  {
    id: "load-balancing-and-proxies",
    order: 8,
    title: "Load Balancing & Proxies",
    description:
      "Understand reverse proxies, load balancers, health checks, routing strategies and traffic distribution.",
    goal: "Distribute workloads and improve availability and scalability.",
    primaryPath: "Reverse Proxy + Load Balancer",
    alternatives: [],
  },

  // ============================================================
  // PHASE 9 — STORAGE & CDN
  // ============================================================

  {
    id: "storage-and-cdn",
    order: 9,
    title: "Storage & Content Delivery",
    description:
      "Understand object storage, file storage, CDNs, static assets and geographically distributed content delivery.",
    goal: "Design scalable storage and content delivery for large applications.",
    primaryPath: "Object Storage + CDN",
    alternatives: ["Block Storage", "File Storage"],
  },

  // ============================================================
  // PHASE 10 — ASYNCHRONOUS COMMUNICATION
  // ============================================================

  {
    id: "message-queues-and-events",
    order: 10,
    title: "Message Queues & Event-Driven Systems",
    description:
      "Understand queues, producers, consumers, acknowledgements, retries, dead-letter queues and event-driven architecture.",
    goal: "Decouple services and move expensive work into asynchronous workflows.",
    primaryPath: "Message Queue + Event-Driven Architecture",
    alternatives: ["RabbitMQ", "Kafka", "Cloud Messaging Services"],
  },

  // ============================================================
  // PHASE 11 — BACKGROUND PROCESSING
  // ============================================================

  {
    id: "background-processing",
    order: 11,
    title: "Background Processing & Job Systems",
    description:
      "Design workers, scheduled jobs, retry policies, idempotent processing and long-running task execution.",
    goal: "Reliably process work outside synchronous request paths.",
    primaryPath: "Workers + Queue + Retry + Idempotency",
    alternatives: [],
  },

  // ============================================================
  // PHASE 12 — CONSISTENCY & TRANSACTIONS
  // ============================================================

  {
    id: "consistency-and-transactions",
    order: 12,
    title: "Consistency & Distributed Transactions",
    description:
      "Understand consistency models, ACID, isolation, eventual consistency and distributed transaction challenges.",
    goal: "Reason about correctness when data spans multiple operations or services.",
    primaryPath: "ACID + Isolation + Eventual Consistency",
    alternatives: [],
  },

  // ============================================================
  // PHASE 13 — CAP & DISTRIBUTED SYSTEM FUNDAMENTALS
  // ============================================================

  {
    id: "distributed-systems-foundation",
    order: 13,
    title: "Distributed Systems Foundation",
    description:
      "Learn CAP, availability, consistency, partition tolerance, failure models, replication and distributed coordination.",
    goal: "Develop the mental model required to reason about systems running across multiple machines.",
    primaryPath: "CAP + Replication + Failure Handling",
    alternatives: [],
  },

  // ============================================================
  // PHASE 14 — RELIABILITY
  // ============================================================

  {
    id: "reliability-and-fault-tolerance",
    order: 14,
    title: "Reliability & Fault Tolerance",
    description:
      "Design systems that tolerate failures through redundancy, health checks, retries, timeouts, circuit breakers and graceful degradation.",
    goal: "Build systems that continue operating when individual components fail.",
    primaryPath: "Timeouts + Retries + Circuit Breakers + Redundancy",
    alternatives: [],
  },

  // ============================================================
  // PHASE 15 — OBSERVABILITY
  // ============================================================

  {
    id: "observability",
    order: 15,
    title: "Observability & Distributed Tracing",
    description:
      "Understand logs, metrics, traces, correlation IDs, health checks, alerting and debugging distributed systems.",
    goal: "Make production systems observable and diagnosable.",
    primaryPath: "Logs + Metrics + Traces",
    alternatives: [
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
      "Cloud Observability Platforms",
    ],
  },

  // ============================================================
  // PHASE 16 — SECURITY
  // ============================================================

  {
    id: "system-security",
    order: 16,
    title: "Security in System Design",
    description:
      "Apply authentication, authorization, encryption, secrets management, API security, network security and threat modeling.",
    goal: "Design systems with security as an architectural property.",
    primaryPath:
      "Authentication + Authorization + Encryption + Threat Modeling",
    alternatives: [],
  },

  // ============================================================
  // PHASE 17 — SCALABILITY
  // ============================================================

  {
    id: "scalability",
    order: 17,
    title: "Scalability",
    description:
      "Understand vertical and horizontal scaling, stateless services, partitioning, caching and workload distribution.",
    goal: "Design systems that can handle increasing traffic and data volume.",
    primaryPath: "Stateless Services + Horizontal Scaling + Load Balancing",
    alternatives: [],
  },

  // ============================================================
  // PHASE 18 — HIGH AVAILABILITY
  // ============================================================

  {
    id: "high-availability",
    order: 18,
    title: "High Availability & Disaster Recovery",
    description:
      "Design redundancy, multi-zone deployments, backups, failover, disaster recovery and recovery objectives.",
    goal: "Build systems that survive infrastructure failures and recover predictably.",
    primaryPath: "Redundancy + Failover + Backups + Disaster Recovery",
    alternatives: [],
  },

  // ============================================================
  // PHASE 19 — MICROSERVICES
  // ============================================================

  {
    id: "microservices-architecture",
    order: 19,
    title: "Microservices Architecture",
    description:
      "Understand service decomposition, ownership, communication, service discovery, distributed data and operational complexity.",
    goal: "Know when microservices are justified and how to design them safely.",
    primaryPath: "Modular Monolith → Services → Microservices",
    alternatives: ["Service-Oriented Architecture", "Modular Monolith"],
  },

  // ============================================================
  // PHASE 20 — EVENT-DRIVEN ARCHITECTURE
  // ============================================================

  {
    id: "event-driven-architecture",
    order: 20,
    title: "Event-Driven Architecture",
    description:
      "Design event producers, consumers, brokers, event schemas, ordering, delivery guarantees and replay strategies.",
    goal: "Build loosely coupled systems using asynchronous events.",
    primaryPath: "Events + Broker + Consumers",
    alternatives: [],
  },

  // ============================================================
  // PHASE 21 — REALTIME SYSTEMS
  // ============================================================

  {
    id: "realtime-systems",
    order: 21,
    title: "Realtime Systems",
    description:
      "Design WebSocket systems, pub/sub, connection management, fan-out and realtime scaling.",
    goal: "Build scalable chat, collaboration, notifications and live-update systems.",
    primaryPath: "WebSockets + Pub/Sub",
    alternatives: ["Server-Sent Events", "WebRTC"],
  },

  // ============================================================
  // PHASE 22 — SEARCH SYSTEMS
  // ============================================================

  {
    id: "search-systems",
    order: 22,
    title: "Search Systems",
    description:
      "Understand inverted indexes, indexing pipelines, relevance, autocomplete, filtering and distributed search.",
    goal: "Design scalable search and discovery systems.",
    primaryPath: "Inverted Index + Distributed Search",
    alternatives: ["Elasticsearch", "OpenSearch", "Database Full-Text Search"],
  },

  // ============================================================
  // PHASE 23 — RATE LIMITING
  // ============================================================

  {
    id: "rate-limiting",
    order: 23,
    title: "Rate Limiting & Traffic Control",
    description:
      "Design rate limiting algorithms, quotas, throttling, distributed counters and abuse protection.",
    goal: "Protect services and enforce fair resource usage.",
    primaryPath: "Token Bucket + Distributed Rate Limiting",
    alternatives: ["Leaky Bucket", "Fixed Window", "Sliding Window"],
  },

  // ============================================================
  // PHASE 24 — UNIQUE ID & DISTRIBUTED IDENTIFIERS
  // ============================================================

  {
    id: "distributed-id-generation",
    order: 24,
    title: "Distributed ID Generation",
    description:
      "Understand globally unique identifiers, ordering, collision avoidance and distributed ID-generation strategies.",
    goal: "Design identifiers that work correctly across distributed services.",
    primaryPath: "UUID + Snowflake-Style IDs",
    alternatives: ["Database Sequences", "ULID"],
  },

  // ============================================================
  // PHASE 25 — ARCHITECTURAL PATTERNS
  // ============================================================

  {
    id: "architectural-patterns",
    order: 25,
    title: "Architectural Patterns",
    description:
      "Study client-server, layered architecture, event-driven systems, serverless, microservices and modular architectures.",
    goal: "Select architecture patterns based on system constraints rather than fashion.",
    primaryPath: "Layered + Modular + Event-Driven + Service-Oriented Patterns",
    alternatives: ["Serverless", "Microservices", "Monolith"],
  },

  // ============================================================
  // PHASE 26 — SERVERLESS
  // ============================================================

  {
    id: "serverless-architecture",
    order: 26,
    title: "Serverless Architecture",
    description:
      "Understand functions, managed services, event triggers, cold starts, stateless execution and serverless trade-offs.",
    goal: "Know when managed/serverless architecture is appropriate.",
    primaryPath: "Functions + Managed Services + Events",
    alternatives: [],
  },

  // ============================================================
  // PHASE 27 — CLOUD ARCHITECTURE
  // ============================================================

  {
    id: "cloud-system-architecture",
    order: 27,
    title: "Cloud System Architecture",
    description:
      "Combine compute, storage, databases, networking, load balancing, identity, queues and observability in cloud architectures.",
    goal: "Design production-grade cloud systems.",
    primaryPath: "AWS Architecture",
    alternatives: ["GCP Architecture", "Azure Architecture"],
  },

  // ============================================================
  // PHASE 28 — DATA-INTENSIVE SYSTEMS
  // ============================================================

  {
    id: "data-intensive-systems",
    order: 28,
    title: "Data-Intensive Systems",
    description:
      "Understand large-scale data processing, storage, streaming, replication, partitioning and data pipelines.",
    goal: "Design systems where data volume, throughput and processing become dominant constraints.",
    primaryPath: "Distributed Storage + Streaming + Data Pipelines",
    alternatives: ["Batch Processing", "Stream Processing"],
  },

  // ============================================================
  // PHASE 29 — SYSTEM PERFORMANCE
  // ============================================================

  {
    id: "system-performance",
    order: 29,
    title: "System Performance Engineering",
    description:
      "Analyze latency, throughput, bottlenecks, resource utilization and performance trade-offs.",
    goal: "Design systems that meet latency and throughput requirements.",
    primaryPath: "Latency + Throughput + Bottleneck Analysis",
    alternatives: [],
  },

  // ============================================================
  // PHASE 30 — COST & EFFICIENCY
  // ============================================================

  {
    id: "cost-and-efficiency",
    order: 30,
    title: "Cost-Aware Architecture",
    description:
      "Evaluate infrastructure cost, storage cost, compute cost, network cost and architectural trade-offs.",
    goal: "Design systems that meet requirements without unnecessary infrastructure expense.",
    primaryPath: "Cost vs Performance vs Reliability",
    alternatives: [],
  },

  // ============================================================
  // PHASE 31 — SOFTWARE ARCHITECTURE
  // ============================================================

  {
    id: "software-architecture",
    order: 31,
    title: "Software Architecture",
    description:
      "Apply modularity, separation of concerns, domain boundaries, dependency management and architecture decision-making.",
    goal: "Design maintainable software structures before scaling them.",
    primaryPath: "Modularity + Boundaries + Dependency Management",
    alternatives: [
      "Clean Architecture",
      "Hexagonal Architecture",
      "Domain-Driven Design",
    ],
  },

  // ============================================================
  // PHASE 32 — LOW LEVEL DESIGN
  // ============================================================

  {
    id: "low-level-design",
    order: 32,
    title: "Low-Level Design",
    description:
      "Design classes, interfaces, relationships, responsibilities and extensible object-oriented components.",
    goal: "Translate requirements into maintainable implementation-level designs.",
    primaryPath: "OOP + SOLID + Design Patterns",
    alternatives: [],
  },

  // ============================================================
  // PHASE 33 — DESIGN PATTERNS
  // ============================================================

  {
    id: "design-patterns",
    order: 33,
    title: "Design Patterns",
    description:
      "Understand common object-oriented and architectural design patterns and when to apply them.",
    goal: "Improve implementation flexibility without blindly applying patterns.",
    primaryPath: "Creational + Structural + Behavioral Patterns",
    alternatives: [],
  },

  // ============================================================
  // PHASE 34 — DOMAIN-DRIVEN DESIGN
  // ============================================================

  {
    id: "domain-driven-design",
    order: 34,
    title: "Domain-Driven Design",
    description:
      "Understand bounded contexts, aggregates, entities, value objects and domain boundaries.",
    goal: "Model complex business domains and create meaningful service boundaries.",
    primaryPath: "Bounded Contexts + Aggregates + Domain Modeling",
    alternatives: [],
  },

  // ============================================================
  // PHASE 35 — SYSTEM DESIGN CASE STUDIES
  // ============================================================

  {
    id: "system-design-case-studies",
    order: 35,
    title: "System Design Case Studies",
    description:
      "Apply system-design concepts to representative real-world systems.",
    goal: "Develop the ability to turn abstract building blocks into complete architectures.",
    primaryPath:
      "Requirements → Estimation → Architecture → Deep Dive → Trade-offs",
    alternatives: [],
  },

  // ============================================================
  // PHASE 36 — CORE INTERVIEW SYSTEMS
  // ============================================================

  {
    id: "core-system-design-problems",
    order: 36,
    title: "Core System Design Problems",
    description:
      "Practice commonly discussed system-design problems such as URL shorteners, unique ID systems, feeds, messaging and search.",
    goal: "Build reusable system-design patterns rather than memorizing individual solutions.",
    primaryPath: "Pattern Recognition + Trade-off Reasoning",
    alternatives: [],
  },

  // ============================================================
  // PHASE 37 — COMMUNICATION & COLLABORATION
  // ============================================================

  {
    id: "architecture-communication",
    order: 37,
    title: "Architecture Communication",
    description:
      "Learn to communicate requirements, diagrams, assumptions, trade-offs, alternatives and architecture decisions.",
    goal: "Explain technical decisions clearly during design reviews and senior-level interviews.",
    primaryPath: "Assumptions → Diagram → Trade-offs → Decision",
    alternatives: [],
  },

  // ============================================================
  // PHASE 38 — ARCHITECTURE DECISION MAKING
  // ============================================================

  {
    id: "architecture-decision-making",
    order: 38,
    title: "Architecture Decision Making",
    description:
      "Compare architectural alternatives using scalability, reliability, latency, complexity, cost and operational constraints.",
    goal: "Choose solutions based on requirements instead of following generic architecture templates.",
    primaryPath: "Requirements → Constraints → Trade-offs → Decision",
    alternatives: [],
  },

  // ============================================================
  // PHASE 39 — PRODUCTION SYSTEM ARCHITECTURE
  // ============================================================

  {
    id: "production-system-architecture",
    order: 39,
    title: "Production System Architecture",
    description:
      "Combine security, scalability, reliability, observability, deployment, data and cost considerations into complete production architectures.",
    goal: "Design systems that are not only scalable but actually operable in production.",
    primaryPath: "Scalability + Reliability + Security + Observability + Cost",
    alternatives: [],
  },

  // ============================================================
  // PHASE 40 — ADVANCED DISTRIBUTED SYSTEMS
  // ============================================================

  {
    id: "advanced-distributed-systems",
    order: 40,
    title: "Advanced Distributed Systems",
    description:
      "Explore advanced consistency, coordination, consensus, replication, distributed transactions and failure-handling concepts.",
    goal: "Develop deeper distributed-systems reasoning for senior engineering and architecture work.",
    primaryPath: "Replication + Consensus + Coordination + Failure Models",
    alternatives: [],
  },

  // ============================================================
  // PHASE 41 — SENIOR SYSTEM DESIGN
  // ============================================================

  {
    id: "senior-system-design",
    order: 41,
    title: "Senior-Level System Design",
    description:
      "Design complex systems while balancing product requirements, engineering constraints, organizational boundaries and operational realities.",
    goal: "Reach the level required for senior SDE, SDE-2 and staff-oriented system-design discussions.",
    primaryPath:
      "Product Thinking + Architecture + Distributed Systems + Trade-offs",
    alternatives: [],
  },

  // ============================================================
  // PHASE 42 — SOFTWARE ARCHITECTURE MASTERY
  // ============================================================

  {
    id: "software-architecture-mastery",
    order: 42,
    title: "Software Architecture Mastery",
    description:
      "Integrate low-level design, high-level design, distributed systems, cloud architecture, security, reliability and organizational constraints.",
    goal: "Develop the ability to design and evolve complex software systems over time.",
    primaryPath: "HLD + LLD + Distributed Systems + Cloud + Architecture",
    alternatives: [],
  },
];

export default systemDesignSoftwareArchitecturePhases;
export { systemDesignSoftwareArchitecturePhases };

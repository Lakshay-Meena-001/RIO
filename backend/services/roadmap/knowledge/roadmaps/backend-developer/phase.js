/**
 * RIO Backend Developer Roadmap
 *
 * Canonical learning phases for Backend Development.
 *
 * Important:
 * - Static knowledge only.
 * - No LLM is involved.
 * - No user progress/status belongs here.
 * - Phases define the recommended learning progression.
 * - Actual detailed knowledge lives in node.js.
 *
 * Philosophy:
 * - Learn backend fundamentals before frameworks.
 * - Use one primary technology path deeply.
 * - Understand alternative technologies without treating them as mandatory.
 * - Move from simple applications to production systems.
 * - Move to distributed systems only after strong backend fundamentals.
 */

export const backendPhases = [
  /* ------------------------------------------------------------------------ */
  /* Phase 1 - Backend Foundation                                             */
  /* ------------------------------------------------------------------------ */

  {
    id: "backend-foundation",
    order: 1,
    title: "Backend Foundation",

    description:
      "Understand how backend systems work before learning a backend framework.",

    goal: "Build a strong mental model of servers, HTTP, networking basics, processes, requests, responses, APIs, and backend responsibilities.",

    focus: [
      "Client-server architecture",
      "How the web works",
      "HTTP and HTTPS",
      "Requests and responses",
      "HTTP methods",
      "Status codes",
      "Headers",
      "Cookies",
      "Sessions",
      "JSON",
      "DNS basics",
      "Ports",
      "CORS",
      "Environment variables",
      "Backend responsibilities",
      "Git and GitHub",
    ],

    outcome:
      "You can explain what happens when a client sends a request to a backend and how a backend processes and returns a response.",

    recommendedPath: {
      title: "Primary foundation",
      approach:
        "Learn backend concepts independently of any specific framework before moving into implementation.",
    },

    technologyOptions: [
      {
        id: "nodejs",
        title: "Node.js",
        recommended: true,
      },
      {
        id: "python",
        title: "Python",
        recommended: false,
      },
      {
        id: "java",
        title: "Java",
        recommended: false,
      },
      {
        id: "go",
        title: "Go",
        recommended: false,
      },
      {
        id: "dotnet",
        title: ".NET",
        recommended: false,
      },
    ],

    nextPhase: "javascript-backend-runtime",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 2 - JavaScript Backend Runtime                                     */
  /* ------------------------------------------------------------------------ */

  {
    id: "javascript-backend-runtime",
    order: 2,
    title: "JavaScript Backend Runtime",

    description:
      "Understand Node.js and the runtime concepts required to build reliable asynchronous backend applications.",

    goal: "Become comfortable with Node.js internals, asynchronous execution, modules, processes, filesystem operations, streams, and HTTP servers.",

    focus: [
      "Node.js runtime",
      "V8 basics",
      "Event loop",
      "Call stack",
      "Microtasks and macrotasks",
      "Asynchronous I/O",
      "Promises",
      "async/await",
      "ES modules",
      "CommonJS awareness",
      "npm",
      "package.json",
      "Environment variables",
      "Process",
      "Signals",
      "Error handling",
      "File system",
      "Buffers",
      "Streams",
      "Native HTTP server",
      "Graceful shutdown",
    ],

    outcome:
      "You can build and reason about an asynchronous Node.js server without treating Node.js as a black box.",

    recommendedPath: {
      technology: "Node.js",
      reason:
        "Node.js is the primary implementation path for the initial RIO backend roadmap.",
    },

    alternatives: [
      {
        technology: "Python",
        framework: "FastAPI",
        role: "Alternative backend ecosystem",
      },
      {
        technology: "Java",
        framework: "Spring Boot",
        role: "Enterprise backend ecosystem",
      },
      {
        technology: "Go",
        framework: "Standard library / Gin / Echo awareness",
        role: "Cloud-native and high-performance ecosystem",
      },
      {
        technology: ".NET",
        framework: "ASP.NET Core",
        role: "Enterprise and Microsoft ecosystem",
      },
    ],

    nextPhase: "api-engineering",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 3 - API Engineering                                                */
  /* ------------------------------------------------------------------------ */

  {
    id: "api-engineering",
    order: 3,
    title: "API Engineering",

    description:
      "Move from simple backend scripts to structured, maintainable, production-oriented APIs.",

    goal: "Build APIs with proper routing, middleware, validation, controllers, services, error handling, contracts, and predictable behavior.",

    focus: [
      "Express.js",
      "Routing",
      "Middleware",
      "Request lifecycle",
      "Controllers",
      "Services",
      "Repositories",
      "Validation",
      "DTO concepts",
      "Error handling",
      "REST API design",
      "Resource modeling",
      "Path parameters",
      "Query parameters",
      "Request bodies",
      "Headers",
      "Pagination",
      "Filtering",
      "Sorting",
      "Searching",
      "API versioning",
      "Idempotency",
      "Timeouts",
      "Retries",
      "Rate limiting",
      "Request IDs",
      "Correlation IDs",
    ],

    outcome:
      "You can design and implement a clean production-style REST API instead of only creating CRUD endpoints.",

    recommendedPath: {
      technology: "Express.js",
      architecture:
        "Route → Middleware → Controller → Service → Repository → Database",
    },

    technologyOptions: [
      {
        id: "express",
        title: "Express.js",
        recommended: true,
        ecosystem: "Node.js",
      },
      {
        id: "fastapi",
        title: "FastAPI",
        recommended: false,
        ecosystem: "Python",
      },
      {
        id: "spring-boot",
        title: "Spring Boot",
        recommended: false,
        ecosystem: "Java",
      },
      {
        id: "aspnet-core",
        title: "ASP.NET Core",
        recommended: false,
        ecosystem: ".NET",
      },
      {
        id: "go-http",
        title: "Go HTTP ecosystem",
        recommended: false,
        ecosystem: "Go",
      },
    ],

    nextPhase: "database-engineering",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 4 - Database Engineering                                           */
  /* ------------------------------------------------------------------------ */

  {
    id: "database-engineering",
    order: 4,
    title: "Database Engineering",

    description:
      "Learn how backend applications store, retrieve, model, index, and protect data.",

    goal: "Become capable of designing database-backed applications and understanding the trade-offs between major database models.",

    focus: [
      "Database fundamentals",
      "Data modeling",
      "MongoDB",
      "Documents and collections",
      "Schema design",
      "Embedding vs referencing",
      "Indexes",
      "Query optimization",
      "Aggregation",
      "Transactions",
      "Atomic operations",
      "Connection management",
      "Connection pooling concepts",
      "SQL fundamentals",
      "PostgreSQL awareness",
      "Relational modeling",
      "Joins",
      "Constraints",
      "Normalization",
      "Transactions and ACID",
      "NoSQL vs SQL trade-offs",
    ],

    outcome:
      "You can choose an appropriate database model, design data structures, write efficient queries, and reason about consistency and transactions.",

    recommendedPath: {
      primary: "MongoDB",
      secondary: "PostgreSQL awareness",
      reason:
        "Start with MongoDB for the primary Node.js/MERN path while building transferable database fundamentals and SQL knowledge.",
    },

    technologyOptions: [
      {
        id: "mongodb",
        title: "MongoDB",
        recommended: true,
        type: "document-database",
      },
      {
        id: "postgresql",
        title: "PostgreSQL",
        recommended: true,
        type: "relational-database",
        depth: "secondary",
      },
      {
        id: "mysql",
        title: "MySQL",
        recommended: false,
        type: "relational-database",
      },
      {
        id: "dynamodb",
        title: "DynamoDB",
        recommended: false,
        type: "managed-nosql",
      },
      {
        id: "cassandra",
        title: "Cassandra",
        recommended: false,
        type: "distributed-nosql",
      },
    ],

    nextPhase: "authentication-and-security",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 5 - Authentication & Security                                      */
  /* ------------------------------------------------------------------------ */

  {
    id: "authentication-and-security",
    order: 5,
    title: "Authentication & Backend Security",

    description:
      "Build backend systems that correctly identify users, enforce permissions, protect data, and resist common attacks.",

    goal: "Understand authentication, authorization, secure sessions, credential protection, API security, and practical web security.",

    focus: [
      "Authentication",
      "Authorization",
      "Sessions",
      "Cookies",
      "JWT",
      "Access tokens",
      "Refresh tokens",
      "Password hashing",
      "Role-based access control",
      "Permission-based access control",
      "OAuth concepts",
      "CORS",
      "CSRF",
      "XSS awareness",
      "Input validation",
      "Injection prevention",
      "Security headers",
      "HTTPS",
      "TLS awareness",
      "Secrets management",
      "Rate limiting",
      "Brute-force protection",
      "API security",
      "OWASP risks",
      "Secure error handling",
    ],

    outcome:
      "You can implement authentication and authorization correctly and identify the major security risks in a backend application.",

    recommendedPath: {
      approach:
        "Learn security concepts first, then implement secure authentication and authorization inside real APIs.",
      rule: "Frontend authentication checks improve UX but backend authorization remains authoritative.",
    },

    securityStandards: [
      "OWASP Top 10",
      "OWASP ASVS awareness",
      "Secure coding principles",
    ],

    nextPhase: "testing-and-reliability",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 6 - Testing & Reliability                                          */
  /* ------------------------------------------------------------------------ */

  {
    id: "testing-and-reliability",
    order: 6,
    title: "Testing & Backend Reliability",

    description:
      "Learn how to verify backend behavior and make systems safer to change.",

    goal: "Build confidence through automated testing, structured errors, validation, logging, and reliable failure handling.",

    focus: [
      "Unit testing",
      "Integration testing",
      "API testing",
      "End-to-end testing",
      "Test doubles",
      "Mocking",
      "Fixtures",
      "Test isolation",
      "Validation testing",
      "Authentication testing",
      "Authorization testing",
      "Error handling",
      "Structured errors",
      "Logging",
      "Request tracing awareness",
      "Health checks",
      "Graceful shutdown",
      "Failure handling",
      "Retries",
      "Timeouts",
    ],

    outcome:
      "You can test critical backend behavior and confidently modify an application without relying only on manual testing.",

    technologyOptions: [
      {
        id: "jest",
        title: "Jest",
        recommended: true,
      },
      {
        id: "vitest",
        title: "Vitest",
        recommended: true,
        depth: "alternative",
      },
      {
        id: "supertest",
        title: "Supertest",
        recommended: true,
        purpose: "HTTP/API testing",
      },
      {
        id: "playwright",
        title: "Playwright",
        recommended: false,
        purpose: "End-to-end testing",
      },
    ],

    nextPhase: "caching-and-background-processing",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 7 - Caching & Background Processing                                */
  /* ------------------------------------------------------------------------ */

  {
    id: "caching-and-background-processing",
    order: 7,
    title: "Caching, Background Jobs & Asynchronous Systems",

    description:
      "Learn how backend systems reduce database load and move slow work outside the request-response path.",

    goal: "Understand caching, queues, workers, retries, asynchronous processing, and eventual consistency at an application level.",

    focus: [
      "Caching fundamentals",
      "Cache-aside",
      "TTL",
      "Cache invalidation",
      "Cache stampede",
      "Distributed caching",
      "Redis",
      "Redis data structures",
      "Redis Pub/Sub awareness",
      "Background jobs",
      "Workers",
      "Queues",
      "Retries",
      "Dead-letter queues",
      "Acknowledgements",
      "Backpressure",
      "Idempotent workers",
      "Eventual consistency",
    ],

    outcome:
      "You can identify slow or repeated work, decide when to cache or queue it, and build reliable asynchronous processing.",

    recommendedPath: {
      cache: "Redis",
      queue: "One primary queue system first",
      principle:
        "Understand queue and caching concepts before collecting multiple tools.",
    },

    technologyOptions: [
      {
        id: "redis",
        title: "Redis",
        recommended: true,
        purposes: ["Caching", "Sessions", "Rate limiting", "Pub/Sub"],
      },
      {
        id: "rabbitmq",
        title: "RabbitMQ",
        recommended: true,
        depth: "conceptual-to-practical",
      },
      {
        id: "kafka",
        title: "Apache Kafka",
        recommended: false,
        depth: "conceptual initially",
      },
      {
        id: "sqs",
        title: "Amazon SQS",
        recommended: false,
        depth: "cloud alternative",
      },
    ],

    nextPhase: "realtime-and-file-processing",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 8 - Realtime & Files                                               */
  /* ------------------------------------------------------------------------ */

  {
    id: "realtime-and-file-processing",
    order: 8,
    title: "Real-Time Systems & File Processing",

    description:
      "Build backend features that require persistent connections, event delivery, media handling, and asynchronous processing.",

    goal: "Understand WebSockets, real-time communication, file uploads, object storage, workers, and scalable real-time patterns.",

    focus: [
      "WebSockets",
      "Socket.IO",
      "Connection lifecycle",
      "Rooms",
      "Presence",
      "Typing indicators",
      "Notifications",
      "Reconnect handling",
      "Heartbeats",
      "Real-time authentication",
      "Scaling real-time servers",
      "Multipart uploads",
      "File validation",
      "Object storage",
      "S3 concepts",
      "Presigned URLs",
      "Image processing",
      "Video processing awareness",
      "CDN concepts",
      "Background processing",
    ],

    outcome:
      "You can build production-style real-time and file-based backend features while keeping slow work outside the main request path.",

    recommendedPath: {
      realtime: "WebSocket / Socket.IO",
      storage: "Object storage such as Amazon S3",
      principle:
        "Use persistent connections and background workers only where the product actually needs them.",
    },

    nextPhase: "performance-and-production",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 9 - Performance & Production                                       */
  /* ------------------------------------------------------------------------ */

  {
    id: "performance-and-production",
    order: 9,
    title: "Backend Performance & Production Engineering",

    description:
      "Learn how to measure, diagnose, and improve backend performance and reliability.",

    goal: "Move from 'the API works' to 'the API works efficiently, predictably, and reliably under realistic load'.",

    focus: [
      "Performance measurement",
      "Latency",
      "Throughput",
      "CPU vs I/O",
      "Event-loop blocking",
      "Memory usage",
      "Connection pooling",
      "Database query optimization",
      "Indexes",
      "Pagination",
      "Compression",
      "Streaming",
      "Caching",
      "Load testing",
      "Concurrency",
      "Rate limiting",
      "Resource limits",
      "Graceful degradation",
      "Health checks",
      "Readiness",
      "Liveness",
    ],

    outcome:
      "You can identify backend bottlenecks using measurements instead of guessing and improve system behavior under load.",

    recommendedPath: {
      principle:
        "Measure first, identify the bottleneck, optimize, then measure again.",
    },

    nextPhase: "deployment-and-cloud",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 10 - Deployment & Cloud                                            */
  /* ------------------------------------------------------------------------ */

  {
    id: "deployment-and-cloud",
    order: 10,
    title: "Deployment, Containers & Cloud",

    description:
      "Take backend applications from local development to repeatable production deployments.",

    goal: "Understand containers, reverse proxies, deployment environments, cloud infrastructure, networking, and production configuration.",

    focus: [
      "Production configuration",
      "Environment separation",
      "Docker",
      "Dockerfile",
      "Images",
      "Containers",
      "Volumes",
      "Networks",
      "Docker Compose",
      "Multi-stage builds",
      "Container registries",
      "Nginx",
      "Reverse proxy",
      "Load balancing awareness",
      "Cloud fundamentals",
      "Compute",
      "Storage",
      "Networking",
      "IAM",
      "Managed databases",
      "Object storage",
      "Secrets",
      "HTTPS",
      "Domains",
    ],

    outcome:
      "You can containerize a backend application and deploy it into a real production-like cloud environment.",

    recommendedPath: {
      container: "Docker",
      cloud: "AWS",
      principle:
        "Learn one cloud deeply first while understanding transferable cloud concepts.",
    },

    technologyOptions: [
      {
        id: "aws",
        title: "AWS",
        recommended: true,
      },
      {
        id: "gcp",
        title: "Google Cloud",
        recommended: false,
      },
      {
        id: "azure",
        title: "Microsoft Azure",
        recommended: false,
      },
    ],

    nextPhase: "ci-cd-and-observability",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 11 - CI/CD & Observability                                         */
  /* ------------------------------------------------------------------------ */

  {
    id: "ci-cd-and-observability",
    order: 11,
    title: "CI/CD, Observability & Operations",

    description:
      "Automate backend delivery and understand what is happening inside production systems.",

    goal: "Build repeatable deployments and gain visibility into logs, metrics, traces, failures, and system health.",

    focus: [
      "CI",
      "CD",
      "Pipeline stages",
      "Automated tests",
      "Builds",
      "Deployment environments",
      "Secrets in CI/CD",
      "Artifacts",
      "Rollback concepts",
      "Logging",
      "Structured logging",
      "Metrics",
      "Tracing",
      "Distributed tracing awareness",
      "OpenTelemetry",
      "Prometheus awareness",
      "Grafana awareness",
      "Alerts",
      "Health monitoring",
      "Incident awareness",
    ],

    outcome:
      "You can automatically validate and deploy backend applications and investigate production failures using logs, metrics, and traces.",

    recommendedPath: {
      ciCd: "GitHub Actions",
      observability: "OpenTelemetry concepts + Prometheus/Grafana awareness",
      principle:
        "Automation and observability are production engineering fundamentals, not optional decorations.",
    },

    nextPhase: "software-architecture",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 12 - Software Architecture                                         */
  /* ------------------------------------------------------------------------ */

  {
    id: "software-architecture",
    order: 12,
    title: "Backend Software Architecture",

    description:
      "Learn how to structure backend systems so they remain maintainable as features, teams, and traffic grow.",

    goal: "Understand architectural boundaries, modularity, dependency management, and trade-offs before moving into distributed systems.",

    focus: [
      "Separation of concerns",
      "Layered architecture",
      "Modular architecture",
      "Clean architecture awareness",
      "Hexagonal architecture awareness",
      "Dependency inversion",
      "SOLID",
      "Design patterns",
      "Domain boundaries",
      "Service boundaries",
      "Configuration architecture",
      "Dependency management",
      "Modular monolith",
      "Architecture trade-offs",
      "Technical debt",
    ],

    outcome:
      "You can design a maintainable backend architecture instead of allowing the codebase to become an unstructured collection of routes and database queries.",

    recommendedPath: {
      architecture:
        "Start with a well-structured modular monolith before introducing microservices.",
      principle:
        "Architecture should solve a real problem rather than add complexity for its own sake.",
    },

    nextPhase: "distributed-systems-and-microservices",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 13 - Distributed Systems & Microservices                            */
  /* ------------------------------------------------------------------------ */

  {
    id: "distributed-systems-and-microservices",
    order: 13,
    title: "Distributed Systems & Microservices",

    description:
      "Move from a single backend application to systems composed of multiple independently running services.",

    goal: "Understand when and why distributed architecture is needed and how to handle its additional complexity.",

    focus: [
      "Monolith vs modular monolith",
      "Microservices",
      "Service boundaries",
      "API Gateway",
      "Service-to-service communication",
      "REST between services",
      "gRPC awareness",
      "Asynchronous communication",
      "Service discovery",
      "Load balancing",
      "Distributed authentication",
      "Distributed transactions",
      "Saga pattern",
      "Outbox pattern",
      "Eventual consistency",
      "Idempotency",
      "Retries",
      "Timeouts",
      "Circuit breakers",
      "Bulkheads",
      "Failure isolation",
      "Event-driven architecture",
      "Message brokers",
      "Consumer groups",
      "Distributed tracing",
    ],

    outcome:
      "You can reason about distributed backend architecture and understand the trade-offs that appear when a monolith becomes multiple services.",

    recommendedPath: {
      progression: [
        "Monolith",
        "Modular monolith",
        "Understand distributed-system problems",
        "Introduce microservices only when justified",
      ],
    },

    technologyOptions: [
      {
        id: "rest",
        title: "REST",
        recommended: true,
      },
      {
        id: "grpc",
        title: "gRPC",
        recommended: false,
        purpose: "Service-to-service communication where appropriate",
      },
      {
        id: "rabbitmq",
        title: "RabbitMQ",
        recommended: true,
        purpose: "Message-oriented workloads",
      },
      {
        id: "kafka",
        title: "Kafka",
        recommended: false,
        purpose: "High-throughput event streaming",
      },
    ],

    nextPhase: "advanced-backend-systems",
  },

  /* ------------------------------------------------------------------------ */
  /* Phase 14 - Advanced Backend Systems                                      */
  /* ------------------------------------------------------------------------ */

  {
    id: "advanced-backend-systems",
    order: 14,
    title: "Advanced Backend Systems",

    description:
      "Develop senior-level backend reasoning around scalability, resilience, distributed data, and high-load systems.",

    goal: "Become capable of making backend architecture decisions for large-scale and failure-prone systems.",

    focus: [
      "Horizontal scaling",
      "Vertical scaling",
      "Load balancing",
      "Database replication",
      "Read replicas",
      "Sharding concepts",
      "Partitioning",
      "Distributed caching",
      "Consistency models",
      "Strong consistency",
      "Eventual consistency",
      "CAP awareness",
      "Fault tolerance",
      "High availability",
      "Disaster recovery",
      "Backpressure",
      "Rate limiting at scale",
      "Distributed locks",
      "Leader election awareness",
      "Idempotency",
      "Exactly-once vs at-least-once processing",
      "Data durability",
      "Capacity planning",
      "High-load architecture",
      "System design connection",
    ],

    outcome:
      "You can reason about scalability, reliability, consistency, and failure modes in large backend systems and connect those decisions to system design.",

    recommendedPath: {
      principle:
        "Learn advanced distributed concepts through real system problems instead of memorizing architecture patterns.",
    },

    nextPhase: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export default backendPhases;

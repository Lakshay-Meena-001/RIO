/**
 * RIO Backend Developer Roadmap
 *
 * Canonical backend knowledge nodes.
 *
 * Rules:
 * - Static knowledge only.
 * - No user progress.
 * - No LLM.
 * - No generated roadmap data.
 * - Every node is reusable by standard, resume-adaptive,
 *   custom and cross-roadmap generation.
 *
 * Node relationships are defined separately in edge.js.
 */

import { createKnowledgeNode } from "../../factory.js";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const node = (data) => createKnowledgeNode(data);

/* -------------------------------------------------------------------------- */
/* Phase 1 - Backend Foundation                                               */
/* -------------------------------------------------------------------------- */

const foundationNodes = [
  node({
    id: "backend-client-server",
    title: "Client-Server Architecture",
    category: "backend-foundation",
    importance: "critical",
    description:
      "Understand how clients communicate with backend servers and how responsibilities are divided between them.",
    whyItMatters:
      "Almost every backend decision becomes easier once the request-response and client-server mental model is clear.",
    prerequisites: [],
    enables: ["backend-http", "backend-rest-api"],
    alternatives: [],
    related: ["backend-request-lifecycle"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Client responsibilities",
        "Server responsibilities",
        "Request-response model",
        "Stateless vs stateful behavior",
      ],
      avoid: [
        "Framework-specific abstractions before understanding the underlying model.",
      ],
    },
    practice: {
      tasks: [
        "Explain what happens when a browser calls an API.",
        "Draw a client → server → database flow.",
        "Identify which responsibilities belong to frontend and backend.",
      ],
    },
    metadata: {
      phaseId: "backend-foundation",
      transferable: true,
    },
  }),

  node({
    id: "backend-http",
    title: "HTTP & HTTPS",
    category: "backend-foundation",
    importance: "critical",
    description:
      "Learn HTTP requests, responses, methods, status codes, headers, HTTPS and the concepts required to build web APIs.",
    whyItMatters:
      "Backend APIs communicate primarily through HTTP, so framework knowledge without HTTP knowledge creates shallow understanding.",
    prerequisites: ["backend-client-server"],
    enables: ["backend-rest-api", "backend-authentication"],
    alternatives: [],
    related: ["backend-web-security", "backend-reverse-proxy"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "HTTP methods",
        "Status codes",
        "Headers",
        "Request body",
        "Content types",
        "HTTPS",
        "TLS awareness",
      ],
    },
    practice: {
      tasks: [
        "Inspect real HTTP requests in browser DevTools.",
        "Build a tiny HTTP server.",
        "Explain why different HTTP status codes exist.",
      ],
    },
    metadata: {
      phaseId: "backend-foundation",
      transferable: true,
    },
  }),

  node({
    id: "backend-request-lifecycle",
    title: "Backend Request Lifecycle",
    category: "backend-foundation",
    importance: "high",
    description:
      "Understand how a request travels through middleware, application logic, persistence and response handling.",
    whyItMatters:
      "A request lifecycle mental model prevents controllers, middleware and business logic from becoming a confusing block of code.",
    prerequisites: ["backend-http"],
    enables: ["backend-express", "backend-rest-api"],
    alternatives: [],
    related: ["backend-layered-architecture"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Request parsing",
        "Middleware",
        "Routing",
        "Business logic",
        "Persistence",
        "Response generation",
        "Error propagation",
      ],
    },
    practice: {
      tasks: [
        "Trace one request through a backend application.",
        "Draw Route → Middleware → Controller → Service → Repository → Database.",
      ],
    },
    metadata: {
      phaseId: "backend-foundation",
      transferable: true,
    },
  }),

  node({
    id: "backend-git",
    title: "Git & Backend Project Workflow",
    category: "backend-foundation",
    importance: "high",
    description:
      "Use Git effectively for backend development, collaboration and production workflows.",
    whyItMatters:
      "Backend engineering is iterative and collaborative; version control is foundational to reliable development.",
    prerequisites: [],
    enables: ["backend-testing", "backend-cicd"],
    alternatives: [],
    related: ["backend-cicd"],
    guidance: {
      recommendedDepth: "practical",
      focus: [
        "Branches",
        "Commits",
        "Pull requests",
        "Merge conflicts",
        "Environment files",
        "Secrets exclusion",
      ],
    },
    practice: {
      tasks: [
        "Create a backend repository.",
        "Use feature branches.",
        "Add environment files safely.",
      ],
    },
    metadata: {
      phaseId: "backend-foundation",
      transferable: true,
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 2 - JavaScript Backend Runtime                                      */
/* -------------------------------------------------------------------------- */

const runtimeNodes = [
  node({
    id: "nodejs-runtime",
    title: "Node.js Runtime",
    category: "backend-runtime",
    importance: "critical",
    description:
      "Understand Node.js as a JavaScript runtime and how it performs asynchronous server-side work.",
    whyItMatters:
      "Understanding Node.js internals makes asynchronous backend behavior, performance and failures much easier to reason about.",
    prerequisites: ["backend-http"],
    enables: [
      "nodejs-event-loop",
      "nodejs-async-programming",
      "nodejs-http-server",
      "backend-express",
    ],
    alternatives: ["python-runtime", "java-runtime", "go-runtime"],
    related: ["backend-performance"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Runtime model",
        "V8 awareness",
        "Process model",
        "Asynchronous I/O",
        "CPU-bound vs I/O-bound work",
      ],
    },
    practice: {
      tasks: [
        "Build a basic Node.js server.",
        "Explain why Node.js handles I/O-heavy workloads effectively.",
      ],
    },
    metadata: {
      phaseId: "javascript-backend-runtime",
      primaryTechnology: true,
    },
  }),

  node({
    id: "nodejs-event-loop",
    title: "Node.js Event Loop",
    category: "backend-runtime",
    importance: "critical",
    description:
      "Understand the event loop, call stack, microtasks, macrotasks and asynchronous I/O.",
    whyItMatters:
      "Incorrect assumptions about asynchronous execution cause race conditions, latency problems and hard-to-debug backend behavior.",
    prerequisites: ["nodejs-runtime"],
    enables: ["nodejs-async-programming", "backend-performance"],
    alternatives: [],
    related: ["nodejs-worker-threads"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Call stack",
        "Event loop",
        "Microtasks",
        "Timers",
        "I/O callbacks",
        "Blocking work",
      ],
    },
    practice: {
      tasks: [
        "Predict execution order of asynchronous JavaScript.",
        "Identify event-loop blocking code.",
      ],
    },
    metadata: {
      phaseId: "javascript-backend-runtime",
      transferable: true,
    },
  }),

  node({
    id: "nodejs-async-programming",
    title: "Asynchronous Programming",
    category: "backend-runtime",
    importance: "critical",
    description:
      "Master promises, async/await, error propagation and concurrent asynchronous operations.",
    whyItMatters:
      "Production Node.js applications perform database, network and filesystem operations asynchronously.",
    prerequisites: ["nodejs-event-loop"],
    enables: ["backend-express", "backend-queue-processing"],
    alternatives: [],
    related: ["nodejs-event-loop"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Promises",
        "async/await",
        "Promise.all",
        "Sequential vs concurrent work",
        "Async error handling",
      ],
    },
    practice: {
      tasks: [
        "Convert callback code to promises.",
        "Compare sequential and concurrent async operations.",
        "Handle rejected promises correctly.",
      ],
    },
    metadata: {
      phaseId: "javascript-backend-runtime",
      transferable: true,
    },
  }),

  node({
    id: "nodejs-modules-and-packages",
    title: "Node.js Modules & Package Management",
    category: "backend-runtime",
    importance: "high",
    description:
      "Understand ES modules, package.json, npm dependencies, scripts and dependency management.",
    whyItMatters:
      "Real Node.js applications depend on external packages and modular project structure.",
    prerequisites: ["nodejs-runtime"],
    enables: ["backend-express"],
    alternatives: [],
    related: ["backend-layered-architecture"],
    guidance: {
      recommendedDepth: "practical",
      focus: [
        "ES modules",
        "package.json",
        "npm",
        "Dependency versions",
        "Scripts",
        "Development vs production dependencies",
      ],
    },
    practice: {
      tasks: [
        "Create a modular Node.js project.",
        "Add and remove dependencies.",
        "Create useful npm scripts.",
      ],
    },
    metadata: {
      phaseId: "javascript-backend-runtime",
      transferable: true,
    },
  }),

  node({
    id: "nodejs-streams-and-buffers",
    title: "Streams & Buffers",
    category: "backend-runtime",
    importance: "medium",
    description:
      "Understand streams and buffers for efficient handling of large or continuous data.",
    whyItMatters:
      "Streams become important for file processing, uploads, downloads and high-throughput systems.",
    prerequisites: ["nodejs-runtime"],
    enables: ["backend-file-processing", "backend-performance"],
    alternatives: [],
    related: ["backend-object-storage"],
    guidance: {
      recommendedDepth: "conceptual-to-practical",
    },
    practice: {
      tasks: [
        "Read a large file using streams.",
        "Explain why loading an entire large file into memory can be problematic.",
      ],
    },
    metadata: {
      phaseId: "javascript-backend-runtime",
    },
  }),

  node({
    id: "nodejs-process-and-graceful-shutdown",
    title: "Processes, Signals & Graceful Shutdown",
    category: "backend-runtime",
    importance: "high",
    description:
      "Understand Node.js processes, environment configuration, OS signals and graceful shutdown.",
    whyItMatters:
      "Production systems must release connections and finish or safely terminate work when instances stop.",
    prerequisites: ["nodejs-runtime"],
    enables: ["backend-production", "backend-containerization"],
    alternatives: [],
    related: ["backend-health-checks"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Handle SIGTERM.",
        "Close server and database connections gracefully.",
        "Separate development and production configuration.",
      ],
    },
    metadata: {
      phaseId: "javascript-backend-runtime",
    },
  }),

  node({
    id: "nodejs-worker-threads",
    title: "Worker Threads & CPU-Bound Work",
    category: "backend-runtime",
    importance: "medium",
    description:
      "Understand when CPU-heavy work should be moved away from the main Node.js execution path.",
    whyItMatters:
      "CPU-heavy work can block the event loop and increase latency for unrelated requests.",
    prerequisites: ["nodejs-event-loop"],
    enables: ["backend-performance"],
    alternatives: [],
    related: ["backend-background-jobs"],
    guidance: {
      recommendedDepth: "conceptual",
      avoid: ["Prematurely using workers for ordinary I/O operations."],
    },
    practice: {
      tasks: [
        "Identify CPU-bound operations.",
        "Compare blocking work with worker-based execution.",
      ],
    },
    metadata: {
      phaseId: "javascript-backend-runtime",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 3 - API Engineering                                                  */
/* -------------------------------------------------------------------------- */

const apiNodes = [
  node({
    id: "backend-express",
    title: "Express.js",
    category: "api-engineering",
    importance: "critical",
    description:
      "Use Express.js to build structured HTTP APIs with routing, middleware and application-level request handling.",
    whyItMatters:
      "Express provides the primary practical backend implementation path for the initial Node.js ecosystem.",
    prerequisites: [
      "nodejs-runtime",
      "nodejs-async-programming",
      "backend-request-lifecycle",
    ],
    enables: [
      "backend-routing",
      "backend-middleware",
      "backend-layered-architecture",
    ],
    alternatives: ["fastapi", "spring-boot", "aspnet-core", "go-http"],
    related: ["backend-rest-api"],
    guidance: {
      recommendedDepth: "strong",
      recommendedFor: "primary-node-backend-path",
    },
    practice: {
      tasks: [
        "Build a REST API with Express.",
        "Separate routes, controllers and services.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
      primaryTechnology: true,
    },
  }),

  node({
    id: "backend-routing",
    title: "Routing",
    category: "api-engineering",
    importance: "critical",
    description:
      "Design and implement predictable API routes and resource-oriented endpoints.",
    whyItMatters:
      "Good routing creates clear API contracts and makes backend systems easier to consume and maintain.",
    prerequisites: ["backend-express"],
    enables: ["backend-rest-api", "backend-api-versioning"],
    alternatives: [],
    related: ["backend-rest-api"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Design CRUD resource routes.",
        "Use path and query parameters appropriately.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-middleware",
    title: "Middleware & Request Pipeline",
    category: "api-engineering",
    importance: "critical",
    description:
      "Use middleware for cross-cutting request processing such as authentication, validation, logging and error handling.",
    whyItMatters:
      "Middleware allows common behavior to be composed without duplicating logic across controllers.",
    prerequisites: ["backend-express", "backend-request-lifecycle"],
    enables: [
      "backend-authentication",
      "backend-validation",
      "backend-logging",
    ],
    alternatives: [],
    related: ["backend-error-handling"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Create authentication middleware.",
        "Create validation middleware.",
        "Create centralized error middleware.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-layered-architecture",
    title: "Controller-Service-Repository Architecture",
    category: "api-engineering",
    importance: "critical",
    description:
      "Separate transport logic, business logic and persistence responsibilities into clear layers.",
    whyItMatters:
      "Separation of responsibilities makes backend applications easier to test, extend and reason about.",
    prerequisites: ["backend-middleware", "backend-routing"],
    enables: ["backend-software-architecture", "backend-testing"],
    alternatives: [],
    related: ["backend-modular-monolith"],
    guidance: {
      recommendedDepth: "strong",
      architecture:
        "Route → Middleware → Controller → Service → Repository → Database",
    },
    practice: {
      tasks: [
        "Refactor a CRUD API into layers.",
        "Keep database operations out of controllers.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-rest-api",
    title: "REST API Design",
    category: "api-engineering",
    importance: "critical",
    description:
      "Design predictable REST APIs using resources, HTTP methods, status codes and consistent response contracts.",
    whyItMatters:
      "API design affects every frontend, mobile, service and integration that consumes the backend.",
    prerequisites: ["backend-http", "backend-routing"],
    enables: [
      "backend-pagination-filtering-sorting",
      "backend-api-versioning",
      "backend-idempotency",
    ],
    alternatives: ["graphql", "grpc"],
    related: ["backend-api-contracts"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Resource naming",
        "HTTP semantics",
        "Status codes",
        "Response structure",
        "Error contracts",
      ],
    },
    practice: {
      tasks: [
        "Design APIs for users, products and orders.",
        "Review APIs for consistency.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-validation",
    title: "Request Validation",
    category: "api-engineering",
    importance: "critical",
    description:
      "Validate and normalize untrusted client input before it reaches business logic or persistence.",
    whyItMatters:
      "Backend systems must never assume that client input is valid or trustworthy.",
    prerequisites: ["backend-middleware"],
    enables: ["backend-web-security", "backend-testing"],
    alternatives: [],
    related: ["backend-validation"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Validate request body, query and path parameters.",
        "Reject malformed and unexpected input.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-error-handling",
    title: "Centralized Error Handling",
    category: "api-engineering",
    importance: "critical",
    description:
      "Design consistent application errors, HTTP responses, logging and safe production error messages.",
    whyItMatters:
      "Poor error handling creates inconsistent APIs, leaked information and difficult debugging.",
    prerequisites: ["backend-middleware"],
    enables: ["backend-testing", "backend-observability"],
    alternatives: [],
    related: ["backend-logging"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Create a centralized error middleware.",
        "Separate operational errors from programming errors.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-pagination-filtering-sorting",
    title: "Pagination, Filtering & Sorting",
    category: "api-engineering",
    importance: "high",
    description:
      "Design APIs that efficiently retrieve subsets of large datasets.",
    whyItMatters:
      "Returning entire collections does not scale and creates unnecessary database and network load.",
    prerequisites: ["backend-rest-api", "database-query-optimization"],
    enables: ["backend-performance", "database-query-optimization"],
    alternatives: [],
    related: ["backend-search"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Offset pagination",
        "Cursor pagination",
        "Filtering",
        "Sorting",
        "Limits",
      ],
    },
    practice: {
      tasks: ["Implement pagination.", "Compare offset and cursor pagination."],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-api-versioning",
    title: "API Versioning",
    category: "api-engineering",
    importance: "medium",
    description:
      "Manage API evolution without unnecessarily breaking existing consumers.",
    whyItMatters:
      "Production APIs often have clients that cannot all migrate simultaneously.",
    prerequisites: ["backend-rest-api"],
    enables: ["backend-production"],
    alternatives: [],
    related: ["backend-api-contracts"],
    guidance: {
      recommendedDepth: "conceptual-to-practical",
    },
    practice: {
      tasks: [
        "Design a versioning strategy for a public API.",
        "Explain when a breaking change requires a new version.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-idempotency",
    title: "Idempotency & Safe Retries",
    category: "api-engineering",
    importance: "high",
    description:
      "Design APIs so retrying requests does not accidentally duplicate critical operations.",
    whyItMatters:
      "Networks fail and clients retry; payment, order and mutation APIs must tolerate duplicate delivery safely.",
    prerequisites: ["backend-rest-api"],
    enables: ["backend-reliable-messaging", "backend-distributed-systems"],
    alternatives: [],
    related: ["backend-retries", "backend-event-driven"],
    guidance: {
      recommendedDepth: "strong",
      examples: ["Payments", "Orders", "Job creation"],
    },
    practice: {
      tasks: [
        "Design an idempotency-key flow.",
        "Explain how duplicate requests are detected.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),

  node({
    id: "backend-api-contracts",
    title: "API Contracts & Documentation",
    category: "api-engineering",
    importance: "high",
    description:
      "Define predictable API contracts and communicate them clearly to consumers.",
    whyItMatters:
      "Strong contracts reduce frontend/backend integration failures and make APIs easier to evolve.",
    prerequisites: ["backend-rest-api"],
    enables: ["backend-testing", "backend-api-versioning"],
    alternatives: [],
    related: ["backend-schema-validation"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Document API endpoints.",
        "Define request and response examples.",
        "Document error cases.",
      ],
    },
    metadata: {
      phaseId: "api-engineering",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 4 - Database Engineering                                             */
/* -------------------------------------------------------------------------- */

const databaseNodes = [
  node({
    id: "database-fundamentals",
    title: "Database Fundamentals",
    category: "database",
    importance: "critical",
    description:
      "Understand how databases store, retrieve, update and protect application data.",
    whyItMatters:
      "Backend correctness and performance depend heavily on sound data modeling and database decisions.",
    prerequisites: ["backend-rest-api"],
    enables: ["mongodb", "postgresql", "database-indexing"],
    alternatives: [],
    related: ["database-transactions"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Model data for a simple application.",
        "Explain persistence, queries and indexes.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
      transferable: true,
    },
  }),

  node({
    id: "mongodb",
    title: "MongoDB",
    category: "database",
    importance: "critical",
    description:
      "Learn MongoDB as the primary database implementation for the initial MERN-oriented backend path.",
    whyItMatters:
      "MongoDB integrates naturally with the initial Node.js/MERN path while teaching important NoSQL modeling concepts.",
    prerequisites: ["database-fundamentals"],
    enables: [
      "mongodb-data-modeling",
      "database-indexing",
      "database-transactions",
    ],
    alternatives: ["postgresql", "mysql"],
    related: ["mongoose"],
    guidance: {
      recommendedDepth: "strong",
      recommendedFor: "primary-mern-path",
    },
    practice: {
      tasks: [
        "Design collections for users and products.",
        "Implement CRUD operations.",
        "Use indexes.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
      primaryTechnology: true,
    },
  }),

  node({
    id: "mongodb-data-modeling",
    title: "MongoDB Data Modeling",
    category: "database",
    importance: "critical",
    description:
      "Design MongoDB schemas using embedding, referencing and access-pattern-driven modeling.",
    whyItMatters:
      "NoSQL databases require deliberate modeling around application access patterns.",
    prerequisites: ["mongodb"],
    enables: ["database-query-optimization", "backend-performance"],
    alternatives: [],
    related: ["database-indexing"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Embedding",
        "Referencing",
        "Access patterns",
        "Document size",
        "Atomic updates",
      ],
    },
    practice: {
      tasks: [
        "Model an e-commerce order system.",
        "Choose embedding vs referencing for multiple relationships.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
    },
  }),

  node({
    id: "mongoose",
    title: "Mongoose",
    category: "database",
    importance: "high",
    description:
      "Use Mongoose for MongoDB schemas, validation, models and database interaction in Node.js applications.",
    whyItMatters:
      "Mongoose provides practical schema and modeling capabilities for the primary Node.js/MongoDB path.",
    prerequisites: ["mongodb", "backend-validation"],
    enables: ["backend-layered-architecture", "database-transactions"],
    alternatives: [],
    related: ["mongodb-data-modeling"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Create schemas and models.",
        "Implement validation.",
        "Separate model logic from services.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
    },
  }),

  node({
    id: "postgresql",
    title: "PostgreSQL",
    category: "database",
    importance: "high",
    description:
      "Learn relational database fundamentals and PostgreSQL as the primary transferable SQL ecosystem.",
    whyItMatters:
      "SQL and relational databases are fundamental across backend, data and enterprise engineering.",
    prerequisites: ["database-fundamentals"],
    enables: ["database-sql", "database-transactions", "database-indexing"],
    alternatives: ["mysql"],
    related: ["database-acid"],
    guidance: {
      recommendedDepth: "strong-secondary",
      recommendation:
        "Learn after establishing the primary MongoDB path, unless the user's target requires SQL-first development.",
    },
    practice: {
      tasks: [
        "Design relational tables.",
        "Write SELECT, JOIN, INSERT and UPDATE queries.",
        "Model relationships.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
      transferable: true,
    },
  }),

  node({
    id: "database-sql",
    title: "SQL Fundamentals",
    category: "database",
    importance: "critical",
    description:
      "Learn SQL queries, joins, aggregation, constraints and data manipulation.",
    whyItMatters:
      "SQL is a foundational backend and data engineering skill even when the primary stack uses NoSQL.",
    prerequisites: ["postgresql"],
    enables: ["database-query-optimization", "database-transactions"],
    alternatives: [],
    related: ["database-relational-modeling"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Write joins.",
        "Use grouping and aggregation.",
        "Solve realistic data retrieval problems.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
      transferable: true,
    },
  }),

  node({
    id: "database-relational-modeling",
    title: "Relational Data Modeling",
    category: "database",
    importance: "high",
    description:
      "Understand tables, relationships, keys, constraints and normalization.",
    whyItMatters:
      "Relational modeling teaches durable data design principles that transfer across SQL databases.",
    prerequisites: ["database-sql"],
    enables: ["database-transactions", "database-indexing"],
    alternatives: [],
    related: ["database-normalization"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Design normalized schemas.",
        "Model one-to-one, one-to-many and many-to-many relationships.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
    },
  }),

  node({
    id: "database-indexing",
    title: "Database Indexing",
    category: "database",
    importance: "critical",
    description:
      "Understand indexes and how they affect query performance and storage.",
    whyItMatters:
      "Poor indexing is one of the most common causes of slow backend APIs.",
    prerequisites: ["mongodb-data-modeling", "database-sql"],
    enables: ["database-query-optimization", "backend-performance"],
    alternatives: [],
    related: ["database-query-plans"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Add indexes for realistic access patterns.",
        "Compare indexed and non-indexed queries.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
    },
  }),

  node({
    id: "database-query-optimization",
    title: "Query Optimization",
    category: "database",
    importance: "high",
    description:
      "Diagnose slow database queries and improve them using indexes, query structure and access patterns.",
    whyItMatters:
      "Backend performance often depends more on database access than application code.",
    prerequisites: ["database-indexing"],
    enables: ["backend-performance", "backend-scaling"],
    alternatives: [],
    related: ["database-query-plans"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Inspect slow queries.",
        "Use query plans.",
        "Optimize an API backed by a large dataset.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
    },
  }),

  node({
    id: "database-transactions",
    title: "Transactions & ACID",
    category: "database",
    importance: "critical",
    description:
      "Understand atomicity, consistency, isolation, durability and transactional workflows.",
    whyItMatters:
      "Critical business operations often require multiple changes to succeed or fail together.",
    prerequisites: ["database-relational-modeling", "mongodb"],
    enables: ["backend-business-logic", "backend-distributed-transactions"],
    alternatives: [],
    related: ["database-consistency"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Model a transaction involving multiple writes.",
        "Explain why partial updates can corrupt business state.",
      ],
    },
    metadata: {
      phaseId: "database-engineering",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 5 - Authentication & Security                                       */
/* -------------------------------------------------------------------------- */

const securityNodes = [
  node({
    id: "backend-authentication",
    title: "Authentication",
    category: "security",
    importance: "critical",
    description:
      "Learn how backend systems establish and maintain a user's identity.",
    whyItMatters:
      "Identity is foundational to private data, personalized behavior and access control.",
    prerequisites: ["backend-http", "backend-middleware"],
    enables: [
      "backend-authorization",
      "backend-session-management",
      "backend-token-authentication",
    ],
    alternatives: [],
    related: ["oauth", "backend-password-security"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Implement registration and login.",
        "Handle authenticated requests.",
        "Implement logout correctly.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "backend-authorization",
    title: "Authorization",
    category: "security",
    importance: "critical",
    description:
      "Control what authenticated users are allowed to access or modify.",
    whyItMatters:
      "Authentication alone does not prevent unauthorized actions or privilege escalation.",
    prerequisites: ["backend-authentication"],
    enables: ["backend-rbac", "backend-api-security"],
    alternatives: [],
    related: ["backend-authorization"],
    guidance: {
      recommendedDepth: "strong",
      securityRule:
        "Authorization must be enforced on the backend, not trusted from frontend state.",
    },
    practice: {
      tasks: [
        "Implement role-based access control.",
        "Prevent users from accessing another user's resources.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "backend-password-security",
    title: "Password Hashing & Credential Security",
    category: "security",
    importance: "critical",
    description:
      "Protect passwords and credentials using secure hashing and safe credential-handling practices.",
    whyItMatters:
      "Passwords must never be stored as plaintext or recoverable secrets.",
    prerequisites: ["backend-authentication"],
    enables: ["backend-secure-authentication"],
    alternatives: [],
    related: ["backend-secrets-management"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Hash passwords before storage.",
        "Verify password hashes safely.",
        "Design password reset flows.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "backend-session-management",
    title: "Sessions & Cookies",
    category: "security",
    importance: "high",
    description:
      "Understand server-side sessions, cookies and secure session management.",
    whyItMatters:
      "Session design affects authentication security, logout behavior and multi-device access.",
    prerequisites: ["backend-authentication", "backend-http"],
    enables: ["backend-cookie-security", "backend-web-security"],
    alternatives: ["backend-token-authentication"],
    related: ["backend-session-security"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Implement secure session cookies.",
        "Explain session expiration and revocation.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "backend-token-authentication",
    title: "JWT & Token-Based Authentication",
    category: "security",
    importance: "high",
    description:
      "Understand access tokens, refresh tokens and token-based authentication trade-offs.",
    whyItMatters:
      "Token-based authentication is common in APIs and distributed applications, but requires careful lifecycle design.",
    prerequisites: ["backend-authentication"],
    enables: ["backend-refresh-tokens", "backend-service-auth"],
    alternatives: ["backend-session-management"],
    related: ["oauth"],
    guidance: {
      recommendedDepth: "strong",
      warning:
        "JWT is a mechanism, not a complete authentication architecture.",
    },
    practice: {
      tasks: [
        "Implement access and refresh token concepts.",
        "Design token expiration and revocation strategy.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "oauth",
    title: "OAuth & External Identity",
    category: "security",
    importance: "medium",
    description:
      "Understand OAuth and external identity providers for delegated authentication and authorization.",
    whyItMatters:
      "Modern applications frequently integrate Google, GitHub, enterprise identity and other providers.",
    prerequisites: ["backend-authentication", "backend-http"],
    enables: ["backend-identity-integration"],
    alternatives: [],
    related: ["backend-token-authentication"],
    guidance: {
      recommendedDepth: "conceptual-to-practical",
    },
    practice: {
      tasks: [
        "Explain authorization-code flow.",
        "Understand the role of redirect URIs and tokens.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "backend-web-security",
    title: "Web Application Security",
    category: "security",
    importance: "critical",
    description:
      "Protect backend applications against common web and API security vulnerabilities.",
    whyItMatters:
      "Security must be designed into application behavior rather than added after features are complete.",
    prerequisites: ["backend-validation", "backend-authentication"],
    enables: ["backend-secure-architecture", "backend-devsecops"],
    alternatives: [],
    related: [
      "backend-validation",
      "backend-api-security",
      "backend-cors",
      "backend-web-security",
    ],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Broken access control",
        "Injection",
        "XSS awareness",
        "CSRF",
        "SSRF awareness",
        "Security headers",
        "Rate limiting",
        "Secrets",
      ],
    },
    practice: {
      tasks: [
        "Threat-model an API endpoint.",
        "Test authorization boundaries.",
        "Validate untrusted input.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "backend-api-security",
    title: "API Security",
    category: "security",
    importance: "critical",
    description:
      "Secure APIs through authentication, authorization, validation, rate limiting and safe error handling.",
    whyItMatters:
      "APIs expose business capabilities directly and are common targets for abuse.",
    prerequisites: [
      "backend-authorization",
      "backend-validation",
      "backend-web-security",
    ],
    enables: ["backend-production-security"],
    alternatives: [],
    related: ["backend-rate-limiting"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Secure a CRUD API.",
        "Test unauthorized and over-privileged requests.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "backend-rate-limiting",
    title: "Rate Limiting & Abuse Protection",
    category: "security",
    importance: "high",
    description:
      "Limit abusive or excessive requests and protect expensive backend operations.",
    whyItMatters:
      "Rate limiting protects authentication, APIs and infrastructure from abuse and accidental overload.",
    prerequisites: ["backend-api-security", "redis"],
    enables: ["backend-production-security", "backend-scaling"],
    alternatives: [],
    related: ["backend-caching"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Implement endpoint-specific rate limits.",
        "Design stricter limits for login and sensitive operations.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),

  node({
    id: "backend-secrets-management",
    title: "Secrets Management",
    category: "security",
    importance: "critical",
    description:
      "Protect API keys, credentials, tokens and other sensitive configuration.",
    whyItMatters:
      "Leaked secrets can compromise entire environments and external systems.",
    prerequisites: ["backend-git", "backend-web-security"],
    enables: ["backend-cloud-security", "backend-cicd"],
    alternatives: [],
    related: ["backend-environment-config"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Keep secrets out of Git.",
        "Use environment configuration safely.",
        "Understand production secret managers.",
      ],
    },
    metadata: {
      phaseId: "authentication-and-security",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 6 - Testing & Reliability                                            */
/* -------------------------------------------------------------------------- */

const testingNodes = [
  node({
    id: "backend-testing",
    title: "Backend Testing Fundamentals",
    category: "testing",
    importance: "critical",
    description:
      "Understand why and how backend behavior is tested at different levels.",
    whyItMatters:
      "Testing gives confidence that business-critical backend behavior continues to work as the system evolves.",
    prerequisites: ["backend-layered-architecture"],
    enables: [
      "backend-unit-testing",
      "backend-integration-testing",
      "backend-api-testing",
    ],
    alternatives: [],
    related: ["backend-reliability"],
    guidance: {
      recommendedDepth: "strong",
      focus: ["Unit", "Integration", "API", "End-to-end"],
    },
    practice: {
      tasks: [
        "Create a test strategy for a backend service.",
        "Identify what belongs in unit vs integration tests.",
      ],
    },
    metadata: {
      phaseId: "testing-and-reliability",
    },
  }),

  node({
    id: "backend-unit-testing",
    title: "Unit Testing",
    category: "testing",
    importance: "high",
    description:
      "Test isolated business logic and pure components independently.",
    whyItMatters:
      "Unit tests provide fast feedback for business rules and utility logic.",
    prerequisites: ["backend-testing"],
    enables: ["backend-integration-testing"],
    alternatives: [],
    related: ["backend-mocking"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Test service-level business rules.",
        "Test edge cases and invalid inputs.",
      ],
    },
    metadata: {
      phaseId: "testing-and-reliability",
    },
  }),

  node({
    id: "backend-integration-testing",
    title: "Integration Testing",
    category: "testing",
    importance: "high",
    description:
      "Test interactions between application layers, databases and external components.",
    whyItMatters:
      "Many backend failures happen at boundaries rather than inside isolated functions.",
    prerequisites: ["backend-unit-testing", "database-fundamentals"],
    enables: ["backend-api-testing"],
    alternatives: [],
    related: ["backend-e2e-testing"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Test services against a test database.",
        "Verify repository and service integration.",
      ],
    },
    metadata: {
      phaseId: "testing-and-reliability",
    },
  }),

  node({
    id: "backend-api-testing",
    title: "API Testing",
    category: "testing",
    importance: "critical",
    description:
      "Test HTTP endpoints, authentication, validation, authorization and response contracts.",
    whyItMatters:
      "API tests verify the behavior consumers actually depend upon.",
    prerequisites: ["backend-integration-testing", "backend-rest-api"],
    enables: ["backend-e2e-testing", "backend-cicd"],
    alternatives: [],
    related: ["backend-api-contracts"],
    guidance: {
      recommendedDepth: "strong",
      primaryTool: "Supertest",
    },
    practice: {
      tasks: [
        "Test successful and failed API requests.",
        "Test authorization boundaries.",
        "Test validation errors.",
      ],
    },
    metadata: {
      phaseId: "testing-and-reliability",
    },
  }),

  node({
    id: "backend-e2e-testing",
    title: "End-to-End Testing",
    category: "testing",
    importance: "medium",
    description:
      "Verify complete application workflows across multiple components.",
    whyItMatters:
      "End-to-end tests catch integration failures that isolated tests can miss.",
    prerequisites: ["backend-api-testing"],
    enables: ["backend-cicd"],
    alternatives: [],
    related: ["backend-integration-testing"],
    guidance: {
      recommendedDepth: "practical",
      toolOptions: ["Playwright"],
    },
    practice: {
      tasks: [
        "Test registration → login → authenticated operation.",
        "Test a complete critical business workflow.",
      ],
    },
    metadata: {
      phaseId: "testing-and-reliability",
    },
  }),

  node({
    id: "backend-reliability",
    title: "Backend Reliability Principles",
    category: "reliability",
    importance: "high",
    description:
      "Design backend services to behave predictably during failures, retries and partial outages.",
    whyItMatters:
      "Production systems fail; reliability engineering determines how safely they fail.",
    prerequisites: ["backend-error-handling", "backend-testing"],
    enables: ["backend-retries", "backend-timeouts", "backend-resilience"],
    alternatives: [],
    related: ["backend-observability"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "List failure modes for a critical API.",
        "Define expected behavior for each failure.",
      ],
    },
    metadata: {
      phaseId: "testing-and-reliability",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 7 - Caching & Background Processing                                  */
/* -------------------------------------------------------------------------- */

const asyncSystemNodes = [
  node({
    id: "redis",
    title: "Redis",
    category: "caching-and-async",
    importance: "critical",
    description:
      "Use Redis for caching, temporary state, rate limiting, Pub/Sub and other high-speed backend workloads.",
    whyItMatters:
      "Redis is a practical foundation for reducing database load and supporting distributed backend features.",
    prerequisites: ["database-fundamentals", "backend-performance"],
    enables: [
      "backend-caching",
      "backend-rate-limiting",
      "backend-pubsub",
      "backend-realtime-scaling",
    ],
    alternatives: [],
    related: ["backend-session-management", "backend-queue-processing"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Strings",
        "Hashes",
        "Lists",
        "Sets",
        "Sorted sets",
        "TTL",
        "Pub/Sub",
      ],
    },
    practice: {
      tasks: [
        "Add Redis caching to an API.",
        "Implement TTL-based caching.",
        "Use Redis for rate limiting.",
      ],
    },
    metadata: {
      phaseId: "caching-and-background-processing",
      primaryTechnology: true,
    },
  }),

  node({
    id: "backend-caching",
    title: "Caching Strategy",
    category: "caching-and-async",
    importance: "critical",
    description:
      "Understand when and how to cache data and how to deal with stale or invalid cache entries.",
    whyItMatters:
      "Caching improves latency and reduces database load but introduces consistency and invalidation problems.",
    prerequisites: ["redis", "database-query-optimization"],
    enables: ["backend-distributed-caching", "backend-scaling"],
    alternatives: [],
    related: ["backend-caching"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Cache-aside",
        "TTL",
        "Invalidation",
        "Cache stampede",
        "Stale data",
      ],
    },
    practice: {
      tasks: [
        "Implement cache-aside.",
        "Design invalidation for updated resources.",
      ],
    },
    metadata: {
      phaseId: "caching-and-background-processing",
    },
  }),

  node({
    id: "backend-background-jobs",
    title: "Background Jobs",
    category: "caching-and-async",
    importance: "high",
    description:
      "Move slow or non-critical work out of the synchronous request path.",
    whyItMatters:
      "Email, image processing, reports and other slow tasks should not unnecessarily keep API requests waiting.",
    prerequisites: ["nodejs-async-programming", "backend-reliability"],
    enables: ["backend-queue-processing", "backend-file-processing"],
    alternatives: [],
    related: ["nodejs-worker-threads"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Move email sending to a background job.",
        "Design a report-generation workflow.",
      ],
    },
    metadata: {
      phaseId: "caching-and-background-processing",
    },
  }),

  node({
    id: "backend-queue-processing",
    title: "Message Queues",
    category: "caching-and-async",
    importance: "high",
    description:
      "Understand producers, consumers, acknowledgements, retries and asynchronous message processing.",
    whyItMatters:
      "Queues decouple work and help systems handle spikes and slow consumers.",
    prerequisites: ["backend-background-jobs"],
    enables: [
      "backend-event-driven",
      "backend-microservices",
      "backend-reliable-messaging",
    ],
    alternatives: ["rabbitmq", "kafka", "sqs"],
    related: [" backend-reliable-messaging"],
    guidance: {
      recommendedDepth: "strong",
      primaryApproach:
        "Learn one queue system practically and understand alternatives conceptually.",
    },
    practice: {
      tasks: [
        "Build a producer-consumer workflow.",
        "Implement retries.",
        "Handle failed messages.",
      ],
    },
    metadata: {
      phaseId: "caching-and-background-processing",
    },
  }),

  node({
    id: "rabbitmq",
    title: "RabbitMQ",
    category: "messaging",
    importance: "high",
    description:
      "Learn RabbitMQ as a practical message broker for asynchronous application workloads.",
    whyItMatters:
      "RabbitMQ provides a practical way to learn message-oriented architecture without starting with a large distributed streaming platform.",
    prerequisites: ["backend-queue-processing"],
    enables: ["backend-event-driven", "backend-microservices"],
    alternatives: ["kafka", "sqs"],
    related: [" backend-reliable-messaging"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Publish and consume messages.",
        "Implement retry and dead-letter behavior.",
      ],
    },
    metadata: {
      phaseId: "caching-and-background-processing",
    },
  }),

  node({
    id: "kafka",
    title: "Apache Kafka",
    category: "messaging",
    importance: "medium",
    description:
      "Understand Kafka as a distributed event-streaming platform for high-throughput event-driven systems.",
    whyItMatters:
      "Kafka becomes important for event streams, analytics pipelines and large-scale asynchronous architectures.",
    prerequisites: ["backend-queue-processing", "backend-event-driven"],
    enables: ["backend-event-streaming", "backend-distributed-systems"],
    alternatives: ["rabbitmq"],
    related: ["data-engineering"],
    guidance: {
      recommendedDepth: "conceptual-first",
      recommendation:
        "Do not learn Kafka deeply before understanding queues and events.",
    },
    practice: {
      tasks: [
        "Understand topics and partitions.",
        "Understand producers and consumers.",
        "Understand consumer groups and offsets.",
      ],
    },
    metadata: {
      phaseId: "caching-and-background-processing",
    },
  }),

  node({
    id: "backend-reliable-messaging",
    title: "Reliable Message Processing",
    category: "messaging",
    importance: "high",
    description:
      "Design asynchronous processing that handles retries, duplicate delivery and failed consumers safely.",
    whyItMatters:
      "Distributed messaging rarely gives a perfect single-delivery guarantee, so consumers must be designed for failure.",
    prerequisites: ["backend-queue-processing", "backend-idempotency"],
    enables: ["backend-event-driven", "backend-distributed-systems"],
    alternatives: [],
    related: [" backend-reliable-messaging"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "At-least-once delivery",
        "Idempotency",
        "Retries",
        "Dead-letter queues",
        "Acknowledgements",
      ],
    },
    practice: {
      tasks: ["Make a consumer idempotent.", "Design failed-message recovery."],
    },
    metadata: {
      phaseId: "caching-and-background-processing",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 8 - Realtime & File Processing                                       */
/* -------------------------------------------------------------------------- */

const realtimeFileNodes = [
  node({
    id: "backend-websockets",
    title: "WebSockets",
    category: "realtime",
    importance: "high",
    description:
      "Understand persistent bidirectional connections for real-time backend communication.",
    whyItMatters:
      "Some applications need server-driven updates instead of repeatedly polling HTTP endpoints.",
    prerequisites: ["backend-http", "backend-authentication"],
    enables: ["backend-realtime-applications", "backend-realtime-scaling"],
    alternatives: ["socket-io"],
    related: ["backend-pubsub"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Build a real-time connection.",
        "Handle reconnects and connection lifecycle.",
      ],
    },
    metadata: {
      phaseId: "realtime-and-file-processing",
    },
  }),

  node({
    id: "socket-io",
    title: "Socket.IO",
    category: "realtime",
    importance: "high",
    description:
      "Build practical real-time features on top of WebSocket-oriented communication.",
    whyItMatters:
      "Socket.IO provides practical abstractions for rooms, events and connection management in Node applications.",
    prerequisites: ["backend-websockets"],
    enables: ["backend-realtime-applications"],
    alternatives: [],
    related: ["redis"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Build one-to-one chat.",
        "Build rooms and notifications.",
        "Handle reconnect behavior.",
      ],
    },
    metadata: {
      phaseId: "realtime-and-file-processing",
    },
  }),

  node({
    id: "backend-realtime-applications",
    title: "Real-Time Application Patterns",
    category: "realtime",
    importance: "high",
    description:
      "Design presence, typing indicators, notifications, read receipts and other real-time workflows.",
    whyItMatters:
      "Real-time features require careful state and connection management beyond simply opening a WebSocket.",
    prerequisites: ["socket-io"],
    enables: ["backend-realtime-scaling"],
    alternatives: [],
    related: ["backend-event-driven"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Build a real-time chat system.",
        "Implement online/offline presence.",
        "Implement notifications.",
      ],
    },
    metadata: {
      phaseId: "realtime-and-file-processing",
    },
  }),

  node({
    id: "backend-realtime-scaling",
    title: "Scaling Real-Time Systems",
    category: "realtime",
    importance: "medium",
    description:
      "Understand how multiple backend instances coordinate real-time connections and events.",
    whyItMatters:
      "A single WebSocket server is easy; multiple instances introduce shared-state and message-delivery problems.",
    prerequisites: ["backend-realtime-applications", "redis"],
    enables: ["backend-distributed-systems"],
    alternatives: [],
    related: ["backend-pubsub"],
    guidance: {
      recommendedDepth: "conceptual-to-practical",
    },
    practice: {
      tasks: [
        "Understand why local in-memory state fails across multiple instances.",
        "Use a shared Pub/Sub mechanism conceptually.",
      ],
    },
    metadata: {
      phaseId: "realtime-and-file-processing",
    },
  }),

  node({
    id: "backend-file-processing",
    title: "File Uploads & Processing",
    category: "file-processing",
    importance: "high",
    description:
      "Handle multipart uploads, validation, storage and asynchronous file processing.",
    whyItMatters:
      "Production applications frequently handle images, documents, videos and other user-generated files.",
    prerequisites: ["nodejs-streams-and-buffers", "backend-web-security"],
    enables: ["backend-object-storage", "backend-background-jobs"],
    alternatives: [],
    related: ["backend-file-security"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Implement safe file uploads.",
        "Validate file type and size.",
        "Move processing to a background job.",
      ],
    },
    metadata: {
      phaseId: "realtime-and-file-processing",
    },
  }),

  node({
    id: "backend-object-storage",
    title: "Object Storage & Presigned URLs",
    category: "file-processing",
    importance: "high",
    description:
      "Use object storage for large files and understand presigned upload/download flows.",
    whyItMatters:
      "Application servers should not unnecessarily carry large file payloads when object storage can handle them directly.",
    prerequisites: ["backend-file-processing"],
    enables: ["backend-cdn", "backend-cloud"],
    alternatives: ["s3"],
    related: ["backend-file-security"],
    guidance: {
      recommendedDepth: "practical",
      primaryTechnology: "Amazon S3",
    },
    practice: {
      tasks: [
        "Upload directly to object storage using a presigned URL.",
        "Store metadata in the application database.",
      ],
    },
    metadata: {
      phaseId: "realtime-and-file-processing",
    },
  }),

  node({
    id: "backend-cdn",
    title: "CDN & Static Asset Delivery",
    category: "file-processing",
    importance: "medium",
    description:
      "Understand how CDNs distribute static and media content closer to users.",
    whyItMatters:
      "CDNs reduce latency and origin load for globally accessed files and assets.",
    prerequisites: ["backend-object-storage"],
    enables: ["backend-cloud", "backend-performance"],
    alternatives: [],
    related: ["backend-reverse-proxy"],
    guidance: {
      recommendedDepth: "conceptual-to-practical",
    },
    practice: {
      tasks: [
        "Explain origin vs edge delivery.",
        "Design media delivery through a CDN.",
      ],
    },
    metadata: {
      phaseId: "realtime-and-file-processing",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 9 - Performance & Production                                        */
/* -------------------------------------------------------------------------- */

const performanceNodes = [
  node({
    id: "backend-performance",
    title: "Backend Performance Engineering",
    category: "performance",
    importance: "critical",
    description:
      "Measure and improve backend latency, throughput, CPU usage, memory usage and I/O efficiency.",
    whyItMatters:
      "Production systems need predictable performance rather than merely functional correctness.",
    prerequisites: [
      "nodejs-event-loop",
      "database-query-optimization",
      "backend-rest-api",
    ],
    enables: ["backend-load-testing", "backend-scaling"],
    alternatives: [],
    related: ["backend-caching"],
    guidance: {
      recommendedDepth: "strong",
      rule: "Measure → identify bottleneck → optimize → measure again.",
    },
    practice: {
      tasks: [
        "Profile a slow endpoint.",
        "Identify whether the bottleneck is CPU, I/O or database work.",
      ],
    },
    metadata: {
      phaseId: "performance-and-production",
    },
  }),

  node({
    id: "backend-load-testing",
    title: "Load & Stress Testing",
    category: "performance",
    importance: "high",
    description:
      "Evaluate backend behavior under realistic concurrency and traffic.",
    whyItMatters:
      "A system that works for one user can fail badly under concurrent load.",
    prerequisites: ["backend-performance", "backend-api-testing"],
    enables: ["backend-capacity-planning", "backend-scaling"],
    alternatives: [],
    related: ["backend-rate-limiting"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Load test an API.",
        "Measure latency and throughput.",
        "Identify the first bottleneck.",
      ],
    },
    metadata: {
      phaseId: "performance-and-production",
    },
  }),

  node({
    id: "backend-health-checks",
    title: "Health Checks & Readiness",
    category: "production",
    importance: "high",
    description:
      "Expose meaningful health and readiness information for production infrastructure.",
    whyItMatters:
      "Load balancers and orchestration platforms need to know whether an instance can safely receive traffic.",
    prerequisites: ["backend-production"],
    enables: ["backend-containerization", "backend-observability"],
    alternatives: [],
    related: ["nodejs-process-and-graceful-shutdown"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Implement liveness and readiness concepts.",
        "Avoid treating every dependency failure as identical.",
      ],
    },
    metadata: {
      phaseId: "performance-and-production",
    },
  }),

  node({
    id: "backend-production",
    title: "Production Configuration",
    category: "production",
    importance: "critical",
    description:
      "Separate development, testing and production configuration safely and predictably.",
    whyItMatters:
      "Production systems require different secrets, logging, database connections and operational settings.",
    prerequisites: ["backend-secrets-management"],
    enables: ["backend-containerization", "backend-cicd"],
    alternatives: [],
    related: ["backend-environment-config"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Separate configuration by environment.",
        "Never commit production secrets.",
      ],
    },
    metadata: {
      phaseId: "performance-and-production",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 10 - Deployment & Cloud                                              */
/* -------------------------------------------------------------------------- */

const deploymentNodes = [
  node({
    id: "docker",
    title: "Docker",
    category: "deployment",
    importance: "critical",
    description:
      "Package backend applications and their runtime dependencies into reproducible containers.",
    whyItMatters:
      "Containers make development, testing and deployment environments more consistent.",
    prerequisites: ["backend-production"],
    enables: ["docker-compose", "backend-kubernetes", "backend-cicd"],
    alternatives: [],
    related: ["backend-cloud"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Containerize the backend.",
        "Write a production-oriented Dockerfile.",
        "Understand images, layers and containers.",
      ],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
      primaryTechnology: true,
    },
  }),

  node({
    id: "docker-compose",
    title: "Docker Compose",
    category: "deployment",
    importance: "high",
    description:
      "Run multi-service local environments consistently using Docker Compose.",
    whyItMatters:
      "Real backend systems often require databases, Redis and other supporting services.",
    prerequisites: ["docker"],
    enables: ["backend-local-infrastructure"],
    alternatives: [],
    related: ["redis", "rabbitmq"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Run backend + MongoDB + Redis with Compose.",
        "Configure service networking and environment variables.",
      ],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
    },
  }),

  node({
    id: "backend-reverse-proxy",
    title: "Reverse Proxy & Nginx",
    category: "deployment",
    importance: "high",
    description:
      "Understand reverse proxies, TLS termination, routing and traffic handling in front of backend services.",
    whyItMatters:
      "Production deployments commonly place application servers behind reverse proxies or load balancers.",
    prerequisites: ["backend-http", "backend-production"],
    enables: ["backend-cloud", "backend-load-balancing"],
    alternatives: [],
    related: ["backend-cdn"],
    guidance: {
      recommendedDepth: "practical",
      primaryTechnology: "Nginx",
    },
    practice: {
      tasks: [
        "Place a backend behind Nginx.",
        "Understand proxy headers and TLS termination.",
      ],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
    },
  }),

  node({
    id: "backend-cloud",
    title: "Cloud Fundamentals",
    category: "cloud",
    importance: "critical",
    description:
      "Understand cloud compute, networking, storage, IAM, managed services and production infrastructure.",
    whyItMatters:
      "Modern backend applications are commonly deployed on cloud infrastructure.",
    prerequisites: ["docker", "backend-reverse-proxy"],
    enables: ["aws", "backend-cloud-networking", "backend-cloud-security"],
    alternatives: ["gcp", "azure"],
    related: ["backend-devops"],
    guidance: {
      recommendedDepth: "strong",
      principle: "Learn cloud concepts first and one provider deeply.",
    },
    practice: {
      tasks: [
        "Deploy a containerized backend to a cloud environment.",
        "Understand compute, storage, networking and IAM.",
      ],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
      transferable: true,
    },
  }),

  node({
    id: "aws",
    title: "AWS Backend Deployment",
    category: "cloud",
    importance: "high",
    description:
      "Use AWS as the primary cloud implementation path for backend deployment.",
    whyItMatters:
      "AWS provides a broad ecosystem for compute, storage, databases, networking and production backend infrastructure.",
    prerequisites: ["backend-cloud"],
    enables: ["backend-cloud-networking", "backend-cloud-security"],
    alternatives: ["gcp", "azure"],
    related: ["backend-containerization"],
    guidance: {
      recommendedDepth: "strong",
      recommendation:
        "Learn AWS deeply enough to deploy and operate real applications; learn other providers conceptually first.",
    },
    practice: {
      tasks: [
        "Deploy a backend.",
        "Use managed storage/database concepts.",
        "Configure IAM safely.",
      ],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
      primaryTechnology: true,
    },
  }),

  node({
    id: "gcp",
    title: "Google Cloud",
    category: "cloud",
    importance: "medium",
    description: "Understand Google Cloud as an alternative cloud ecosystem.",
    whyItMatters:
      "Cloud concepts transfer across providers, while provider-specific services differ.",
    prerequisites: ["backend-cloud"],
    enables: [],
    alternatives: ["aws", "azure"],
    related: ["backend-cloud"],
    guidance: {
      recommendedDepth: "awareness",
      recommendation:
        "Do not learn deeply during the initial backend path unless the target role requires it.",
    },
    practice: {
      tasks: ["Map common AWS concepts to GCP equivalents."],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
    },
  }),

  node({
    id: "azure",
    title: "Microsoft Azure",
    category: "cloud",
    importance: "medium",
    description:
      "Understand Azure as an alternative enterprise cloud ecosystem.",
    whyItMatters:
      "Azure is particularly relevant to Microsoft-centric and enterprise environments.",
    prerequisites: ["backend-cloud"],
    enables: [],
    alternatives: ["aws", "gcp"],
    related: ["backend-cloud"],
    guidance: {
      recommendedDepth: "awareness",
      recommendation:
        "Do not learn deeply during the initial backend path unless the target role requires it.",
    },
    practice: {
      tasks: ["Map common AWS concepts to Azure equivalents."],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
    },
  }),

  node({
    id: "backend-cloud-networking",
    title: "Cloud Networking",
    category: "cloud",
    importance: "high",
    description:
      "Understand VPC-style networking, subnets, security boundaries, routing and service connectivity.",
    whyItMatters:
      "Backend deployment becomes much easier once network boundaries and traffic flow are understood.",
    prerequisites: ["backend-cloud", "backend-http"],
    enables: ["backend-load-balancing", "backend-cloud-security"],
    alternatives: [],
    related: ["computer-networking"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Trace internet → load balancer → application → database traffic.",
        "Understand public and private network boundaries.",
      ],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
    },
  }),

  node({
    id: "backend-cloud-security",
    title: "Cloud Security Basics",
    category: "cloud",
    importance: "high",
    description:
      "Apply least privilege, network isolation, secrets protection and secure cloud configuration.",
    whyItMatters:
      "Cloud misconfiguration can expose entire applications and databases.",
    prerequisites: ["backend-cloud", "backend-secrets-management"],
    enables: ["backend-devsecops"],
    alternatives: [],
    related: ["backend-web-security"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Apply least-privilege IAM.",
        "Keep databases private.",
        "Protect cloud secrets.",
      ],
    },
    metadata: {
      phaseId: "deployment-and-cloud",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 11 - CI/CD & Observability                                          */
/* -------------------------------------------------------------------------- */

const operationsNodes = [
  node({
    id: "backend-cicd",
    title: "CI/CD",
    category: "operations",
    importance: "critical",
    description:
      "Automate testing, building and deployment of backend applications.",
    whyItMatters:
      "Manual deployment is error-prone and prevents reliable, repeatable software delivery.",
    prerequisites: ["backend-testing", "docker", "backend-production"],
    enables: ["backend-observability", "backend-devsecops"],
    alternatives: ["github-actions", "gitlab-ci", "jenkins"],
    related: ["backend-git"],
    guidance: {
      recommendedDepth: "strong",
      primaryTechnology: "GitHub Actions",
    },
    practice: {
      tasks: [
        "Run tests on every pull request.",
        "Build a container image.",
        "Deploy after successful validation.",
      ],
    },
    metadata: {
      phaseId: "ci-cd-and-observability",
    },
  }),

  node({
    id: "github-actions",
    title: "GitHub Actions",
    category: "operations",
    importance: "high",
    description:
      "Use GitHub Actions for automated backend testing, builds and deployments.",
    whyItMatters:
      "It provides a practical CI/CD implementation path for GitHub-based projects.",
    prerequisites: ["backend-cicd"],
    enables: ["backend-production-delivery"],
    alternatives: ["gitlab-ci", "jenkins"],
    related: ["docker"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Create a CI pipeline.",
        "Run tests and linting.",
        "Build and publish a container.",
      ],
    },
    metadata: {
      phaseId: "ci-cd-and-observability",
    },
  }),

  node({
    id: "backend-logging",
    title: "Structured Logging",
    category: "observability",
    importance: "critical",
    description:
      "Produce useful structured logs that help developers diagnose backend behavior and failures.",
    whyItMatters:
      "Production debugging depends on meaningful context around requests, errors and system events.",
    prerequisites: ["backend-error-handling"],
    enables: ["backend-observability", "backend-distributed-tracing"],
    alternatives: [],
    related: ["backend-request-ids"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Log request IDs and important events.",
        "Avoid logging secrets or sensitive data.",
      ],
    },
    metadata: {
      phaseId: "ci-cd-and-observability",
    },
  }),

  node({
    id: "backend-observability",
    title: "Observability",
    category: "observability",
    importance: "critical",
    description:
      "Understand logs, metrics and traces as complementary signals for understanding production systems.",
    whyItMatters:
      "Without observability, scaling and debugging become guesswork.",
    prerequisites: ["backend-logging", "backend-health-checks"],
    enables: ["backend-distributed-tracing", "backend-sre"],
    alternatives: [],
    related: ["opentelemetry"],
    guidance: {
      recommendedDepth: "strong",
      pillars: ["Logs", "Metrics", "Traces"],
    },
    practice: {
      tasks: [
        "Define metrics for an API.",
        "Trace a request across application components.",
      ],
    },
    metadata: {
      phaseId: "ci-cd-and-observability",
    },
  }),

  node({
    id: "opentelemetry",
    title: "OpenTelemetry",
    category: "observability",
    importance: "high",
    description:
      "Understand vendor-neutral instrumentation for traces, metrics and telemetry.",
    whyItMatters:
      "Standardized telemetry helps systems remain observable across services and infrastructure.",
    prerequisites: ["backend-observability"],
    enables: ["backend-distributed-tracing"],
    alternatives: [],
    related: ["prometheus", "grafana"],
    guidance: {
      recommendedDepth: "practical",
    },
    practice: {
      tasks: [
        "Instrument a backend request.",
        "Trace a request across service boundaries.",
      ],
    },
    metadata: {
      phaseId: "ci-cd-and-observability",
    },
  }),

  node({
    id: "prometheus",
    title: "Prometheus",
    category: "observability",
    importance: "medium",
    description:
      "Understand metrics collection and querying through Prometheus-style monitoring.",
    whyItMatters:
      "Metrics help identify trends, saturation and service health.",
    prerequisites: ["backend-observability"],
    enables: ["backend-sre"],
    alternatives: [],
    related: ["grafana"],
    guidance: {
      recommendedDepth: "awareness-to-practical",
    },
    practice: {
      tasks: [
        "Expose application metrics.",
        "Identify useful backend service metrics.",
      ],
    },
    metadata: {
      phaseId: "ci-cd-and-observability",
    },
  }),

  node({
    id: "grafana",
    title: "Grafana",
    category: "observability",
    importance: "medium",
    description:
      "Visualize operational metrics and build useful monitoring dashboards.",
    whyItMatters:
      "Good dashboards turn raw metrics into operational visibility.",
    prerequisites: ["prometheus"],
    enables: ["backend-sre"],
    alternatives: [],
    related: ["backend-observability"],
    guidance: {
      recommendedDepth: "awareness-to-practical",
    },
    practice: {
      tasks: ["Create a dashboard for API latency and traffic."],
    },
    metadata: {
      phaseId: "ci-cd-and-observability",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 12 - Software Architecture                                            */
/* -------------------------------------------------------------------------- */

const architectureNodes = [
  node({
    id: "backend-software-architecture",
    title: "Software Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Learn how to organize backend systems around clear responsibilities, boundaries and dependencies.",
    whyItMatters:
      "Architecture determines how easily a backend can evolve as requirements and teams grow.",
    prerequisites: ["backend-layered-architecture", "backend-production"],
    enables: ["backend-modular-monolith", "backend-microservices"],
    alternatives: [],
    related: ["backend-system-design-connection"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Architect a production SaaS backend.",
        "Explain why each architectural boundary exists.",
      ],
    },
    metadata: {
      phaseId: "software-architecture",
    },
  }),

  node({
    id: "backend-modular-monolith",
    title: "Modular Monolith",
    category: "architecture",
    importance: "critical",
    description:
      "Structure a single deployable application into strong internal modules and boundaries.",
    whyItMatters:
      "A modular monolith provides many architectural benefits without immediately introducing distributed-system complexity.",
    prerequisites: ["backend-software-architecture"],
    enables: ["backend-microservices"],
    alternatives: [],
    related: ["backend-domain-boundaries"],
    guidance: {
      recommendedDepth: "strong",
      recommendation:
        "Master modular architecture before splitting systems into microservices.",
    },
    practice: {
      tasks: [
        "Split an application into domain modules.",
        "Prevent accidental cross-module coupling.",
      ],
    },
    metadata: {
      phaseId: "software-architecture",
    },
  }),

  node({
    id: "backend-solid",
    title: "SOLID & Design Principles",
    category: "architecture",
    importance: "high",
    description:
      "Use object-oriented and general software design principles to keep backend code maintainable.",
    whyItMatters:
      "Good design reduces accidental coupling and makes business logic easier to test and evolve.",
    prerequisites: ["backend-layered-architecture"],
    enables: ["backend-software-architecture"],
    alternatives: [],
    related: ["lld-ood"],
    guidance: {
      recommendedDepth: "strong",
      principle:
        "Use principles to solve real design problems rather than applying patterns mechanically.",
    },
    practice: {
      tasks: [
        "Refactor tightly coupled code.",
        "Identify violations of separation of concerns.",
      ],
    },
    metadata: {
      phaseId: "software-architecture",
    },
  }),

  node({
    id: "backend-domain-boundaries",
    title: "Domain & Service Boundaries",
    category: "architecture",
    importance: "high",
    description:
      "Identify meaningful business boundaries before deciding whether separate services are necessary.",
    whyItMatters:
      "Poor service boundaries create distributed complexity without providing useful independence.",
    prerequisites: ["backend-modular-monolith"],
    enables: ["backend-microservices"],
    alternatives: [],
    related: ["backend-event-driven"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Identify domains in an e-commerce system.",
        "Explain which modules should remain together and why.",
      ],
    },
    metadata: {
      phaseId: "software-architecture",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 13 - Distributed Systems & Microservices                             */
/* -------------------------------------------------------------------------- */

const distributedNodes = [
  node({
    id: "backend-microservices",
    title: "Microservices",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand independently deployable services and the trade-offs introduced by distributed architecture.",
    whyItMatters:
      "Microservices can improve independent scaling and ownership but introduce network, consistency and operational complexity.",
    prerequisites: [
      "backend-modular-monolith",
      "backend-domain-boundaries",
      "backend-queue-processing",
    ],
    enables: [
      "backend-service-communication",
      "backend-distributed-transactions",
      "backend-service-resilience",
    ],
    alternatives: ["modular-monolith"],
    related: ["backend-system-design-connection"],
    guidance: {
      recommendedDepth: "strong",
      rule: "Do not introduce microservices simply because they are popular.",
    },
    practice: {
      tasks: [
        "Split a modular monolith conceptually into services.",
        "Identify the new distributed-system problems.",
      ],
    },
    metadata: {
      phaseId: "distributed-systems-and-microservices",
    },
  }),

  node({
    id: "backend-service-communication",
    title: "Service-to-Service Communication",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand synchronous and asynchronous communication between backend services.",
    whyItMatters:
      "Communication choices affect latency, coupling, failure propagation and scalability.",
    prerequisites: ["backend-microservices"],
    enables: ["backend-service-resilience", "backend-distributed-tracing"],
    alternatives: ["rest", "grpc"],
    related: ["backend-event-driven"],
    guidance: {
      recommendedDepth: "strong",
      compare: ["REST", "gRPC", "Messaging", "Events"],
    },
    practice: {
      tasks: [
        "Choose synchronous vs asynchronous communication for different workflows.",
      ],
    },
    metadata: {
      phaseId: "distributed-systems-and-microservices",
    },
  }),

  node({
    id: "backend-event-driven",
    title: "Event-Driven Architecture",
    category: "distributed-systems",
    importance: "high",
    description:
      "Design systems where important state changes produce events consumed by independent components.",
    whyItMatters:
      "Events can reduce coupling and enable asynchronous workflows, integrations and scalable processing.",
    prerequisites: ["backend-queue-processing", "backend-microservices"],
    enables: ["backend-distributed-systems", "backend-event-streaming"],
    alternatives: [],
    related: ["kafka", "rabbitmq"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Design OrderCreated → Payment → Inventory → Notification flow.",
        "Identify where eventual consistency is acceptable.",
      ],
    },
    metadata: {
      phaseId: "distributed-systems-and-microservices",
    },
  }),

  node({
    id: "backend-service-resilience",
    title: "Distributed Resilience",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Handle timeouts, retries, circuit breakers, bulkheads and failure isolation across services.",
    whyItMatters:
      "In distributed systems, remote dependencies fail independently and can propagate outages.",
    prerequisites: [
      "backend-microservices",
      "backend-service-communication",
      "backend-reliability",
    ],
    enables: ["backend-advanced-distributed-systems"],
    alternatives: [],
    related: ["backend-idempotency"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "Timeouts",
        "Retries",
        "Circuit breakers",
        "Bulkheads",
        "Backpressure",
        "Failure isolation",
      ],
    },
    practice: {
      tasks: [
        "Design retry behavior for a failed dependency.",
        "Explain when retries can make an outage worse.",
      ],
    },
    metadata: {
      phaseId: "distributed-systems-and-microservices",
    },
  }),

  node({
    id: "backend-distributed-transactions",
    title: "Distributed Transactions & Saga",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand how business workflows spanning multiple services handle consistency without a single database transaction.",
    whyItMatters:
      "Splitting a system across services removes many simple transactional guarantees.",
    prerequisites: [
      "database-transactions",
      "backend-microservices",
      "backend-event-driven",
    ],
    enables: ["backend-advanced-distributed-systems"],
    alternatives: [],
    related: ["backend-outbox"],
    guidance: {
      recommendedDepth: "conceptual-to-strong",
    },
    practice: {
      tasks: [
        "Model an order-payment-inventory workflow.",
        "Explain compensating actions.",
      ],
    },
    metadata: {
      phaseId: "distributed-systems-and-microservices",
    },
  }),

  node({
    id: "backend-outbox",
    title: "Outbox Pattern",
    category: "distributed-systems",
    importance: "high",
    description:
      "Use an outbox to reliably connect database state changes with asynchronous event publication.",
    whyItMatters:
      "It helps avoid the dual-write problem where database and message publication succeed or fail independently.",
    prerequisites: ["backend-event-driven", "database-transactions"],
    enables: ["backend-advanced-distributed-systems"],
    alternatives: [],
    related: ["backend-idempotency"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Design an order-created outbox flow.",
        "Explain how consumers handle duplicate events.",
      ],
    },
    metadata: {
      phaseId: "distributed-systems-and-microservices",
    },
  }),

  node({
    id: "backend-distributed-tracing",
    title: "Distributed Tracing",
    category: "distributed-systems",
    importance: "high",
    description:
      "Trace requests across multiple backend services and asynchronous boundaries.",
    whyItMatters:
      "Traditional logs become difficult to correlate when one user request crosses many services.",
    prerequisites: ["backend-observability", "backend-microservices"],
    enables: ["backend-advanced-distributed-systems"],
    alternatives: [],
    related: ["opentelemetry"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Trace a request through multiple services.",
        "Correlate logs and traces using request context.",
      ],
    },
    metadata: {
      phaseId: "distributed-systems-and-microservices",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Phase 14 - Advanced Backend Systems                                       */
/* -------------------------------------------------------------------------- */

const advancedNodes = [
  node({
    id: "backend-scaling",
    title: "Backend Scaling",
    category: "advanced-backend",
    importance: "critical",
    description:
      "Understand vertical and horizontal scaling and how application architecture changes as traffic grows.",
    whyItMatters:
      "Scaling decisions affect cost, availability, latency and architectural complexity.",
    prerequisites: ["backend-performance", "backend-cloud"],
    enables: [
      "backend-load-balancing",
      "backend-distributed-caching",
      "backend-database-replication",
    ],
    alternatives: [],
    related: ["backend-system-design-connection"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Scale an API horizontally.",
        "Identify state that prevents safe horizontal scaling.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),

  node({
    id: "backend-load-balancing",
    title: "Load Balancing",
    category: "advanced-backend",
    importance: "high",
    description:
      "Distribute incoming traffic across multiple backend instances.",
    whyItMatters:
      "Load balancing supports horizontal scaling, availability and traffic distribution.",
    prerequisites: ["backend-scaling", "backend-cloud-networking"],
    enables: ["backend-high-availability"],
    alternatives: [],
    related: ["backend-reverse-proxy"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Explain how a load balancer distributes requests.",
        "Understand health-based routing.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),

  node({
    id: "backend-distributed-caching",
    title: "Distributed Caching",
    category: "advanced-backend",
    importance: "high",
    description:
      "Use shared caches across multiple backend instances and understand distributed cache consistency.",
    whyItMatters:
      "Local memory caches break when traffic is distributed across multiple instances.",
    prerequisites: ["backend-caching", "backend-scaling"],
    enables: ["backend-scaling"],
    alternatives: [],
    related: ["redis"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Explain why local caches diverge across instances.",
        "Design shared-cache invalidation.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),

  node({
    id: "backend-database-replication",
    title: "Database Replication",
    category: "advanced-backend",
    importance: "high",
    description:
      "Understand replication, read replicas and the trade-offs of distributing database reads and writes.",
    whyItMatters:
      "Database capacity and availability can become bottlenecks as systems grow.",
    prerequisites: ["database-transactions", "backend-scaling"],
    enables: ["backend-database-sharding", "backend-high-availability"],
    alternatives: [],
    related: ["database-consistency"],
    guidance: {
      recommendedDepth: "conceptual-to-strong",
    },
    practice: {
      tasks: [
        "Explain primary and replica roles.",
        "Reason about replica lag.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),

  node({
    id: "backend-database-sharding",
    title: "Database Sharding & Partitioning",
    category: "advanced-backend",
    importance: "medium",
    description:
      "Understand partitioning and sharding strategies for datasets that exceed the practical limits of a single database instance.",
    whyItMatters:
      "Sharding introduces major operational and consistency complexity and should be used only when justified.",
    prerequisites: ["backend-database-replication", "backend-scaling"],
    enables: ["backend-scaling"],
    alternatives: [],
    related: ["backend-system-design-connection"],
    guidance: {
      recommendedDepth: "conceptual",
      warning: "Do not treat sharding as a default optimization.",
    },
    practice: {
      tasks: [
        "Explain a possible shard key.",
        "Identify problems caused by poor partitioning.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),

  node({
    id: "backend-high-availability",
    title: "High Availability & Fault Tolerance",
    category: "advanced-backend",
    importance: "critical",
    description:
      "Design systems that continue operating despite individual component failures.",
    whyItMatters:
      "Production systems must tolerate machine, network, dependency and deployment failures.",
    prerequisites: ["backend-load-balancing", "backend-service-resilience"],
    enables: ["backend-disaster-recovery", "backend-scaling"],
    alternatives: [],
    related: ["backend-system-design-connection"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Identify single points of failure.",
        "Design redundancy for critical components.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),

  node({
    id: "backend-capacity-planning",
    title: "Capacity Planning",
    category: "advanced-backend",
    importance: "high",
    description:
      "Estimate traffic, storage, compute and dependency capacity before systems become overloaded.",
    whyItMatters:
      "Scaling proactively requires understanding expected workload and system limits.",
    prerequisites: ["backend-load-testing", "backend-scaling"],
    enables: ["backend-scaling", "backend-system-design-connection"],
    alternatives: [],
    related: ["backend-performance"],
    guidance: {
      recommendedDepth: "strong",
    },
    practice: {
      tasks: [
        "Estimate requests per second.",
        "Estimate storage growth.",
        "Identify likely bottlenecks.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),

  node({
    id: "backend-advanced-distributed-systems",
    title: "Advanced Distributed Systems",
    category: "advanced-backend",
    importance: "critical",
    description:
      "Develop a deeper understanding of consistency, partitioning, availability, messaging semantics and distributed failure.",
    whyItMatters:
      "Senior backend and system-design work requires reasoning about systems where no single machine has complete control.",
    prerequisites: [
      "backend-service-resilience",
      "backend-distributed-transactions",
      "backend-database-replication",
    ],
    enables: ["backend-system-design-connection"],
    alternatives: [],
    related: ["backend-advanced-distributed-systems", "backend-consistency-models"],
    guidance: {
      recommendedDepth: "strong",
      focus: [
        "CAP awareness",
        "Consistency models",
        "Failure modes",
        "Message delivery semantics",
        "Partitioning",
        "Availability",
      ],
    },
    practice: {
      tasks: [
        "Analyze consistency vs availability trade-offs.",
        "Reason about network partitions.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),

  node({
    id: "backend-system-design-connection",
    title: "Backend to System Design",
    category: "advanced-backend",
    importance: "critical",
    description:
      "Connect practical backend engineering decisions to high-level system design.",
    whyItMatters:
      "System design is not separate magic; it builds on APIs, databases, caching, messaging, scaling and reliability.",
    prerequisites: [
      "backend-advanced-distributed-systems",
      "backend-capacity-planning",
    ],
    enables: ["backend-system-design-connection"],
    alternatives: [],
    related: [
      "backend-scaling",
      "backend-observability",
      "backend-microservices",
    ],
    guidance: {
      recommendedDepth: "strong",
      recommendation:
        "Use real backend projects as the bridge into HLD and distributed-system design.",
    },
    practice: {
      tasks: [
        "Design a scalable backend for an e-commerce system.",
        "Design a notification system.",
        "Design a real-time chat backend.",
      ],
    },
    metadata: {
      phaseId: "advanced-backend-systems",
    },
  }),
];

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export const backendDeveloperNodes = [
  ...foundationNodes,
  ...runtimeNodes,
  ...apiNodes,
  ...databaseNodes,
  ...securityNodes,
  ...testingNodes,
  ...asyncSystemNodes,
  ...realtimeFileNodes,
  ...performanceNodes,
  ...deploymentNodes,
  ...operationsNodes,
  ...architectureNodes,
  ...distributedNodes,
  ...advancedNodes,
];

export default backendDeveloperNodes;

const fullStackDeveloperPhases = [
  // ============================================================
  // PHASE 1 — WEB FOUNDATION
  // ============================================================

  {
    id: "web-foundation",
    order: 1,
    title: "Web Development Foundation",
    description:
      "Understand how browsers, servers, HTTP, URLs, DNS, HTML, CSS and web applications work.",
    goal: "Build a strong foundation before moving into frontend and backend engineering.",
    primaryPath: "Web fundamentals + HTML + CSS + HTTP",
    alternatives: [],
  },

  // ============================================================
  // PHASE 2 — PROGRAMMING FOUNDATION
  // ============================================================

  {
    id: "programming-foundation",
    order: 2,
    title: "Programming Foundation",
    description:
      "Develop programming fundamentals including variables, control flow, functions, data structures, modules and debugging.",
    goal: "Build the programming ability required to work across the complete application stack.",
    primaryPath: "JavaScript / TypeScript",
    alternatives: ["Python", "Java", "C#"],
  },

  // ============================================================
  // PHASE 3 — FRONTEND CORE
  // ============================================================

  {
    id: "frontend-core",
    order: 3,
    title: "Frontend Engineering",
    description:
      "Build interactive browser applications using HTML, CSS, JavaScript, DOM APIs, asynchronous programming and browser capabilities.",
    goal: "Become comfortable building real frontend interfaces before introducing a frontend framework.",
    primaryPath: "HTML + CSS + JavaScript",
    alternatives: [],
  },

  // ============================================================
  // PHASE 4 — REACT
  // ============================================================

  {
    id: "react-development",
    order: 4,
    title: "React Development",
    description:
      "Learn component architecture, hooks, routing, data fetching, forms and state management.",
    goal: "Build maintainable production-oriented React applications.",
    primaryPath: "React",
    alternatives: ["Vue", "Angular"],
  },

  // ============================================================
  // PHASE 5 — TYPESCRIPT
  // ============================================================

  {
    id: "typescript",
    order: 5,
    title: "TypeScript",
    description:
      "Add static typing, interfaces, generics, utility types and type-safe application development.",
    goal: "Develop large frontend and backend applications with stronger correctness and maintainability.",
    primaryPath: "TypeScript",
    alternatives: [],
  },

  // ============================================================
  // PHASE 6 — FRONTEND PRODUCTION ENGINEERING
  // ============================================================

  {
    id: "production-frontend",
    order: 6,
    title: "Production Frontend Engineering",
    description:
      "Learn frontend architecture, testing, performance, accessibility, security and design-system practices.",
    goal: "Move from simple frontend projects to production-quality applications.",
    primaryPath: "React + TypeScript",
    alternatives: ["Next.js", "Vue", "Angular"],
  },

  // ============================================================
  // PHASE 7 — BACKEND FOUNDATION
  // ============================================================

  {
    id: "backend-foundation",
    order: 7,
    title: "Backend Engineering Foundation",
    description:
      "Understand servers, processes, APIs, HTTP lifecycle, backend architecture, validation and error handling.",
    goal: "Understand how frontend applications communicate with production backend systems.",
    primaryPath: "Node.js",
    alternatives: ["Python", "Java", "Go", ".NET"],
  },

  // ============================================================
  // PHASE 8 — NODE.JS
  // ============================================================

  {
    id: "nodejs-backend",
    order: 8,
    title: "Node.js Backend Development",
    description:
      "Learn Node.js runtime internals, asynchronous programming, modules, streams, processes and production server development.",
    goal: "Build reliable backend services using the JavaScript ecosystem.",
    primaryPath: "Node.js",
    alternatives: [],
  },

  // ============================================================
  // PHASE 9 — API ENGINEERING
  // ============================================================

  {
    id: "api-engineering",
    order: 9,
    title: "API Engineering",
    description:
      "Design REST APIs, validation, pagination, filtering, error handling, versioning and service boundaries.",
    goal: "Build predictable APIs consumed by frontend applications and other services.",
    primaryPath: "REST APIs",
    alternatives: ["GraphQL", "gRPC"],
  },

  // ============================================================
  // PHASE 10 — DATABASES
  // ============================================================

  {
    id: "database-engineering",
    order: 10,
    title: "Database Engineering",
    description:
      "Understand relational and document databases, schema design, indexing, transactions, queries and data modeling.",
    goal: "Choose and use databases correctly for application requirements.",
    primaryPath: "PostgreSQL + MongoDB",
    alternatives: ["MySQL", "SQL Server", "Redis"],
  },

  // ============================================================
  // PHASE 11 — AUTHENTICATION & SECURITY
  // ============================================================

  {
    id: "authentication-security",
    order: 11,
    title: "Authentication & Application Security",
    description:
      "Implement authentication, authorization, sessions, tokens, OAuth, validation, secure cookies and common web security controls.",
    goal: "Build applications that protect users, data and business operations.",
    primaryPath: "Sessions + JWT + OAuth/OIDC",
    alternatives: [],
  },

  // ============================================================
  // PHASE 12 — FULL STACK INTEGRATION
  // ============================================================

  {
    id: "full-stack-integration",
    order: 12,
    title: "Full Stack Application Integration",
    description:
      "Connect frontend, backend, databases, authentication, file handling and external APIs into complete applications.",
    goal: "Build end-to-end applications independently.",
    primaryPath: "React + Node.js + Database",
    alternatives: [],
  },

  // ============================================================
  // PHASE 13 — STATE & DATA MANAGEMENT
  // ============================================================

  {
    id: "full-stack-data-flow",
    order: 13,
    title: "Full Stack Data Flow",
    description:
      "Understand client state, server state, caching, optimistic updates, API synchronization and data consistency.",
    goal: "Build applications with predictable data flow and responsive user experiences.",
    primaryPath: "React State + Server State + API Caching",
    alternatives: [],
  },

  // ============================================================
  // PHASE 14 — FILES & REAL-WORLD FEATURES
  // ============================================================

  {
    id: "real-world-application-features",
    order: 14,
    title: "Real-World Application Features",
    description:
      "Build file uploads, search, notifications, email, background jobs, payments, realtime features and third-party integrations.",
    goal: "Move beyond CRUD applications toward real production product capabilities.",
    primaryPath: "Object Storage + Background Jobs + Realtime + External APIs",
    alternatives: [],
  },

  // ============================================================
  // PHASE 15 — TESTING
  // ============================================================

  {
    id: "full-stack-testing",
    order: 15,
    title: "Full Stack Testing",
    description:
      "Test frontend components, APIs, business logic, database behavior and complete user workflows.",
    goal: "Build confidence that application changes do not break existing functionality.",
    primaryPath: "Unit + Integration + End-to-End Testing",
    alternatives: [],
  },

  // ============================================================
  // PHASE 16 — PERFORMANCE
  // ============================================================

  {
    id: "full-stack-performance",
    order: 16,
    title: "Full Stack Performance",
    description:
      "Optimize frontend rendering, APIs, database queries, caching, network usage and backend workloads.",
    goal: "Build applications that remain responsive as traffic and data grow.",
    primaryPath: "Frontend + API + Database Optimization",
    alternatives: [],
  },

  // ============================================================
  // PHASE 17 — CACHING & ASYNC PROCESSING
  // ============================================================

  {
    id: "caching-and-background-processing",
    order: 17,
    title: "Caching & Background Processing",
    description:
      "Use caching, queues, workers, scheduled jobs and asynchronous processing to improve scalability and reliability.",
    goal: "Move expensive or slow work away from synchronous request paths.",
    primaryPath: "Redis + Queues + Workers",
    alternatives: ["RabbitMQ", "Kafka", "Cloud Queues"],
  },

  // ============================================================
  // PHASE 18 — REALTIME SYSTEMS
  // ============================================================

  {
    id: "realtime-systems",
    order: 18,
    title: "Realtime Full Stack Systems",
    description:
      "Build realtime communication using WebSockets, Server-Sent Events and event-driven backend systems.",
    goal: "Support chat, live notifications, collaboration and realtime dashboards.",
    primaryPath: "WebSockets",
    alternatives: ["Server-Sent Events", "WebRTC awareness"],
  },

  // ============================================================
  // PHASE 19 — DEVOPS FOUNDATION
  // ============================================================

  {
    id: "devops-foundation",
    order: 19,
    title: "DevOps for Full Stack Engineers",
    description:
      "Learn Linux, Git workflows, environment configuration, Docker, networking and application deployment.",
    goal: "Become capable of deploying and operating applications instead of depending entirely on another team.",
    primaryPath: "Linux + Git + Docker",
    alternatives: [],
  },

  // ============================================================
  // PHASE 20 — DOCKER & CONTAINERS
  // ============================================================

  {
    id: "docker-and-containers",
    order: 20,
    title: "Docker & Containers",
    description:
      "Containerize frontend and backend services and understand images, networks, volumes and multi-container applications.",
    goal: "Create reproducible application environments.",
    primaryPath: "Docker + Docker Compose",
    alternatives: ["Podman"],
  },

  // ============================================================
  // PHASE 21 — CI/CD
  // ============================================================

  {
    id: "ci-cd",
    order: 21,
    title: "CI/CD",
    description:
      "Automate testing, builds, security checks and deployments through continuous integration and delivery pipelines.",
    goal: "Create repeatable and reliable software delivery workflows.",
    primaryPath: "GitHub Actions",
    alternatives: ["GitLab CI", "Jenkins"],
  },

  // ============================================================
  // PHASE 22 — CLOUD
  // ============================================================

  {
    id: "cloud-deployment",
    order: 22,
    title: "Cloud Deployment",
    description:
      "Deploy full-stack applications using cloud compute, networking, databases, storage, DNS, TLS and monitoring.",
    goal: "Operate real applications on production cloud infrastructure.",
    primaryPath: "AWS",
    alternatives: ["GCP", "Azure"],
  },

  // ============================================================
  // PHASE 23 — OBSERVABILITY
  // ============================================================

  {
    id: "observability",
    order: 23,
    title: "Production Observability",
    description:
      "Implement logs, metrics, traces, health checks, alerts and application monitoring.",
    goal: "Understand what production systems are doing and diagnose failures quickly.",
    primaryPath: "Logs + Metrics + Traces",
    alternatives: ["OpenTelemetry", "Cloud-native observability"],
  },

  // ============================================================
  // PHASE 24 — ARCHITECTURE
  // ============================================================

  {
    id: "full-stack-architecture",
    order: 24,
    title: "Full Stack Architecture",
    description:
      "Design modular applications, service boundaries, data flows, caching, asynchronous communication and scalable architectures.",
    goal: "Move from feature implementation to system-level engineering.",
    primaryPath: "Modular Monolith → Services",
    alternatives: ["Microservices"],
  },

  // ============================================================
  // PHASE 25 — SCALABILITY
  // ============================================================

  {
    id: "full-stack-scalability",
    order: 25,
    title: "Full Stack Scalability",
    description:
      "Understand horizontal scaling, load balancing, caching, database scaling, queues and stateless services.",
    goal: "Design applications capable of handling increasing traffic and data.",
    primaryPath:
      "Load Balancing + Caching + Database Scaling + Async Processing",
    alternatives: [],
  },

  // ============================================================
  // PHASE 26 — MICROSERVICES
  // ============================================================

  {
    id: "microservices",
    order: 26,
    title: "Microservices",
    description:
      "Understand service decomposition, communication, service discovery, resilience, distributed data and operational complexity.",
    goal: "Know when and how to evolve a full-stack application into multiple services.",
    primaryPath: "Node.js Microservices",
    alternatives: ["Java/Spring Boot", "Go"],
  },

  // ============================================================
  // PHASE 27 — DISTRIBUTED SYSTEMS
  // ============================================================

  {
    id: "distributed-systems",
    order: 27,
    title: "Distributed Systems for Full Stack Engineers",
    description:
      "Understand consistency, availability, retries, timeouts, idempotency, messaging, distributed transactions and failure handling.",
    goal: "Reason about systems that run across multiple machines and services.",
    primaryPath: "Distributed Systems Fundamentals",
    alternatives: [],
  },

  // ============================================================
  // PHASE 28 — CLOUD-NATIVE
  // ============================================================

  {
    id: "cloud-native-full-stack",
    order: 28,
    title: "Cloud-Native Full Stack Engineering",
    description:
      "Use managed cloud services, containers, orchestration, infrastructure automation and scalable application architectures.",
    goal: "Build modern cloud-native applications rather than simply hosting traditional applications.",
    primaryPath: "AWS + Docker + Kubernetes",
    alternatives: ["GCP", "Azure"],
  },

  // ============================================================
  // PHASE 29 — SECURITY
  // ============================================================

  {
    id: "full-stack-security",
    order: 29,
    title: "Full Stack Security",
    description:
      "Apply secure coding, OWASP practices, API security, secrets management, dependency security and cloud security.",
    goal: "Build applications that are secure throughout their lifecycle.",
    primaryPath: "OWASP + API Security + Cloud Security",
    alternatives: [],
  },

  // ============================================================
  // PHASE 30 — AI INTEGRATION
  // ============================================================

  {
    id: "ai-powered-full-stack",
    order: 30,
    title: "AI-Powered Full Stack Applications",
    description:
      "Integrate LLM APIs, embeddings, RAG, structured outputs, tool calling and AI workflows into full-stack products.",
    goal: "Build modern applications that use AI as a product capability rather than as an isolated experiment.",
    primaryPath: "LLM APIs + RAG + Tool Calling",
    alternatives: ["Open-source models", "AI agent workflows"],
  },

  // ============================================================
  // PHASE 31 — SYSTEM DESIGN
  // ============================================================

  {
    id: "full-stack-system-design",
    order: 31,
    title: "System Design for Full Stack Engineers",
    description:
      "Design scalable APIs, databases, caches, queues, storage systems, realtime systems and distributed architectures.",
    goal: "Develop the system-design capability expected from experienced full-stack engineers.",
    primaryPath: "HLD + Distributed Systems + LLD",
    alternatives: [],
  },

  // ============================================================
  // PHASE 32 — PRODUCTION ENGINEERING
  // ============================================================

  {
    id: "production-full-stack-engineering",
    order: 32,
    title: "Production Full Stack Engineering",
    description:
      "Combine frontend, backend, databases, security, testing, cloud, DevOps, observability and architecture into production systems.",
    goal: "Reach professional-level full-stack engineering capability.",
    primaryPath:
      "React + TypeScript + Node.js + PostgreSQL/MongoDB + AWS + Docker",
    alternatives: [
      "PERN",
      "MEAN",
      "Next.js full stack",
      "Python full stack",
      "Java full stack",
    ],
  },
];

export default fullStackDeveloperPhases;
export { fullStackDeveloperPhases };

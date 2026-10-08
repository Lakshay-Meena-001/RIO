import { createKnowledgeNode } from "../../factory.js";

const node = (data) => createKnowledgeNode(data);

const fullStackDeveloperNodes = [
  // ============================================================
  // PHASE 1 — WEB FOUNDATION
  // ============================================================

  node({
    id: "web-fundamentals",
    title: "Web Fundamentals",
    category: "foundation",
    importance: "critical",
    description:
      "Understand browsers, servers, URLs, DNS, HTTP, HTTPS and the request-response lifecycle.",
    whyItMatters:
      "Full-stack engineers need to understand the complete path from browser to backend and back.",
    prerequisites: [],
    enables: ["html", "css", "http-and-apis"],
    alternatives: [],
    related: ["networking-foundation"],
    metadata: { phase: "web-foundation", primary: true },
  }),

  node({
    id: "html",
    title: "HTML",
    category: "frontend",
    importance: "critical",
    description:
      "Build semantic web documents using HTML elements, forms, metadata and accessibility-aware structure.",
    whyItMatters: "HTML is the structural foundation of browser applications.",
    prerequisites: ["web-fundamentals"],
    enables: ["css", "accessibility"],
    alternatives: [],
    related: ["forms"],
    metadata: { phase: "web-foundation", primary: true },
  }),

  node({
    id: "css",
    title: "CSS",
    category: "frontend",
    importance: "critical",
    description:
      "Learn selectors, layout, Flexbox, Grid, responsive design, positioning and modern styling.",
    whyItMatters:
      "Production interfaces require reliable layout and responsive behavior.",
    prerequisites: ["html"],
    enables: ["responsive-design"],
    alternatives: [],
    related: ["design-systems"],
    metadata: { phase: "web-foundation", primary: true },
  }),

  node({
    id: "responsive-design",
    title: "Responsive Design",
    category: "frontend",
    importance: "high",
    description:
      "Build interfaces that adapt correctly across screen sizes and devices.",
    whyItMatters:
      "Real applications must work across different devices and viewport sizes.",
    prerequisites: ["css"],
    enables: ["frontend-architecture"],
    alternatives: [],
    related: ["accessibility"],
    metadata: { phase: "web-foundation" },
  }),

  // ============================================================
  // PHASE 2 — PROGRAMMING FOUNDATION
  // ============================================================

  node({
    id: "javascript",
    title: "JavaScript",
    category: "programming",
    importance: "critical",
    description:
      "Learn JavaScript syntax, functions, objects, arrays, closures, modules, asynchronous programming and error handling.",
    whyItMatters:
      "JavaScript is the primary language connecting the frontend and Node.js backend path.",
    prerequisites: ["web-fundamentals"],
    enables: [
      "dom",
      "async-javascript",
      "javascript-modules",
      "nodejs-runtime",
    ],
    alternatives: ["python-for-full-stack", "java-for-full-stack"],
    related: ["typescript"],
    metadata: {
      phase: "programming-foundation",
      primary: true,
    },
  }),

  node({
    id: "typescript",
    title: "TypeScript",
    category: "programming",
    importance: "critical",
    description:
      "Learn static typing, interfaces, generics, utility types and type-safe application development.",
    whyItMatters:
      "Type safety improves maintainability across large frontend and backend applications.",
    prerequisites: ["javascript"],
    enables: ["react-typescript", "typed-node-backend"],
    alternatives: [],
    related: ["frontend-architecture"],
    metadata: {
      phase: "typescript",
      primary: true,
    },
  }),

  node({
    id: "python-for-full-stack",
    title: "Python for Full Stack",
    category: "programming",
    importance: "medium",
    description:
      "Understand Python as an alternative backend programming language.",
    whyItMatters:
      "Python is useful for teams building full-stack applications alongside AI and data workloads.",
    prerequisites: ["web-fundamentals"],
    enables: ["python-backend"],
    alternatives: ["javascript"],
    related: ["ai-powered-full-stack"],
    metadata: {
      phase: "programming-foundation",
      optional: true,
    },
  }),

  node({
    id: "java-for-full-stack",
    title: "Java for Full Stack",
    category: "programming",
    importance: "medium",
    description: "Understand Java as an enterprise backend programming path.",
    whyItMatters: "Java remains important for enterprise full-stack systems.",
    prerequisites: ["web-fundamentals"],
    enables: ["java-backend"],
    alternatives: ["javascript"],
    related: ["microservices"],
    metadata: {
      phase: "programming-foundation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 3 — FRONTEND CORE
  // ============================================================

  node({
    id: "dom",
    title: "DOM",
    category: "frontend",
    importance: "critical",
    description:
      "Understand the browser DOM, events, element manipulation and browser-side application behavior.",
    whyItMatters:
      "Frameworks abstract the DOM, but understanding it helps debug and reason about browser applications.",
    prerequisites: ["javascript", "html"],
    enables: ["react"],
    alternatives: [],
    related: ["frontend-testing"],
    metadata: { phase: "frontend-core" },
  }),

  node({
    id: "async-javascript",
    title: "Asynchronous JavaScript",
    category: "programming",
    importance: "critical",
    description:
      "Understand promises, async/await, event loops, concurrency and asynchronous error handling.",
    whyItMatters:
      "Frontend APIs and Node.js backend systems depend heavily on asynchronous execution.",
    prerequisites: ["javascript"],
    enables: ["nodejs-runtime", "react-data-fetching"],
    alternatives: [],
    related: ["backend-concurrency"],
    metadata: {
      phase: "frontend-core",
      primary: true,
    },
  }),

  node({
    id: "javascript-modules",
    title: "JavaScript Modules",
    category: "programming",
    importance: "high",
    description:
      "Understand ES modules, imports, exports, dependency organization and package usage.",
    whyItMatters:
      "Modern frontend and Node.js applications are composed from modules and packages.",
    prerequisites: ["javascript"],
    enables: ["nodejs-runtime", "frontend-architecture"],
    alternatives: [],
    related: ["typescript"],
    metadata: { phase: "frontend-core" },
  }),

  node({
    id: "accessibility",
    title: "Web Accessibility",
    category: "frontend",
    importance: "high",
    description:
      "Build interfaces usable by people with different abilities using semantic HTML, keyboard support and accessible UI patterns.",
    whyItMatters:
      "Accessibility is an important production-quality requirement.",
    prerequisites: ["html", "responsive-design"],
    enables: ["production-frontend"],
    alternatives: [],
    related: ["frontend-testing"],
    metadata: { phase: "frontend-core" },
  }),

  node({
    id: "forms",
    title: "Frontend Forms",
    category: "frontend",
    importance: "high",
    description:
      "Build controlled forms, validation, submission flows and user-input handling.",
    whyItMatters:
      "Forms are central to authentication, onboarding and most business applications.",
    prerequisites: ["html", "javascript"],
    enables: ["react"],
    alternatives: [],
    related: ["api-validation"],
    metadata: { phase: "frontend-core" },
  }),

  // ============================================================
  // PHASE 4 — REACT
  // ============================================================

  node({
    id: "react",
    title: "React",
    category: "frontend-framework",
    importance: "critical",
    description:
      "Build component-based interfaces using React components, props, state and composition.",
    whyItMatters:
      "React is the primary frontend framework in the full-stack roadmap.",
    prerequisites: ["dom", "javascript", "forms"],
    enables: ["react-hooks", "react-routing", "react-data-fetching"],
    alternatives: ["vue", "angular"],
    related: ["typescript"],
    metadata: {
      phase: "react-development",
      primary: true,
    },
  }),

  node({
    id: "react-hooks",
    title: "React Hooks",
    category: "frontend-framework",
    importance: "critical",
    description:
      "Use state, effects, memoization, refs and custom hooks effectively.",
    whyItMatters: "Hooks are central to modern React application architecture.",
    prerequisites: ["react"],
    enables: ["react-state-management", "react-data-fetching"],
    alternatives: [],
    related: ["frontend-architecture"],
    metadata: { phase: "react-development" },
  }),

  node({
    id: "react-routing",
    title: "React Routing",
    category: "frontend-framework",
    importance: "high",
    description:
      "Implement client-side routing, nested routes, protected routes and navigation.",
    whyItMatters:
      "Production applications commonly contain multiple authenticated and public routes.",
    prerequisites: ["react"],
    enables: ["full-stack-integration"],
    alternatives: [],
    related: ["authentication"],
    metadata: { phase: "react-development" },
  }),

  node({
    id: "react-data-fetching",
    title: "React Data Fetching",
    category: "frontend-framework",
    importance: "critical",
    description:
      "Fetch, cache, synchronize and mutate server data from frontend applications.",
    whyItMatters:
      "Most full-stack applications depend on reliable frontend-backend data synchronization.",
    prerequisites: ["react-hooks", "async-javascript"],
    enables: ["full-stack-data-flow"],
    alternatives: [],
    related: ["api-engineering"],
    metadata: { phase: "react-development" },
  }),

  node({
    id: "react-state-management",
    title: "React State Management",
    category: "frontend-framework",
    importance: "high",
    description: "Manage local, shared and server-related application state.",
    whyItMatters:
      "Correct state boundaries prevent frontend complexity from growing uncontrollably.",
    prerequisites: ["react-hooks"],
    enables: ["full-stack-data-flow"],
    alternatives: ["redux-awareness", "zustand-awareness"],
    related: ["frontend-architecture"],
    metadata: { phase: "react-development" },
  }),

  node({
    id: "vue",
    title: "Vue Awareness",
    category: "frontend-framework",
    importance: "medium",
    description: "Understand Vue as an alternative frontend framework.",
    whyItMatters: "Vue is used across many frontend teams and products.",
    prerequisites: ["javascript"],
    enables: [],
    alternatives: ["react"],
    related: ["frontend-architecture"],
    metadata: {
      phase: "react-development",
      optional: true,
    },
  }),

  node({
    id: "angular",
    title: "Angular Awareness",
    category: "frontend-framework",
    importance: "medium",
    description:
      "Understand Angular as an alternative enterprise frontend framework.",
    whyItMatters:
      "Angular remains relevant in enterprise frontend environments.",
    prerequisites: ["javascript", "typescript"],
    enables: [],
    alternatives: ["react"],
    related: ["frontend-architecture"],
    metadata: {
      phase: "react-development",
      optional: true,
    },
  }),

  node({
    id: "redux-awareness",
    title: "Redux Awareness",
    category: "frontend-framework",
    importance: "medium",
    description:
      "Understand centralized state management concepts using Redux.",
    whyItMatters: "Redux remains common in large React applications.",
    prerequisites: ["react-state-management"],
    enables: [],
    alternatives: ["zustand-awareness"],
    related: ["frontend-architecture"],
    metadata: {
      phase: "react-development",
      optional: true,
    },
  }),

  node({
    id: "zustand-awareness",
    title: "Zustand Awareness",
    category: "frontend-framework",
    importance: "medium",
    description: "Understand lightweight global state management with Zustand.",
    whyItMatters:
      "Lightweight state management can simplify applications that do not need a larger state architecture.",
    prerequisites: ["react-state-management"],
    enables: [],
    alternatives: ["redux-awareness"],
    related: ["frontend-architecture"],
    metadata: {
      phase: "react-development",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 5 — TYPESCRIPT
  // ============================================================

  node({
    id: "react-typescript",
    title: "React + TypeScript",
    category: "frontend",
    importance: "critical",
    description:
      "Build type-safe React components, hooks, props, forms and API integrations.",
    whyItMatters:
      "React + TypeScript is a strong production frontend combination.",
    prerequisites: ["react", "typescript"],
    enables: ["production-frontend"],
    alternatives: [],
    related: ["typed-node-backend"],
    metadata: {
      phase: "typescript",
      primary: true,
    },
  }),

  node({
    id: "typed-node-backend",
    title: "TypeScript Node.js Backend",
    category: "backend",
    importance: "critical",
    description: "Build type-safe Node.js services using TypeScript.",
    whyItMatters:
      "Using one language across frontend and backend can reduce context switching.",
    prerequisites: ["nodejs-runtime", "typescript"],
    enables: ["full-stack-integration"],
    alternatives: [],
    related: ["react-typescript"],
    metadata: {
      phase: "typescript",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 6 — PRODUCTION FRONTEND
  // ============================================================

  node({
    id: "frontend-architecture",
    title: "Frontend Architecture",
    category: "frontend-architecture",
    importance: "critical",
    description:
      "Organize frontend applications using maintainable component, feature and data-flow boundaries.",
    whyItMatters:
      "Large frontend applications require architecture beyond individual components.",
    prerequisites: ["react", "react-state-management", "javascript-modules"],
    enables: ["full-stack-integration", "production-frontend"],
    alternatives: [],
    related: ["design-systems"],
    metadata: {
      phase: "production-frontend",
      primary: true,
    },
  }),

  node({
    id: "production-frontend",
    title: "Production Frontend Engineering",
    category: "frontend-architecture",
    importance: "critical",
    description:
      "Combine accessibility, architecture, testing, performance and security into production frontend systems.",
    whyItMatters:
      "Production frontend engineering requires reliability beyond visual correctness.",
    prerequisites: [
      "frontend-architecture",
      "react-typescript",
      "accessibility",
    ],
    enables: ["full-stack-integration"],
    alternatives: [],
    related: ["frontend-testing", "frontend-performance", "web-security"],
    metadata: {
      phase: "production-frontend",
      primary: true,
    },
  }),

  node({
    id: "frontend-testing",
    title: "Frontend Testing",
    category: "testing",
    importance: "high",
    description:
      "Test components, user interactions, hooks and frontend workflows.",
    whyItMatters:
      "Automated frontend tests prevent regressions in user-facing behavior.",
    prerequisites: ["production-frontend"],
    enables: ["full-stack-testing"],
    alternatives: [],
    related: ["frontend-performance"],
    metadata: { phase: "production-frontend" },
  }),

  node({
    id: "frontend-performance",
    title: "Frontend Performance",
    category: "performance",
    importance: "high",
    description:
      "Optimize rendering, bundles, network usage, images, caching and client-side execution.",
    whyItMatters: "Frontend performance directly affects user experience.",
    prerequisites: ["production-frontend"],
    enables: ["full-stack-performance"],
    alternatives: [],
    related: ["react-data-fetching"],
    metadata: { phase: "production-frontend" },
  }),

  node({
    id: "web-security",
    title: "Frontend Web Security",
    category: "security",
    importance: "critical",
    description:
      "Understand XSS, CSRF, CORS, secure cookies, content security and browser security boundaries.",
    whyItMatters:
      "Frontend applications interact directly with untrusted browser environments.",
    prerequisites: ["production-frontend"],
    enables: ["full-stack-security"],
    alternatives: [],
    related: ["authentication"],
    metadata: { phase: "production-frontend" },
  }),

  node({
    id: "design-systems",
    title: "Design Systems",
    category: "frontend",
    importance: "medium",
    description:
      "Create reusable UI components, tokens, patterns and consistent product interfaces.",
    whyItMatters:
      "Design systems improve consistency and development speed in larger products.",
    prerequisites: ["frontend-architecture"],
    enables: [],
    alternatives: [],
    related: ["production-frontend"],
    metadata: {
      phase: "production-frontend",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 7 — BACKEND FOUNDATION
  // ============================================================

  node({
    id: "backend-foundation",
    title: "Backend Engineering Foundation",
    category: "backend",
    importance: "critical",
    description:
      "Understand servers, requests, responses, processes, APIs, middleware and backend architecture.",
    whyItMatters:
      "Full-stack engineers must understand the server-side half of their applications.",
    prerequisites: ["web-fundamentals", "javascript", "async-javascript"],
    enables: ["nodejs-runtime", "api-engineering"],
    alternatives: ["python-backend", "java-backend"],
    related: ["full-stack-integration"],
    metadata: {
      phase: "backend-foundation",
      primary: true,
    },
  }),

  node({
    id: "nodejs-runtime",
    title: "Node.js Runtime",
    category: "backend",
    importance: "critical",
    description:
      "Understand Node.js runtime behavior, event loop, modules, streams, processes and asynchronous I/O.",
    whyItMatters:
      "Node.js is the primary backend runtime for the MERN-oriented full-stack path.",
    prerequisites: [
      "backend-foundation",
      "javascript-modules",
      "async-javascript",
    ],
    enables: ["express-backend", "backend-concurrency"],
    alternatives: [],
    related: ["typed-node-backend"],
    metadata: {
      phase: "nodejs-backend",
      primary: true,
    },
  }),

  node({
    id: "express-backend",
    title: "Express.js",
    category: "backend",
    importance: "critical",
    description:
      "Build HTTP APIs using routing, middleware, validation, error handling and service organization.",
    whyItMatters: "Express provides a practical Node.js API development path.",
    prerequisites: ["nodejs-runtime", "api-engineering"],
    enables: ["rest-api", "backend-architecture"],
    alternatives: [],
    related: ["typed-node-backend"],
    metadata: {
      phase: "nodejs-backend",
      primary: true,
    },
  }),

  node({
    id: "backend-concurrency",
    title: "Backend Concurrency",
    category: "backend",
    importance: "high",
    description:
      "Understand asynchronous I/O, concurrent requests, workers and background processing.",
    whyItMatters:
      "Backend services must safely handle many operations without blocking critical paths.",
    prerequisites: ["nodejs-runtime"],
    enables: ["background-jobs"],
    alternatives: [],
    related: ["distributed-systems"],
    metadata: { phase: "nodejs-backend" },
  }),

  // ============================================================
  // PHASE 8 — API ENGINEERING
  // ============================================================

  node({
    id: "api-engineering",
    title: "API Engineering",
    category: "backend",
    importance: "critical",
    description:
      "Design API contracts, request validation, responses, errors, pagination, filtering and versioning.",
    whyItMatters:
      "APIs are the primary boundary between frontend and backend systems.",
    prerequisites: ["backend-foundation", "http-and-apis"],
    enables: ["rest-api", "api-validation", "api-pagination"],
    alternatives: ["graphql-api", "grpc-api"],
    related: ["authentication"],
    metadata: {
      phase: "api-engineering",
      primary: true,
    },
  }),

  node({
    id: "http-and-apis",
    title: "HTTP & APIs",
    category: "backend",
    importance: "critical",
    description:
      "Understand HTTP methods, status codes, headers, cookies, content types and API communication.",
    whyItMatters: "HTTP is the communication foundation of most web APIs.",
    prerequisites: ["web-fundamentals"],
    enables: ["api-engineering"],
    alternatives: [],
    related: ["networking-foundation"],
    metadata: { phase: "api-engineering" },
  }),

  node({
    id: "rest-api",
    title: "REST API Development",
    category: "backend",
    importance: "critical",
    description:
      "Design resource-oriented REST APIs with predictable contracts and HTTP semantics.",
    whyItMatters: "REST remains a dominant API style for web applications.",
    prerequisites: ["api-engineering", "express-backend"],
    enables: ["full-stack-integration"],
    alternatives: ["graphql-api", "grpc-api"],
    related: ["api-security"],
    metadata: {
      phase: "api-engineering",
      primary: true,
    },
  }),

  node({
    id: "graphql-api",
    title: "GraphQL API Awareness",
    category: "backend",
    importance: "medium",
    description:
      "Understand GraphQL schemas, resolvers, queries and mutations.",
    whyItMatters:
      "GraphQL is useful for applications that benefit from flexible data querying.",
    prerequisites: ["api-engineering"],
    enables: [],
    alternatives: ["rest-api"],
    related: ["full-stack-data-flow"],
    metadata: {
      phase: "api-engineering",
      optional: true,
    },
  }),

  node({
    id: "grpc-api",
    title: "gRPC API Awareness",
    category: "backend",
    importance: "medium",
    description:
      "Understand gRPC contracts and service-to-service communication.",
    whyItMatters: "gRPC can be valuable for internal distributed systems.",
    prerequisites: ["api-engineering"],
    enables: [],
    alternatives: ["rest-api"],
    related: ["microservices"],
    metadata: {
      phase: "api-engineering",
      optional: true,
    },
  }),

  node({
    id: "api-validation",
    title: "API Validation",
    category: "backend",
    importance: "critical",
    description:
      "Validate request bodies, query parameters, route parameters and API contracts.",
    whyItMatters:
      "Validation protects APIs from invalid and potentially malicious input.",
    prerequisites: ["api-engineering"],
    enables: ["authentication"],
    alternatives: [],
    related: ["full-stack-security"],
    metadata: { phase: "api-engineering" },
  }),

  node({
    id: "api-pagination",
    title: "API Pagination & Filtering",
    category: "backend",
    importance: "high",
    description:
      "Implement pagination, filtering, sorting and search APIs efficiently.",
    whyItMatters:
      "Large datasets cannot safely be returned in a single request.",
    prerequisites: ["api-engineering"],
    enables: ["full-stack-performance"],
    alternatives: [],
    related: ["database-querying"],
    metadata: { phase: "api-engineering" },
  }),

  // ============================================================
  // PHASE 9 — DATABASE ENGINEERING
  // ============================================================

  node({
    id: "database-engineering",
    title: "Database Engineering",
    category: "database",
    importance: "critical",
    description:
      "Understand data modeling, schemas, indexes, queries, transactions and database trade-offs.",
    whyItMatters:
      "Most full-stack applications depend heavily on persistent data.",
    prerequisites: ["backend-foundation", "api-engineering"],
    enables: [
      "postgresql",
      "mongodb",
      "database-querying",
      "database-transactions",
    ],
    alternatives: [],
    related: ["redis"],
    metadata: {
      phase: "database-engineering",
      primary: true,
    },
  }),

  node({
    id: "postgresql",
    title: "PostgreSQL",
    category: "database",
    importance: "critical",
    description:
      "Use PostgreSQL for relational modeling, SQL queries, indexes and transactions.",
    whyItMatters:
      "PostgreSQL is a strong production default for relational application data.",
    prerequisites: ["database-engineering"],
    enables: ["database-querying", "database-transactions"],
    alternatives: ["mysql", "sql-server"],
    related: ["data-modeling"],
    metadata: {
      phase: "database-engineering",
      primary: true,
    },
  }),

  node({
    id: "mongodb",
    title: "MongoDB",
    category: "database",
    importance: "critical",
    description:
      "Use MongoDB for document modeling, queries, indexes and application data.",
    whyItMatters: "MongoDB is the primary NoSQL database in the MERN path.",
    prerequisites: ["database-engineering"],
    enables: ["database-querying", "database-transactions"],
    alternatives: [],
    related: ["mern-stack"],
    metadata: {
      phase: "database-engineering",
      primary: true,
    },
  }),

  node({
    id: "mysql",
    title: "MySQL Awareness",
    category: "database",
    importance: "medium",
    description: "Understand MySQL as an alternative relational database.",
    whyItMatters: "MySQL remains widely deployed in production systems.",
    prerequisites: ["database-engineering"],
    enables: [],
    alternatives: ["postgresql"],
    related: ["database-querying"],
    metadata: {
      phase: "database-engineering",
      optional: true,
    },
  }),

  node({
    id: "sql-server",
    title: "SQL Server Awareness",
    category: "database",
    importance: "medium",
    description:
      "Understand Microsoft SQL Server as an enterprise relational database.",
    whyItMatters: "SQL Server is common in enterprise environments.",
    prerequisites: ["database-engineering"],
    enables: [],
    alternatives: ["postgresql"],
    related: ["java-backend"],
    metadata: {
      phase: "database-engineering",
      optional: true,
    },
  }),

  node({
    id: "database-querying",
    title: "Database Querying & Optimization",
    category: "database",
    importance: "critical",
    description:
      "Write efficient queries, use indexes and understand query execution behavior.",
    whyItMatters:
      "Poor database queries are a common cause of production performance problems.",
    prerequisites: ["postgresql", "mongodb"],
    enables: ["full-stack-performance"],
    alternatives: [],
    related: ["api-pagination"],
    metadata: { phase: "database-engineering" },
  }),

  node({
    id: "database-transactions",
    title: "Database Transactions",
    category: "database",
    importance: "critical",
    description:
      "Understand atomic operations, consistency and transaction boundaries.",
    whyItMatters:
      "Transactions protect important business operations from partial updates.",
    prerequisites: ["postgresql", "mongodb"],
    enables: ["full-stack-architecture"],
    alternatives: [],
    related: ["distributed-systems"],
    metadata: { phase: "database-engineering" },
  }),

  // ============================================================
  // PHASE 10 — AUTHENTICATION & SECURITY
  // ============================================================

  node({
    id: "authentication",
    title: "Authentication",
    category: "security",
    importance: "critical",
    description:
      "Implement secure login, sessions, JWTs, password handling and authentication flows.",
    whyItMatters:
      "Most production applications need secure user identity management.",
    prerequisites: ["api-validation", "rest-api"],
    enables: ["authorization", "oauth-oidc"],
    alternatives: [],
    related: ["web-security"],
    metadata: {
      phase: "authentication-security",
      primary: true,
    },
  }),

  node({
    id: "authorization",
    title: "Authorization",
    category: "security",
    importance: "critical",
    description:
      "Implement roles, permissions, ownership checks and least-privilege access.",
    whyItMatters:
      "Authentication identifies users; authorization determines what they may do.",
    prerequisites: ["authentication"],
    enables: ["full-stack-security"],
    alternatives: [],
    related: ["rbac"],
    metadata: { phase: "authentication-security" },
  }),

  node({
    id: "oauth-oidc",
    title: "OAuth & OpenID Connect",
    category: "security",
    importance: "high",
    description:
      "Understand delegated authorization, identity federation and modern login flows.",
    whyItMatters:
      "OAuth/OIDC are widely used for third-party and enterprise authentication.",
    prerequisites: ["authentication"],
    enables: ["full-stack-integration"],
    alternatives: [],
    related: ["identity-management"],
    metadata: { phase: "authentication-security" },
  }),

  node({
    id: "rbac",
    title: "Role-Based Access Control",
    category: "security",
    importance: "high",
    description: "Implement role and permission-based access control.",
    whyItMatters:
      "RBAC provides a practical authorization model for many applications.",
    prerequisites: ["authorization"],
    enables: ["full-stack-security"],
    alternatives: [],
    related: ["identity-management"],
    metadata: { phase: "authentication-security" },
  }),

  node({
    id: "identity-management",
    title: "Identity Management",
    category: "security",
    importance: "high",
    description:
      "Understand user identities, sessions, federation and account lifecycle management.",
    whyItMatters:
      "Identity becomes increasingly important as applications grow.",
    prerequisites: ["oauth-oidc", "authorization"],
    enables: ["full-stack-security"],
    alternatives: [],
    related: ["cloud-security"],
    metadata: { phase: "authentication-security" },
  }),

  // ============================================================
  // PHASE 11 — FULL STACK INTEGRATION
  // ============================================================

  node({
    id: "full-stack-integration",
    title: "Full Stack Application Integration",
    category: "full-stack",
    importance: "critical",
    description:
      "Connect React, APIs, authentication, databases and backend services into complete applications.",
    whyItMatters:
      "This is where frontend and backend knowledge becomes one product.",
    prerequisites: [
      "production-frontend",
      "rest-api",
      "postgresql",
      "mongodb",
      "authentication",
    ],
    enables: ["full-stack-data-flow", "real-world-features", "mern-stack"],
    alternatives: [],
    related: ["pern-stack", "mean-stack"],
    metadata: {
      phase: "full-stack-integration",
      primary: true,
    },
  }),

  node({
    id: "mern-stack",
    title: "MERN Stack",
    category: "full-stack",
    importance: "critical",
    description:
      "Build full-stack applications with MongoDB, Express.js, React and Node.js.",
    whyItMatters:
      "MERN is the primary JavaScript full-stack path in this roadmap.",
    prerequisites: ["mongodb", "express-backend", "react", "nodejs-runtime"],
    enables: ["production-full-stack"],
    alternatives: ["pern-stack", "mean-stack"],
    related: ["typescript"],
    metadata: {
      phase: "full-stack-integration",
      primary: true,
    },
  }),

  node({
    id: "pern-stack",
    title: "PERN Stack",
    category: "full-stack",
    importance: "medium",
    description:
      "Build applications using PostgreSQL, Express.js, React and Node.js.",
    whyItMatters:
      "PERN is a strong alternative when relational data modeling is preferred.",
    prerequisites: ["postgresql", "express-backend", "react", "nodejs-runtime"],
    enables: [],
    alternatives: ["mern-stack"],
    related: ["database-transactions"],
    metadata: {
      phase: "full-stack-integration",
      optional: true,
    },
  }),

  node({
    id: "mean-stack",
    title: "MEAN Stack",
    category: "full-stack",
    importance: "medium",
    description:
      "Build applications using MongoDB, Express.js, Angular and Node.js.",
    whyItMatters:
      "MEAN is an alternative enterprise-oriented JavaScript stack.",
    prerequisites: ["mongodb", "express-backend", "angular", "nodejs-runtime"],
    enables: [],
    alternatives: ["mern-stack"],
    related: ["typescript"],
    metadata: {
      phase: "full-stack-integration",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 12 — DATA FLOW
  // ============================================================

  node({
    id: "full-stack-data-flow",
    title: "Full Stack Data Flow",
    category: "full-stack",
    importance: "critical",
    description:
      "Design client state, server state, API synchronization, caching and optimistic updates.",
    whyItMatters:
      "Predictable data flow is essential for complex applications.",
    prerequisites: [
      "react-data-fetching",
      "react-state-management",
      "full-stack-integration",
    ],
    enables: ["real-world-features"],
    alternatives: [],
    related: ["caching"],
    metadata: { phase: "full-stack-data-flow" },
  }),

  // ============================================================
  // PHASE 13 — REAL-WORLD FEATURES
  // ============================================================

  node({
    id: "real-world-features",
    title: "Real-World Application Features",
    category: "full-stack",
    importance: "critical",
    description:
      "Build uploads, search, email, notifications, payments, third-party integrations and business workflows.",
    whyItMatters: "Production applications require capabilities beyond CRUD.",
    prerequisites: ["full-stack-integration", "full-stack-data-flow"],
    enables: ["background-jobs", "realtime"],
    alternatives: [],
    related: ["object-storage"],
    metadata: {
      phase: "real-world-application-features",
      primary: true,
    },
  }),

  node({
    id: "object-storage",
    title: "Object Storage",
    category: "backend",
    importance: "high",
    description:
      "Store user uploads and application assets using scalable object storage.",
    whyItMatters:
      "Large files should generally not be stored directly inside application databases.",
    prerequisites: ["real-world-features"],
    enables: ["cloud-deployment"],
    alternatives: [],
    related: ["aws-s3"],
    metadata: { phase: "real-world-application-features" },
  }),

  node({
    id: "background-jobs",
    title: "Background Jobs",
    category: "backend",
    importance: "critical",
    description:
      "Move slow or asynchronous work into workers and background job systems.",
    whyItMatters:
      "Background processing prevents long-running tasks from blocking user requests.",
    prerequisites: ["backend-concurrency", "real-world-features"],
    enables: ["caching-and-queues"],
    alternatives: [],
    related: ["queues"],
    metadata: { phase: "real-world-application-features" },
  }),

  node({
    id: "realtime",
    title: "Realtime Applications",
    category: "realtime",
    importance: "high",
    description:
      "Build chat, live notifications, dashboards and collaborative features.",
    whyItMatters: "Realtime behavior is common in modern products.",
    prerequisites: ["real-world-features", "full-stack-integration"],
    enables: ["realtime-architecture"],
    alternatives: [],
    related: ["websockets"],
    metadata: { phase: "realtime-systems" },
  }),

  // ============================================================
  // PHASE 14 — TESTING
  // ============================================================

  node({
    id: "full-stack-testing",
    title: "Full Stack Testing",
    category: "testing",
    importance: "critical",
    description:
      "Test frontend behavior, backend logic, APIs, databases and complete user workflows.",
    whyItMatters:
      "Production applications need confidence across the entire stack.",
    prerequisites: ["frontend-testing", "rest-api", "database-querying"],
    enables: ["ci-cd"],
    alternatives: [],
    related: ["production-full-stack"],
    metadata: {
      phase: "full-stack-testing",
      primary: true,
    },
  }),

  node({
    id: "integration-testing",
    title: "Integration Testing",
    category: "testing",
    importance: "critical",
    description:
      "Test interactions between APIs, databases, services and application components.",
    whyItMatters:
      "Integration failures often occur even when individual units work correctly.",
    prerequisites: ["full-stack-testing"],
    enables: ["ci-cd"],
    alternatives: [],
    related: ["microservices"],
    metadata: { phase: "full-stack-testing" },
  }),

  node({
    id: "end-to-end-testing",
    title: "End-to-End Testing",
    category: "testing",
    importance: "high",
    description:
      "Validate complete user journeys across frontend and backend systems.",
    whyItMatters:
      "E2E tests verify that the complete application works from the user's perspective.",
    prerequisites: ["full-stack-testing", "integration-testing"],
    enables: ["ci-cd"],
    alternatives: [],
    related: ["production-full-stack"],
    metadata: { phase: "full-stack-testing" },
  }),

  // ============================================================
  // PHASE 15 — PERFORMANCE
  // ============================================================

  node({
    id: "full-stack-performance",
    title: "Full Stack Performance",
    category: "performance",
    importance: "critical",
    description:
      "Optimize frontend rendering, APIs, database queries, network usage and backend workloads.",
    whyItMatters:
      "Performance must be optimized across the entire request path.",
    prerequisites: [
      "frontend-performance",
      "database-querying",
      "api-pagination",
    ],
    enables: ["caching", "full-stack-scalability"],
    alternatives: [],
    related: ["observability"],
    metadata: {
      phase: "full-stack-performance",
      primary: true,
    },
  }),

  node({
    id: "caching",
    title: "Caching",
    category: "performance",
    importance: "critical",
    description:
      "Cache frequently accessed data and expensive operations using appropriate cache strategies.",
    whyItMatters: "Caching can significantly reduce latency and database load.",
    prerequisites: ["full-stack-performance"],
    enables: ["full-stack-scalability"],
    alternatives: [],
    related: ["redis"],
    metadata: { phase: "full-stack-performance" },
  }),

  // ============================================================
  // PHASE 16 — CACHING & BACKGROUND PROCESSING
  // ============================================================

  node({
    id: "caching-and-queues",
    title: "Caching & Message Queues",
    category: "backend",
    importance: "critical",
    description:
      "Use Redis, queues and workers for caching, asynchronous processing and workload isolation.",
    whyItMatters:
      "Queues and caching become essential as application complexity and traffic increase.",
    prerequisites: ["caching", "background-jobs"],
    enables: ["full-stack-scalability", "distributed-systems"],
    alternatives: ["rabbitmq", "kafka", "cloud-queues"],
    related: ["microservices"],
    metadata: {
      phase: "caching-and-background-processing",
      primary: true,
    },
  }),

  node({
    id: "redis",
    title: "Redis",
    category: "infrastructure",
    importance: "critical",
    description:
      "Use Redis for caching, rate limiting, ephemeral state and background-job infrastructure.",
    whyItMatters:
      "Redis is a common building block in production web applications.",
    prerequisites: ["database-engineering"],
    enables: ["caching-and-queues"],
    alternatives: [],
    related: ["caching"],
    metadata: {
      phase: "caching-and-background-processing",
      primary: true,
    },
  }),

  node({
    id: "queues",
    title: "Message Queues",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Understand producers, consumers, retries, acknowledgements and asynchronous message processing.",
    whyItMatters: "Queues decouple workloads and improve resilience.",
    prerequisites: ["background-jobs"],
    enables: ["distributed-systems"],
    alternatives: ["rabbitmq", "kafka", "cloud-queues"],
    related: ["microservices"],
    metadata: { phase: "caching-and-background-processing" },
  }),

  node({
    id: "rabbitmq",
    title: "RabbitMQ Awareness",
    category: "distributed-systems",
    importance: "medium",
    description: "Understand RabbitMQ as a message-broker option.",
    whyItMatters:
      "RabbitMQ is useful for reliable application messaging workflows.",
    prerequisites: ["queues"],
    enables: [],
    alternatives: ["kafka", "cloud-queues"],
    related: ["microservices"],
    metadata: {
      phase: "caching-and-background-processing",
      optional: true,
    },
  }),

  node({
    id: "kafka",
    title: "Apache Kafka Awareness",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand Kafka topics, partitions, producers, consumers and event streaming.",
    whyItMatters:
      "Kafka is important for event-driven and high-throughput distributed systems.",
    prerequisites: ["queues"],
    enables: ["event-driven-architecture"],
    alternatives: ["rabbitmq", "cloud-queues"],
    related: ["microservices"],
    metadata: {
      phase: "caching-and-background-processing",
      optional: true,
    },
  }),

  node({
    id: "cloud-queues",
    title: "Cloud Queue Awareness",
    category: "distributed-systems",
    importance: "medium",
    description:
      "Understand managed cloud queue services as an alternative to self-managed brokers.",
    whyItMatters: "Managed queues can reduce operational complexity.",
    prerequisites: ["queues"],
    enables: [],
    alternatives: ["rabbitmq", "kafka"],
    related: ["cloud-deployment"],
    metadata: {
      phase: "caching-and-background-processing",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 17 — REALTIME
  // ============================================================

  node({
    id: "websockets",
    title: "WebSockets",
    category: "realtime",
    importance: "high",
    description:
      "Build persistent bidirectional communication between clients and servers.",
    whyItMatters:
      "WebSockets are useful for chat, live notifications and collaborative applications.",
    prerequisites: ["realtime"],
    enables: ["realtime-architecture"],
    alternatives: ["server-sent-events"],
    related: ["scaling-realtime"],
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
      "SSE can be simpler than WebSockets for one-way realtime updates.",
    prerequisites: ["realtime"],
    enables: ["realtime-architecture"],
    alternatives: ["websockets"],
    related: ["api-engineering"],
    metadata: {
      phase: "realtime-systems",
      optional: true,
    },
  }),

  node({
    id: "realtime-architecture",
    title: "Realtime Architecture",
    category: "realtime",
    importance: "high",
    description:
      "Design scalable realtime systems using connections, pub/sub, state and horizontal scaling.",
    whyItMatters:
      "Realtime systems become more complex when multiple application instances are involved.",
    prerequisites: ["websockets", "realtime"],
    enables: ["full-stack-scalability"],
    alternatives: [],
    related: ["redis"],
    metadata: { phase: "realtime-systems" },
  }),

  // ============================================================
  // PHASE 18 — DEVOPS FOUNDATION
  // ============================================================

  node({
    id: "devops-foundation",
    title: "DevOps Foundation",
    category: "devops",
    importance: "critical",
    description:
      "Learn Linux, Git, environment configuration, networking and deployment fundamentals.",
    whyItMatters:
      "Full-stack engineers should understand how their applications reach production.",
    prerequisites: ["full-stack-integration", "web-fundamentals"],
    enables: ["docker", "ci-cd"],
    alternatives: [],
    related: ["cloud-deployment"],
    metadata: {
      phase: "devops-foundation",
      primary: true,
    },
  }),

  node({
    id: "docker",
    title: "Docker",
    category: "devops",
    importance: "critical",
    description:
      "Containerize frontend and backend applications and understand images, containers, networks and volumes.",
    whyItMatters: "Containers create reproducible application environments.",
    prerequisites: ["devops-foundation"],
    enables: ["docker-compose", "cloud-deployment"],
    alternatives: ["podman"],
    related: ["microservices"],
    metadata: {
      phase: "docker-and-containers",
      primary: true,
    },
  }),

  node({
    id: "docker-compose",
    title: "Docker Compose",
    category: "devops",
    importance: "high",
    description:
      "Run multi-container development environments for frontend, backend, databases and supporting services.",
    whyItMatters:
      "Compose is useful for local development of multi-service applications.",
    prerequisites: ["docker"],
    enables: ["cloud-deployment"],
    alternatives: [],
    related: ["microservices"],
    metadata: { phase: "docker-and-containers" },
  }),

  node({
    id: "podman",
    title: "Podman Awareness",
    category: "devops",
    importance: "low",
    description: "Understand Podman as an alternative container engine.",
    whyItMatters: "Podman is relevant in some container environments.",
    prerequisites: ["docker"],
    enables: [],
    alternatives: ["docker"],
    related: ["cloud-native-full-stack"],
    metadata: {
      phase: "docker-and-containers",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 19 — CI/CD
  // ============================================================

  node({
    id: "ci-cd",
    title: "CI/CD",
    category: "devops",
    importance: "critical",
    description:
      "Automate testing, builds, security checks and application deployments.",
    whyItMatters:
      "Reliable delivery is essential for production software development.",
    prerequisites: ["devops-foundation", "full-stack-testing"],
    enables: ["cloud-deployment"],
    alternatives: ["gitlab-ci", "jenkins"],
    related: ["security-supply-chain"],
    metadata: {
      phase: "ci-cd",
      primary: true,
    },
  }),

  node({
    id: "gitlab-ci",
    title: "GitLab CI Awareness",
    category: "devops",
    importance: "medium",
    description: "Understand GitLab CI pipelines and deployment automation.",
    whyItMatters: "GitLab CI is widely used for software delivery.",
    prerequisites: ["ci-cd"],
    enables: [],
    alternatives: ["github-actions"],
    related: ["devsecops"],
    metadata: {
      phase: "ci-cd",
      optional: true,
    },
  }),

  node({
    id: "jenkins",
    title: "Jenkins Awareness",
    category: "devops",
    importance: "medium",
    description:
      "Understand Jenkins-based continuous integration and delivery.",
    whyItMatters:
      "Jenkins remains common in established enterprise environments.",
    prerequisites: ["ci-cd"],
    enables: [],
    alternatives: ["github-actions"],
    related: ["devsecops"],
    metadata: {
      phase: "ci-cd",
      optional: true,
    },
  }),

  node({
    id: "github-actions",
    title: "GitHub Actions",
    category: "devops",
    importance: "critical",
    description:
      "Build automated workflows for testing, packaging, security scanning and deployment.",
    whyItMatters: "GitHub Actions provides a practical primary CI/CD path.",
    prerequisites: ["ci-cd"],
    enables: ["cloud-deployment"],
    alternatives: ["gitlab-ci", "jenkins"],
    related: ["devsecops"],
    metadata: {
      phase: "ci-cd",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 20 — CLOUD
  // ============================================================

  node({
    id: "cloud-deployment",
    title: "Cloud Deployment",
    category: "cloud",
    importance: "critical",
    description:
      "Deploy applications using cloud compute, networking, databases, storage, DNS, TLS and monitoring.",
    whyItMatters:
      "Production applications need reliable hosting and infrastructure.",
    prerequisites: ["docker", "github-actions", "object-storage"],
    enables: ["observability", "cloud-native-full-stack"],
    alternatives: ["gcp-cloud", "azure-cloud"],
    related: ["aws"],
    metadata: {
      phase: "cloud-deployment",
      primary: true,
    },
  }),

  node({
    id: "aws",
    title: "AWS",
    category: "cloud",
    importance: "critical",
    description:
      "Learn core AWS compute, networking, storage, databases, IAM and deployment services.",
    whyItMatters: "AWS is the primary cloud platform in the roadmap.",
    prerequisites: ["cloud-deployment"],
    enables: ["cloud-native-full-stack"],
    alternatives: ["gcp-cloud", "azure-cloud"],
    related: ["devops-foundation"],
    metadata: {
      phase: "cloud-deployment",
      primary: true,
    },
  }),

  node({
    id: "gcp-cloud",
    title: "GCP Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand core Google Cloud services relevant to full-stack applications.",
    whyItMatters: "GCP is a strong alternative cloud platform.",
    prerequisites: ["cloud-deployment"],
    enables: [],
    alternatives: ["aws", "azure-cloud"],
    related: ["cloud-native-full-stack"],
    metadata: {
      phase: "cloud-deployment",
      optional: true,
    },
  }),

  node({
    id: "azure-cloud",
    title: "Azure Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand core Azure services relevant to full-stack applications.",
    whyItMatters: "Azure is important in enterprise environments.",
    prerequisites: ["cloud-deployment"],
    enables: [],
    alternatives: ["aws", "gcp-cloud"],
    related: ["cloud-native-full-stack"],
    metadata: {
      phase: "cloud-deployment",
      optional: true,
    },
  }),

  node({
    id: "aws-s3",
    title: "AWS S3",
    category: "cloud",
    importance: "high",
    description:
      "Use S3-style object storage for application files and assets.",
    whyItMatters: "Object storage is a common production requirement.",
    prerequisites: ["object-storage", "aws"],
    enables: ["cloud-native-full-stack"],
    alternatives: [],
    related: ["real-world-features"],
    metadata: { phase: "cloud-deployment" },
  }),

  // ============================================================
  // PHASE 21 — OBSERVABILITY
  // ============================================================

  node({
    id: "observability",
    title: "Production Observability",
    category: "observability",
    importance: "critical",
    description:
      "Implement logs, metrics, traces, health checks and alerts across frontend and backend systems.",
    whyItMatters:
      "You cannot reliably operate production systems without visibility into their behavior.",
    prerequisites: ["cloud-deployment", "full-stack-performance"],
    enables: ["full-stack-architecture"],
    alternatives: [],
    related: ["security-observability"],
    metadata: {
      phase: "observability",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 22 — ARCHITECTURE
  // ============================================================

  node({
    id: "backend-architecture",
    title: "Backend Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Organize backend systems into maintainable modules, layers and service boundaries.",
    whyItMatters:
      "Architecture determines how easily a backend can evolve as features increase.",
    prerequisites: ["express-backend", "database-querying"],
    enables: ["full-stack-architecture"],
    alternatives: [],
    related: ["microservices"],
    metadata: { phase: "full-stack-architecture" },
  }),

  node({
    id: "full-stack-architecture",
    title: "Full Stack Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Design complete application architecture spanning frontend, APIs, databases, caching, queues and infrastructure.",
    whyItMatters:
      "Experienced full-stack engineers need system-level design skills.",
    prerequisites: [
      "backend-architecture",
      "observability",
      "caching-and-queues",
    ],
    enables: ["full-stack-scalability", "microservices"],
    alternatives: [],
    related: ["full-stack-system-design"],
    metadata: {
      phase: "full-stack-architecture",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 23 — SCALABILITY
  // ============================================================

  node({
    id: "full-stack-scalability",
    title: "Full Stack Scalability",
    category: "architecture",
    importance: "critical",
    description:
      "Understand horizontal scaling, load balancing, caching, database scaling and asynchronous processing.",
    whyItMatters:
      "Applications need architectural strategies as traffic and data increase.",
    prerequisites: [
      "full-stack-architecture",
      "caching-and-queues",
      "realtime-architecture",
    ],
    enables: ["distributed-systems", "cloud-native-full-stack"],
    alternatives: [],
    related: ["microservices"],
    metadata: {
      phase: "full-stack-scalability",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 24 — MICROSERVICES
  // ============================================================

  node({
    id: "microservices",
    title: "Microservices",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand service decomposition, communication, service ownership, resilience and distributed data.",
    whyItMatters:
      "Microservices solve organizational and scaling problems but introduce distributed-system complexity.",
    prerequisites: [
      "full-stack-architecture",
      "full-stack-scalability",
      "distributed-systems",
    ],
    enables: ["cloud-native-full-stack"],
    alternatives: ["java-microservices", "go-microservices"],
    related: ["event-driven-architecture"],
    metadata: {
      phase: "microservices",
      primary: true,
    },
  }),

  node({
    id: "java-microservices",
    title: "Java / Spring Boot Microservices Awareness",
    category: "distributed-systems",
    importance: "medium",
    description:
      "Understand Java and Spring Boot as an alternative backend path for microservices.",
    whyItMatters: "Java is heavily used for enterprise distributed systems.",
    prerequisites: ["microservices"],
    enables: [],
    alternatives: ["microservices"],
    related: ["java-backend"],
    metadata: {
      phase: "microservices",
      optional: true,
    },
  }),

  node({
    id: "go-microservices",
    title: "Go Microservices Awareness",
    category: "distributed-systems",
    importance: "medium",
    description:
      "Understand Go as an alternative language for high-performance backend services.",
    whyItMatters:
      "Go is widely used for infrastructure and high-throughput services.",
    prerequisites: ["microservices"],
    enables: [],
    alternatives: ["microservices"],
    related: ["distributed-systems"],
    metadata: {
      phase: "microservices",
      optional: true,
    },
  }),

  node({
    id: "event-driven-architecture",
    title: "Event-Driven Architecture",
    category: "distributed-systems",
    importance: "high",
    description:
      "Design systems around events, producers, consumers and asynchronous workflows.",
    whyItMatters:
      "Event-driven architecture enables loose coupling and scalable workflows.",
    prerequisites: ["microservices", "kafka"],
    enables: ["distributed-systems"],
    alternatives: [],
    related: ["queues"],
    metadata: { phase: "microservices" },
  }),

  // ============================================================
  // PHASE 25 — DISTRIBUTED SYSTEMS
  // ============================================================

  node({
    id: "distributed-systems",
    title: "Distributed Systems",
    category: "distributed-systems",
    importance: "critical",
    description:
      "Understand consistency, availability, retries, timeouts, idempotency, messaging and distributed failures.",
    whyItMatters:
      "Modern full-stack systems increasingly span multiple services and machines.",
    prerequisites: ["full-stack-scalability", "caching-and-queues"],
    enables: [
      "microservices",
      "cloud-native-full-stack",
      "full-stack-system-design",
    ],
    alternatives: [],
    related: ["event-driven-architecture"],
    metadata: {
      phase: "distributed-systems",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 26 — CLOUD NATIVE
  // ============================================================

  node({
    id: "cloud-native-full-stack",
    title: "Cloud-Native Full Stack",
    category: "cloud",
    importance: "critical",
    description:
      "Combine managed cloud services, containers, orchestration, automation and scalable application architecture.",
    whyItMatters:
      "Cloud-native engineering goes beyond simply hosting an application on a VM.",
    prerequisites: [
      "aws",
      "docker",
      "distributed-systems",
      "full-stack-scalability",
    ],
    enables: ["full-stack-system-design"],
    alternatives: ["gcp-cloud", "azure-cloud"],
    related: ["kubernetes"],
    metadata: {
      phase: "cloud-native-full-stack",
      primary: true,
    },
  }),

  node({
    id: "kubernetes",
    title: "Kubernetes Awareness",
    category: "cloud",
    importance: "high",
    description:
      "Understand Kubernetes workloads, services, configuration and deployment concepts.",
    whyItMatters:
      "Kubernetes is widely used for operating containerized production systems.",
    prerequisites: ["docker", "cloud-native-full-stack"],
    enables: ["full-stack-system-design"],
    alternatives: [],
    related: ["microservices"],
    metadata: {
      phase: "cloud-native-full-stack",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 27 — SECURITY
  // ============================================================

  node({
    id: "full-stack-security",
    title: "Full Stack Security",
    category: "security",
    importance: "critical",
    description:
      "Apply secure coding, OWASP practices, API security, secrets management and cloud security across the stack.",
    whyItMatters:
      "Security must be part of full-stack engineering rather than an afterthought.",
    prerequisites: [
      "web-security",
      "authorization",
      "identity-management",
      "cloud-native-full-stack",
    ],
    enables: ["production-full-stack", "full-stack-system-design"],
    alternatives: [],
    related: ["devsecops"],
    metadata: {
      phase: "full-stack-security",
      primary: true,
    },
  }),

  node({
    id: "devsecops",
    title: "DevSecOps Awareness",
    category: "security",
    importance: "high",
    description:
      "Integrate security testing, dependency scanning, secrets detection and infrastructure security into CI/CD.",
    whyItMatters:
      "Security should be continuously checked during software delivery.",
    prerequisites: ["full-stack-security", "ci-cd"],
    enables: ["production-full-stack"],
    alternatives: [],
    related: ["security-supply-chain"],
    metadata: {
      phase: "full-stack-security",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 28 — AI
  // ============================================================

  node({
    id: "ai-powered-full-stack",
    title: "AI-Powered Full Stack Applications",
    category: "ai",
    importance: "critical",
    description:
      "Integrate LLM APIs, embeddings, structured outputs, RAG and tool calling into full-stack products.",
    whyItMatters:
      "AI capabilities are increasingly becoming application features rather than separate products.",
    prerequisites: ["full-stack-integration", "api-engineering"],
    enables: ["rag-integration", "ai-agents-integration"],
    alternatives: ["open-source-models"],
    related: ["gen-ai-llm-engineer"],
    metadata: {
      phase: "ai-powered-full-stack",
      primary: true,
    },
  }),

  node({
    id: "rag-integration",
    title: "RAG Integration",
    category: "ai",
    importance: "high",
    description:
      "Integrate retrieval-augmented generation into production full-stack applications.",
    whyItMatters:
      "RAG allows applications to ground model responses in application or organizational data.",
    prerequisites: ["ai-powered-full-stack"],
    enables: ["production-full-stack"],
    alternatives: [],
    related: ["vector-database"],
    metadata: { phase: "ai-powered-full-stack" },
  }),

  node({
    id: "ai-agents-integration",
    title: "AI Agent Integration",
    category: "ai",
    importance: "high",
    description:
      "Integrate tool-using AI workflows into full-stack products with controlled permissions.",
    whyItMatters:
      "Agents can automate multi-step workflows when used with appropriate controls.",
    prerequisites: ["ai-powered-full-stack"],
    enables: ["production-full-stack"],
    alternatives: [],
    related: ["full-stack-security"],
    metadata: { phase: "ai-powered-full-stack" },
  }),

  node({
    id: "open-source-models",
    title: "Open-Source Model Integration",
    category: "ai",
    importance: "medium",
    description:
      "Understand how full-stack applications can consume self-hosted or open-source models.",
    whyItMatters:
      "Some applications require more control over models, data or deployment.",
    prerequisites: ["ai-powered-full-stack"],
    enables: [],
    alternatives: ["ai-powered-full-stack"],
    related: ["cloud-native-full-stack"],
    metadata: {
      phase: "ai-powered-full-stack",
      optional: true,
    },
  }),

  node({
    id: "vector-database",
    title: "Vector Database Awareness",
    category: "ai",
    importance: "high",
    description:
      "Understand vector storage and similarity search for AI-powered applications.",
    whyItMatters:
      "Vector retrieval is a common building block for RAG systems.",
    prerequisites: ["rag-integration"],
    enables: ["production-full-stack"],
    alternatives: [],
    related: ["mongodb", "postgresql"],
    metadata: {
      phase: "ai-powered-full-stack",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 29 — SYSTEM DESIGN
  // ============================================================

  node({
    id: "full-stack-system-design",
    title: "Full Stack System Design",
    category: "system-design",
    importance: "critical",
    description:
      "Design scalable APIs, databases, caches, queues, storage, realtime systems and distributed architectures.",
    whyItMatters:
      "Senior full-stack engineers need to reason about complete systems and trade-offs.",
    prerequisites: [
      "distributed-systems",
      "cloud-native-full-stack",
      "full-stack-security",
    ],
    enables: ["production-full-stack"],
    alternatives: [],
    related: ["system-design-software-architecture"],
    metadata: {
      phase: "full-stack-system-design",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 30 — PRODUCTION ENGINEERING
  // ============================================================

  node({
    id: "production-full-stack",
    title: "Production Full Stack Engineering",
    category: "production",
    importance: "critical",
    description:
      "Combine frontend, backend, databases, security, testing, cloud, DevOps, observability and architecture into production systems.",
    whyItMatters:
      "This represents the complete professional full-stack engineering capability.",
    prerequisites: [
      "full-stack-system-design",
      "full-stack-security",
      "full-stack-testing",
      "observability",
      "ci-cd",
    ],
    enables: [],
    alternatives: [],
    related: [
      "mern-stack",
      "pern-stack",
      "mean-stack",
      "ai-powered-full-stack",
    ],
    metadata: {
      phase: "production-full-stack-engineering",
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
const nodeIds = new Set(fullStackDeveloperNodes.map((item) => item.id));

for (const item of fullStackDeveloperNodes) {
  const references = [
    ...(item.prerequisites || []),
    ...(item.enables || []),
    ...(item.alternatives || []),
    ...(item.related || []),
  ];

  for (const reference of references) {
    if (!nodeIds.has(reference)) {
      throw new Error(
        `[Full Stack Roadmap] Invalid node reference "${reference}" ` +
          `in node "${item.id}".`,
      );
    }
  }
}

export default fullStackDeveloperNodes;
export { fullStackDeveloperNodes };

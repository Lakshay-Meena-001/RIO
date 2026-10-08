import { createRoadmapTemplate } from "../../factory.js";

import systemDesignSoftwareArchitecturePhases from "./phase.js";
import systemDesignSoftwareArchitectureNodes from "./node.js";
import systemDesignSoftwareArchitectureEdges from "./edge.js";

const systemDesignSoftwareArchitectureRoadmap = createRoadmapTemplate({
  id: "system-design-software-architecture",
  version: 1,
  type: "career-roadmap",

  title: "System Design / Software Architecture",

  description:
    "A comprehensive system design and software architecture roadmap covering requirements engineering, capacity estimation, networking, API design, databases, caching, load balancing, storage, messaging, distributed systems, consistency, reliability, observability, security, scalability, high availability, microservices, event-driven architecture, realtime systems, search, rate limiting, cloud architecture, data-intensive systems, software architecture, low-level design, design patterns, domain-driven design, production architecture and senior-level system design.",

  goal: "Build the ability to analyze requirements, design scalable and reliable software systems, make architecture trade-offs, communicate technical decisions, and evolve production systems from application-level architecture to distributed systems.",

  nodes: systemDesignSoftwareArchitectureNodes,

  edges: systemDesignSoftwareArchitectureEdges,

  alternatives: [
    {
      id: "architecture-first",
      title: "Architecture-First Path",
      type: "primary",
      description:
        "The primary path focuses on requirements, HLD, distributed systems, cloud architecture, reliability, security and production trade-offs.",
      technologyPath: [
        "Requirements Engineering",
        "Capacity Estimation",
        "API Design",
        "Databases",
        "Caching",
        "Load Balancing",
        "Messaging",
        "Distributed Systems",
        "Cloud Architecture",
        "Observability",
        "Security",
        "System Design",
      ],
    },

    {
      id: "backend-system-design",
      title: "Backend-Oriented System Design",
      type: "alternative",
      description:
        "Backend engineers can enter system design through APIs, databases, caching, messaging, microservices and distributed systems.",
      technologyPath: [
        "REST",
        "Node.js / Java / Go / Python",
        "SQL",
        "NoSQL",
        "Redis",
        "Kafka",
        "Microservices",
        "Cloud",
      ],
    },

    {
      id: "cloud-architecture",
      title: "Cloud Architecture Path",
      type: "alternative",
      description:
        "Emphasizes cloud infrastructure, managed services, networking, reliability, security and cost-aware architecture.",
      technologyPath: [
        "AWS",
        "GCP",
        "Azure",
        "Networking",
        "Load Balancing",
        "Object Storage",
        "Managed Databases",
        "Queues",
        "Observability",
        "Disaster Recovery",
      ],
    },

    {
      id: "distributed-systems",
      title: "Distributed Systems Path",
      type: "advanced",
      description:
        "Deeper path for engineers working on high-scale distributed platforms and infrastructure.",
      technologyPath: [
        "Replication",
        "Partitioning",
        "Sharding",
        "Consistency",
        "Consensus",
        "Distributed Coordination",
        "Event Streaming",
        "Distributed Transactions",
        "Fault Tolerance",
      ],
    },

    {
      id: "low-level-design",
      title: "Low-Level Design Path",
      type: "alternative",
      description:
        "Implementation-oriented architecture path covering OOP, SOLID, design patterns, modularity and domain modeling.",
      technologyPath: [
        "OOP",
        "SOLID",
        "Design Patterns",
        "Clean Architecture",
        "Hexagonal Architecture",
        "Domain-Driven Design",
      ],
    },

    {
      id: "microservices-architecture",
      title: "Microservices Architecture Path",
      type: "advanced",
      description:
        "Advanced architecture path for systems where independent services, deployment and scaling are justified by requirements.",
      technologyPath: [
        "Service Boundaries",
        "REST / gRPC",
        "Service Discovery",
        "Message Brokers",
        "Distributed Transactions",
        "Event-Driven Architecture",
        "Observability",
        "Containerization",
        "Kubernetes",
      ],
    },

    {
      id: "event-driven-architecture",
      title: "Event-Driven Architecture Path",
      type: "advanced",
      description:
        "Specialized path for asynchronous, high-throughput and loosely coupled systems.",
      technologyPath: [
        "Message Queues",
        "Kafka",
        "Pub/Sub",
        "Event Schemas",
        "Event Sourcing",
        "CQRS",
        "Stream Processing",
      ],
    },

    {
      id: "realtime-systems",
      title: "Realtime Systems Path",
      type: "specialization",
      description:
        "Specialization for chat, collaboration, notifications, live updates and other realtime workloads.",
      technologyPath: [
        "WebSockets",
        "SSE",
        "Pub/Sub",
        "Redis",
        "Connection Management",
        "Realtime Scaling",
      ],
    },
  ],

  metadata: {
    domain: "system-design-software-architecture",

    careerRoles: [
      "Software Engineer",
      "SDE-2",
      "Senior Software Engineer",
      "Backend Engineer",
      "Distributed Systems Engineer",
      "Cloud Architect",
      "Software Architect",
      "Platform Engineer",
      "Solutions Architect",
      "Staff Software Engineer",
    ],

    primaryTechnologyPath: {
      requirements: "Functional + Non-Functional Requirements",

      estimation: "Back-of-the-Envelope Capacity Estimation",

      networking: "DNS + HTTP/HTTPS + TCP + TLS",

      api: "REST",

      relationalDatabase: "PostgreSQL / SQL",

      documentDatabase: "MongoDB / Document Database",

      cache: "Redis",

      loadBalancing: "Reverse Proxy + Load Balancer",

      storage: "Object Storage + CDN",

      messaging: "Kafka / Managed Queue",

      architecture: "Modular Monolith → Services → Microservices",

      cloud: "AWS",

      observability: "Logs + Metrics + Distributed Tracing",

      security: "Authentication + Authorization + Encryption + Threat Modeling",

      reliability: "Timeouts + Retries + Circuit Breakers + Redundancy",

      advanced:
        "Distributed Systems + Event-Driven Architecture + Cloud-Native Systems",
    },

    alternativeTechnologyPaths: {
      api: ["REST", "GraphQL", "gRPC"],

      databases: [
        "PostgreSQL",
        "MySQL",
        "SQL Server",
        "MongoDB",
        "Distributed Databases",
      ],

      cache: ["Redis", "Memcached", "CDN", "Application Cache"],

      messaging: ["Kafka", "RabbitMQ", "Cloud Messaging"],

      cloud: ["AWS", "GCP", "Azure"],

      architecture: [
        "Monolith",
        "Modular Monolith",
        "Microservices",
        "Serverless",
        "Event-Driven",
        "Service-Oriented Architecture",
      ],

      observability: [
        "OpenTelemetry",
        "Prometheus",
        "Grafana",
        "Cloud Observability Platforms",
      ],

      softwareArchitecture: [
        "Layered Architecture",
        "Clean Architecture",
        "Hexagonal Architecture",
        "Domain-Driven Design",
      ],
    },

    technologyStrategy: {
      rule: "Learn system-design principles first and use technologies as implementation examples. Do not memorize vendor-specific architectures as universal solutions.",

      primaryCloud: "AWS",

      alternativeClouds: ["GCP", "Azure"],

      primaryApi: "REST",

      apiAlternatives: ["GraphQL", "gRPC"],

      primaryDatabase: "SQL",

      databaseAlternatives: ["NoSQL", "Distributed Databases"],

      primaryCache: "Redis",

      primaryMessaging: "Kafka / Managed Queues",

      architectureProgression:
        "Layered Application → Modular Monolith → Services → Microservices when justified",

      distributedSystemsProgression:
        "Replication → Partitioning → Consistency → Messaging → Failure Handling → Coordination",

      interviewProgression:
        "Requirements → Estimation → High-Level Design → Deep Dives → Trade-offs → Bottlenecks → Reliability",

      seniorProgression:
        "System Design → Architecture Decisions → Production Architecture → Distributed Systems → Architecture Evolution",
    },

    progression: systemDesignSoftwareArchitecturePhases.map((phase) => ({
      order: phase.order,
      id: phase.id,
      title: phase.title,
    })),

    phases: systemDesignSoftwareArchitecturePhases,

    roadmapPrinciples: [
      "Start with requirements before choosing technologies.",
      "Separate functional requirements from non-functional requirements.",
      "Use capacity estimation to justify architectural decisions.",
      "Understand networking before reasoning about distributed communication.",
      "Learn API design as a system boundary rather than merely endpoint syntax.",
      "Choose databases based on workload and access patterns.",
      "Understand indexing before prematurely introducing database sharding.",
      "Use caching to solve specific latency or load problems.",
      "Understand cache invalidation and consistency trade-offs.",
      "Use load balancing for horizontal scaling and availability.",
      "Prefer object storage for large files instead of transactional databases.",
      "Use asynchronous processing when synchronous request paths should not perform expensive work.",
      "Understand idempotency before relying heavily on retries.",
      "Treat distributed systems as systems with partial failures.",
      "Understand consistency and availability trade-offs rather than treating one model as universally correct.",
      "Design reliability using timeouts, retries, circuit breakers, redundancy and graceful degradation.",
      "Observability is part of production architecture.",
      "Security must be designed into architecture rather than added after implementation.",
      "Scale horizontally when workload and architecture justify it.",
      "High availability requires redundancy and reliable failure recovery.",
      "Do not introduce microservices simply because they are popular.",
      "Prefer modular monoliths when distributed complexity is not justified.",
      "Use event-driven architecture when asynchronous decoupling provides meaningful benefits.",
      "Realtime systems are specialized architectures with their own scaling challenges.",
      "Search systems should be introduced when database capabilities no longer satisfy search requirements.",
      "Rate limiting protects both reliability and security.",
      "Cloud services are implementation choices; the underlying architectural concepts remain portable.",
      "Cost is an architectural constraint alongside performance and reliability.",
      "Low-level design and high-level design are complementary.",
      "Design patterns should solve real problems rather than be applied mechanically.",
      "Domain boundaries should reflect business responsibilities.",
      "System-design case studies should teach reusable patterns instead of memorized answers.",
      "Architecture communication is an engineering skill.",
      "Every significant architectural decision should be explainable through requirements and trade-offs.",
      "Production architecture must include security, reliability, observability and operational concerns.",
      "Advanced distributed-systems concepts should be learned after the foundational architecture concepts.",
      "Senior-level system design requires balancing product, technical and organizational constraints.",
      "The goal is architectural reasoning, not technology collection.",
    ],

    knowledgeVersion: 1,
  },
});

export default systemDesignSoftwareArchitectureRoadmap;
export { systemDesignSoftwareArchitectureRoadmap };

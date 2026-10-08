import { createRoadmapTemplate } from "../../factory.js";

import fullStackDeveloperPhases from "./phase.js";
import fullStackDeveloperNodes from "./node.js";
import fullStackDeveloperEdges from "./edge.js";

const fullStackDeveloperRoadmap = createRoadmapTemplate({
  id: "full-stack-developer",
  version: 1,
  type: "career-roadmap",

  title: "Full Stack Developer",

  description:
    "A comprehensive full-stack engineering roadmap covering web fundamentals, programming, frontend engineering, React, TypeScript, backend engineering, Node.js, API design, databases, authentication, full-stack integration, testing, performance, caching, background processing, realtime systems, Docker, CI/CD, cloud deployment, observability, architecture, scalability, microservices, distributed systems, cloud-native engineering, security, AI integration and system design.",

  goal: "Build the ability to design, develop, test, deploy, secure, scale and operate production-grade full-stack applications from frontend to backend and cloud infrastructure.",

  nodes: fullStackDeveloperNodes,

  edges: fullStackDeveloperEdges,

  alternatives: [
    {
      id: "mern",
      title: "MERN",
      type: "primary",
      description:
        "Primary JavaScript full-stack path using MongoDB, Express.js, React and Node.js.",
      technologyPath: [
        "React",
        "TypeScript",
        "Node.js",
        "Express.js",
        "MongoDB",
        "Redis",
        "Docker",
        "AWS",
      ],
    },

    {
      id: "pern",
      title: "PERN",
      type: "alternative",
      description: "Relational-database-oriented JavaScript full-stack path.",
      technologyPath: [
        "React",
        "TypeScript",
        "Node.js",
        "Express.js",
        "PostgreSQL",
        "Redis",
        "Docker",
        "AWS",
      ],
    },

    {
      id: "mean",
      title: "MEAN",
      type: "alternative",
      description:
        "Enterprise-oriented JavaScript full-stack path using Angular.",
      technologyPath: [
        "Angular",
        "TypeScript",
        "Node.js",
        "Express.js",
        "MongoDB",
        "Docker",
        "Cloud",
      ],
    },

    {
      id: "nextjs-full-stack",
      title: "Next.js Full Stack",
      type: "alternative",
      description:
        "React-based full-stack path using Next.js for frontend and server-side capabilities.",
      technologyPath: ["React", "Next.js", "TypeScript", "PostgreSQL", "Cloud"],
    },

    {
      id: "python-full-stack",
      title: "Python Full Stack",
      type: "alternative",
      description:
        "Python-oriented backend path combined with a modern frontend stack.",
      technologyPath: [
        "React",
        "TypeScript",
        "Python",
        "FastAPI",
        "PostgreSQL",
        "Docker",
        "Cloud",
      ],
    },

    {
      id: "java-full-stack",
      title: "Java Full Stack",
      type: "alternative",
      description:
        "Enterprise-oriented full-stack path using Java and Spring Boot.",
      technologyPath: [
        "React or Angular",
        "TypeScript",
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "Docker",
        "Cloud",
      ],
    },

    {
      id: "cloud-native-full-stack",
      title: "Cloud-Native Full Stack",
      type: "advanced",
      description:
        "Production-oriented path combining full-stack development with containers, cloud, Kubernetes, observability and distributed systems.",
      technologyPath: [
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL/MongoDB",
        "Redis",
        "Docker",
        "Kubernetes",
        "AWS",
        "CI/CD",
        "Observability",
      ],
    },

    {
      id: "ai-full-stack",
      title: "AI-Powered Full Stack",
      type: "advanced",
      description:
        "Full-stack engineering combined with production AI integrations such as LLM APIs, RAG, embeddings and agent workflows.",
      technologyPath: [
        "React",
        "TypeScript",
        "Node.js",
        "Python when required",
        "LLM APIs",
        "Embeddings",
        "RAG",
        "Vector Search",
        "Cloud",
      ],
    },

    {
      id: "microservices-full-stack",
      title: "Microservices Full Stack",
      type: "advanced",
      description:
        "Scale full-stack systems into independently deployable services when the system and organization justify the complexity.",
      technologyPath: [
        "React",
        "Node.js",
        "REST/gRPC",
        "Redis",
        "Message Queues",
        "Kafka",
        "Docker",
        "Kubernetes",
        "Cloud",
      ],
    },
  ],

  metadata: {
    domain: "full-stack-development",

    careerRoles: [
      "Full Stack Developer",
      "Full Stack Software Engineer",
      "Product Engineer",
      "Software Engineer",
      "Frontend Engineer",
      "Backend Engineer",
      "Cloud-Native Full Stack Engineer",
      "AI Full Stack Engineer",
    ],

    primaryTechnologyPath: {
      frontend: "React",
      frontendLanguage: "TypeScript",
      backendRuntime: "Node.js",
      backendFramework: "Express.js",
      primaryDatabase: "MongoDB",
      relationalDatabase: "PostgreSQL",
      caching: "Redis",
      apiStyle: "REST",
      realtime: "WebSockets",
      containerization: "Docker",
      cicd: "GitHub Actions",
      cloud: "AWS",
      orchestration: "Kubernetes",
      observability: "Logs + Metrics + Traces",
      architecture: "Modular Monolith → Services",
      ai: "LLM APIs + RAG + Tool Calling",
    },

    alternativeTechnologyPaths: {
      frontend: ["React", "Vue", "Angular", "Next.js"],

      backend: ["Node.js", "Python/FastAPI", "Java/Spring Boot", "Go", ".NET"],

      databases: ["MongoDB", "PostgreSQL", "MySQL", "SQL Server"],

      apis: ["REST", "GraphQL", "gRPC"],

      cloud: ["AWS", "GCP", "Azure"],

      queues: [
        "Redis-based queues",
        "RabbitMQ",
        "Kafka",
        "Cloud-managed queues",
      ],

      cicd: ["GitHub Actions", "GitLab CI", "Jenkins"],
    },

    technologyStrategy: {
      rule: "Choose one primary stack and master it deeply. Alternatives exist to show industry paths and help adaptation; they are not additional mandatory learning tracks.",

      primaryStack: "MERN",

      primaryFrontend: "React + TypeScript",

      primaryBackend: "Node.js + Express.js",

      primaryDatabase: "MongoDB",

      relationalDatabase: "PostgreSQL",

      primaryCache: "Redis",

      primaryApi: "REST",

      primaryCloud: "AWS",

      primaryContainer: "Docker",

      primaryCicd: "GitHub Actions",

      architectureProgression:
        "Monolith → Modular Monolith → Services → Microservices when justified",

      aiProgression:
        "API Integration → Structured Outputs → Embeddings → RAG → Tool Calling → Production AI Workflows",
    },

    progression: fullStackDeveloperPhases.map((phase) => ({
      order: phase.order,
      id: phase.id,
      title: phase.title,
    })),

    phases: fullStackDeveloperPhases,

    roadmapPrinciples: [
      "Learn the web before learning frameworks.",
      "Master JavaScript before relying on React or Node.js abstractions.",
      "TypeScript is the production type-safety layer across the primary JavaScript stack.",
      "React is the primary frontend path.",
      "Node.js and Express.js are the primary backend path.",
      "MongoDB represents the primary MERN path while PostgreSQL provides the relational alternative.",
      "REST is the primary API style; GraphQL and gRPC are alternatives.",
      "Authentication and authorization are separate responsibilities.",
      "Security is part of full-stack engineering rather than a final phase.",
      "Testing should cover units, integrations and complete user workflows.",
      "Performance should be reasoned about across frontend, API, database and infrastructure layers.",
      "Caching and background processing become important as applications grow.",
      "Realtime systems are a specialization rather than a prerequisite for every application.",
      "Docker provides the primary containerization path.",
      "CI/CD should automate testing and delivery.",
      "Cloud deployment should be learned before advanced cloud-native architecture.",
      "Observability is mandatory for serious production systems.",
      "Start with a modular monolith before introducing microservices unless requirements justify earlier decomposition.",
      "Distributed systems concepts become important when applications span multiple services or machines.",
      "Kubernetes is an advanced operational skill, not a prerequisite for basic full-stack development.",
      "AI integration is an optional advanced capability that can be combined with the core full-stack path.",
      "RAG, embeddings and tool calling should be treated as application capabilities rather than replacements for core engineering.",
      "System design connects all full-stack concepts at senior engineering levels.",
      "Choose one stack deeply instead of attempting to master every alternative.",
      "Alternative stacks exist to support career adaptation and different industry requirements.",
      "Production readiness means building, testing, deploying, securing, observing and maintaining the system.",
    ],

    knowledgeVersion: 1,
  },
});

export default fullStackDeveloperRoadmap;
export { fullStackDeveloperRoadmap };

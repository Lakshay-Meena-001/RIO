/**
 * RIO Backend Developer Roadmap
 *
 * Canonical backend roadmap definition.
 *
 * This file only composes:
 * - phases
 * - knowledge nodes
 * - dependency edges
 *
 * No user data.
 * No progress.
 * No LLM.
 * No runtime personalization.
 */

import { createRoadmapTemplate } from "../../factory.js";

import backendPhases from "./phase.js";
import backendDeveloperNodes from "./node.js";
import backendDeveloperEdges from "./edge.js";

/* -------------------------------------------------------------------------- */
/* Roadmap Metadata                                                            */
/* -------------------------------------------------------------------------- */

const backendDeveloperRoadmap = createRoadmapTemplate({
  id: "backend-developer",

  version: 1,

  type: "career-roadmap",

  title: "Backend Developer",

  description:
    "A structured backend engineering roadmap covering backend fundamentals, Node.js, API engineering, databases, authentication, security, testing, caching, asynchronous systems, real-time applications, performance, cloud deployment, CI/CD, observability, architecture, microservices and advanced distributed systems.",

  goal: "Build production-ready backend engineering skills from fundamentals to scalable and distributed systems while understanding major backend technology choices and when each path makes sense.",

  nodes: backendDeveloperNodes,

  edges: backendDeveloperEdges,

  alternatives: [
    {
      id: "nodejs-express",
      title: "Node.js + Express",
      recommended: true,
      category: "javascript-backend",
      reason:
        "Primary implementation path for the RIO backend and MERN-oriented development.",
    },
    {
      id: "python-fastapi",
      title: "Python + FastAPI",
      recommended: false,
      category: "python-backend",
      reason:
        "Strong alternative for Python-oriented backend, AI/ML and API development.",
    },
    {
      id: "java-spring-boot",
      title: "Java + Spring Boot",
      recommended: false,
      category: "enterprise-backend",
      reason:
        "Major enterprise backend ecosystem and important alternative for backend careers.",
    },
    {
      id: "go-backend",
      title: "Go",
      recommended: false,
      category: "cloud-native-backend",
      reason: "Useful for high-performance and cloud-native backend systems.",
    },
    {
      id: "dotnet-backend",
      title: ".NET / ASP.NET Core",
      recommended: false,
      category: "enterprise-backend",
      reason: "Strong backend option for Microsoft and enterprise ecosystems.",
    },
  ],

  metadata: {
    domain: "backend-engineering",

    careerRoles: [
      "Backend Developer",
      "Backend Engineer",
      "Software Engineer",
      "API Engineer",
      "Platform Engineer",
      "Distributed Systems Engineer",
    ],

    primaryTechnologyPath: {
      language: "JavaScript",
      runtime: "Node.js",
      framework: "Express.js",
      database: "MongoDB",
      cache: "Redis",
      cloud: "AWS",
      containerization: "Docker",
      cicd: "GitHub Actions",
    },

    technologyStrategy: {
      principle:
        "Choose one primary implementation path and understand alternatives without requiring users to learn every ecosystem.",

      primaryPath: [
        "Node.js",
        "Express.js",
        "MongoDB",
        "Redis",
        "Docker",
        "AWS",
        "GitHub Actions",
      ],

      alternatives: ["Python + FastAPI", "Java + Spring Boot", "Go", ".NET"],
    },

    progression: [
      "backend-foundation",
      "javascript-backend-runtime",
      "api-engineering",
      "database-engineering",
      "authentication-and-security",
      "testing-and-reliability",
      "caching-and-background-processing",
      "realtime-and-file-processing",
      "performance-and-production",
      "deployment-and-cloud",
      "ci-cd-and-observability",
      "software-architecture",
      "distributed-systems-and-microservices",
      "advanced-backend-systems",
    ],

    roadmapPrinciples: [
      "Fundamentals before frameworks",
      "One primary technology path before alternatives",
      "Security is part of backend engineering",
      "Testing is part of development",
      "Measure before optimizing",
      "Prefer modular monoliths before unnecessary microservices",
      "Understand distributed-system trade-offs before adopting distributed architecture",
      "Learn concepts that transfer across technologies",
      "Avoid technology FOMO",
      "Production readiness matters more than framework collection",
    ],

    knowledgeVersion: 1,
  },
});

export { backendDeveloperRoadmap };

export default backendDeveloperRoadmap;

/**
 * RIO Frontend Developer Roadmap
 *
 * This file defines the learning phases of the canonical
 * Frontend Developer roadmap.
 *
 * Important:
 * - This is static knowledge.
 * - No LLM is involved.
 * - Phases define learning progression.
 * - Actual topics live in nodes.js.
 */

export const frontendPhases = [
  {
    id: "web-foundation",
    order: 1,
    title: "Web Foundation",

    description:
      "Understand how the web works and build a strong foundation before moving into frontend frameworks.",

    goal: "Understand browsers, HTTP, HTML, CSS, accessibility basics, and developer tooling.",

    focus: [
      "How the web works",
      "HTML",
      "CSS",
      "Accessibility",
      "Git and GitHub",
      "Browser fundamentals",
    ],

    outcome:
      "You can build and structure a clean responsive webpage and understand what happens when it is loaded in a browser.",

    nextPhase: "javascript-foundation",
  },

  {
    id: "javascript-foundation",
    order: 2,
    title: "JavaScript Foundation",

    description:
      "Build the programming and browser-side JavaScript knowledge required for modern frontend development.",

    goal: "Become comfortable writing JavaScript and understanding how it executes in the browser.",

    focus: [
      "JavaScript fundamentals",
      "Functions",
      "Objects and arrays",
      "DOM",
      "Events",
      "Asynchronous JavaScript",
      "Promises",
      "Fetch API",
      "Modules",
    ],

    outcome:
      "You can build interactive browser applications using JavaScript without depending on a framework.",

    nextPhase: "frontend-engineering",
  },

  {
    id: "frontend-engineering",
    order: 3,
    title: "Frontend Engineering",

    description:
      "Move from basic frontend development to structured, maintainable application development.",

    goal: "Learn the engineering practices required to build larger frontend applications.",

    focus: [
      "Responsive design",
      "Reusable UI",
      "Forms",
      "API integration",
      "State concepts",
      "Error handling",
      "Accessibility",
      "Frontend architecture",
    ],

    outcome:
      "You can structure a frontend application instead of treating it as a collection of individual pages.",

    nextPhase: "react",
  },

  {
    id: "react",
    order: 4,
    title: "React",

    description:
      "Learn React as the primary tool for building modern component-based frontend applications.",

    goal: "Build production-oriented React applications with reusable components and predictable state management.",

    focus: [
      "Components",
      "JSX",
      "Props",
      "State",
      "Events",
      "Hooks",
      "Forms",
      "Routing",
      "API integration",
      "State management",
    ],

    outcome:
      "You can build a complete React application with reusable components, routing, forms, API integration, and application state.",

    nextPhase: "typescript",
  },

  {
    id: "typescript",
    order: 5,
    title: "TypeScript",

    description:
      "Add type safety and stronger developer tooling to modern frontend applications.",

    goal: "Use TypeScript effectively in production React projects.",

    focus: [
      "Types",
      "Interfaces",
      "Generics",
      "Type narrowing",
      "Utility types",
      "React with TypeScript",
      "API types",
    ],

    outcome:
      "You can build and maintain a typed frontend codebase instead of relying entirely on runtime checks.",

    nextPhase: "production-frontend",
  },

  {
    id: "production-frontend",
    order: 6,
    title: "Production Frontend",

    description:
      "Learn the engineering practices required to take frontend applications from working prototypes to production systems.",

    goal: "Build frontend applications that are reliable, secure, accessible, testable, and performant.",

    focus: [
      "Testing",
      "Performance",
      "Accessibility",
      "Web security",
      "Error handling",
      "Caching",
      "Code splitting",
      "Build optimization",
      "Environment configuration",
    ],

    outcome:
      "You can prepare a frontend application for real users rather than stopping after the UI works locally.",

    nextPhase: "deployment-and-delivery",
  },

  {
    id: "deployment-and-delivery",
    order: 7,
    title: "Deployment & Delivery",

    description:
      "Understand how frontend applications are built, deployed, monitored, and maintained in real environments.",

    goal: "Become comfortable taking a frontend application from source code to a production deployment.",

    focus: [
      "Production builds",
      "Environment variables",
      "CDN concepts",
      "Hosting",
      "CI/CD",
      "Domain and HTTPS",
      "Monitoring",
      "Logging",
    ],

    outcome:
      "You can deploy a frontend application and understand the basic production infrastructure around it.",

    nextPhase: "advanced-frontend",
  },

  {
    id: "advanced-frontend",
    order: 8,
    title: "Advanced Frontend",

    description:
      "Explore advanced frontend architecture, performance, rendering strategies, and specialized areas.",

    goal: "Develop the ability to make informed architectural decisions for complex frontend systems.",

    focus: [
      "Advanced performance",
      "Rendering strategies",
      "Frontend architecture",
      "Design systems",
      "Advanced state management",
      "Large application structure",
      "Web platform APIs",
    ],

    outcome:
      "You can reason about architecture and trade-offs in larger frontend applications.",

    nextPhase: "specializations",
  },

  {
    id: "specializations",
    order: 9,
    title: "Specializations",

    description:
      "Choose advanced directions based on your goals instead of learning everything at once.",

    goal: "Allow the roadmap to adapt toward different frontend career directions.",

    focus: [
      "Creative frontend",
      "Advanced UI and animation",
      "3D web",
      "AI-powered frontend",
      "Full-stack integration",
      "Frontend architecture",
    ],

    outcome:
      "You can specialize according to your career direction without treating every advanced technology as mandatory.",

    nextPhase: null,
  },
];

export default frontendPhases;

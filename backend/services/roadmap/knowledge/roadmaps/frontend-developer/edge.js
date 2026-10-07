/**
 * RIO Frontend Developer Roadmap
 *
 * Canonical graph relationships.
 *
 * Important:
 * - Nodes are defined in nodes.js.
 * - This file defines how those nodes relate to each other.
 * - Relationships are used for prerequisites, recommended progression,
 *   alternative paths, and roadmap adaptation.
 */

import { createKnowledgeEdge } from "../../index.js";

/* -------------------------------------------------------------------------- */
/* Web Foundation                                                             */
/* -------------------------------------------------------------------------- */

const webFoundationEdges = [
  createKnowledgeEdge({
    source: "web-fundamentals",
    target: "html",
    type: "prerequisite",
    reason: "HTML is part of understanding and building web pages.",
  }),

  createKnowledgeEdge({
    source: "html",
    target: "css",
    type: "prerequisite",
    reason: "CSS styles and lays out HTML documents.",
  }),

  createKnowledgeEdge({
    source: "html",
    target: "accessibility",
    type: "prerequisite",
    reason: "Accessible interfaces begin with semantic HTML.",
  }),

  createKnowledgeEdge({
    source: "css",
    target: "responsive-design",
    type: "prerequisite",
    reason: "Responsive design depends on CSS layout fundamentals.",
  }),

  createKnowledgeEdge({
    source: "html",
    target: "forms",
    type: "prerequisite",
    reason: "Frontend forms are built on native HTML form controls.",
  }),

  createKnowledgeEdge({
    source: "web-fundamentals",
    target: "javascript",
    type: "recommended-next",
    reason:
      "Once the web model is understood, JavaScript adds application behavior.",
  }),
];

/* -------------------------------------------------------------------------- */
/* JavaScript                                                                 */
/* -------------------------------------------------------------------------- */

const javascriptEdges = [
  createKnowledgeEdge({
    source: "javascript",
    target: "dom",
    type: "prerequisite",
    reason: "DOM manipulation requires JavaScript fundamentals.",
  }),

  createKnowledgeEdge({
    source: "javascript",
    target: "async-javascript",
    type: "prerequisite",
    reason: "Asynchronous JavaScript builds on core language concepts.",
  }),

  createKnowledgeEdge({
    source: "web-fundamentals",
    target: "http-and-apis",
    type: "prerequisite",
    reason:
      "API integration requires understanding the web request/response model.",
  }),

  createKnowledgeEdge({
    source: "async-javascript",
    target: "http-and-apis",
    type: "prerequisite",
    reason: "API calls are asynchronous operations in frontend applications.",
  }),

  createKnowledgeEdge({
    source: "javascript",
    target: "javascript-modules",
    type: "prerequisite",
    reason: "Modules organize JavaScript code into maintainable units.",
  }),

  createKnowledgeEdge({
    source: "dom",
    target: "async-javascript",
    type: "recommended-next",
    reason:
      "After understanding browser interaction, asynchronous browser operations become natural.",
  }),

  createKnowledgeEdge({
    source: "javascript-modules",
    target: "react",
    type: "prerequisite",
    reason: "Modern React applications rely heavily on JavaScript modules.",
  }),

  createKnowledgeEdge({
    source: "javascript",
    target: "react",
    type: "prerequisite",
    reason: "React development requires strong JavaScript fundamentals.",
  }),
];

/* -------------------------------------------------------------------------- */
/* Frontend Engineering                                                       */
/* -------------------------------------------------------------------------- */

const frontendEngineeringEdges = [
  createKnowledgeEdge({
    source: "accessibility",
    target: "forms",
    type: "prerequisite",
    reason:
      "Production forms need accessible labels, controls, focus, and feedback.",
  }),

  createKnowledgeEdge({
    source: "javascript",
    target: "forms",
    type: "prerequisite",
    reason: "Interactive forms require JavaScript behavior.",
  }),

  createKnowledgeEdge({
    source: "javascript-modules",
    target: "frontend-architecture",
    type: "prerequisite",
    reason: "Application architecture depends on organizing code into modules.",
  }),

  createKnowledgeEdge({
    source: "http-and-apis",
    target: "frontend-architecture",
    type: "prerequisite",
    reason:
      "Frontend architecture must separate UI concerns from API concerns.",
  }),

  createKnowledgeEdge({
    source: "forms",
    target: "frontend-architecture",
    type: "recommended-next",
    reason: "Forms expose real application state and validation concerns.",
  }),

  createKnowledgeEdge({
    source: "frontend-architecture",
    target: "react",
    type: "prerequisite",
    reason:
      "React applications benefit from understanding component boundaries and data flow.",
  }),
];

/* -------------------------------------------------------------------------- */
/* React                                                                      */
/* -------------------------------------------------------------------------- */

const reactEdges = [
  createKnowledgeEdge({
    source: "react",
    target: "react-hooks",
    type: "prerequisite",
    reason:
      "Hooks extend React components with state, effects, references, and reusable behavior.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "react-routing",
    type: "prerequisite",
    reason:
      "Application routing is built around React applications and components.",
  }),

  createKnowledgeEdge({
    source: "react-hooks",
    target: "react-data-fetching",
    type: "prerequisite",
    reason: "Data fetching requires state and effect management.",
  }),

  createKnowledgeEdge({
    source: "http-and-apis",
    target: "react-data-fetching",
    type: "prerequisite",
    reason: "React data fetching depends on API fundamentals.",
  }),

  createKnowledgeEdge({
    source: "react-hooks",
    target: "react-state-management",
    type: "prerequisite",
    reason:
      "State-management decisions require understanding React's local state model.",
  }),

  createKnowledgeEdge({
    source: "react-data-fetching",
    target: "react-state-management",
    type: "recommended-next",
    reason:
      "Understanding server state first prevents unnecessary global state usage.",
  }),

  createKnowledgeEdge({
    source: "react-routing",
    target: "authentication",
    type: "prerequisite",
    reason: "Protected application experiences commonly depend on routing.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "typescript",
    type: "recommended-next",
    reason:
      "TypeScript can be introduced once React fundamentals are understood.",
  }),
];

/* -------------------------------------------------------------------------- */
/* TypeScript                                                                 */
/* -------------------------------------------------------------------------- */

const typescriptEdges = [
  createKnowledgeEdge({
    source: "javascript",
    target: "typescript",
    type: "prerequisite",
    reason:
      "TypeScript extends JavaScript and requires understanding JavaScript behavior.",
  }),

  createKnowledgeEdge({
    source: "typescript",
    target: "react-typescript",
    type: "prerequisite",
    reason: "React with TypeScript requires TypeScript fundamentals.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "react-typescript",
    type: "prerequisite",
    reason: "Typed React development requires React fundamentals.",
  }),

  createKnowledgeEdge({
    source: "react-hooks",
    target: "react-typescript",
    type: "recommended-next",
    reason:
      "Typed hooks and component logic are important in production React applications.",
  }),
];

/* -------------------------------------------------------------------------- */
/* Production                                                                 */
/* -------------------------------------------------------------------------- */

const productionEdges = [
  createKnowledgeEdge({
    source: "react",
    target: "frontend-testing",
    type: "prerequisite",
    reason:
      "Component behavior needs to be understood before it can be tested effectively.",
  }),

  createKnowledgeEdge({
    source: "forms",
    target: "frontend-testing",
    type: "prerequisite",
    reason: "Forms are important production UI flows that need reliable tests.",
  }),

  createKnowledgeEdge({
    source: "react-data-fetching",
    target: "frontend-testing",
    type: "prerequisite",
    reason: "API states and asynchronous UI behavior should be tested.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "frontend-performance",
    type: "prerequisite",
    reason:
      "Frontend performance includes understanding component rendering and application behavior.",
  }),

  createKnowledgeEdge({
    source: "http-and-apis",
    target: "frontend-performance",
    type: "prerequisite",
    reason: "Network performance is a major part of frontend performance.",
  }),

  createKnowledgeEdge({
    source: "frontend-architecture",
    target: "frontend-performance",
    type: "recommended-next",
    reason:
      "Architecture affects rendering, data flow, bundle size, and performance.",
  }),

  createKnowledgeEdge({
    source: "http-and-apis",
    target: "web-security",
    type: "prerequisite",
    reason:
      "Secure frontend API integration requires understanding HTTP communication.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "web-security",
    type: "prerequisite",
    reason:
      "Frontend security must be applied to application UI and rendering behavior.",
  }),

  createKnowledgeEdge({
    source: "web-security",
    target: "authentication",
    type: "prerequisite",
    reason:
      "Authentication flows must account for browser and frontend security concerns.",
  }),

  createKnowledgeEdge({
    source: "react-typescript",
    target: "production-frontend",
    type: "recommended-next",
    reason:
      "Typed React applications are a strong foundation for production engineering.",
  }),
];

/* -------------------------------------------------------------------------- */
/* Design Systems                                                             */
/* -------------------------------------------------------------------------- */

const designSystemEdges = [
  createKnowledgeEdge({
    source: "css",
    target: "design-systems",
    type: "prerequisite",
    reason: "Design systems require strong styling and layout fundamentals.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "design-systems",
    type: "prerequisite",
    reason:
      "Reusable component systems are commonly implemented with component-based UI frameworks.",
  }),

  createKnowledgeEdge({
    source: "frontend-architecture",
    target: "design-systems",
    type: "prerequisite",
    reason:
      "A design system requires clear component boundaries and reusable architecture.",
  }),

  createKnowledgeEdge({
    source: "accessibility",
    target: "design-systems",
    type: "prerequisite",
    reason: "Reusable components should preserve accessibility by default.",
  }),
];

/* -------------------------------------------------------------------------- */
/* Deployment                                                                 */
/* -------------------------------------------------------------------------- */

const deploymentEdges = [
  createKnowledgeEdge({
    source: "javascript-modules",
    target: "build-and-deployment",
    type: "prerequisite",
    reason:
      "Modern frontend deployment requires understanding build tooling and dependencies.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "build-and-deployment",
    type: "prerequisite",
    reason:
      "React applications need a production build and deployment process.",
  }),

  createKnowledgeEdge({
    source: "frontend-performance",
    target: "build-and-deployment",
    type: "recommended-next",
    reason:
      "Performance considerations influence production build and asset delivery decisions.",
  }),

  createKnowledgeEdge({
    source: "git",
    target: "ci-cd",
    type: "prerequisite",
    reason: "CI/CD pipelines operate against source-control workflows.",
  }),

  createKnowledgeEdge({
    source: "frontend-testing",
    target: "ci-cd",
    type: "prerequisite",
    reason: "Automated tests are a core validation step in frontend CI.",
  }),

  createKnowledgeEdge({
    source: "build-and-deployment",
    target: "ci-cd",
    type: "prerequisite",
    reason: "CI/CD automates the production build and deployment process.",
  }),
];

/* -------------------------------------------------------------------------- */
/* Advanced Frontend                                                          */
/* -------------------------------------------------------------------------- */

const advancedEdges = [
  createKnowledgeEdge({
    source: "frontend-architecture",
    target: "advanced-frontend",
    type: "prerequisite",
    reason:
      "Advanced frontend engineering builds on architecture fundamentals.",
  }),

  createKnowledgeEdge({
    source: "react-state-management",
    target: "advanced-frontend",
    type: "prerequisite",
    reason:
      "Large applications require deeper understanding of state architecture.",
  }),

  createKnowledgeEdge({
    source: "frontend-performance",
    target: "advanced-frontend",
    type: "prerequisite",
    reason:
      "Advanced frontend work requires understanding real performance trade-offs.",
  }),

  createKnowledgeEdge({
    source: "typescript",
    target: "advanced-frontend",
    type: "prerequisite",
    reason:
      "Large frontend codebases benefit from strong type-safe engineering practices.",
  }),

  createKnowledgeEdge({
    source: "design-systems",
    target: "advanced-frontend",
    type: "recommended-next",
    reason:
      "Reusable design systems become increasingly important as applications grow.",
  }),
];

/* -------------------------------------------------------------------------- */
/* Specializations                                                            */
/* -------------------------------------------------------------------------- */

const specializationEdges = [
  createKnowledgeEdge({
    source: "css",
    target: "creative-frontend",
    type: "prerequisite",
    reason:
      "Creative frontend requires strong visual styling and layout fundamentals.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "creative-frontend",
    type: "prerequisite",
    reason: "React is useful for building interactive creative experiences.",
  }),

  createKnowledgeEdge({
    source: "frontend-performance",
    target: "creative-frontend",
    type: "prerequisite",
    reason:
      "Heavy animation and visual experiences require performance awareness.",
  }),

  createKnowledgeEdge({
    source: "react",
    target: "ai-frontend",
    type: "prerequisite",
    reason:
      "AI-powered interfaces require a solid frontend application foundation.",
  }),

  createKnowledgeEdge({
    source: "http-and-apis",
    target: "ai-frontend",
    type: "prerequisite",
    reason: "AI capabilities are commonly consumed through APIs.",
  }),

  createKnowledgeEdge({
    source: "frontend-architecture",
    target: "ai-frontend",
    type: "prerequisite",
    reason: "AI features need clear frontend/backend boundaries.",
  }),

  createKnowledgeEdge({
    source: "web-security",
    target: "ai-frontend",
    type: "prerequisite",
    reason:
      "AI integrations must protect credentials and handle untrusted model/user content safely.",
  }),

  createKnowledgeEdge({
    source: "advanced-frontend",
    target: "creative-frontend",
    type: "recommended-next",
    reason:
      "Advanced frontend foundations make creative specialization more effective.",
  }),

  createKnowledgeEdge({
    source: "advanced-frontend",
    target: "ai-frontend",
    type: "recommended-next",
    reason:
      "Advanced application architecture helps integrate AI features cleanly.",
  }),
];

/* -------------------------------------------------------------------------- */
/* Public Edge Collection                                                     */
/* -------------------------------------------------------------------------- */

export const frontendEdges = [
  ...webFoundationEdges,
  ...javascriptEdges,
  ...frontendEngineeringEdges,
  ...reactEdges,
  ...typescriptEdges,
  ...productionEdges,
  ...designSystemEdges,
  ...deploymentEdges,
  ...advancedEdges,
  ...specializationEdges,
];

export default frontendEdges;

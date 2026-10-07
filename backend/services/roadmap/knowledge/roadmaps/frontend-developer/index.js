/**
 * RIO Frontend Developer Roadmap
 *
 * Canonical roadmap entry point.
 *
 * This file combines:
 * - phases
 * - knowledge nodes
 * - graph edges
 *
 * It does not contain the actual knowledge itself.
 */

import { createRoadmapTemplate } from "../../index.js";

import { frontendPhases } from "./phase.js";
import { frontendNodes } from "./node.js";
import { frontendEdges } from "./edge.js";

const frontendDeveloperRoadmap = createRoadmapTemplate({
  id: "frontend-developer",

  version: 1,

  type: "role",

  title: "Frontend Developer",

  description:
    "A flexible path from web fundamentals to production-ready frontend engineering and advanced specialization.",

  goal:
    "Build strong web and JavaScript foundations, master modern frontend development, learn production engineering, and choose advanced specializations based on career goals.",

  nodes: frontendNodes,

  edges: frontendEdges,

  alternatives: [
    {
      id: "frontend-framework",
      title: "Frontend Framework Alternatives",

      options: [
        {
          id: "react",
          title: "React",
          recommended: true,
          replaces: null,
        },
        {
          id: "vue",
          title: "Vue",
          recommended: false,
          replaces: "react",
        },
        {
          id: "angular",
          title: "Angular",
          recommended: false,
          replaces: "react",
        },
      ],
    },
  ],

  metadata: {
    category: "web-development",

    domain: "frontend",

    primaryTechnology: "react",

    technologies: [
      "html",
      "css",
      "javascript",
      "react",
      "typescript",
    ],

    phases: frontendPhases,

    progression: [
      "web-foundation",
      "javascript-foundation",
      "frontend-engineering",
      "react",
      "typescript",
      "production-frontend",
      "deployment-and-delivery",
      "advanced-frontend",
      "specializations",
    ],

    designPrinciples: [
      "Learn fundamentals before abstractions.",
      "Build before moving to advanced topics.",
      "Known topics can be skipped or de-emphasized.",
      "Advanced technologies are optional unless required by the target path.",
      "The roadmap should adapt to the user's existing knowledge.",
    ],
  },
});

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export { frontendDeveloperRoadmap };

export default frontendDeveloperRoadmap;
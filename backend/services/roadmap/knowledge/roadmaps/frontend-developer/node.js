/**
 * RIO Frontend Developer Roadmap
 *
 * Canonical knowledge nodes.
 *
 * Important:
 * - Static knowledge only.
 * - No LLM.
 * - No user progress/status here.
 * - User progress belongs to the user roadmap model.
 */

import { createKnowledgeNode } from "../../index.js";

/* -------------------------------------------------------------------------- */
/* Web Foundation                                                             */
/* -------------------------------------------------------------------------- */

const webFundamentals = createKnowledgeNode({
  id: "web-fundamentals",
  title: "How the Web Works",
  category: "web-foundation",
  importance: "core",

  description:
    "Understand the basic journey from a browser request to a response and how frontend applications communicate with servers.",

  whyItMatters:
    "Frontend developers constantly work with browsers, servers, URLs, HTTP, APIs, and network requests.",

  prerequisites: [],

  enables: ["html", "css", "browser-fundamentals", "http-and-apis"],

  guidance: {
    beginner:
      "Start here. You do not need networking expertise; understand only the web concepts required for frontend development.",

    alreadyKnown:
      "Quickly validate HTTP, request/response, URLs, headers, status codes, browser-server communication, and APIs.",

    partialKnowledge:
      "Review the request → server → response lifecycle and then continue.",

    nextStep:
      "Move into HTML and CSS once the browser/server relationship is clear.",
  },

  practice: {
    learn: [
      "Browser and server",
      "Client-server model",
      "URLs",
      "HTTP basics",
      "Request and response",
      "HTTP methods",
      "HTTP status codes",
      "Headers",
      "Cookies basics",
      "APIs",
    ],

    practice: [
      "Inspect requests in browser DevTools",
      "Identify HTTP methods and status codes",
      "Read request and response headers",
    ],

    build: ["Create a simple static page and inspect its network requests."],

    validate: ["Explain what happens when a user enters a URL in the browser."],
  },

  metadata: {
    phase: "web-foundation",
    tags: ["web", "http", "browser", "network"],
  },
});

const html = createKnowledgeNode({
  id: "html",
  title: "HTML",
  category: "web-foundation",
  importance: "core",

  description: "Learn how to structure web pages using semantic HTML.",

  whyItMatters:
    "HTML provides the structure and meaning that browsers, users, search engines, and assistive technologies consume.",

  prerequisites: ["web-fundamentals"],

  enables: ["css", "accessibility", "forms", "seo-basics"],

  guidance: {
    beginner:
      "Learn semantic HTML rather than memorizing every available element.",

    alreadyKnown:
      "Validate semantic structure, forms, accessibility-related elements, and modern HTML usage.",

    partialKnowledge:
      "Focus on semantic elements, forms, tables, media, and document structure.",

    nextStep: "Use CSS to turn structured HTML into responsive interfaces.",
  },

  practice: {
    learn: [
      "Document structure",
      "Semantic elements",
      "Links",
      "Images",
      "Lists",
      "Tables",
      "Forms",
      "Inputs",
      "Audio and video",
      "HTML attributes",
    ],

    practice: [
      "Convert a div-heavy page into semantic HTML",
      "Build forms",
      "Structure article and dashboard layouts",
    ],

    build: ["Build a semantic personal profile page."],

    validate: [
      "Create a page with meaningful semantic structure without unnecessary divs.",
    ],
  },

  metadata: {
    phase: "web-foundation",
    tags: ["html", "semantic-html"],
  },
});

const css = createKnowledgeNode({
  id: "css",
  title: "CSS",
  category: "web-foundation",
  importance: "core",

  description:
    "Learn how to style, position, and create responsive user interfaces.",

  whyItMatters:
    "Production frontend development requires reliable layout, responsive behavior, visual hierarchy, and maintainable styling.",

  prerequisites: ["html"],

  enables: [
    "responsive-design",
    "css-architecture",
    "design-systems",
    "creative-frontend",
  ],

  guidance: {
    beginner:
      "Master layout and responsive fundamentals before chasing advanced visual effects.",

    alreadyKnown:
      "Validate Flexbox, Grid, responsive design, positioning, specificity, and maintainable CSS.",

    partialKnowledge:
      "Focus first on the box model, Flexbox, Grid, responsive units, and media queries.",

    nextStep:
      "Build responsive interfaces before moving into component-based frontend development.",
  },

  practice: {
    learn: [
      "Selectors",
      "Cascade",
      "Specificity",
      "Box model",
      "Display",
      "Positioning",
      "Flexbox",
      "CSS Grid",
      "Units",
      "Typography",
      "Colors",
      "Pseudo classes",
      "Pseudo elements",
      "Media queries",
      "Responsive layouts",
    ],

    practice: [
      "Recreate common layouts",
      "Build responsive cards",
      "Build navigation layouts",
      "Convert desktop layouts to mobile layouts",
    ],

    build: ["Build a responsive landing page."],

    validate: [
      "Build the same layout using both Flexbox and Grid where appropriate.",
    ],
  },

  metadata: {
    phase: "web-foundation",
    tags: ["css", "layout", "responsive"],
  },
});

const responsiveDesign = createKnowledgeNode({
  id: "responsive-design",
  title: "Responsive Design",
  category: "web-foundation",
  importance: "core",

  description:
    "Design interfaces that adapt correctly across screen sizes and devices.",

  whyItMatters:
    "Real users access applications from phones, tablets, laptops, and large screens.",

  prerequisites: ["html", "css"],

  enables: ["frontend-engineering", "production-frontend"],

  guidance: {
    beginner:
      "Learn mobile-first thinking and responsive layout before adding framework-specific styling systems.",

    alreadyKnown:
      "Validate breakpoints, fluid sizing, responsive typography, and layout adaptation.",

    partialKnowledge:
      "Practice converting fixed desktop layouts into fluid responsive interfaces.",

    nextStep: "Apply responsive thinking to reusable components.",
  },

  practice: {
    learn: [
      "Mobile-first design",
      "Breakpoints",
      "Fluid layouts",
      "Responsive typography",
      "Responsive images",
      "Container strategies",
    ],

    practice: [
      "Resize layouts using DevTools",
      "Test common mobile and desktop widths",
    ],

    build: ["Build a responsive dashboard."],

    validate: [
      "Application remains usable without horizontal scrolling across common viewport sizes.",
    ],
  },

  metadata: {
    phase: "web-foundation",
    tags: ["responsive", "mobile-first", "ui"],
  },
});

const accessibility = createKnowledgeNode({
  id: "accessibility",
  title: "Web Accessibility",
  category: "web-foundation",
  importance: "core",

  description:
    "Build interfaces that can be used by people with different abilities and assistive technologies.",

  whyItMatters:
    "Accessibility is part of production-quality frontend engineering rather than an optional visual enhancement.",

  prerequisites: ["html"],

  enables: ["forms", "production-frontend", "frontend-testing"],

  guidance: {
    beginner:
      "Start with semantic HTML, keyboard navigation, labels, focus states, and meaningful content.",

    alreadyKnown:
      "Validate keyboard accessibility, focus management, semantics, labels, ARIA usage, and accessible forms.",

    partialKnowledge:
      "Prioritize native HTML semantics before learning advanced ARIA patterns.",

    nextStep:
      "Apply accessibility consistently to reusable components and forms.",
  },

  practice: {
    learn: [
      "Semantic HTML",
      "Keyboard navigation",
      "Focus management",
      "Labels",
      "Alt text",
      "ARIA basics",
      "Accessible forms",
      "Color contrast",
    ],

    practice: [
      "Navigate applications using only the keyboard",
      "Audit form labels and focus states",
      "Inspect accessibility tree in browser DevTools",
    ],

    build: ["Make an existing dashboard keyboard accessible."],

    validate: ["Complete core user flows without a mouse."],
  },

  metadata: {
    phase: "web-foundation",
    tags: ["accessibility", "a11y"],
  },
});

const git = createKnowledgeNode({
  id: "git",
  title: "Git & GitHub",
  category: "developer-tools",
  importance: "core",

  description:
    "Use version control to manage source code and collaborate safely.",

  whyItMatters:
    "Production development depends on version history, branching, collaboration, reviews, and reliable source management.",

  prerequisites: [],

  enables: ["frontend-engineering", "ci-cd"],

  guidance: {
    beginner:
      "Learn practical Git workflows first instead of trying to memorize every Git command.",

    alreadyKnown:
      "Validate branching, merging, pull requests, resolving conflicts, and clean commit practices.",

    partialKnowledge:
      "Focus on add, commit, status, log, branch, switch, merge, pull, push, and conflict resolution.",

    nextStep: "Use Git naturally throughout every project.",
  },

  practice: {
    learn: [
      "Repository",
      "Commit",
      "Branch",
      "Merge",
      "Remote",
      "Pull request",
      "Conflict resolution",
      "GitHub workflow",
    ],

    practice: [
      "Create branches",
      "Resolve merge conflicts",
      "Open pull requests",
      "Review changes",
    ],

    build: ["Maintain every roadmap project in a GitHub repository."],

    validate: ["Recover a previous version of a project using Git."],
  },

  metadata: {
    phase: "web-foundation",
    tags: ["git", "github", "version-control"],
  },
});

/* -------------------------------------------------------------------------- */
/* JavaScript                                                                 */
/* -------------------------------------------------------------------------- */

const javascript = createKnowledgeNode({
  id: "javascript",
  title: "JavaScript",
  category: "javascript",
  importance: "core",

  description:
    "Master the JavaScript language used to build interactive frontend applications.",

  whyItMatters:
    "Modern frontend frameworks are built around JavaScript concepts. Weak JavaScript knowledge creates problems later in React and application architecture.",

  prerequisites: ["html", "css"],

  enables: ["dom", "async-javascript", "modules", "react", "typescript"],

  guidance: {
    beginner:
      "Spend serious time here. React should not be used as a replacement for learning JavaScript.",

    alreadyKnown:
      "Validate closures, scope, objects, arrays, higher-order functions, destructuring, modules, and asynchronous concepts.",

    partialKnowledge:
      "Focus on functions, scope, objects, arrays, array methods, destructuring, closures, and error handling.",

    nextStep:
      "Move into DOM and asynchronous JavaScript once core language concepts feel natural.",
  },

  practice: {
    learn: [
      "Variables",
      "Data types",
      "Operators",
      "Conditionals",
      "Loops",
      "Functions",
      "Scope",
      "Closures",
      "Objects",
      "Arrays",
      "Destructuring",
      "Spread and rest",
      "Higher-order functions",
      "Error handling",
    ],

    practice: [
      "Write small JavaScript utilities",
      "Transform arrays with map/filter/reduce",
      "Implement object and array operations",
      "Practice closures",
    ],

    build: ["Build small browser utilities without a framework."],

    validate: [
      "Explain the behavior of a JavaScript function without executing it.",
    ],
  },

  metadata: {
    phase: "javascript-foundation",
    tags: ["javascript", "language"],
  },
});

const dom = createKnowledgeNode({
  id: "dom",
  title: "DOM & Browser APIs",
  category: "javascript",
  importance: "core",

  description:
    "Understand how JavaScript interacts with HTML documents and browser-provided APIs.",

  whyItMatters:
    "Even when using React, understanding the browser's DOM and event model makes frontend behavior much easier to reason about.",

  prerequisites: ["javascript", "html"],

  enables: ["async-javascript", "react", "browser-fundamentals"],

  guidance: {
    beginner:
      "Learn the DOM enough to understand browser behavior; you do not need to build large applications using manual DOM manipulation.",

    alreadyKnown:
      "Validate events, event propagation, DOM traversal, browser storage, and common Web APIs.",

    partialKnowledge:
      "Focus on query selection, manipulation, events, forms, and event propagation.",

    nextStep: "Move into asynchronous browser APIs and fetch.",
  },

  practice: {
    learn: [
      "DOM tree",
      "Element selection",
      "DOM manipulation",
      "Events",
      "Event bubbling",
      "Event delegation",
      "Forms",
      "localStorage",
      "sessionStorage",
      "Browser APIs",
    ],

    practice: [
      "Build interactive components without React",
      "Handle form events",
      "Implement event delegation",
    ],

    build: ["Build a small vanilla JavaScript todo application."],

    validate: ["Explain event bubbling and why event delegation works."],
  },

  metadata: {
    phase: "javascript-foundation",
    tags: ["dom", "browser", "events"],
  },
});

const asyncJavascript = createKnowledgeNode({
  id: "async-javascript",
  title: "Asynchronous JavaScript",
  category: "javascript",
  importance: "core",

  description:
    "Understand asynchronous execution and how frontend applications communicate with APIs.",

  whyItMatters:
    "Most production applications depend on asynchronous network requests, timers, user events, and background work.",

  prerequisites: ["javascript", "dom", "web-fundamentals"],

  enables: ["http-and-apis", "react", "data-fetching"],

  guidance: {
    beginner:
      "Understand the mental model first. Do not memorize Promise syntax without understanding asynchronous execution.",

    alreadyKnown:
      "Validate promises, async/await, error handling, event loop basics, and concurrent requests.",

    partialKnowledge:
      "Focus on Promise states, chaining, async/await, try/catch, and parallel requests.",

    nextStep: "Use these concepts with real HTTP APIs.",
  },

  practice: {
    learn: [
      "Synchronous vs asynchronous execution",
      "Callbacks",
      "Promises",
      "Promise chaining",
      "async/await",
      "try/catch",
      "Event loop basics",
      "Promise.all",
      "Request cancellation basics",
    ],

    practice: [
      "Handle success and failure states",
      "Run multiple requests",
      "Implement loading and error states",
    ],

    build: ["Build a small application consuming a public API."],

    validate: [
      "Explain what happens when multiple asynchronous operations are started together.",
    ],
  },

  metadata: {
    phase: "javascript-foundation",
    tags: ["async", "promises", "event-loop"],
  },
});

const httpApis = createKnowledgeNode({
  id: "http-and-apis",
  title: "HTTP & API Integration",
  category: "web-foundation",
  importance: "core",

  description: "Consume backend APIs reliably from frontend applications.",

  whyItMatters:
    "Frontend applications rarely operate alone. They depend on APIs for authentication, data, payments, dashboards, and most business functionality.",

  prerequisites: ["web-fundamentals", "async-javascript"],

  enables: ["react", "data-fetching", "authentication"],

  guidance: {
    beginner:
      "Learn REST-style API interaction and understand request, response, loading, success, and failure states.",

    alreadyKnown:
      "Validate HTTP methods, status codes, headers, authentication, pagination, and error handling.",

    partialKnowledge:
      "Practice GET, POST, PUT/PATCH, DELETE and handling API failures.",

    nextStep: "Integrate APIs into component-based applications.",
  },

  practice: {
    learn: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "Headers",
      "JSON",
      "Status codes",
      "Authentication basics",
      "Pagination",
      "API errors",
    ],

    practice: [
      "Consume REST APIs",
      "Send authenticated requests",
      "Handle API failures",
    ],

    build: ["Build a CRUD frontend connected to an API."],

    validate: [
      "Implement loading, success, empty, and error states for API data.",
    ],
  },

  metadata: {
    phase: "javascript-foundation",
    tags: ["http", "api", "rest"],
  },
});

const modules = createKnowledgeNode({
  id: "javascript-modules",
  title: "JavaScript Modules & Tooling",
  category: "javascript",
  importance: "important",

  description:
    "Structure JavaScript applications into maintainable modules and understand modern frontend tooling.",

  whyItMatters:
    "Production applications contain many files and dependencies. Modules and tooling keep the codebase maintainable.",

  prerequisites: ["javascript"],

  enables: ["react", "frontend-architecture"],

  guidance: {
    beginner:
      "Understand import/export and the purpose of a build tool before diving into advanced configuration.",

    alreadyKnown:
      "Validate ESM, dependency management, package.json, npm scripts, and bundler concepts.",

    partialKnowledge:
      "Focus on import/export, npm, package.json, scripts, and dependency management.",

    nextStep: "Use modules naturally in React applications.",
  },

  practice: {
    learn: [
      "ES modules",
      "import/export",
      "package.json",
      "npm",
      "Dependencies",
      "Dev dependencies",
      "Scripts",
      "Build tools",
      "Bundling concepts",
    ],

    practice: [
      "Split an application into modules",
      "Create npm scripts",
      "Install and manage dependencies",
    ],

    build: ["Convert a small JavaScript project into a modular application."],

    validate: ["Explain why frontend applications need a build process."],
  },

  metadata: {
    phase: "javascript-foundation",
    tags: ["modules", "npm", "tooling"],
  },
});

/* -------------------------------------------------------------------------- */
/* Frontend Engineering                                                       */
/* -------------------------------------------------------------------------- */

const forms = createKnowledgeNode({
  id: "forms",
  title: "Frontend Forms",
  category: "frontend-engineering",
  importance: "core",

  description:
    "Build reliable forms with validation, accessible controls, and clear feedback.",

  whyItMatters:
    "Forms are central to authentication, onboarding, search, payments, dashboards, and business applications.",

  prerequisites: ["html", "javascript", "accessibility"],

  enables: ["react", "frontend-testing"],

  guidance: {
    beginner:
      "Start with native HTML forms and browser validation before relying on libraries.",

    alreadyKnown:
      "Validate controlled inputs, validation strategy, accessibility, error states, and submission handling.",

    partialKnowledge:
      "Focus on input state, validation, submission, and error feedback.",

    nextStep:
      "Build forms using React once the browser fundamentals are clear.",
  },

  practice: {
    learn: [
      "Form controls",
      "Labels",
      "Validation",
      "Input state",
      "Submission",
      "Error states",
      "Accessible feedback",
    ],

    practice: [
      "Build login and registration forms",
      "Validate user input",
      "Handle server-side validation errors",
    ],

    build: ["Build a production-style registration form."],

    validate: ["Handle invalid input without losing user-entered data."],
  },

  metadata: {
    phase: "frontend-engineering",
    tags: ["forms", "validation", "ux"],
  },
});

const frontendArchitecture = createKnowledgeNode({
  id: "frontend-architecture",
  title: "Frontend Architecture",
  category: "frontend-engineering",
  importance: "important",

  description:
    "Learn how to organize frontend applications so they remain understandable as they grow.",

  whyItMatters:
    "A small project can work with almost any structure. Large applications require clear boundaries and predictable dependencies.",

  prerequisites: ["javascript-modules", "http-and-apis", "forms"],

  enables: ["react", "state-management", "production-frontend"],

  guidance: {
    beginner:
      "Do not over-engineer. First learn separation of concerns, reusable components, and clear data flow.",

    alreadyKnown:
      "Validate feature-based organization, dependency boundaries, state ownership, and API separation.",

    partialKnowledge:
      "Focus on component responsibility, data flow, reusable logic, and folder organization.",

    nextStep: "Apply these principles while building React applications.",
  },

  practice: {
    learn: [
      "Separation of concerns",
      "Component responsibility",
      "Reusable logic",
      "Data flow",
      "Feature boundaries",
      "API layer separation",
      "Configuration separation",
    ],

    practice: [
      "Refactor a messy frontend",
      "Separate API logic from UI logic",
      "Identify duplicated responsibilities",
    ],

    build: [
      "Structure a medium-sized frontend using feature-oriented organization.",
    ],

    validate: ["Explain why each major part of the application exists."],
  },

  metadata: {
    phase: "frontend-engineering",
    tags: ["architecture", "code-organization"],
  },
});

/* -------------------------------------------------------------------------- */
/* React                                                                      */
/* -------------------------------------------------------------------------- */

const react = createKnowledgeNode({
  id: "react",
  title: "React Fundamentals",
  category: "react",
  importance: "core",

  description: "Learn component-based UI development using React.",

  whyItMatters:
    "React provides the component model and rendering approach used by a large ecosystem of modern frontend applications.",

  prerequisites: [
    "javascript",
    "javascript-modules",
    "dom",
    "frontend-architecture",
  ],

  enables: [
    "react-hooks",
    "react-routing",
    "react-data-fetching",
    "react-state-management",
  ],

  alternatives: ["vue", "angular"],

  guidance: {
    beginner:
      "Learn React after JavaScript fundamentals. Focus on the component mental model instead of memorizing APIs.",

    alreadyKnown:
      "Validate components, JSX, props, state, events, rendering, and composition.",

    partialKnowledge:
      "Revisit components, props, state, and one-way data flow.",

    nextStep: "Move into hooks and real application patterns.",
  },

  practice: {
    learn: [
      "Components",
      "JSX",
      "Props",
      "State",
      "Events",
      "Conditional rendering",
      "Lists",
      "Keys",
      "Component composition",
      "One-way data flow",
    ],

    practice: [
      "Convert static UI into components",
      "Build reusable components",
      "Pass data through props",
      "Manage local state",
    ],

    build: ["Build a small React dashboard."],

    validate: ["Explain why a component re-renders and what data caused it."],
  },

  metadata: {
    phase: "react",
    tags: ["react", "components", "jsx"],
  },
});

const reactHooks = createKnowledgeNode({
  id: "react-hooks",
  title: "React Hooks",
  category: "react",
  importance: "core",

  description:
    "Use React hooks to manage state, side effects, references, and reusable behavior.",

  whyItMatters:
    "Hooks are fundamental to modern React application development.",

  prerequisites: ["react"],

  enables: [
    "react-data-fetching",
    "react-state-management",
    "frontend-testing",
  ],

  guidance: {
    beginner: "Understand why a hook exists before memorizing its syntax.",

    alreadyKnown:
      "Validate useState, useEffect, useRef, useMemo, useCallback, custom hooks, and dependency behavior.",

    partialKnowledge:
      "Focus on state, effects, refs, and custom hooks before optimization hooks.",

    nextStep: "Use hooks to build real application features.",
  },

  practice: {
    learn: [
      "useState",
      "useEffect",
      "useRef",
      "useMemo",
      "useCallback",
      "Custom hooks",
      "Effect dependencies",
    ],

    practice: [
      "Build reusable hooks",
      "Handle API loading state",
      "Manage browser subscriptions",
    ],

    build: ["Build a reusable data-fetching hook."],

    validate: ["Explain when an effect runs and why."],
  },

  metadata: {
    phase: "react",
    tags: ["react", "hooks"],
  },
});

const reactRouting = createKnowledgeNode({
  id: "react-routing",
  title: "Client-Side Routing",
  category: "react",
  importance: "core",

  description:
    "Build multi-page experiences within a frontend application using client-side routing.",

  whyItMatters:
    "Real applications contain multiple views, protected pages, nested routes, parameters, and navigation flows.",

  prerequisites: ["react"],

  enables: ["authentication", "frontend-architecture"],

  guidance: {
    beginner:
      "Learn route configuration, navigation, parameters, nested routes, and protected routes.",

    alreadyKnown:
      "Validate nested routing, route parameters, redirects, lazy routes, and authentication-aware navigation.",

    partialKnowledge:
      "Focus on basic routes, navigation, params, and protected routes.",

    nextStep: "Combine routing with authentication and application state.",
  },

  practice: {
    learn: [
      "Routes",
      "Navigation",
      "Route parameters",
      "Nested routes",
      "Protected routes",
      "Redirects",
      "Not-found routes",
    ],

    practice: [
      "Create dashboard routes",
      "Implement protected pages",
      "Handle route parameters",
    ],

    build: ["Build a multi-page dashboard application."],

    validate: [
      "Implement a protected route without exposing private UI states incorrectly.",
    ],
  },

  metadata: {
    phase: "react",
    tags: ["react", "routing"],
  },
});

const reactDataFetching = createKnowledgeNode({
  id: "react-data-fetching",
  title: "Data Fetching & Server State",
  category: "react",
  importance: "core",

  description:
    "Manage remote API data, loading states, errors, caching, and synchronization in React applications.",

  whyItMatters:
    "Production applications depend heavily on remote data and must handle more than the successful response case.",

  prerequisites: ["react", "react-hooks", "http-and-apis"],

  enables: ["production-frontend", "state-management"],

  guidance: {
    beginner:
      "First understand request lifecycle and server state before adding a data-fetching library.",

    alreadyKnown:
      "Validate caching, invalidation, retries, optimistic updates, pagination, and stale data.",

    partialKnowledge:
      "Focus on loading, success, empty, error, refetch, and mutation states.",

    nextStep:
      "Use a suitable server-state library when application complexity justifies it.",
  },

  practice: {
    learn: [
      "Loading state",
      "Error state",
      "Empty state",
      "Caching",
      "Refetching",
      "Mutations",
      "Pagination",
      "Optimistic updates",
    ],

    practice: [
      "Implement CRUD API integration",
      "Handle stale data",
      "Implement optimistic UI updates",
    ],

    build: ["Build a production-style CRUD dashboard."],

    validate: ["Handle all major API states without breaking the UI."],
  },

  metadata: {
    phase: "react",
    tags: ["react", "api", "server-state"],
  },
});

const stateManagement = createKnowledgeNode({
  id: "react-state-management",
  title: "State Management",
  category: "react",
  importance: "important",

  description:
    "Understand how to choose and organize state inside larger frontend applications.",

  whyItMatters:
    "Not all state belongs in one global store. Correct state ownership keeps applications simpler and easier to maintain.",

  prerequisites: ["react", "react-hooks", "react-data-fetching"],

  enables: ["frontend-architecture", "production-frontend"],

  guidance: {
    beginner:
      "Start with local component state. Move state upward or globally only when there is a real need.",

    alreadyKnown:
      "Validate local state, lifted state, context, global state, and server state separation.",

    partialKnowledge:
      "Focus on deciding where state should live before learning state libraries.",

    nextStep:
      "Choose a state-management solution based on application requirements.",
  },

  practice: {
    learn: [
      "Local state",
      "Lifted state",
      "Derived state",
      "Context",
      "Global state",
      "Server state",
      "State ownership",
    ],

    practice: [
      "Refactor unnecessary global state",
      "Separate server state from UI state",
    ],

    build: [
      "Build an application with authentication, filters, UI state, and server data.",
    ],

    validate: [
      "Explain why each important piece of state lives where it does.",
    ],
  },

  metadata: {
    phase: "react",
    tags: ["state", "architecture"],
  },
});

/* -------------------------------------------------------------------------- */
/* TypeScript                                                                 */
/* -------------------------------------------------------------------------- */

const typescript = createKnowledgeNode({
  id: "typescript",
  title: "TypeScript",
  category: "typescript",
  importance: "core",

  description:
    "Add static typing and stronger tooling to JavaScript applications.",

  whyItMatters:
    "TypeScript improves maintainability, refactoring, developer tooling, and reliability in larger frontend codebases.",

  prerequisites: ["javascript", "react"],

  enables: ["react-typescript", "production-frontend"],

  guidance: {
    beginner:
      "Learn TypeScript after becoming comfortable with JavaScript. It should clarify JavaScript rather than replace understanding it.",

    alreadyKnown:
      "Validate unions, generics, narrowing, utility types, and API modeling.",

    partialKnowledge:
      "Focus on primitive types, objects, interfaces, unions, functions, and narrowing.",

    nextStep: "Apply TypeScript to React components and API responses.",
  },

  practice: {
    learn: [
      "Primitive types",
      "Arrays and objects",
      "Interfaces",
      "Type aliases",
      "Union types",
      "Generics",
      "Type narrowing",
      "Utility types",
      "Function types",
    ],

    practice: [
      "Convert JavaScript utilities to TypeScript",
      "Model API responses",
      "Type reusable functions",
    ],

    build: ["Convert a React project from JavaScript to TypeScript."],

    validate: ["Model a moderately complex API response without using any."],
  },

  metadata: {
    phase: "typescript",
    tags: ["typescript", "types"],
  },
});

const reactTypescript = createKnowledgeNode({
  id: "react-typescript",
  title: "React with TypeScript",
  category: "typescript",
  importance: "important",

  description:
    "Use TypeScript effectively across React components, hooks, forms, and API layers.",

  whyItMatters:
    "Production React codebases frequently combine React and TypeScript.",

  prerequisites: ["typescript", "react", "react-hooks"],

  enables: ["production-frontend", "frontend-architecture"],

  guidance: {
    beginner:
      "Learn component props, event types, hooks, forms, and API models first.",

    alreadyKnown:
      "Validate reusable generic components and strongly typed data-fetching patterns.",

    partialKnowledge:
      "Focus on props, events, state, refs, and API response typing.",

    nextStep: "Use typed architecture throughout production projects.",
  },

  practice: {
    learn: [
      "Typed props",
      "Typed state",
      "Event types",
      "Refs",
      "Custom hook types",
      "API response types",
      "Form types",
    ],

    practice: [
      "Type reusable components",
      "Type form handlers",
      "Type API clients",
    ],

    build: ["Build a fully typed React dashboard."],

    validate: ["Remove unsafe any usage from a realistic React feature."],
  },

  metadata: {
    phase: "typescript",
    tags: ["typescript", "react"],
  },
});

/* -------------------------------------------------------------------------- */
/* Production Frontend                                                       */
/* -------------------------------------------------------------------------- */

const frontendTesting = createKnowledgeNode({
  id: "frontend-testing",
  title: "Frontend Testing",
  category: "production",
  importance: "important",

  description:
    "Test frontend behavior at appropriate levels instead of relying only on manual testing.",

  whyItMatters:
    "Automated tests reduce regressions and make production applications safer to change.",

  prerequisites: ["react", "forms", "react-data-fetching"],

  enables: ["ci-cd", "production-frontend"],

  guidance: {
    beginner:
      "Start by testing user-visible behavior and important business flows.",

    alreadyKnown:
      "Validate unit, component, integration, and end-to-end testing trade-offs.",

    partialKnowledge:
      "Focus on component behavior, forms, API states, and critical flows.",

    nextStep: "Integrate important tests into CI.",
  },

  practice: {
    learn: [
      "Unit testing",
      "Component testing",
      "Integration testing",
      "End-to-end testing",
      "Mocking",
      "Test isolation",
    ],

    practice: [
      "Test forms",
      "Test loading and error states",
      "Test authenticated flows",
    ],

    build: ["Add automated tests to a production-style React application."],

    validate: [
      "A critical user flow should fail the test suite when its behavior is intentionally broken.",
    ],
  },

  metadata: {
    phase: "production-frontend",
    tags: ["testing", "quality"],
  },
});

const frontendPerformance = createKnowledgeNode({
  id: "frontend-performance",
  title: "Frontend Performance",
  category: "production",
  importance: "important",

  description:
    "Understand how loading, rendering, JavaScript execution, network requests, and assets affect user experience.",

  whyItMatters:
    "Performance affects usability, conversion, accessibility, and the perceived quality of an application.",

  prerequisites: ["react", "http-and-apis", "frontend-architecture"],

  enables: ["advanced-frontend", "production-frontend"],

  guidance: {
    beginner:
      "Learn to measure performance before optimizing. Do not optimize based only on intuition.",

    alreadyKnown:
      "Validate code splitting, lazy loading, caching, rendering costs, bundle size, and Core Web Vitals concepts.",

    partialKnowledge:
      "Start with network, image size, JavaScript bundle, rendering, and unnecessary work.",

    nextStep: "Use browser tooling to identify real bottlenecks.",
  },

  practice: {
    learn: [
      "Browser performance basics",
      "Network performance",
      "Bundle size",
      "Code splitting",
      "Lazy loading",
      "Caching",
      "Rendering performance",
      "Web performance metrics",
    ],

    practice: [
      "Inspect performance traces",
      "Analyze bundle size",
      "Optimize large assets",
    ],

    build: ["Take a slow frontend and measure then improve its performance."],

    validate: [
      "Explain what changed and what measurement improved after an optimization.",
    ],
  },

  metadata: {
    phase: "production-frontend",
    tags: ["performance", "optimization"],
  },
});

const webSecurity = createKnowledgeNode({
  id: "web-security",
  title: "Frontend Web Security",
  category: "security",
  importance: "core",

  description:
    "Understand common browser and frontend security risks and how frontend applications interact with secure backends.",

  whyItMatters:
    "Frontend applications handle authentication flows, user input, tokens, sensitive data, and untrusted content.",

  prerequisites: ["web-fundamentals", "http-and-apis", "react"],

  enables: ["production-frontend", "authentication"],

  guidance: {
    beginner:
      "Focus on practical browser security and safe data handling before advanced security testing.",

    alreadyKnown:
      "Validate XSS, CSRF concepts, content security, secure cookies, CORS, and unsafe input handling.",

    partialKnowledge:
      "Start with XSS, authentication storage decisions, CORS, and browser security boundaries.",

    nextStep: "Apply secure defaults to authentication and API integration.",
  },

  practice: {
    learn: [
      "XSS",
      "CSRF concepts",
      "CORS",
      "Content Security Policy basics",
      "Secure cookies",
      "Input handling",
      "Sensitive data exposure",
      "Browser security model",
    ],

    practice: [
      "Identify unsafe rendering",
      "Inspect authentication cookies",
      "Review frontend API requests for sensitive data",
    ],

    build: [
      "Secure a frontend authentication flow against common browser-side mistakes.",
    ],

    validate: [
      "Explain why user-controlled HTML must not be rendered blindly.",
    ],
  },

  metadata: {
    phase: "production-frontend",
    tags: ["security", "xss", "cors", "browser-security"],
  },
});

const authentication = createKnowledgeNode({
  id: "authentication",
  title: "Frontend Authentication",
  category: "production",
  importance: "core",

  description:
    "Integrate authentication and authorization-aware UI with backend services.",

  whyItMatters:
    "Most real applications have authenticated users, protected resources, sessions, roles, or permissions.",

  prerequisites: ["http-and-apis", "react-routing", "web-security"],

  enables: ["production-frontend", "frontend-architecture"],

  guidance: {
    beginner:
      "Understand the difference between authentication and authorization. Frontend checks improve UX but do not replace backend authorization.",

    alreadyKnown:
      "Validate sessions, access tokens, refresh behavior, protected routes, roles, and logout flows.",

    partialKnowledge:
      "Focus on login state, session persistence, protected UI, and server-authoritative authorization.",

    nextStep: "Build authentication into a complete application.",
  },

  practice: {
    learn: [
      "Authentication",
      "Authorization",
      "Sessions",
      "Access tokens",
      "Refresh concepts",
      "Protected routes",
      "Logout",
      "Role-aware UI",
    ],

    practice: [
      "Implement login state",
      "Handle expired authentication",
      "Protect application routes",
    ],

    build: ["Build a dashboard with authentication and role-aware navigation."],

    validate: [
      "Explain why hiding a button in the frontend is not authorization.",
    ],
  },

  metadata: {
    phase: "production-frontend",
    tags: ["authentication", "authorization", "security"],
  },
});

const designSystems = createKnowledgeNode({
  id: "design-systems",
  title: "Design Systems",
  category: "advanced-frontend",
  importance: "important",

  description:
    "Create reusable visual and interaction patterns for consistent applications.",

  whyItMatters:
    "Larger products need consistency across components, pages, teams, and future features.",

  prerequisites: ["css", "react", "frontend-architecture"],

  enables: ["advanced-frontend", "creative-frontend"],

  guidance: {
    beginner:
      "Start with reusable components and design tokens. A full design system is not required for every project.",

    alreadyKnown:
      "Validate component APIs, tokens, variants, accessibility, documentation, and consistency.",

    partialKnowledge:
      "Focus on reusable UI primitives, spacing, typography, colors, and component variants.",

    nextStep: "Build a small reusable component system inside a real project.",
  },

  practice: {
    learn: [
      "Design tokens",
      "Reusable components",
      "Component variants",
      "Typography system",
      "Spacing system",
      "Accessibility",
      "Component documentation",
    ],

    practice: [
      "Extract repeated UI patterns",
      "Create reusable button, input, modal, and card components",
    ],

    build: ["Build a small reusable UI component library."],

    validate: ["A new page can be built primarily from existing components."],
  },

  metadata: {
    phase: "advanced-frontend",
    tags: ["design-system", "components", "ui"],
  },
});

/* -------------------------------------------------------------------------- */
/* Deployment & Delivery                                                      */
/* -------------------------------------------------------------------------- */

const buildAndDeployment = createKnowledgeNode({
  id: "build-and-deployment",
  title: "Build & Deployment",

  category: "deployment",
  importance: "core",

  description:
    "Understand how frontend source code becomes a deployable production application.",

  whyItMatters:
    "Frontend engineering does not end when the application works on localhost.",

  prerequisites: ["javascript-modules", "react", "frontend-performance"],

  enables: ["ci-cd", "production-frontend"],

  guidance: {
    beginner:
      "Learn production builds, environment configuration, hosting, domains, and HTTPS before advanced infrastructure.",

    alreadyKnown:
      "Validate build pipelines, environment separation, asset delivery, CDN concepts, and deployment strategies.",

    partialKnowledge:
      "Focus on build command, environment variables, hosting, domain, and HTTPS.",

    nextStep: "Automate deployments using CI/CD.",
  },

  practice: {
    learn: [
      "Development vs production builds",
      "Environment variables",
      "Static assets",
      "Hosting",
      "Domains",
      "HTTPS",
      "CDN concepts",
    ],

    practice: [
      "Create a production build",
      "Configure environment variables",
      "Deploy a frontend application",
    ],

    build: ["Deploy a React application with a custom production environment."],

    validate: [
      "Deploy the application from a clean repository without manual source modifications.",
    ],
  },

  metadata: {
    phase: "deployment-and-delivery",
    tags: ["deployment", "hosting", "build"],
  },
});

const ciCd = createKnowledgeNode({
  id: "ci-cd",
  title: "Frontend CI/CD",
  category: "deployment",
  importance: "important",

  description:
    "Automate testing, building, and deployment of frontend applications.",

  whyItMatters:
    "Automation makes releases repeatable and reduces manual deployment mistakes.",

  prerequisites: ["git", "frontend-testing", "build-and-deployment"],

  enables: ["production-frontend"],

  guidance: {
    beginner: "Start with a simple pipeline: install → test → build.",

    alreadyKnown:
      "Validate branch checks, deployment environments, secrets, artifacts, and rollback concepts.",

    partialKnowledge: "Focus on automated testing and production builds first.",

    nextStep: "Add deployment only after the validation pipeline is reliable.",
  },

  practice: {
    learn: [
      "CI",
      "CD",
      "Pipeline stages",
      "Secrets",
      "Artifacts",
      "Environment separation",
      "Deployment checks",
    ],

    practice: [
      "Run tests automatically on pull requests",
      "Build production bundles automatically",
    ],

    build: ["Create a CI/CD pipeline for a React application."],

    validate: [
      "A pull request should automatically fail when the project no longer builds or tests successfully.",
    ],
  },

  metadata: {
    phase: "deployment-and-delivery",
    tags: ["ci", "cd", "automation"],
  },
});

/* -------------------------------------------------------------------------- */
/* Advanced / Specialization                                                  */
/* -------------------------------------------------------------------------- */

const advancedFrontend = createKnowledgeNode({
  id: "advanced-frontend",
  title: "Advanced Frontend Architecture",
  category: "advanced-frontend",
  importance: "advanced",

  description:
    "Reason about architecture, scalability, rendering, performance, and maintainability in larger frontend applications.",

  whyItMatters:
    "Senior frontend engineering is increasingly about making good trade-offs rather than simply knowing framework APIs.",

  prerequisites: [
    "frontend-architecture",
    "react-state-management",
    "frontend-performance",
    "typescript",
    "design-systems",
  ],

  enables: ["creative-frontend", "ai-frontend"],

  guidance: {
    beginner:
      "Do not start here. Reach this phase after building and maintaining real applications.",

    alreadyKnown:
      "Use this area for deeper architecture and scalability decisions.",

    partialKnowledge:
      "Choose one architectural problem from a real project and study it deeply.",

    nextStep: "Choose a specialization based on career goals.",
  },

  practice: {
    learn: [
      "Large application architecture",
      "Rendering strategies",
      "Advanced performance",
      "State architecture",
      "Component boundaries",
      "Scalability trade-offs",
    ],

    practice: [
      "Analyze large frontend architectures",
      "Refactor a growing application",
    ],

    build: [
      "Design and implement a large frontend application with clear boundaries.",
    ],

    validate: ["Explain major architectural trade-offs in your project."],
  },

  metadata: {
    phase: "advanced-frontend",
    tags: ["architecture", "scalability", "senior"],
  },
});

const creativeFrontend = createKnowledgeNode({
  id: "creative-frontend",
  title: "Creative Frontend",
  category: "specialization",
  importance: "optional",

  description:
    "Explore advanced visual interfaces, animation, creative coding, and immersive web experiences.",

  whyItMatters:
    "Creative frontend is useful for portfolios, brand experiences, interactive products, and visually differentiated applications.",

  prerequisites: ["css", "react", "frontend-performance"],

  enables: [],

  guidance: {
    beginner:
      "Optional specialization. Do not learn this before core frontend engineering is strong.",

    alreadyKnown:
      "Choose only the visual technologies relevant to your target projects.",

    partialKnowledge:
      "Start with animation fundamentals before moving into 3D.",

    nextStep:
      "Choose animation, creative coding, or 3D based on the type of experience you want to build.",
  },

  practice: {
    learn: [
      "Web animation",
      "GSAP concepts",
      "Motion design",
      "Canvas basics",
      "Three.js concepts",
      "React Three Fiber concepts",
    ],

    practice: [
      "Animate interfaces",
      "Build interactive visual sections",
      "Experiment with 3D scenes",
    ],

    build: ["Build an interactive portfolio or creative landing page."],

    validate: [
      "Maintain good usability and performance while adding visual effects.",
    ],
  },

  metadata: {
    phase: "specializations",
    tags: ["creative", "animation", "threejs", "gsap"],
    optional: true,
  },
});

const aiFrontend = createKnowledgeNode({
  id: "ai-frontend",
  title: "AI-Enhanced Frontend",

  category: "specialization",
  importance: "optional",

  description:
    "Integrate AI capabilities into frontend applications while maintaining good UX, security, and performance.",

  whyItMatters:
    "AI-powered interfaces are becoming a practical application pattern across search, productivity, content, and developer tools.",

  prerequisites: [
    "react",
    "http-and-apis",
    "frontend-architecture",
    "web-security",
  ],

  enables: [],

  guidance: {
    beginner:
      "Learn this after core frontend and API integration. AI does not replace frontend fundamentals.",

    alreadyKnown:
      "Focus on streaming UI, latency handling, errors, usage limits, and secure backend integration.",

    partialKnowledge:
      "Start by integrating an AI-backed API rather than implementing models yourself.",

    nextStep: "Build one focused AI-powered product feature.",
  },

  practice: {
    learn: [
      "AI API integration",
      "Streaming responses",
      "Loading states",
      "Error handling",
      "Conversation UI",
      "Usage limits",
      "Secure API architecture",
    ],

    practice: [
      "Build streaming responses",
      "Handle partial results",
      "Design useful AI loading states",
    ],

    build: ["Build an AI-powered frontend feature backed by a secure API."],

    validate: [
      "The frontend remains usable when the AI service is slow, unavailable, or returns an error.",
    ],
  },

  metadata: {
    phase: "specializations",
    tags: ["ai", "llm", "frontend"],
    optional: true,
  },
});

/* -------------------------------------------------------------------------- */
/* Public Node Collection                                                     */
/* -------------------------------------------------------------------------- */

export const frontendNodes = [
  /* Web Foundation */
  webFundamentals,
  html,
  css,
  responsiveDesign,
  accessibility,
  git,

  /* JavaScript */
  javascript,
  dom,
  asyncJavascript,
  httpApis,
  modules,

  /* Frontend Engineering */
  forms,
  frontendArchitecture,

  /* React */
  react,
  reactHooks,
  reactRouting,
  reactDataFetching,
  stateManagement,

  /* TypeScript */
  typescript,
  reactTypescript,

  /* Production */
  frontendTesting,
  frontendPerformance,
  webSecurity,
  authentication,

  /* Advanced */
  designSystems,

  /* Deployment */
  buildAndDeployment,
  ciCd,

  /* Advanced / Specialization */
  advancedFrontend,
  creativeFrontend,
  aiFrontend,
];

export default frontendNodes;

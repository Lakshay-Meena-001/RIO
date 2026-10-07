import { IMPORTANCE } from "../../constants/roadmap.constants.js";
import { createSkillDefinition } from "./skill.schema.js";

const javascript = createSkillDefinition({
  id: "javascript",
  title: "JavaScript",
  category: "language",
  importance: IMPORTANCE.CORE,

  description: "A core programming language for modern web development.",

  whyItMatters:
    "JavaScript is fundamental to frontend development and is also widely used on the backend through Node.js.",

  prerequisites: [],

  enables: ["react", "nodejs"],

  alternatives: [],

  related: ["typescript"],

  guidance: {
    beginner:
      "Learn fundamentals first: variables, functions, objects, arrays, scope, closures, asynchronous programming and modules.",

    alreadyKnown:
      "Move toward deeper JavaScript concepts and practical usage in the chosen frontend or backend path.",

    partialKnowledge:
      "Strengthen core language fundamentals before moving heavily into frameworks.",

    nextStep:
      "Choose the next path based on the target role: React for frontend or Node.js for backend.",
  },
});

export default javascript;

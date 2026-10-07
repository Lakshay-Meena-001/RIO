import { skills, getSkill } from "./skills/index.js";

const knowledgeBase = Object.freeze({
  version: 1,
  skills,
});

export { knowledgeBase, getSkill };

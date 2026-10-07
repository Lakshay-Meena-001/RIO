import javascript from "./javascript.js";

const skills = Object.freeze({
  javascript,
});

const getSkill = (skillId) => skills[skillId] ?? null;

export { skills, getSkill };

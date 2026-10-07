import { IMPORTANCE } from "../../constants/roadmap.constants.js";

const createSkillDefinition = ({
  id,
  title,
  category,
  importance = IMPORTANCE.IMPORTANT,
  description,
  whyItMatters,
  prerequisites = [],
  enables = [],
  alternatives = [],
  related = [],
  guidance = {},
}) => ({
  id,
  title,
  category,
  importance,
  description,
  whyItMatters,
  prerequisites,
  enables,
  alternatives,
  related,
  guidance: {
    beginner: guidance.beginner ?? "",
    alreadyKnown: guidance.alreadyKnown ?? "",
    partialKnowledge: guidance.partialKnowledge ?? "",
    nextStep: guidance.nextStep ?? "",
  },
});

export { createSkillDefinition };

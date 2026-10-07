import frontendDeveloper from "./frontend-developer.js";

const roadmaps = Object.freeze({
  "frontend-developer": frontendDeveloper,
});

const getRoadmapTemplate = (roadmapId) =>
  roadmaps[roadmapId] ?? null;

export {
  roadmaps,
  getRoadmapTemplate,
};
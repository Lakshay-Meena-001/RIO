import frontendDeveloper from "./frontend-developer.js";
import backendDeveloperRoadmap from "./roadmaps/backend-developer/index.js";

export const roadmapTemplates = {
  "frontend-developer": frontendDeveloperRoadmap,
  "backend-developer": backendDeveloperRoadmap,
};

const getRoadmapTemplate = (roadmapId) => roadmaps[roadmapId] ?? null;

export { roadmaps, getRoadmapTemplate };

import frontendDeveloperRoadmap from "./roadmaps/frontend-developer/index.js";
import backendDeveloperRoadmap from "./roadmaps/backend-developer/index.js";
import cloudEngineerRoadmap from "./roadmaps/cloud-engineer/index.js";
import devopsPlatformEngineerRoadmap from "./roadmaps/devops-platform-engineer/index.js";
import dataEngineerRoadmap from "./roadmaps/data-engineer/index.js";
import aiMlEngineerRoadmap from "./roadmaps/ai-ml-engineer/index.js";
import genAiLlmEngineerRoadmap from "./roadmaps/gen-ai-llm-engineer/index.js";
import cybersecuritySecurityEngineerRoadmap from "./roadmaps/cybersecurity-security-engineer/index.js";
import fullStackDeveloperRoadmap from "./roadmaps/full-stack-developer/index.js";
import systemDesignSoftwareArchitectureRoadmap from "./roadmaps/system-design-software-architecture/index.js";

export const roadmapTemplates = {
  "frontend-developer": frontendDeveloperRoadmap,

  "backend-developer": backendDeveloperRoadmap,

  "cloud-engineer": cloudEngineerRoadmap,

  "devops-platform-engineer": devopsPlatformEngineerRoadmap,

  "data-engineer": dataEngineerRoadmap,

  "ai-ml-engineer": aiMlEngineerRoadmap,

  "gen-ai-llm-engineer": genAiLlmEngineerRoadmap,

  "cybersecurity-security-engineer": cybersecuritySecurityEngineerRoadmap,

  "full-stack-developer": fullStackDeveloperRoadmap,

  "system-design-software-architecture":
    systemDesignSoftwareArchitectureRoadmap,
};

const getRoadmapTemplate = (roadmapId) => roadmapTemplates[roadmapId] ?? null;

const getAllRoadmapTemplates = () => Object.values(roadmapTemplates);

const hasRoadmapTemplate = (roadmapId) =>
  Object.prototype.hasOwnProperty.call(roadmapTemplates, roadmapId);

export { getRoadmapTemplate, getAllRoadmapTemplates, hasRoadmapTemplate };

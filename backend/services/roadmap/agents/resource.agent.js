import {
  findRelevantYouTubeVideos,
  buildYouTubeResource,
} from "../services/youtube.service.js";

const MAX_RESOURCES_PER_MODULE = 3;

const buildModuleTopic = (module) => {
  return [
    module.title,
    module.description,
    module.whyItMatters,
    module.learningOutcomes
      ?.slice(0, 3)
      .join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
};

export const getResourcesForModule = async (
  module,
) => {
  const topic = buildModuleTopic(module);

  if (!topic) {
    return [];
  }

  const rankedVideos =
    await findRelevantYouTubeVideos({
      topic,
      maxResults: 8,
    });

  if (!rankedVideos.length) {
    return [];
  }

  return rankedVideos
    .slice(0, MAX_RESOURCES_PER_MODULE)
    .map(({ video }, index) =>
      buildYouTubeResource(video, {
        isPrimary: index === 0,

        reason:
          index === 0
            ? "Selected as the primary learning resource because it has strong topic relevance and quality signals."
            : "Selected as a supplementary resource for additional explanation or practice.",
      }),
    )
    .filter(Boolean);
};

export const getResourcesForRoadmap = async (
  modules,
) => {
  if (
    !Array.isArray(modules) ||
    modules.length === 0
  ) {
    return [];
  }

  const resources = [];

  for (const module of modules) {
    try {
      const moduleResources =
        await getResourcesForModule(module);

      resources.push({
        moduleOrder: module.order,
        resources: moduleResources,
      });
    } catch (error) {
      console.error(
        "Resource selection failed:",
        {
          moduleOrder: module.order,
          message: error.message,
        },
      );

      resources.push({
        moduleOrder: module.order,
        resources: [],
      });
    }
  }

  return resources;
};
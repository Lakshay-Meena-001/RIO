import { StateGraph, START, END } from "@langchain/langgraph";

import { roadmapState } from "./roadmap.state.js";
import { generateRoadmap } from "../agents/roadmap.agent.js";
import { getResourcesForRoadmap } from "../agents/resource.agent.js";
import {
  LEARNING_SYSTEM,
  LEARNING_SYSTEM_VERSION,
} from "../constants/learning-system.js";

const generateRoadmapNode = async (state) => {
  const roadmap = await generateRoadmap({
    role: state.role,
    targetPackage: state.targetPackage,
    resume: state.resume,
  });

  return {
    roadmap,
  };
};

const generateResourcesNode = async (state) => {
  if (!state.roadmap?.modules?.length) {
    return {
      resources: [],
    };
  }

  const resources = await getResourcesForRoadmap(state.roadmap.modules);

  return {
    resources,
  };
};

const attachResourcesNode = async (state) => {
  if (!state.roadmap?.modules?.length) {
    return {
      roadmap: state.roadmap,
    };
  }

  const resourceMap = new Map(
    state.resources.map((item) => [item.moduleOrder, item.resources]),
  );

  const modules = state.roadmap.modules.map((module) => ({
    ...module,
    resources: resourceMap.get(module.order) || [],
  }));

  return {
    roadmap: {
      ...state.roadmap,
      modules,
    },
  };
};

const attachLearningSystemNode = async () => {
  return {
    learningSystem: {
      version: LEARNING_SYSTEM_VERSION,
      ...LEARNING_SYSTEM,
    },
  };
};

const roadmapGraph = new StateGraph(roadmapState)
  .addNode("generateRoadmap", generateRoadmapNode)
  .addNode("generateResources", generateResourcesNode)
  .addNode("attachResources", attachResourcesNode)
  .addNode("attachLearningSystem", attachLearningSystemNode)

  .addEdge(START, "generateRoadmap")
  .addEdge("generateRoadmap", "generateResources")
  .addEdge("generateResources", "attachResources")
  .addEdge("attachResources", "attachLearningSystem")
  .addEdge("attachLearningSystem", END);

export const compiledRoadmapGraph = roadmapGraph.compile();

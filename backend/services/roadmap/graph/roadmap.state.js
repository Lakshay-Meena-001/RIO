import { Annotation } from "@langchain/langgraph";

export const roadmapState = Annotation.Root({
  userId: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  role: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  targetPackage: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  resume: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  roadmap: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  resources: Annotation({
    reducer: (_, next) => next,
    default: () => [],
  }),

  learningSystem: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  error: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),
});

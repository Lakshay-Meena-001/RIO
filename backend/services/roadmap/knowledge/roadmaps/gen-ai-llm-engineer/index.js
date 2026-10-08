import { createRoadmapTemplate } from "../../factory.js";

import genAiLlmEngineerPhases from "./phase.js";
import genAiLlmEngineerNodes from "./node.js";
import genAiLlmEngineerEdges from "./edge.js";

const genAiLlmEngineerRoadmap = createRoadmapTemplate({
  id: "gen-ai-llm-engineer",
  version: 1,
  type: "career-roadmap",

  title: "Generative AI / LLM Engineer",

  description:
    "A comprehensive production-oriented Generative AI and LLM Engineer roadmap covering Python, AI/ML, mathematics, deep learning, PyTorch, NLP, sequence models, attention, transformers, LLM fundamentals, tokenization, embeddings, pretraining, inference, prompt engineering, LLM APIs, structured outputs, fine-tuning, PEFT, RAG, advanced RAG, agents, evaluation, security, LLMOps, GPU infrastructure, distributed LLM systems, cloud and advanced AI system design.",

  goal: "Build the ability to understand, develop, integrate, fine-tune, evaluate, deploy, secure, observe and scale modern Generative AI and LLM systems in production.",

  nodes: genAiLlmEngineerNodes,

  edges: genAiLlmEngineerEdges,

  alternatives: [
    {
      id: "programming",
      title: "AI Programming",
      type: "primary",
      description:
        "Python is the primary implementation language across the AI/ML and LLM ecosystem.",
      technologyPath: ["Python", "NumPy", "Pandas"],
    },

    {
      id: "machine-learning",
      title: "Machine Learning",
      type: "foundation",
      description:
        "Classical ML provides the conceptual foundation for understanding model training, evaluation and generalization.",
      technologyPath: [
        "Classical ML",
        "Supervised Learning",
        "Model Evaluation",
      ],
    },

    {
      id: "deep-learning",
      title: "Deep Learning",
      type: "foundation",
      description:
        "Deep learning provides the neural-network foundation underneath modern foundation models.",
      technologyPath: ["Neural Networks", "PyTorch", "GPU Computing"],
    },

    {
      id: "deep-learning-framework",
      title: "Deep Learning Framework",
      type: "primary",
      description:
        "PyTorch is the primary framework for hands-on LLM and deep-learning development.",
      technologyPath: ["PyTorch", "TensorFlow", "JAX"],
    },

    {
      id: "nlp",
      title: "Natural Language Processing",
      type: "foundation",
      description:
        "NLP provides the language-processing foundation required to understand transformers and LLMs.",
      technologyPath: ["NLP", "Sequence Models", "Text Representations"],
    },

    {
      id: "transformers",
      title: "Transformer Engineering",
      type: "primary",
      description:
        "Transformers are the architectural foundation of modern LLM systems.",
      technologyPath: [
        "Attention",
        "Transformers",
        "Modern Transformer Architectures",
      ],
    },

    {
      id: "llm-development",
      title: "LLM Development",
      type: "primary",
      description:
        "Understand LLM internals before relying exclusively on hosted APIs.",
      technologyPath: [
        "LLM Fundamentals",
        "Tokenization",
        "Pretraining",
        "Inference",
      ],
    },

    {
      id: "application-engineering",
      title: "LLM Application Engineering",
      type: "primary",
      description:
        "Build production applications around hosted and open-source foundation models.",
      technologyPath: [
        "Prompt Engineering",
        "LLM APIs",
        "Structured Outputs",
        "Tool Calling",
      ],
    },

    {
      id: "open-source-llm",
      title: "Open-Source LLM Engineering",
      type: "advanced",
      description:
        "Work directly with open-source models, model repositories and model adaptation.",
      technologyPath: [
        "Hugging Face",
        "Fine-Tuning",
        "LoRA",
        "QLoRA",
        "Model Serving",
      ],
    },

    {
      id: "rag",
      title: "Retrieval-Augmented Generation",
      type: "primary",
      description:
        "Build grounded AI systems using embeddings, vector search and retrieval pipelines.",
      technologyPath: [
        "Embeddings",
        "Vector Search",
        "RAG",
        "Advanced RAG",
        "RAG Evaluation",
      ],
    },

    {
      id: "agents",
      title: "AI Agents",
      type: "advanced",
      description:
        "Build controlled tool-using AI systems when dynamic workflows require agentic behavior.",
      technologyPath: [
        "Tool Calling",
        "Agent Orchestration",
        "Agent Memory",
        "Multi-Agent Systems",
      ],
    },

    {
      id: "fine-tuning",
      title: "LLM Fine-Tuning",
      type: "advanced",
      description:
        "Adapt pretrained models when prompting and retrieval are insufficient.",
      technologyPath: ["Supervised Fine-Tuning", "PEFT", "LoRA", "QLoRA"],
    },

    {
      id: "evaluation",
      title: "AI Evaluation",
      type: "primary",
      description:
        "Evaluate model and application quality using measurable signals.",
      technologyPath: [
        "LLM Evaluation",
        "RAG Evaluation",
        "Automated Evaluation",
        "Human Evaluation",
      ],
    },

    {
      id: "security",
      title: "LLM Security",
      type: "primary",
      description:
        "Secure AI applications against prompt injection, data leakage and unsafe tool execution.",
      technologyPath: ["LLM Security", "Guardrails", "Tool Security"],
    },

    {
      id: "llmops",
      title: "LLMOps",
      type: "primary",
      description:
        "Operate LLM applications through evaluation, deployment, observability and lifecycle management.",
      technologyPath: ["LLMOps", "Observability", "Evaluation", "Deployment"],
    },

    {
      id: "cloud",
      title: "Cloud for AI",
      type: "primary",
      description:
        "AWS is the primary cloud path, with GCP and Azure as alternatives.",
      technologyPath: ["AWS", "GCP", "Azure"],
    },

    {
      id: "infrastructure",
      title: "AI Infrastructure",
      type: "advanced",
      description:
        "Operate models using GPUs, containers, cloud infrastructure and distributed systems.",
      technologyPath: [
        "GPU Computing",
        "Docker",
        "Kubernetes",
        "Cloud",
        "Distributed Systems",
      ],
    },
  ],

  metadata: {
    domain: "generative-ai-llm",

    careerRoles: [
      "Generative AI Engineer",
      "LLM Engineer",
      "AI Engineer",
      "Applied AI Engineer",
      "LLM Application Engineer",
      "AI Platform Engineer",
      "AI Infrastructure Engineer",
      "ML Engineer",
    ],

    primaryTechnologyPath: {
      language: "Python",
      numericalComputing: "NumPy",
      dataProcessing: "Pandas",
      machineLearning: "Classical ML fundamentals",
      deepLearning: "PyTorch",
      nlp: "Modern NLP",
      architecture: "Transformers",
      llm: "Large Language Models",
      ecosystem: "Hugging Face",
      application: "LLM APIs",
      structuredOutputs: "Schema-constrained outputs",
      tools: "Function / Tool Calling",
      retrieval: "Embeddings + Vector Search",
      rag: "RAG + Advanced RAG",
      fineTuning: "SFT + LoRA + QLoRA",
      agents: "Tool-using AI Agents",
      evaluation: "LLM + RAG Evaluation",
      security: "LLM Security + Guardrails",
      serving: "Production LLM Serving",
      operations: "LLMOps",
      cloud: "AWS",
      infrastructure: "GPU + Docker + Kubernetes",
    },

    alternativeTechnologyPaths: {
      deepLearning: ["TensorFlow", "JAX"],

      cloud: ["GCP", "Azure"],

      modelDeployment: ["Hosted Model APIs", "Self-hosted Open-Source Models"],

      retrieval: ["Vector Search", "Hybrid Search", "Reranking"],
    },

    technologyStrategy: {
      rule: "Master the conceptual foundation first, then one primary LLM application and production stack deeply. Specializations such as fine-tuning, agents and distributed inference should be added according to the target role.",

      primaryLanguage: "Python",

      primaryDeepLearningFramework: "PyTorch",

      primaryLLMArchitecture: "Transformer",

      primaryApplicationPath: "LLM API + Structured Outputs + Tool Calling",

      primaryRetrievalPath: "Embeddings + Vector Search + RAG",

      primaryAdaptationPath: "Fine-Tuning + PEFT + LoRA",

      primaryOperationsPath: "Evaluation + Observability + LLMOps",

      primaryCloud: "AWS",

      primaryInfrastructure: "GPU + Docker + Kubernetes",
    },

    progression: genAiLlmEngineerPhases.map((phase) => ({
      order: phase.order,
      id: phase.id,
      title: phase.title,
    })),

    phases: genAiLlmEngineerPhases,

    roadmapPrinciples: [
      "GenAI engineering is broader than prompt engineering.",
      "Python is the primary programming language.",
      "AI, ML and deep-learning foundations are included before advanced LLM topics.",
      "Mathematics is learned for understanding rather than unnecessary mathematical overload.",
      "Classical ML provides useful foundations for evaluation and training concepts.",
      "Deep learning is required to understand modern foundation models.",
      "PyTorch is the primary deep-learning implementation framework.",
      "NLP fundamentals come before transformers.",
      "Attention should be understood before treating transformers as a black box.",
      "Transformers are the core architecture behind modern LLM systems.",
      "LLM fundamentals include tokenization, pretraining and inference.",
      "Prompt engineering is useful but is only one part of LLM engineering.",
      "Structured outputs make LLM integration more reliable.",
      "Tool calling connects models to real application capabilities.",
      "Embeddings and vector search provide the foundation for semantic retrieval.",
      "RAG should be understood from ingestion through retrieval and generation.",
      "Advanced RAG includes hybrid retrieval, query transformation and reranking.",
      "RAG quality must be evaluated rather than judged only through demos.",
      "Fine-tuning should be used when it solves a problem that prompting or retrieval cannot.",
      "LoRA and QLoRA provide practical parameter-efficient adaptation.",
      "Agents should be introduced only when dynamic tool-driven workflows justify their complexity.",
      "LLM evaluation is a first-class engineering concern.",
      "LLM observability is required for debugging and production operation.",
      "Security must cover prompts, data, tools and model interactions.",
      "Guardrails provide application-level controls around model behavior.",
      "Production AI requires serving, scaling, monitoring and lifecycle management.",
      "GPU and distributed-system knowledge becomes important for self-hosted and large-scale models.",
      "Cloud is an implementation environment; it does not replace AI fundamentals.",
      "Master one primary stack before exploring every available framework or platform.",
      "Advanced LLM engineering is about reliable AI systems, not merely using larger models.",
    ],

    knowledgeVersion: 1,
  },
});

export default genAiLlmEngineerRoadmap;
export { genAiLlmEngineerRoadmap };

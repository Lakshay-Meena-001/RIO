import { createRoadmapTemplate } from "../../factory.js";

import aiMlEngineerPhases from "./phase.js";
import aiMlEngineerNodes from "./node.js";
import aiMlEngineerEdges from "./edge.js";

const aiMlEngineerRoadmap = createRoadmapTemplate({
  id: "ai-ml-engineer",
  version: 1,
  type: "career-roadmap",

  title: "AI/ML Engineer",

  description:
    "A production-oriented AI/ML Engineer roadmap covering Python, mathematics, statistics, classical machine learning, deep learning, PyTorch, computer vision, NLP, transformers, LLMs, generative AI, RAG, fine-tuning, model serving, ML system design, MLOps, cloud, GPUs, distributed ML, security and production AI architecture.",

  goal: "Build the ability to develop, evaluate, deploy, monitor and scale production machine learning and AI systems, with Python, PyTorch and modern ML engineering practices as the primary implementation path.",

  nodes: aiMlEngineerNodes,

  edges: aiMlEngineerEdges,

  alternatives: [
    {
      id: "programming",
      title: "Programming",
      type: "primary",
      description:
        "Python is the primary implementation language for modern AI/ML engineering.",
      technologyPath: ["Python", "NumPy", "Pandas"],
    },

    {
      id: "deep-learning",
      title: "Deep Learning Frameworks",
      type: "primary",
      description:
        "PyTorch is the primary deep learning framework, with TensorFlow and JAX as alternatives.",
      technologyPath: ["PyTorch", "TensorFlow", "JAX"],
    },

    {
      id: "classical-ml",
      title: "Classical Machine Learning",
      type: "primary",
      description:
        "Scikit-learn is the primary framework for classical machine learning.",
      technologyPath: ["Scikit-learn"],
    },

    {
      id: "computer-vision",
      title: "Computer Vision",
      type: "specialization",
      description:
        "A specialization path for engineers working with visual data.",
      technologyPath: ["CNNs", "Vision Models", "PyTorch"],
    },

    {
      id: "nlp",
      title: "Natural Language Processing",
      type: "specialization",
      description:
        "A specialization path for language and text-based AI systems.",
      technologyPath: ["NLP", "Transformers", "LLMs"],
    },

    {
      id: "generative-ai",
      title: "Generative AI",
      type: "specialization",
      description:
        "A modern AI specialization covering foundation models, embeddings, RAG and fine-tuning.",
      technologyPath: [
        "Transformers",
        "LLMs",
        "Embeddings",
        "RAG",
        "Fine-tuning",
      ],
    },

    {
      id: "mlops",
      title: "MLOps",
      type: "primary",
      description:
        "Production ML requires experiment tracking, model lifecycle management, automated pipelines and monitoring.",
      technologyPath: [
        "MLflow",
        "Model Registry",
        "ML Pipelines",
        "Model Monitoring",
      ],
    },

    {
      id: "cloud",
      title: "Cloud for ML",
      type: "primary",
      description:
        "AWS is the primary cloud path, with GCP and Azure as alternatives.",
      technologyPath: ["AWS", "GCP", "Azure"],
    },

    {
      id: "infrastructure",
      title: "ML Production Infrastructure",
      type: "advanced",
      description:
        "Production ML systems benefit from containers, cloud infrastructure, deployment automation and observability.",
      technologyPath: [
        "Docker",
        "Kubernetes",
        "Cloud",
        "CI/CD",
        "Observability",
      ],
    },
  ],

  metadata: {
    domain: "ai-machine-learning",

    careerRoles: [
      "Machine Learning Engineer",
      "AI Engineer",
      "Applied ML Engineer",
      "Deep Learning Engineer",
      "Computer Vision Engineer",
      "NLP Engineer",
      "ML Platform Engineer",
      "MLOps Engineer",
    ],

    primaryTechnologyPath: {
      programming: "Python",
      numericalComputing: "NumPy",
      dataProcessing: "Pandas",
      classicalML: "Scikit-learn",
      deepLearning: "PyTorch",
      nlp: "Transformers",
      llm: "LLM ecosystem",
      retrieval: "Embeddings + Vector Search",
      generativeAI: "RAG + Fine-tuning",
      serving: "FastAPI",
      experimentation: "MLflow",
      cloud: "AWS",
      infrastructure: "Docker + Kubernetes",
      monitoring: "ML Observability",
    },

    alternativeTechnologyPaths: {
      deepLearning: ["TensorFlow", "JAX"],

      cloud: ["GCP", "Azure"],

      modelServing: ["gRPC"],

      featureStores: ["Feast"],
    },

    technologyStrategy: {
      rule: "Master the core ML concepts first, then one primary implementation stack deeply. Treat specialized technologies as branches rather than mandatory simultaneous tracks.",

      primaryLanguage: "Python",

      primaryClassicalMLFramework: "Scikit-learn",

      primaryDeepLearningFramework: "PyTorch",

      primaryCloud: "AWS",

      primaryServing: "FastAPI",

      primaryMLOps: "MLflow + automated ML pipelines",

      primaryInfrastructure: "Docker + Kubernetes",
    },

    progression: aiMlEngineerPhases.map((phase) => ({
      order: phase.order,
      id: phase.id,
      title: phase.title,
    })),

    phases: aiMlEngineerPhases,

    roadmapPrinciples: [
      "Build ML fundamentals before collecting frameworks.",
      "Python is the primary programming path.",
      "Mathematics should be learned for intuition and practical model understanding.",
      "Statistics is essential for reliable evaluation and experimentation.",
      "Classical ML should be understood before advanced deep learning.",
      "Scikit-learn is the primary classical ML framework.",
      "PyTorch is the primary deep learning framework.",
      "Computer vision and NLP are specialization branches.",
      "Transformers are a core foundation for modern language and multimodal AI.",
      "LLM engineering is a specialization within the broader AI/ML path.",
      "RAG and fine-tuning solve different problems and should not be treated as interchangeable.",
      "Model serving is part of ML engineering, not an optional afterthought.",
      "ML system design connects models to real production systems.",
      "MLOps is required when models become production systems.",
      "Monitoring must cover both infrastructure and model behavior.",
      "Cloud and GPU knowledge become increasingly important for production workloads.",
      "Distributed ML is an advanced specialization, not a beginner requirement.",
      "Security, privacy and responsible AI belong in production ML engineering.",
      "Master one primary technology path before exploring alternatives.",
      "Advanced ML engineering is about reliable systems, not simply larger models.",
    ],

    knowledgeVersion: 1,
  },
});

export default aiMlEngineerRoadmap;
export { aiMlEngineerRoadmap };

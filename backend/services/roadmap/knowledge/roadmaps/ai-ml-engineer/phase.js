const aiMlEngineerPhases = [
  {
    id: "ai-ml-foundation",
    order: 1,
    title: "AI & Machine Learning Foundation",
    description:
      "Understand AI, machine learning, supervised learning, unsupervised learning, model training and evaluation.",
    goal: "Build the mental model required to understand modern machine learning systems.",
    primaryPath: "Machine learning fundamentals",
    alternatives: [],
  },

  {
    id: "python-for-ml",
    order: 2,
    title: "Python for Machine Learning",
    description:
      "Build practical Python skills for numerical computing, data manipulation, experimentation and ML development.",
    goal: "Write clean Python for real machine learning workflows.",
    primaryPath: "Python",
    alternatives: ["R awareness"],
  },

  {
    id: "math-for-ml",
    order: 3,
    title: "Mathematics for Machine Learning",
    description:
      "Learn the mathematics required to understand optimization, models and statistical reasoning.",
    goal: "Develop enough mathematical intuition to understand how ML algorithms work.",
    primaryPath: "Linear algebra + probability + statistics + calculus",
    alternatives: [],
  },

  {
    id: "data-analysis",
    order: 4,
    title: "Data Analysis & Exploration",
    description:
      "Learn data cleaning, exploration, visualization, distributions, correlations and feature inspection.",
    goal: "Turn raw datasets into useful information before modeling.",
    primaryPath: "Python + NumPy + Pandas",
    alternatives: [],
  },

  {
    id: "statistics-for-ml",
    order: 5,
    title: "Statistics for Machine Learning",
    description:
      "Understand probability distributions, sampling, hypothesis testing, confidence intervals and statistical reasoning.",
    goal: "Make statistically sound decisions during model development.",
    primaryPath: "Probability + statistics",
    alternatives: [],
  },

  {
    id: "supervised-learning",
    order: 6,
    title: "Supervised Learning",
    description:
      "Learn regression, classification, decision trees, ensembles and nearest-neighbor methods.",
    goal: "Build and evaluate models that learn from labeled data.",
    primaryPath: "Classical supervised ML",
    alternatives: [],
  },

  {
    id: "unsupervised-learning",
    order: 7,
    title: "Unsupervised Learning",
    description:
      "Learn clustering, dimensionality reduction and representation discovery.",
    goal: "Extract structure from unlabeled data.",
    primaryPath: "Clustering + dimensionality reduction",
    alternatives: [],
  },

  {
    id: "feature-engineering",
    order: 8,
    title: "Feature Engineering",
    description:
      "Create, transform, select and validate useful model features.",
    goal: "Improve model quality through meaningful representations of input data.",
    primaryPath: "Feature engineering",
    alternatives: [],
  },

  {
    id: "model-evaluation",
    order: 9,
    title: "Model Evaluation & Validation",
    description:
      "Learn train-validation-test splits, cross-validation, metrics, calibration and error analysis.",
    goal: "Determine whether models actually generalize to unseen data.",
    primaryPath: "Robust model evaluation",
    alternatives: [],
  },

  {
    id: "scikit-learn",
    order: 10,
    title: "Scikit-learn",
    description:
      "Build practical classical machine learning pipelines using scikit-learn.",
    goal: "Move from individual algorithms to reproducible ML workflows.",
    primaryPath: "Scikit-learn",
    alternatives: [],
  },

  {
    id: "ml-experimentation",
    order: 11,
    title: "ML Experimentation",
    description:
      "Track experiments, hyperparameters, metrics, datasets and model versions.",
    goal: "Make machine learning development reproducible rather than notebook-driven trial and error.",
    primaryPath: "Experiment tracking",
    alternatives: ["MLflow"],
  },

  {
    id: "deep-learning-foundation",
    order: 12,
    title: "Deep Learning Foundation",
    description:
      "Understand neural networks, tensors, forward propagation, backpropagation and optimization.",
    goal: "Build the conceptual foundation for modern deep learning.",
    primaryPath: "Neural networks",
    alternatives: [],
  },

  {
    id: "pytorch",
    order: 13,
    title: "PyTorch",
    description:
      "Build and train neural networks using tensors, modules, datasets, optimizers and training loops.",
    goal: "Develop practical deep learning systems using a production-relevant framework.",
    primaryPath: "PyTorch",
    alternatives: ["TensorFlow awareness", "JAX awareness"],
  },

  {
    id: "cnn-computer-vision",
    order: 14,
    title: "Computer Vision",
    description:
      "Learn image preprocessing, convolutional neural networks, classification, detection and modern vision models.",
    goal: "Build machine learning systems that understand visual data.",
    primaryPath: "CNNs + modern vision models",
    alternatives: [],
  },

  {
    id: "nlp-foundation",
    order: 15,
    title: "Natural Language Processing",
    description:
      "Understand text preprocessing, representations, sequence modeling and language-model foundations.",
    goal: "Build the foundation for modern language-processing systems.",
    primaryPath: "Modern NLP",
    alternatives: [],
  },

  {
    id: "transformers",
    order: 16,
    title: "Transformers",
    description:
      "Understand attention, self-attention, encoder-decoder architectures and transformer-based models.",
    goal: "Understand the architecture behind modern language and multimodal models.",
    primaryPath: "Transformer architecture",
    alternatives: [],
  },

  {
    id: "llm-foundation",
    order: 17,
    title: "Large Language Model Foundations",
    description:
      "Understand tokenization, pretraining, inference, context windows, embeddings and language-model behavior.",
    goal: "Build the foundation required to work with modern LLM systems.",
    primaryPath: "LLM fundamentals",
    alternatives: [],
  },

  {
    id: "generative-ai",
    order: 18,
    title: "Generative AI",
    description:
      "Understand generative modeling, language generation, image generation and multimodal AI concepts.",
    goal: "Understand how modern generative AI systems are built and used.",
    primaryPath: "Generative AI",
    alternatives: [],
  },

  {
    id: "embeddings-and-vector-search",
    order: 19,
    title: "Embeddings & Vector Search",
    description:
      "Learn embeddings, similarity search, vector databases and semantic retrieval.",
    goal: "Build systems that retrieve semantically relevant information.",
    primaryPath: "Embeddings + vector search",
    alternatives: [],
  },

  {
    id: "rag-systems",
    order: 20,
    title: "Retrieval-Augmented Generation",
    description:
      "Build retrieval pipelines that combine external knowledge with generative models.",
    goal: "Build grounded LLM applications using retrieval.",
    primaryPath: "RAG",
    alternatives: [],
  },

  {
    id: "fine-tuning",
    order: 21,
    title: "Model Fine-Tuning",
    description:
      "Understand supervised fine-tuning, parameter-efficient fine-tuning and adaptation strategies.",
    goal: "Adapt pretrained models to specialized tasks and domains.",
    primaryPath: "Fine-tuning + PEFT",
    alternatives: ["LoRA", "QLoRA"],
  },

  {
    id: "model-serving",
    order: 22,
    title: "Model Serving",
    description: "Deploy trained models behind APIs and inference services.",
    goal: "Turn machine learning models into usable production services.",
    primaryPath: "Python inference API",
    alternatives: ["FastAPI", "gRPC"],
  },

  {
    id: "ml-apis",
    order: 23,
    title: "ML API Engineering",
    description:
      "Design APIs around inference, validation, batching, authentication and model lifecycle.",
    goal: "Expose ML capabilities through reliable production APIs.",
    primaryPath: "FastAPI",
    alternatives: ["Flask awareness", "gRPC"],
  },

  {
    id: "ml-system-design",
    order: 24,
    title: "Machine Learning System Design",
    description:
      "Design complete ML systems covering data, training, serving, monitoring and feedback loops.",
    goal: "Reason about ML systems beyond individual models.",
    primaryPath: "End-to-end ML architecture",
    alternatives: [],
  },

  {
    id: "mlops-foundation",
    order: 25,
    title: "MLOps Foundation",
    description:
      "Understand reproducibility, model versioning, data versioning, experiment tracking and deployment workflows.",
    goal: "Apply software engineering and DevOps principles to machine learning.",
    primaryPath: "MLOps",
    alternatives: [],
  },

  {
    id: "model-registry",
    order: 26,
    title: "Model Registry & Lifecycle",
    description:
      "Manage model versions, stages, metadata and promotion workflows.",
    goal: "Control models throughout their production lifecycle.",
    primaryPath: "Model registry",
    alternatives: ["MLflow"],
  },

  {
    id: "ml-pipelines",
    order: 27,
    title: "ML Pipelines",
    description:
      "Automate data preparation, training, evaluation and model deployment workflows.",
    goal: "Build repeatable machine learning pipelines.",
    primaryPath: "Automated ML pipelines",
    alternatives: [],
  },

  {
    id: "feature-store",
    order: 28,
    title: "Feature Stores",
    description:
      "Understand centralized management and serving of machine learning features.",
    goal: "Maintain consistent training and inference features at scale.",
    primaryPath: "Feature store concepts",
    alternatives: ["Feast awareness"],
  },

  {
    id: "model-monitoring",
    order: 29,
    title: "Model Monitoring",
    description:
      "Monitor model performance, data drift, concept drift, latency and failures.",
    goal: "Keep ML systems reliable after deployment.",
    primaryPath: "ML observability",
    alternatives: [],
  },

  {
    id: "data-drift",
    order: 30,
    title: "Data & Concept Drift",
    description:
      "Understand how changing data distributions affect model performance.",
    goal: "Detect when deployed models no longer represent current reality.",
    primaryPath: "Drift detection",
    alternatives: [],
  },

  {
    id: "ml-cloud",
    order: 31,
    title: "Cloud for ML",
    description:
      "Understand cloud compute, storage, GPUs, networking and managed ML infrastructure.",
    goal: "Run machine learning workloads efficiently in cloud environments.",
    primaryPath: "AWS",
    alternatives: ["GCP", "Azure"],
  },

  {
    id: "gpu-computing",
    order: 32,
    title: "GPU Computing",
    description:
      "Understand GPUs, memory constraints, batching and accelerated model training and inference.",
    goal: "Reason about computational requirements of deep learning systems.",
    primaryPath: "GPU-based ML",
    alternatives: [],
  },

  {
    id: "distributed-ml",
    order: 33,
    title: "Distributed Machine Learning",
    description:
      "Understand distributed training, data parallelism, model parallelism and large-scale inference.",
    goal: "Scale ML workloads beyond a single machine.",
    primaryPath: "Distributed ML",
    alternatives: [],
  },

  {
    id: "ml-security",
    order: 34,
    title: "ML Security",
    description:
      "Understand adversarial inputs, data poisoning, model abuse, privacy and secure inference.",
    goal: "Build machine learning systems with realistic security boundaries.",
    primaryPath: "ML security",
    alternatives: [],
  },

  {
    id: "responsible-ai",
    order: 35,
    title: "Responsible AI",
    description:
      "Understand fairness, bias, explainability, safety, privacy and responsible deployment.",
    goal: "Build AI systems that are evaluated beyond raw model accuracy.",
    primaryPath: "Responsible AI",
    alternatives: [],
  },

  {
    id: "ml-production-infrastructure",
    order: 36,
    title: "ML Production Infrastructure",
    description:
      "Combine containers, cloud infrastructure, CI/CD, orchestration and observability for ML workloads.",
    goal: "Operate ML systems reliably in production.",
    primaryPath: "Docker + Kubernetes + Cloud",
    alternatives: [],
  },

  {
    id: "advanced-ml-architecture",
    order: 37,
    title: "Advanced ML Architecture",
    description:
      "Design scalable end-to-end AI/ML platforms combining data, models, infrastructure, serving and monitoring.",
    goal: "Reach senior-level machine learning systems thinking.",
    primaryPath: "Production AI/ML architecture",
    alternatives: [],
  },
];

export default aiMlEngineerPhases;
export { aiMlEngineerPhases };

import { createKnowledgeNode } from "../../factory.js";

const node = (data) => createKnowledgeNode(data);

const aiMlEngineerNodes = [
  // ============================================================
  // PHASE 1 — AI & ML FOUNDATION
  // ============================================================

  node({
    id: "ai-ml-fundamentals",
    title: "AI & Machine Learning Fundamentals",
    category: "foundation",
    importance: "critical",
    description:
      "Understand artificial intelligence, machine learning, supervised learning, unsupervised learning, training and inference.",
    whyItMatters:
      "A strong conceptual foundation prevents machine learning from becoming a collection of disconnected algorithms.",
    prerequisites: [],
    enables: ["python-for-ml", "statistics-for-ml", "supervised-learning"],
    alternatives: [],
    related: ["deep-learning-foundation"],
    metadata: { phase: "ai-ml-foundation", primary: true },
  }),

  node({
    id: "machine-learning-workflow",
    title: "Machine Learning Workflow",
    category: "foundation",
    importance: "high",
    description:
      "Understand problem definition, data collection, preprocessing, training, evaluation, deployment and monitoring.",
    whyItMatters:
      "Real ML engineering is an end-to-end lifecycle rather than just model training.",
    prerequisites: ["ai-ml-fundamentals"],
    enables: ["data-analysis", "model-evaluation", "ml-system-design"],
    alternatives: [],
    related: ["mlops-foundation"],
    metadata: { phase: "ai-ml-foundation" },
  }),

  // ============================================================
  // PHASE 2 — PYTHON
  // ============================================================

  node({
    id: "python-for-ml",
    title: "Python for Machine Learning",
    category: "programming",
    importance: "critical",
    description:
      "Build practical Python skills for numerical computing, data processing, experimentation and ML development.",
    whyItMatters:
      "Python is the dominant ecosystem for modern machine learning development.",
    prerequisites: ["ai-ml-fundamentals"],
    enables: ["numpy", "pandas", "scikit-learn", "pytorch"],
    alternatives: ["r-awareness"],
    related: ["data-analysis"],
    metadata: { phase: "python-for-ml", primary: true },
  }),

  node({
    id: "numpy",
    title: "NumPy",
    category: "programming",
    importance: "critical",
    description:
      "Work with arrays, vectorized operations, numerical computation and linear algebra primitives.",
    whyItMatters:
      "NumPy provides the numerical foundation used by many Python ML libraries.",
    prerequisites: ["python-for-ml"],
    enables: ["data-analysis", "math-for-ml"],
    alternatives: [],
    related: ["pandas"],
    metadata: { phase: "python-for-ml" },
  }),

  node({
    id: "pandas",
    title: "Pandas",
    category: "data",
    importance: "critical",
    description:
      "Load, clean, transform, join and analyze structured datasets.",
    whyItMatters:
      "Most classical ML workflows require substantial data preparation before training.",
    prerequisites: ["python-for-ml", "numpy"],
    enables: ["data-analysis", "feature-engineering"],
    alternatives: [],
    related: ["statistics-for-ml"],
    metadata: { phase: "python-for-ml" },
  }),

  node({
    id: "r-awareness",
    title: "R Awareness",
    category: "programming",
    importance: "low",
    description:
      "Understand R's role in statistical analysis and specialized data-science environments.",
    whyItMatters: "R remains relevant in statistics-heavy organizations.",
    prerequisites: ["python-for-ml"],
    enables: [],
    alternatives: ["python-for-ml"],
    related: ["statistics-for-ml"],
    metadata: {
      phase: "python-for-ml",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 3 — MATHEMATICS
  // ============================================================

  node({
    id: "math-for-ml",
    title: "Mathematics for Machine Learning",
    category: "mathematics",
    importance: "critical",
    description:
      "Build practical intuition for linear algebra, calculus, probability and optimization.",
    whyItMatters:
      "Mathematical intuition makes model behavior and optimization easier to understand.",
    prerequisites: ["ai-ml-fundamentals"],
    enables: [
      "linear-algebra",
      "calculus-for-ml",
      "probability-for-ml",
      "optimization",
    ],
    alternatives: [],
    related: ["deep-learning-foundation"],
    metadata: { phase: "math-for-ml", primary: true },
  }),

  node({
    id: "linear-algebra",
    title: "Linear Algebra for ML",
    category: "mathematics",
    importance: "critical",
    description:
      "Understand vectors, matrices, dot products, transformations, eigen concepts and tensor representations.",
    whyItMatters:
      "Modern ML models represent data and parameters using vectors, matrices and tensors.",
    prerequisites: ["math-for-ml", "numpy"],
    enables: ["deep-learning-foundation"],
    alternatives: [],
    related: ["pytorch"],
    metadata: { phase: "math-for-ml" },
  }),

  node({
    id: "calculus-for-ml",
    title: "Calculus for ML",
    category: "mathematics",
    importance: "high",
    description:
      "Understand derivatives, gradients, partial derivatives and the chain rule.",
    whyItMatters:
      "Gradient-based optimization is fundamental to deep learning.",
    prerequisites: ["math-for-ml"],
    enables: ["optimization", "deep-learning-foundation"],
    alternatives: [],
    related: ["pytorch"],
    metadata: { phase: "math-for-ml" },
  }),

  node({
    id: "probability-for-ml",
    title: "Probability for ML",
    category: "mathematics",
    importance: "critical",
    description:
      "Understand probability, conditional probability, Bayes concepts and random variables.",
    whyItMatters:
      "Probability underpins uncertainty, statistical learning and model evaluation.",
    prerequisites: ["math-for-ml"],
    enables: ["statistics-for-ml"],
    alternatives: [],
    related: ["model-evaluation"],
    metadata: { phase: "math-for-ml" },
  }),

  node({
    id: "optimization",
    title: "Optimization",
    category: "mathematics",
    importance: "critical",
    description:
      "Understand objective functions, gradients, gradient descent and optimization trade-offs.",
    whyItMatters:
      "Training a model means optimizing an objective over parameters.",
    prerequisites: ["calculus-for-ml", "linear-algebra"],
    enables: ["deep-learning-foundation", "pytorch"],
    alternatives: [],
    related: ["model-evaluation"],
    metadata: { phase: "math-for-ml" },
  }),

  // ============================================================
  // PHASE 4 — DATA ANALYSIS
  // ============================================================

  node({
    id: "data-analysis",
    title: "Data Analysis & Exploration",
    category: "data",
    importance: "critical",
    description:
      "Explore datasets, distributions, correlations, missing values, outliers and data quality.",
    whyItMatters:
      "Understanding data is often more important than choosing a sophisticated model.",
    prerequisites: ["pandas", "statistics-for-ml"],
    enables: ["feature-engineering", "model-evaluation"],
    alternatives: [],
    related: ["data-drift"],
    metadata: { phase: "data-analysis", primary: true },
  }),

  node({
    id: "data-visualization",
    title: "ML Data Visualization",
    category: "data",
    importance: "high",
    description:
      "Visualize distributions, relationships, errors and model behavior.",
    whyItMatters:
      "Visualization makes data and model failures easier to diagnose.",
    prerequisites: ["data-analysis"],
    enables: ["feature-engineering", "model-evaluation"],
    alternatives: [],
    related: ["data-drift"],
    metadata: { phase: "data-analysis" },
  }),

  node({
    id: "data-preprocessing",
    title: "Data Preprocessing",
    category: "data",
    importance: "critical",
    description:
      "Handle missing values, encoding, scaling, normalization and data preparation.",
    whyItMatters: "Poor preprocessing can dominate model quality.",
    prerequisites: ["data-analysis"],
    enables: ["feature-engineering", "scikit-learn"],
    alternatives: [],
    related: ["data-quality"],
    metadata: { phase: "data-analysis" },
  }),

  // ============================================================
  // PHASE 5 — STATISTICS
  // ============================================================

  node({
    id: "statistics-for-ml",
    title: "Statistics for Machine Learning",
    category: "statistics",
    importance: "critical",
    description:
      "Understand distributions, sampling, estimation, hypothesis testing and statistical reasoning.",
    whyItMatters:
      "Statistics provides the foundation for evaluating whether observed model behavior is meaningful.",
    prerequisites: ["probability-for-ml"],
    enables: ["model-evaluation", "supervised-learning"],
    alternatives: [],
    related: ["data-analysis"],
    metadata: { phase: "statistics-for-ml", primary: true },
  }),

  node({
    id: "probability-distributions",
    title: "Probability Distributions",
    category: "statistics",
    importance: "high",
    description:
      "Understand common discrete and continuous probability distributions.",
    whyItMatters:
      "Distributions help model uncertainty and understand datasets.",
    prerequisites: ["probability-for-ml"],
    enables: ["statistics-for-ml"],
    alternatives: [],
    related: ["data-analysis"],
    metadata: { phase: "statistics-for-ml" },
  }),

  node({
    id: "hypothesis-testing",
    title: "Hypothesis Testing",
    category: "statistics",
    importance: "medium",
    description:
      "Understand hypotheses, significance, confidence intervals and statistical tests.",
    whyItMatters:
      "Statistical tests help evaluate whether observed differences are meaningful.",
    prerequisites: ["statistics-for-ml"],
    enables: ["model-evaluation"],
    alternatives: [],
    related: ["data-analysis"],
    metadata: { phase: "statistics-for-ml" },
  }),

  // ============================================================
  // PHASE 6 — SUPERVISED LEARNING
  // ============================================================

  node({
    id: "supervised-learning",
    title: "Supervised Learning",
    category: "machine-learning",
    importance: "critical",
    description: "Learn how models map labeled inputs to target outputs.",
    whyItMatters:
      "Supervised learning powers many practical prediction systems.",
    prerequisites: ["data-preprocessing", "statistics-for-ml"],
    enables: [
      "regression",
      "classification",
      "decision-trees",
      "ensemble-learning",
    ],
    alternatives: [],
    related: ["model-evaluation"],
    metadata: { phase: "supervised-learning", primary: true },
  }),

  node({
    id: "regression",
    title: "Regression",
    category: "machine-learning",
    importance: "critical",
    description:
      "Learn linear and nonlinear regression for predicting continuous targets.",
    whyItMatters:
      "Regression is one of the fundamental supervised learning problem types.",
    prerequisites: ["supervised-learning"],
    enables: ["scikit-learn"],
    alternatives: [],
    related: ["model-evaluation"],
    metadata: { phase: "supervised-learning" },
  }),

  node({
    id: "classification",
    title: "Classification",
    category: "machine-learning",
    importance: "critical",
    description: "Learn binary and multiclass classification techniques.",
    whyItMatters:
      "Classification powers many production prediction and decision systems.",
    prerequisites: ["supervised-learning"],
    enables: ["scikit-learn"],
    alternatives: [],
    related: ["model-evaluation"],
    metadata: { phase: "supervised-learning" },
  }),

  node({
    id: "decision-trees",
    title: "Decision Trees",
    category: "machine-learning",
    importance: "high",
    description:
      "Understand tree-based learning, splits, depth and overfitting.",
    whyItMatters:
      "Trees provide interpretable nonlinear models and foundations for ensembles.",
    prerequisites: ["supervised-learning"],
    enables: ["ensemble-learning"],
    alternatives: [],
    related: ["feature-engineering"],
    metadata: { phase: "supervised-learning" },
  }),

  node({
    id: "ensemble-learning",
    title: "Ensemble Learning",
    category: "machine-learning",
    importance: "critical",
    description: "Understand bagging, boosting and ensemble-based prediction.",
    whyItMatters:
      "Ensembles are powerful baselines for structured/tabular data.",
    prerequisites: ["decision-trees"],
    enables: ["scikit-learn"],
    alternatives: [],
    related: ["model-evaluation"],
    metadata: { phase: "supervised-learning" },
  }),

  // ============================================================
  // PHASE 7 — UNSUPERVISED LEARNING
  // ============================================================

  node({
    id: "unsupervised-learning",
    title: "Unsupervised Learning",
    category: "machine-learning",
    importance: "high",
    description:
      "Learn methods that discover structure without labeled targets.",
    whyItMatters: "Many real datasets lack reliable labels.",
    prerequisites: ["data-analysis", "statistics-for-ml"],
    enables: ["clustering", "dimensionality-reduction"],
    alternatives: [],
    related: ["embeddings-and-vector-search"],
    metadata: { phase: "unsupervised-learning" },
  }),

  node({
    id: "clustering",
    title: "Clustering",
    category: "machine-learning",
    importance: "high",
    description: "Group similar observations using clustering algorithms.",
    whyItMatters:
      "Clustering supports segmentation, exploration and anomaly-related workflows.",
    prerequisites: ["unsupervised-learning"],
    enables: ["scikit-learn"],
    alternatives: [],
    related: ["dimensionality-reduction"],
    metadata: { phase: "unsupervised-learning" },
  }),

  node({
    id: "dimensionality-reduction",
    title: "Dimensionality Reduction",
    category: "machine-learning",
    importance: "high",
    description: "Reduce feature dimensions while preserving useful structure.",
    whyItMatters:
      "Dimensionality reduction helps visualization, compression and modeling.",
    prerequisites: ["unsupervised-learning"],
    enables: ["scikit-learn"],
    alternatives: [],
    related: ["embeddings-and-vector-search"],
    metadata: { phase: "unsupervised-learning" },
  }),

  // ============================================================
  // PHASE 8 — FEATURE ENGINEERING
  // ============================================================

  node({
    id: "feature-engineering",
    title: "Feature Engineering",
    category: "machine-learning",
    importance: "critical",
    description: "Create, transform, select and validate model features.",
    whyItMatters:
      "Good representations can have a larger impact than changing algorithms.",
    prerequisites: ["data-preprocessing", "data-analysis"],
    enables: ["model-evaluation", "scikit-learn"],
    alternatives: [],
    related: ["feature-store"],
    metadata: { phase: "feature-engineering", primary: true },
  }),

  node({
    id: "feature-selection",
    title: "Feature Selection",
    category: "machine-learning",
    importance: "high",
    description:
      "Identify useful features and reduce unnecessary or noisy inputs.",
    whyItMatters:
      "Feature selection can improve generalization, interpretability and efficiency.",
    prerequisites: ["feature-engineering"],
    enables: ["scikit-learn"],
    alternatives: [],
    related: ["model-evaluation"],
    metadata: { phase: "feature-engineering" },
  }),

  // ============================================================
  // PHASE 9 — MODEL EVALUATION
  // ============================================================

  node({
    id: "model-evaluation",
    title: "Model Evaluation & Validation",
    category: "machine-learning",
    importance: "critical",
    description:
      "Use proper train-validation-test strategies, cross-validation and evaluation metrics.",
    whyItMatters:
      "A model that performs well on training data may fail on unseen data.",
    prerequisites: [
      "statistics-for-ml",
      "supervised-learning",
      "feature-engineering",
    ],
    enables: ["cross-validation", "model-error-analysis", "scikit-learn"],
    alternatives: [],
    related: ["ml-experimentation"],
    metadata: { phase: "model-evaluation", primary: true },
  }),

  node({
    id: "cross-validation",
    title: "Cross-Validation",
    category: "machine-learning",
    importance: "high",
    description:
      "Use cross-validation to estimate model generalization more reliably.",
    whyItMatters:
      "Cross-validation helps compare models without overfitting to a single split.",
    prerequisites: ["model-evaluation"],
    enables: ["scikit-learn"],
    alternatives: [],
    related: ["hyperparameter-tuning"],
    metadata: { phase: "model-evaluation" },
  }),

  node({
    id: "model-error-analysis",
    title: "Model Error Analysis",
    category: "machine-learning",
    importance: "critical",
    description:
      "Analyze incorrect predictions to understand model weaknesses and data problems.",
    whyItMatters:
      "Error analysis often provides more actionable improvement signals than a single metric.",
    prerequisites: ["model-evaluation"],
    enables: ["ml-experimentation"],
    alternatives: [],
    related: ["feature-engineering"],
    metadata: { phase: "model-evaluation" },
  }),

  // ============================================================
  // PHASE 10 — SCIKIT-LEARN
  // ============================================================

  node({
    id: "scikit-learn",
    title: "Scikit-learn",
    category: "framework",
    importance: "critical",
    description:
      "Build reproducible classical machine learning pipelines with scikit-learn.",
    whyItMatters:
      "Scikit-learn provides a practical standard toolkit for classical ML.",
    prerequisites: [
      "regression",
      "classification",
      "ensemble-learning",
      "feature-engineering",
      "model-evaluation",
    ],
    enables: ["ml-experimentation", "hyperparameter-tuning"],
    alternatives: [],
    related: ["data-preprocessing"],
    metadata: { phase: "scikit-learn", primary: true },
  }),

  node({
    id: "hyperparameter-tuning",
    title: "Hyperparameter Tuning",
    category: "machine-learning",
    importance: "high",
    description:
      "Optimize model hyperparameters using systematic search and validation.",
    whyItMatters:
      "Appropriate hyperparameters can significantly affect model quality.",
    prerequisites: ["scikit-learn", "cross-validation"],
    enables: ["ml-experimentation"],
    alternatives: [],
    related: ["model-evaluation"],
    metadata: { phase: "scikit-learn" },
  }),

  // ============================================================
  // PHASE 11 — EXPERIMENTATION
  // ============================================================

  node({
    id: "ml-experimentation",
    title: "ML Experimentation",
    category: "mlops",
    importance: "critical",
    description:
      "Track experiments, datasets, parameters, metrics and model artifacts.",
    whyItMatters:
      "Without experiment tracking, ML development becomes difficult to reproduce.",
    prerequisites: ["scikit-learn", "model-error-analysis"],
    enables: ["mlflow", "model-registry"],
    alternatives: [],
    related: ["mlops-foundation"],
    metadata: { phase: "ml-experimentation", primary: true },
  }),

  node({
    id: "mlflow",
    title: "MLflow Awareness",
    category: "mlops",
    importance: "high",
    description:
      "Track ML experiments, artifacts and model lifecycle using MLflow concepts.",
    whyItMatters: "MLflow is a widely used open-source MLOps platform.",
    prerequisites: ["ml-experimentation"],
    enables: ["model-registry"],
    alternatives: [],
    related: ["ml-pipelines"],
    metadata: { phase: "ml-experimentation" },
  }),

  // ============================================================
  // PHASE 12 — DEEP LEARNING
  // ============================================================

  node({
    id: "deep-learning-foundation",
    title: "Deep Learning Foundation",
    category: "deep-learning",
    importance: "critical",
    description:
      "Understand neural networks, tensors, forward propagation, backpropagation and optimization.",
    whyItMatters: "Modern AI systems depend heavily on deep neural networks.",
    prerequisites: ["linear-algebra", "calculus-for-ml", "optimization"],
    enables: ["pytorch", "cnn-computer-vision", "nlp-foundation"],
    alternatives: [],
    related: ["transformers"],
    metadata: { phase: "deep-learning-foundation", primary: true },
  }),

  node({
    id: "neural-networks",
    title: "Neural Networks",
    category: "deep-learning",
    importance: "critical",
    description:
      "Understand layers, activations, losses, gradients and training loops.",
    whyItMatters:
      "Neural networks form the foundation for deep learning architectures.",
    prerequisites: ["deep-learning-foundation"],
    enables: ["pytorch"],
    alternatives: [],
    related: ["cnn-computer-vision"],
    metadata: { phase: "deep-learning-foundation" },
  }),

  node({
    id: "pytorch",
    title: "PyTorch",
    category: "framework",
    importance: "critical",
    description:
      "Build and train neural networks using tensors, modules, datasets and optimizers.",
    whyItMatters:
      "PyTorch is a major framework for modern deep learning research and production.",
    prerequisites: ["neural-networks", "optimization", "python-for-ml"],
    enables: [
      "cnn-computer-vision",
      "nlp-foundation",
      "transformers",
      "distributed-ml",
    ],
    alternatives: ["tensorflow-awareness", "jax-awareness"],
    related: ["gpu-computing"],
    metadata: { phase: "pytorch", primary: true },
  }),

  node({
    id: "tensorflow-awareness",
    title: "TensorFlow Awareness",
    category: "framework",
    importance: "medium",
    description:
      "Understand TensorFlow as an alternative deep learning framework.",
    whyItMatters:
      "TensorFlow remains relevant in some production and enterprise environments.",
    prerequisites: ["deep-learning-foundation"],
    enables: [],
    alternatives: ["pytorch"],
    related: ["model-serving"],
    metadata: {
      phase: "pytorch",
      optional: true,
    },
  }),

  node({
    id: "jax-awareness",
    title: "JAX Awareness",
    category: "framework",
    importance: "medium",
    description:
      "Understand JAX for high-performance numerical computing and modern ML research.",
    whyItMatters:
      "JAX is increasingly relevant for research-oriented ML workloads.",
    prerequisites: ["deep-learning-foundation"],
    enables: [],
    alternatives: ["pytorch"],
    related: ["gpu-computing"],
    metadata: {
      phase: "pytorch",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 13 — COMPUTER VISION
  // ============================================================

  node({
    id: "cnn-computer-vision",
    title: "Computer Vision",
    category: "computer-vision",
    importance: "high",
    description:
      "Learn image preprocessing, CNNs, classification, detection and modern vision models.",
    whyItMatters: "Computer vision is a major ML specialization.",
    prerequisites: ["pytorch", "deep-learning-foundation"],
    enables: ["vision-models"],
    alternatives: [],
    related: ["generative-ai"],
    metadata: { phase: "cnn-computer-vision" },
  }),

  node({
    id: "vision-models",
    title: "Modern Vision Models",
    category: "computer-vision",
    importance: "high",
    description:
      "Understand modern architectures for image classification, object detection and segmentation.",
    whyItMatters:
      "Modern vision systems extend beyond traditional CNN pipelines.",
    prerequisites: ["cnn-computer-vision"],
    enables: ["ml-system-design"],
    alternatives: [],
    related: ["transformers"],
    metadata: { phase: "cnn-computer-vision" },
  }),

  // ============================================================
  // PHASE 14 — NLP
  // ============================================================

  node({
    id: "nlp-foundation",
    title: "Natural Language Processing",
    category: "nlp",
    importance: "critical",
    description:
      "Understand text preprocessing, representations, sequence modeling and language-model foundations.",
    whyItMatters: "NLP provides the foundation for modern language AI systems.",
    prerequisites: ["pytorch", "deep-learning-foundation"],
    enables: ["transformers", "llm-foundation"],
    alternatives: [],
    related: ["embeddings-and-vector-search"],
    metadata: { phase: "nlp-foundation" },
  }),

  node({
    id: "text-representations",
    title: "Text Representations",
    category: "nlp",
    importance: "high",
    description:
      "Understand tokenization, word representations and contextual representations.",
    whyItMatters: "Models require numerical representations of language.",
    prerequisites: ["nlp-foundation"],
    enables: ["transformers", "embeddings-and-vector-search"],
    alternatives: [],
    related: ["llm-foundation"],
    metadata: { phase: "nlp-foundation" },
  }),

  // ============================================================
  // PHASE 15 — TRANSFORMERS
  // ============================================================

  node({
    id: "transformers",
    title: "Transformer Architecture",
    category: "deep-learning",
    importance: "critical",
    description:
      "Understand attention, self-attention, encoder-decoder architectures and transformer blocks.",
    whyItMatters:
      "Transformers underpin modern language, vision and multimodal models.",
    prerequisites: ["nlp-foundation", "pytorch"],
    enables: ["llm-foundation", "generative-ai"],
    alternatives: [],
    related: ["embeddings-and-vector-search"],
    metadata: { phase: "transformers", primary: true },
  }),

  node({
    id: "attention-mechanism",
    title: "Attention Mechanism",
    category: "deep-learning",
    importance: "critical",
    description:
      "Understand queries, keys, values, attention weights and self-attention.",
    whyItMatters:
      "Attention is the central mechanism behind transformer models.",
    prerequisites: ["transformers"],
    enables: ["llm-foundation"],
    alternatives: [],
    related: ["text-representations"],
    metadata: { phase: "transformers" },
  }),

  // ============================================================
  // PHASE 16 — LLM
  // ============================================================

  node({
    id: "llm-foundation",
    title: "LLM Foundations",
    category: "llm",
    importance: "critical",
    description:
      "Understand tokenization, pretraining, inference, context windows, embeddings and language-model behavior.",
    whyItMatters:
      "LLMs are a major modern application of deep learning and transformers.",
    prerequisites: ["transformers", "attention-mechanism"],
    enables: ["generative-ai", "embeddings-and-vector-search", "fine-tuning"],
    alternatives: [],
    related: ["rag-systems"],
    metadata: { phase: "llm-foundation", primary: true },
  }),

  node({
    id: "tokenization",
    title: "LLM Tokenization",
    category: "llm",
    importance: "high",
    description:
      "Understand tokens, token boundaries, vocabularies and tokenization effects.",
    whyItMatters:
      "Tokenization affects model input, cost, context length and behavior.",
    prerequisites: ["llm-foundation"],
    enables: ["generative-ai"],
    alternatives: [],
    related: ["embeddings-and-vector-search"],
    metadata: { phase: "llm-foundation" },
  }),

  // ============================================================
  // PHASE 17 — GENERATIVE AI
  // ============================================================

  node({
    id: "generative-ai",
    title: "Generative AI",
    category: "generative-ai",
    importance: "critical",
    description:
      "Understand generative models, language generation, multimodal systems and practical AI applications.",
    whyItMatters:
      "Generative AI is a major production application of modern foundation models.",
    prerequisites: ["llm-foundation", "transformers"],
    enables: ["rag-systems", "fine-tuning", "model-serving"],
    alternatives: [],
    related: ["embeddings-and-vector-search"],
    metadata: { phase: "generative-ai", primary: true },
  }),

  // ============================================================
  // PHASE 18 — EMBEDDINGS & VECTOR SEARCH
  // ============================================================

  node({
    id: "embeddings-and-vector-search",
    title: "Embeddings & Vector Search",
    category: "retrieval",
    importance: "critical",
    description:
      "Learn embeddings, semantic similarity, vector indexing and vector search.",
    whyItMatters:
      "Semantic retrieval is foundational to modern search and RAG systems.",
    prerequisites: ["text-representations", "llm-foundation"],
    enables: ["rag-systems"],
    alternatives: [],
    related: ["unsupervised-learning"],
    metadata: {
      phase: "embeddings-and-vector-search",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 19 — RAG
  // ============================================================

  node({
    id: "rag-systems",
    title: "Retrieval-Augmented Generation",
    category: "generative-ai",
    importance: "critical",
    description:
      "Build retrieval pipelines that provide external context to generative models.",
    whyItMatters:
      "RAG enables grounded applications without requiring every piece of knowledge to be encoded into model parameters.",
    prerequisites: ["embeddings-and-vector-search", "generative-ai"],
    enables: ["ml-system-design", "model-serving"],
    alternatives: [],
    related: ["data-analysis"],
    metadata: { phase: "rag-systems", primary: true },
  }),

  node({
    id: "retrieval-pipeline",
    title: "Retrieval Pipeline Engineering",
    category: "retrieval",
    importance: "high",
    description:
      "Design chunking, indexing, retrieval, reranking and context assembly pipelines.",
    whyItMatters:
      "RAG quality depends heavily on retrieval and context construction.",
    prerequisites: ["rag-systems"],
    enables: ["ml-system-design"],
    alternatives: [],
    related: ["data-preprocessing"],
    metadata: { phase: "rag-systems" },
  }),

  // ============================================================
  // PHASE 20 — FINE-TUNING
  // ============================================================

  node({
    id: "fine-tuning",
    title: "Model Fine-Tuning",
    category: "llm",
    importance: "high",
    description:
      "Understand supervised fine-tuning and parameter-efficient adaptation of pretrained models.",
    whyItMatters:
      "Fine-tuning can adapt foundation models to specialized behaviors and domains.",
    prerequisites: ["llm-foundation", "pytorch"],
    enables: ["peft", "model-serving"],
    alternatives: [],
    related: ["generative-ai"],
    metadata: { phase: "fine-tuning", primary: true },
  }),

  node({
    id: "peft",
    title: "Parameter-Efficient Fine-Tuning",
    category: "llm",
    importance: "high",
    description:
      "Understand LoRA, QLoRA and other parameter-efficient adaptation techniques.",
    whyItMatters:
      "PEFT reduces the computational cost of adapting large models.",
    prerequisites: ["fine-tuning"],
    enables: ["model-serving"],
    alternatives: [],
    related: ["gpu-computing"],
    metadata: { phase: "fine-tuning" },
  }),

  // ============================================================
  // PHASE 21 — MODEL SERVING
  // ============================================================

  node({
    id: "model-serving",
    title: "Model Serving",
    category: "deployment",
    importance: "critical",
    description: "Deploy trained models behind reliable inference services.",
    whyItMatters:
      "A trained model has little value until it can serve real users or systems.",
    prerequisites: ["generative-ai", "pytorch"],
    enables: ["ml-apis", "model-performance"],
    alternatives: [],
    related: ["mlops-foundation"],
    metadata: { phase: "model-serving", primary: true },
  }),

  node({
    id: "ml-apis",
    title: "ML API Engineering",
    category: "deployment",
    importance: "critical",
    description:
      "Design inference APIs with validation, authentication, batching and error handling.",
    whyItMatters: "Production ML systems need reliable service interfaces.",
    prerequisites: ["model-serving"],
    enables: ["ml-system-design"],
    alternatives: ["grpc-for-ml"],
    related: ["model-performance"],
    metadata: { phase: "ml-apis", primary: true },
  }),

  node({
    id: "grpc-for-ml",
    title: "gRPC for ML Awareness",
    category: "deployment",
    importance: "medium",
    description:
      "Understand gRPC for high-performance internal model-service communication.",
    whyItMatters: "gRPC can be useful for internal distributed ML services.",
    prerequisites: ["ml-apis"],
    enables: ["ml-system-design"],
    alternatives: ["ml-apis"],
    related: ["distributed-ml"],
    metadata: {
      phase: "ml-apis",
      optional: true,
    },
  }),

  node({
    id: "model-performance",
    title: "Inference Performance",
    category: "deployment",
    importance: "critical",
    description:
      "Optimize inference latency, throughput, batching, memory and resource utilization.",
    whyItMatters:
      "Inference cost and latency directly affect production user experience.",
    prerequisites: ["model-serving"],
    enables: ["distributed-ml"],
    alternatives: [],
    related: ["gpu-computing"],
    metadata: { phase: "model-serving" },
  }),

  // ============================================================
  // PHASE 22 — ML SYSTEM DESIGN
  // ============================================================

  node({
    id: "ml-system-design",
    title: "Machine Learning System Design",
    category: "architecture",
    importance: "critical",
    description:
      "Design end-to-end ML systems spanning data, training, serving, monitoring and feedback loops.",
    whyItMatters:
      "Senior ML engineers must reason about complete systems rather than isolated models.",
    prerequisites: ["rag-systems", "ml-apis", "model-evaluation"],
    enables: ["mlops-foundation"],
    alternatives: [],
    related: ["advanced-ml-architecture"],
    metadata: {
      phase: "ml-system-design",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 23 — MLOPS
  // ============================================================

  node({
    id: "mlops-foundation",
    title: "MLOps Foundation",
    category: "mlops",
    importance: "critical",
    description:
      "Apply software engineering and DevOps principles to data, models, experiments and ML deployment.",
    whyItMatters:
      "Production ML requires reproducibility and operational discipline.",
    prerequisites: ["ml-system-design", "ml-experimentation"],
    enables: ["model-registry", "ml-pipelines", "ml-production-infrastructure"],
    alternatives: [],
    related: ["model-monitoring"],
    metadata: { phase: "mlops-foundation", primary: true },
  }),

  node({
    id: "model-registry",
    title: "Model Registry & Lifecycle",
    category: "mlops",
    importance: "critical",
    description:
      "Manage model versions, metadata, stages and promotion workflows.",
    whyItMatters:
      "Production systems need controlled model lifecycle management.",
    prerequisites: ["mlops-foundation", "ml-experimentation"],
    enables: ["ml-pipelines"],
    alternatives: [],
    related: ["mlflow"],
    metadata: { phase: "model-registry" },
  }),

  node({
    id: "ml-pipelines",
    title: "ML Pipelines",
    category: "mlops",
    importance: "critical",
    description:
      "Automate data preparation, training, evaluation and model deployment.",
    whyItMatters: "Automation makes model retraining and delivery repeatable.",
    prerequisites: ["mlops-foundation", "model-registry"],
    enables: ["ml-production-infrastructure"],
    alternatives: [],
    related: ["workflow-orchestration"],
    metadata: { phase: "ml-pipelines" },
  }),

  // ============================================================
  // PHASE 24 — FEATURE STORES
  // ============================================================

  node({
    id: "feature-store",
    title: "Feature Stores",
    category: "mlops",
    importance: "high",
    description:
      "Manage reusable features consistently across training and inference.",
    whyItMatters: "Feature consistency reduces training-serving skew.",
    prerequisites: ["feature-engineering", "mlops-foundation"],
    enables: ["ml-system-design"],
    alternatives: ["feast"],
    related: ["data-analysis"],
    metadata: { phase: "feature-store" },
  }),

  node({
    id: "feast",
    title: "Feast Awareness",
    category: "mlops",
    importance: "medium",
    description: "Understand Feast as an open-source feature-store platform.",
    whyItMatters:
      "Feature stores become useful when ML systems have significant reusable feature requirements.",
    prerequisites: ["feature-store"],
    enables: [],
    alternatives: ["feature-store"],
    related: ["ml-pipelines"],
    metadata: {
      phase: "feature-store",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 25 — MONITORING
  // ============================================================

  node({
    id: "model-monitoring",
    title: "Model Monitoring",
    category: "observability",
    importance: "critical",
    description:
      "Monitor model performance, latency, data quality and production behavior.",
    whyItMatters:
      "ML models can degrade even when infrastructure remains healthy.",
    prerequisites: ["ml-production-infrastructure", "model-serving"],
    enables: ["data-drift"],
    alternatives: [],
    related: ["ml-system-design"],
    metadata: {
      phase: "model-monitoring",
      primary: true,
    },
  }),

  node({
    id: "data-drift",
    title: "Data & Concept Drift",
    category: "observability",
    importance: "critical",
    description:
      "Detect changes in input distributions and relationships that affect model performance.",
    whyItMatters:
      "Production data changes over time and can invalidate learned behavior.",
    prerequisites: ["model-monitoring", "statistics-for-ml"],
    enables: ["advanced-ml-architecture"],
    alternatives: [],
    related: ["data-analysis"],
    metadata: { phase: "data-drift" },
  }),

  // ============================================================
  // PHASE 26 — CLOUD
  // ============================================================

  node({
    id: "ml-cloud",
    title: "Cloud for Machine Learning",
    category: "cloud",
    importance: "critical",
    description:
      "Understand cloud compute, storage, networking, GPUs and managed ML infrastructure.",
    whyItMatters:
      "Production ML workloads often require scalable cloud infrastructure.",
    prerequisites: ["mlops-foundation", "model-serving"],
    enables: ["gpu-computing", "ml-production-infrastructure"],
    alternatives: ["gcp-for-ml", "azure-for-ml"],
    related: ["distributed-ml"],
    metadata: {
      phase: "ml-cloud",
      primary: true,
    },
  }),

  node({
    id: "gcp-for-ml",
    title: "GCP for ML Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand Google Cloud infrastructure relevant to machine learning.",
    whyItMatters: "GCP is highly relevant to AI and ML workloads.",
    prerequisites: ["ml-cloud"],
    enables: [],
    alternatives: ["ml-cloud"],
    related: ["gpu-computing"],
    metadata: {
      phase: "ml-cloud",
      optional: true,
    },
  }),

  node({
    id: "azure-for-ml",
    title: "Azure for ML Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand Azure infrastructure relevant to machine learning.",
    whyItMatters: "Azure is widely used for enterprise ML environments.",
    prerequisites: ["ml-cloud"],
    enables: [],
    alternatives: ["ml-cloud"],
    related: ["model-serving"],
    metadata: {
      phase: "ml-cloud",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 27 — GPU
  // ============================================================

  node({
    id: "gpu-computing",
    title: "GPU Computing",
    category: "infrastructure",
    importance: "critical",
    description:
      "Understand GPU memory, parallel computation, batching and accelerated ML workloads.",
    whyItMatters:
      "Deep learning performance is heavily influenced by GPU resources.",
    prerequisites: ["ml-cloud", "pytorch"],
    enables: ["distributed-ml"],
    alternatives: [],
    related: ["model-performance"],
    metadata: { phase: "gpu-computing", primary: true },
  }),

  // ============================================================
  // PHASE 28 — DISTRIBUTED ML
  // ============================================================

  node({
    id: "distributed-ml",
    title: "Distributed Machine Learning",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand distributed training, data parallelism, model parallelism and large-scale inference.",
    whyItMatters:
      "Large models and datasets can exceed the resources of a single machine.",
    prerequisites: ["gpu-computing", "pytorch", "model-performance"],
    enables: ["advanced-ml-architecture"],
    alternatives: [],
    related: ["ml-cloud"],
    metadata: { phase: "distributed-ml" },
  }),

  // ============================================================
  // PHASE 29 — SECURITY
  // ============================================================

  node({
    id: "ml-security",
    title: "ML Security",
    category: "security",
    importance: "high",
    description:
      "Understand adversarial inputs, data poisoning, model abuse, privacy and secure inference.",
    whyItMatters:
      "ML systems introduce security risks beyond conventional application security.",
    prerequisites: ["ml-system-design", "model-serving"],
    enables: ["responsible-ai"],
    alternatives: [],
    related: ["data-privacy"],
    metadata: { phase: "ml-security" },
  }),

  node({
    id: "responsible-ai",
    title: "Responsible AI",
    category: "governance",
    importance: "critical",
    description:
      "Understand fairness, bias, explainability, safety, privacy and responsible deployment.",
    whyItMatters:
      "Production AI systems must be evaluated for more than technical performance.",
    prerequisites: ["ml-security", "model-monitoring"],
    enables: ["advanced-ml-architecture"],
    alternatives: [],
    related: ["data-drift"],
    metadata: { phase: "responsible-ai" },
  }),

  // ============================================================
  // PHASE 30 — PRODUCTION INFRASTRUCTURE
  // ============================================================

  node({
    id: "ml-production-infrastructure",
    title: "ML Production Infrastructure",
    category: "infrastructure",
    importance: "critical",
    description:
      "Combine containers, cloud infrastructure, deployment automation and observability for ML workloads.",
    whyItMatters:
      "Production ML requires reliable infrastructure around the model itself.",
    prerequisites: ["ml-cloud", "ml-pipelines", "model-monitoring"],
    enables: ["advanced-ml-architecture"],
    alternatives: [],
    related: ["model-serving"],
    metadata: {
      phase: "ml-production-infrastructure",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 31 — ADVANCED ARCHITECTURE
  // ============================================================

  node({
    id: "advanced-ml-architecture",
    title: "Advanced ML Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Design scalable end-to-end AI/ML platforms combining data, models, infrastructure, serving, monitoring and governance.",
    whyItMatters:
      "Senior ML engineers must reason about complete production AI systems.",
    prerequisites: [
      "distributed-ml",
      "data-drift",
      "responsible-ai",
      "ml-production-infrastructure",
    ],
    enables: [],
    alternatives: [],
    related: ["ml-system-design", "model-serving", "mlops-foundation"],
    metadata: {
      phase: "advanced-ml-architecture",
      primary: true,
    },
  }),
];

/**
 * Closed-reference validation.
 *
 * Every relationship must point to a node that exists
 * inside this roadmap.
 */
const nodeIds = new Set(aiMlEngineerNodes.map((item) => item.id));

for (const item of aiMlEngineerNodes) {
  const references = [
    ...(item.prerequisites || []),
    ...(item.enables || []),
    ...(item.alternatives || []),
    ...(item.related || []),
  ];

  for (const reference of references) {
    if (!nodeIds.has(reference)) {
      throw new Error(
        `[AI/ML Roadmap] Invalid node reference "${reference}" ` +
          `in node "${item.id}".`,
      );
    }
  }
}

export default aiMlEngineerNodes;
export { aiMlEngineerNodes };

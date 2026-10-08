import { createKnowledgeNode } from "../../factory.js";

const node = (data) => createKnowledgeNode(data);

const genAiLlmEngineerNodes = [
  // ============================================================
  // PHASE 1 — AI & GENERATIVE AI FOUNDATION
  // ============================================================

  node({
    id: "ai-foundations",
    title: "AI Foundations",
    category: "foundation",
    importance: "critical",
    description:
      "Understand artificial intelligence, machine learning, deep learning and generative AI as connected fields.",
    whyItMatters:
      "GenAI engineering becomes much easier when the relationship between AI, ML, DL and foundation models is clear.",
    prerequisites: [],
    enables: [
      "machine-learning-foundations",
      "python-for-ai",
      "deep-learning-foundations",
    ],
    alternatives: [],
    related: ["generative-ai-foundations"],
    metadata: { phase: "genai-foundation", primary: true },
  }),

  node({
    id: "generative-ai-foundations",
    title: "Generative AI Foundations",
    category: "generative-ai",
    importance: "critical",
    description:
      "Understand generative models, generation, foundation models and the major application patterns of modern GenAI.",
    whyItMatters:
      "This establishes the mental model for the systems built later in the roadmap.",
    prerequisites: ["ai-foundations"],
    enables: ["llm-foundations"],
    alternatives: [],
    related: ["deep-learning-foundations"],
    metadata: { phase: "genai-foundation", primary: true },
  }),

  // ============================================================
  // PHASE 2 — PYTHON
  // ============================================================

  node({
    id: "python-for-ai",
    title: "Python for AI",
    category: "programming",
    importance: "critical",
    description:
      "Build practical Python skills for data processing, experimentation, APIs and AI application development.",
    whyItMatters:
      "Python is the dominant development language across the AI and LLM ecosystem.",
    prerequisites: ["ai-foundations"],
    enables: ["numpy-for-ai", "pandas-for-ai", "pytorch-for-llm"],
    alternatives: [],
    related: ["ai-production-engineering"],
    metadata: { phase: "python-for-ai", primary: true },
  }),

  node({
    id: "numpy-for-ai",
    title: "NumPy for AI",
    category: "programming",
    importance: "high",
    description:
      "Learn arrays, vectorized computation and numerical operations used in ML and deep learning.",
    whyItMatters:
      "Numerical computing concepts are fundamental to understanding tensors and model computation.",
    prerequisites: ["python-for-ai"],
    enables: ["math-for-ai"],
    alternatives: [],
    related: ["pytorch-for-llm"],
    metadata: { phase: "python-for-ai" },
  }),

  node({
    id: "pandas-for-ai",
    title: "Pandas for AI",
    category: "data",
    importance: "high",
    description: "Load, clean, transform and inspect datasets using Pandas.",
    whyItMatters:
      "AI systems depend heavily on clean, structured and inspectable data.",
    prerequisites: ["python-for-ai"],
    enables: ["data-engineering-for-ai"],
    alternatives: [],
    related: ["dataset-engineering-for-llm"],
    metadata: { phase: "python-for-ai" },
  }),

  node({
    id: "r-awareness-for-ai",
    title: "R Awareness",
    category: "programming",
    importance: "low",
    description:
      "Understand the role of R in statistics and data science environments.",
    whyItMatters:
      "R can be useful in statistics-heavy environments but is not the primary GenAI engineering language.",
    prerequisites: ["python-for-ai"],
    enables: [],
    alternatives: ["python-for-ai"],
    related: ["math-for-ai"],
    metadata: {
      phase: "python-for-ai",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 3 — MATHEMATICS
  // ============================================================

  node({
    id: "math-for-ai",
    title: "Mathematics for AI",
    category: "mathematics",
    importance: "critical",
    description:
      "Learn linear algebra, calculus, probability, statistics and optimization needed to understand ML and DL.",
    whyItMatters:
      "Mathematical intuition makes model training and behavior understandable instead of purely framework-driven.",
    prerequisites: ["numpy-for-ai"],
    enables: [
      "linear-algebra-for-ai",
      "calculus-for-ai",
      "probability-for-ai",
      "optimization-for-ai",
    ],
    alternatives: [],
    related: ["deep-learning-foundations"],
    metadata: { phase: "math-for-ai", primary: true },
  }),

  node({
    id: "linear-algebra-for-ai",
    title: "Linear Algebra for AI",
    category: "mathematics",
    importance: "critical",
    description:
      "Understand vectors, matrices, dot products, transformations and tensor representations.",
    whyItMatters:
      "Modern AI models represent data and parameters using vectors, matrices and tensors.",
    prerequisites: ["math-for-ai"],
    enables: ["deep-learning-foundations"],
    alternatives: [],
    related: ["embeddings"],
    metadata: { phase: "math-for-ai" },
  }),

  node({
    id: "calculus-for-ai",
    title: "Calculus for AI",
    category: "mathematics",
    importance: "high",
    description:
      "Understand derivatives, gradients, partial derivatives and the chain rule.",
    whyItMatters:
      "Gradient-based optimization is fundamental to neural-network training.",
    prerequisites: ["math-for-ai"],
    enables: ["optimization-for-ai"],
    alternatives: [],
    related: ["deep-learning-foundations"],
    metadata: { phase: "math-for-ai" },
  }),

  node({
    id: "probability-for-ai",
    title: "Probability for AI",
    category: "mathematics",
    importance: "critical",
    description:
      "Understand probability, conditional probability, distributions and uncertainty.",
    whyItMatters:
      "Probability is central to statistical learning and model behavior.",
    prerequisites: ["math-for-ai"],
    enables: ["machine-learning-foundations"],
    alternatives: [],
    related: ["llm-evaluation"],
    metadata: { phase: "math-for-ai" },
  }),

  node({
    id: "optimization-for-ai",
    title: "Optimization for AI",
    category: "mathematics",
    importance: "critical",
    description:
      "Understand objective functions, gradients, gradient descent and optimization trade-offs.",
    whyItMatters:
      "Training neural networks is fundamentally an optimization problem.",
    prerequisites: ["calculus-for-ai", "linear-algebra-for-ai"],
    enables: ["deep-learning-foundations"],
    alternatives: [],
    related: ["llm-pretraining"],
    metadata: { phase: "math-for-ai" },
  }),

  // ============================================================
  // PHASE 4 — DATA FOUNDATION
  // ============================================================

  node({
    id: "data-engineering-for-ai",
    title: "Data Engineering for AI",
    category: "data",
    importance: "critical",
    description:
      "Learn data collection, cleaning, transformation, validation and dataset preparation.",
    whyItMatters:
      "Training and retrieval quality depend heavily on the quality of the underlying data.",
    prerequisites: ["pandas-for-ai", "python-for-ai"],
    enables: ["data-preprocessing-for-ai", "dataset-engineering-for-llm"],
    alternatives: [],
    related: ["rag-data-pipeline"],
    metadata: { phase: "data-foundation-for-ai", primary: true },
  }),

  node({
    id: "data-preprocessing-for-ai",
    title: "Data Preprocessing for AI",
    category: "data",
    importance: "high",
    description:
      "Handle missing data, normalization, transformation, filtering and dataset preparation.",
    whyItMatters:
      "Poorly prepared data can create model failures and unreliable evaluation.",
    prerequisites: ["data-engineering-for-ai"],
    enables: ["machine-learning-foundations"],
    alternatives: [],
    related: ["dataset-engineering-for-llm"],
    metadata: { phase: "data-foundation-for-ai" },
  }),

  // ============================================================
  // PHASE 5 — MACHINE LEARNING
  // ============================================================

  node({
    id: "machine-learning-foundations",
    title: "Machine Learning Foundations",
    category: "machine-learning",
    importance: "critical",
    description:
      "Understand supervised learning, unsupervised learning, features, training, validation and generalization.",
    whyItMatters:
      "LLMs are machine-learning systems, and understanding ML fundamentals improves system-level reasoning.",
    prerequisites: ["data-preprocessing-for-ai", "probability-for-ai"],
    enables: ["supervised-learning-for-ai", "model-evaluation-for-ai"],
    alternatives: [],
    related: ["deep-learning-foundations"],
    metadata: { phase: "machine-learning-foundation", primary: true },
  }),

  node({
    id: "supervised-learning-for-ai",
    title: "Supervised Learning",
    category: "machine-learning",
    importance: "high",
    description:
      "Understand regression, classification and learning from labeled examples.",
    whyItMatters:
      "Supervised learning concepts directly connect to instruction tuning and evaluation.",
    prerequisites: ["machine-learning-foundations"],
    enables: ["model-evaluation-for-ai"],
    alternatives: [],
    related: ["fine-tuning-foundation"],
    metadata: { phase: "machine-learning-foundation" },
  }),

  node({
    id: "model-evaluation-for-ai",
    title: "Machine Learning Model Evaluation",
    category: "machine-learning",
    importance: "critical",
    description:
      "Learn validation strategies, metrics, error analysis and generalization.",
    whyItMatters:
      "Reliable evaluation is essential before building specialized LLM evaluation systems.",
    prerequisites: [
      "machine-learning-foundations",
      "supervised-learning-for-ai",
    ],
    enables: ["llm-evaluation"],
    alternatives: [],
    related: ["rag-evaluation"],
    metadata: { phase: "machine-learning-foundation" },
  }),

  // ============================================================
  // PHASE 6 — DEEP LEARNING
  // ============================================================

  node({
    id: "deep-learning-foundations",
    title: "Deep Learning Foundations",
    category: "deep-learning",
    importance: "critical",
    description:
      "Understand neural networks, tensors, activations, losses, backpropagation and training.",
    whyItMatters: "Modern LLMs are large deep-learning models.",
    prerequisites: [
      "linear-algebra-for-ai",
      "optimization-for-ai",
      "machine-learning-foundations",
    ],
    enables: ["neural-networks-for-llm", "pytorch-for-llm"],
    alternatives: [],
    related: ["transformers"],
    metadata: { phase: "deep-learning-foundation", primary: true },
  }),

  node({
    id: "neural-networks-for-llm",
    title: "Neural Networks",
    category: "deep-learning",
    importance: "critical",
    description:
      "Understand layers, activation functions, losses, forward passes and backpropagation.",
    whyItMatters:
      "Transformers are neural networks, so their components should not be treated as magic.",
    prerequisites: ["deep-learning-foundations"],
    enables: ["pytorch-for-llm"],
    alternatives: [],
    related: ["attention-mechanism"],
    metadata: { phase: "deep-learning-foundation" },
  }),

  // ============================================================
  // PHASE 7 — PYTORCH
  // ============================================================

  node({
    id: "pytorch-for-llm",
    title: "PyTorch for LLM Engineering",
    category: "framework",
    importance: "critical",
    description:
      "Learn tensors, modules, datasets, dataloaders, optimizers, training loops and GPU execution.",
    whyItMatters:
      "PyTorch is a core framework for modern open-source model development and research.",
    prerequisites: [
      "neural-networks-for-llm",
      "optimization-for-ai",
      "python-for-ai",
    ],
    enables: [
      "nlp-foundations",
      "transformers",
      "llm-pretraining",
      "fine-tuning-foundation",
    ],
    alternatives: ["tensorflow-awareness", "jax-awareness"],
    related: ["gpu-and-accelerators"],
    metadata: { phase: "pytorch-foundation", primary: true },
  }),

  node({
    id: "tensorflow-awareness",
    title: "TensorFlow Awareness",
    category: "framework",
    importance: "low",
    description:
      "Understand TensorFlow as an alternative deep-learning framework.",
    whyItMatters: "Some organizations still use TensorFlow-based ML systems.",
    prerequisites: ["deep-learning-foundations"],
    enables: [],
    alternatives: ["pytorch-for-llm"],
    related: ["model-serving"],
    metadata: {
      phase: "pytorch-foundation",
      optional: true,
    },
  }),

  node({
    id: "jax-awareness",
    title: "JAX Awareness",
    category: "framework",
    importance: "medium",
    description:
      "Understand JAX for accelerated numerical computing and ML research.",
    whyItMatters:
      "JAX is relevant to research-heavy and high-performance AI workloads.",
    prerequisites: ["deep-learning-foundations"],
    enables: [],
    alternatives: ["pytorch-for-llm"],
    related: ["gpu-and-accelerators"],
    metadata: {
      phase: "pytorch-foundation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 8 — NLP
  // ============================================================

  node({
    id: "nlp-foundations",
    title: "NLP Foundations",
    category: "nlp",
    importance: "critical",
    description:
      "Understand text processing, representations, language modeling and sequence-based learning.",
    whyItMatters:
      "LLMs are language-processing systems, so NLP concepts provide essential context.",
    prerequisites: ["pytorch-for-llm", "machine-learning-foundations"],
    enables: ["sequence-models", "embeddings", "transformers"],
    alternatives: [],
    related: ["llm-foundations"],
    metadata: { phase: "nlp-foundation", primary: true },
  }),

  node({
    id: "text-representations",
    title: "Text Representations",
    category: "nlp",
    importance: "critical",
    description:
      "Understand numerical representations of text and contextual representations.",
    whyItMatters:
      "Language must be represented numerically before neural models can process it.",
    prerequisites: ["nlp-foundations"],
    enables: ["embeddings", "sequence-models"],
    alternatives: [],
    related: ["tokenization"],
    metadata: { phase: "nlp-foundation" },
  }),

  // ============================================================
  // PHASE 9 — SEQUENCE MODELS
  // ============================================================

  node({
    id: "sequence-models",
    title: "Sequence Models",
    category: "nlp",
    importance: "high",
    description:
      "Understand RNNs, LSTMs and GRUs and the challenges of sequential modeling.",
    whyItMatters:
      "Sequence models provide useful historical context for understanding why transformers became dominant.",
    prerequisites: ["nlp-foundations", "text-representations"],
    enables: ["attention-mechanism"],
    alternatives: [],
    related: ["transformers"],
    metadata: { phase: "sequence-models" },
  }),

  // ============================================================
  // PHASE 10 — ATTENTION
  // ============================================================

  node({
    id: "attention-mechanism",
    title: "Attention Mechanism",
    category: "deep-learning",
    importance: "critical",
    description:
      "Understand queries, keys, values, attention scores and self-attention.",
    whyItMatters:
      "Attention is the central mechanism behind transformer architectures.",
    prerequisites: ["sequence-models", "pytorch-for-llm"],
    enables: ["transformers", "multi-head-attention"],
    alternatives: [],
    related: ["llm-foundations"],
    metadata: { phase: "attention-foundation", primary: true },
  }),

  node({
    id: "multi-head-attention",
    title: "Multi-Head Attention",
    category: "deep-learning",
    importance: "critical",
    description:
      "Understand multiple attention heads and how they capture different relationships.",
    whyItMatters:
      "Multi-head attention is a fundamental transformer building block.",
    prerequisites: ["attention-mechanism"],
    enables: ["transformers"],
    alternatives: [],
    related: ["transformer-architectures"],
    metadata: { phase: "attention-foundation" },
  }),

  // ============================================================
  // PHASE 11 — TRANSFORMERS
  // ============================================================

  node({
    id: "transformers",
    title: "Transformer Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Understand transformer blocks, self-attention, feed-forward networks, normalization and positional information.",
    whyItMatters:
      "Transformers are the architectural foundation of modern LLMs.",
    prerequisites: [
      "attention-mechanism",
      "multi-head-attention",
      "pytorch-for-llm",
    ],
    enables: ["transformer-architectures", "llm-foundations"],
    alternatives: [],
    related: ["llm-pretraining"],
    metadata: { phase: "transformers", primary: true },
  }),

  // ============================================================
  // PHASE 12 — MODERN TRANSFORMER ARCHITECTURES
  // ============================================================

  node({
    id: "transformer-architectures",
    title: "Modern Transformer Architectures",
    category: "architecture",
    importance: "critical",
    description:
      "Understand encoder-only, decoder-only and encoder-decoder transformer families.",
    whyItMatters:
      "Different transformer architectures are designed for different workloads.",
    prerequisites: ["transformers"],
    enables: ["llm-foundations"],
    alternatives: [],
    related: ["llm-pretraining"],
    metadata: {
      phase: "transformer-architectures",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 13 — LLM FUNDAMENTALS
  // ============================================================

  node({
    id: "llm-foundations",
    title: "Large Language Model Foundations",
    category: "llm",
    importance: "critical",
    description:
      "Understand language modeling, tokens, context windows, pretraining, inference and model behavior.",
    whyItMatters:
      "This is the central conceptual foundation for LLM engineering.",
    prerequisites: [
      "generative-ai-foundations",
      "transformers",
      "transformer-architectures",
    ],
    enables: [
      "tokenization",
      "llm-pretraining",
      "llm-inference",
      "prompt-engineering",
    ],
    alternatives: [],
    related: ["embeddings", "fine-tuning-foundation"],
    metadata: { phase: "llm-fundamentals", primary: true },
  }),

  // ============================================================
  // PHASE 14 — TOKENIZATION
  // ============================================================

  node({
    id: "tokenization",
    title: "LLM Tokenization",
    category: "llm",
    importance: "critical",
    description:
      "Understand tokens, vocabulary, subword tokenization, token IDs and context length.",
    whyItMatters:
      "Tokenization affects model input, context usage, latency and cost.",
    prerequisites: ["llm-foundations"],
    enables: ["embeddings", "prompt-engineering", "llm-inference"],
    alternatives: [],
    related: ["dataset-engineering-for-llm"],
    metadata: { phase: "tokenization", primary: true },
  }),

  // ============================================================
  // PHASE 15 — EMBEDDINGS
  // ============================================================

  node({
    id: "embeddings",
    title: "Embeddings",
    category: "retrieval",
    importance: "critical",
    description:
      "Understand dense vector representations, semantic similarity and embedding models.",
    whyItMatters:
      "Embeddings are the foundation of semantic search and modern retrieval systems.",
    prerequisites: ["text-representations", "tokenization"],
    enables: ["vector-search"],
    alternatives: [],
    related: ["rag-foundation"],
    metadata: { phase: "embeddings", primary: true },
  }),

  // ============================================================
  // PHASE 16 — PRETRAINING
  // ============================================================

  node({
    id: "llm-pretraining",
    title: "LLM Pretraining",
    category: "llm",
    importance: "high",
    description:
      "Understand dataset preparation, next-token prediction, training objectives and large-scale model training.",
    whyItMatters:
      "Understanding pretraining explains where foundation-model capabilities originate.",
    prerequisites: [
      "llm-foundations",
      "pytorch-for-llm",
      "dataset-engineering-for-llm",
    ],
    enables: ["fine-tuning-foundation", "gpu-and-accelerators"],
    alternatives: [],
    related: ["distributed-llm-systems"],
    metadata: { phase: "llm-pretraining" },
  }),

  // ============================================================
  // PHASE 17 — INFERENCE
  // ============================================================

  node({
    id: "llm-inference",
    title: "LLM Inference",
    category: "llm",
    importance: "critical",
    description:
      "Understand autoregressive generation, decoding, sampling, temperature and inference constraints.",
    whyItMatters:
      "LLM applications depend on understanding how model generation actually works.",
    prerequisites: ["llm-foundations", "tokenization"],
    enables: ["prompt-engineering", "llm-inference-optimization"],
    alternatives: [],
    related: ["llm-serving"],
    metadata: { phase: "llm-inference", primary: true },
  }),

  // ============================================================
  // PHASE 18 — PROMPT ENGINEERING
  // ============================================================

  node({
    id: "prompt-engineering",
    title: "Prompt Engineering",
    category: "application",
    importance: "critical",
    description:
      "Learn instruction design, few-shot examples, structured prompts, constraints and prompt composition.",
    whyItMatters:
      "Good prompting improves reliability without requiring model retraining.",
    prerequisites: ["llm-foundations", "llm-inference"],
    enables: ["structured-outputs", "llm-api-engineering"],
    alternatives: [],
    related: ["rag-foundation"],
    metadata: { phase: "prompt-engineering", primary: true },
  }),

  // ============================================================
  // PHASE 19 — LLM API ENGINEERING
  // ============================================================

  node({
    id: "llm-api-engineering",
    title: "LLM API Engineering",
    category: "application",
    importance: "critical",
    description:
      "Integrate hosted foundation models using reliable API patterns, retries, timeouts and error handling.",
    whyItMatters:
      "Most production AI applications initially consume hosted models through APIs.",
    prerequisites: ["prompt-engineering", "llm-foundations"],
    enables: [
      "structured-outputs",
      "tool-calling",
      "ai-production-engineering",
    ],
    alternatives: [],
    related: ["llm-observability"],
    metadata: { phase: "llm-api-engineering", primary: true },
  }),

  // ============================================================
  // PHASE 20 — STRUCTURED OUTPUTS & TOOLS
  // ============================================================

  node({
    id: "structured-outputs",
    title: "Structured Outputs",
    category: "application",
    importance: "critical",
    description:
      "Design reliable machine-readable outputs using schemas, validation and constrained responses.",
    whyItMatters:
      "Production applications cannot safely depend on arbitrary natural-language responses.",
    prerequisites: ["llm-api-engineering", "prompt-engineering"],
    enables: ["tool-calling"],
    alternatives: [],
    related: ["llm-evaluation"],
    metadata: { phase: "structured-outputs", primary: true },
  }),

  node({
    id: "tool-calling",
    title: "Function & Tool Calling",
    category: "agents",
    importance: "critical",
    description:
      "Connect LLMs to APIs, databases, search systems and application capabilities through controlled tools.",
    whyItMatters:
      "Tool calling turns an LLM from a text generator into a system that can interact with applications.",
    prerequisites: ["structured-outputs"],
    enables: ["ai-agents-foundation", "agent-memory"],
    alternatives: [],
    related: ["llm-security"],
    metadata: { phase: "structured-outputs", primary: true },
  }),

  // ============================================================
  // PHASE 21 — HUGGING FACE
  // ============================================================

  node({
    id: "hugging-face-ecosystem",
    title: "Hugging Face Ecosystem",
    category: "ecosystem",
    importance: "critical",
    description:
      "Work with model repositories, tokenizers, datasets and transformer tooling.",
    whyItMatters:
      "Hugging Face is a major ecosystem for open-source models and AI tooling.",
    prerequisites: ["transformers", "llm-foundations"],
    enables: ["fine-tuning-foundation", "llm-serving"],
    alternatives: [],
    related: ["pytorch-for-llm"],
    metadata: { phase: "hugging-face-ecosystem", primary: true },
  }),

  // ============================================================
  // PHASE 22 — FINE-TUNING
  // ============================================================

  node({
    id: "fine-tuning-foundation",
    title: "LLM Fine-Tuning",
    category: "training",
    importance: "critical",
    description:
      "Understand supervised fine-tuning, instruction tuning and adaptation of pretrained models.",
    whyItMatters:
      "Fine-tuning is useful when prompting or retrieval alone cannot produce the desired behavior.",
    prerequisites: [
      "llm-pretraining",
      "hugging-face-ecosystem",
      "pytorch-for-llm",
    ],
    enables: ["peft-lora"],
    alternatives: [],
    related: ["dataset-engineering-for-llm"],
    metadata: { phase: "fine-tuning-foundation", primary: true },
  }),

  // ============================================================
  // PHASE 23 — PEFT
  // ============================================================

  node({
    id: "peft-lora",
    title: "PEFT, LoRA & QLoRA",
    category: "training",
    importance: "critical",
    description:
      "Learn parameter-efficient fine-tuning techniques for adapting large models with limited compute.",
    whyItMatters:
      "PEFT makes model adaptation practical without updating every parameter.",
    prerequisites: ["fine-tuning-foundation"],
    enables: ["llm-serving"],
    alternatives: [],
    related: ["gpu-and-accelerators"],
    metadata: { phase: "peft-lora", primary: true },
  }),

  // ============================================================
  // PHASE 24 — DATASET ENGINEERING
  // ============================================================

  node({
    id: "dataset-engineering-for-llm",
    title: "LLM Dataset Engineering",
    category: "data",
    importance: "critical",
    description:
      "Prepare instruction datasets, clean examples, remove duplicates and validate training data.",
    whyItMatters:
      "Training data quality strongly affects model behavior and fine-tuning results.",
    prerequisites: ["data-engineering-for-ai", "data-preprocessing-for-ai"],
    enables: ["llm-pretraining", "fine-tuning-foundation"],
    alternatives: [],
    related: ["rag-data-pipeline"],
    metadata: {
      phase: "dataset-engineering-for-llm",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 25 — VECTOR SEARCH
  // ============================================================

  node({
    id: "vector-search",
    title: "Vector Search",
    category: "retrieval",
    importance: "critical",
    description:
      "Understand vector indexes, similarity metrics, approximate nearest-neighbor search and vector databases.",
    whyItMatters:
      "Scalable semantic retrieval is a core component of production RAG.",
    prerequisites: ["embeddings"],
    enables: ["rag-foundation"],
    alternatives: [],
    related: ["rag-data-pipeline"],
    metadata: { phase: "vector-search", primary: true },
  }),

  // ============================================================
  // PHASE 26 — RAG
  // ============================================================

  node({
    id: "rag-foundation",
    title: "Retrieval-Augmented Generation",
    category: "retrieval",
    importance: "critical",
    description:
      "Build systems that retrieve external information and provide it as context to an LLM.",
    whyItMatters:
      "RAG enables grounded AI applications using external and updatable knowledge.",
    prerequisites: ["vector-search", "llm-api-engineering"],
    enables: ["rag-data-pipeline", "advanced-rag"],
    alternatives: [],
    related: ["rag-evaluation"],
    metadata: { phase: "rag-foundation", primary: true },
  }),

  // ============================================================
  // PHASE 27 — RAG DATA PIPELINE
  // ============================================================

  node({
    id: "rag-data-pipeline",
    title: "RAG Data Pipeline",
    category: "retrieval",
    importance: "critical",
    description:
      "Design document ingestion, parsing, chunking, metadata extraction, embedding and indexing pipelines.",
    whyItMatters:
      "RAG quality begins with the quality of the knowledge ingestion pipeline.",
    prerequisites: ["rag-foundation", "dataset-engineering-for-llm"],
    enables: ["advanced-rag"],
    alternatives: [],
    related: ["vector-search"],
    metadata: { phase: "rag-data-pipeline", primary: true },
  }),

  // ============================================================
  // PHASE 28 — ADVANCED RAG
  // ============================================================

  node({
    id: "advanced-rag",
    title: "Advanced RAG",
    category: "retrieval",
    importance: "critical",
    description:
      "Learn query rewriting, hybrid retrieval, reranking, contextual compression and multi-stage retrieval.",
    whyItMatters:
      "Production RAG systems require more than simple vector similarity search.",
    prerequisites: ["rag-foundation", "rag-data-pipeline"],
    enables: ["rag-evaluation"],
    alternatives: [],
    related: ["llm-evaluation"],
    metadata: { phase: "advanced-rag", primary: true },
  }),

  // ============================================================
  // PHASE 29 — RAG EVALUATION
  // ============================================================

  node({
    id: "rag-evaluation",
    title: "RAG Evaluation",
    category: "evaluation",
    importance: "critical",
    description:
      "Evaluate retrieval relevance, groundedness, answer quality and hallucination behavior.",
    whyItMatters:
      "A RAG system needs measurable quality signals instead of subjective demos.",
    prerequisites: ["advanced-rag", "model-evaluation-for-ai"],
    enables: ["llm-evaluation"],
    alternatives: [],
    related: ["llm-observability"],
    metadata: { phase: "rag-evaluation", primary: true },
  }),

  // ============================================================
  // PHASE 30 — AGENTS
  // ============================================================

  node({
    id: "ai-agents-foundation",
    title: "AI Agents Foundation",
    category: "agents",
    importance: "critical",
    description:
      "Understand agent loops, planning, tool use, state and controlled interaction with environments.",
    whyItMatters:
      "Agents should be used where dynamic tool-driven workflows provide real value.",
    prerequisites: ["tool-calling", "rag-foundation"],
    enables: ["agent-memory", "multi-agent-systems"],
    alternatives: [],
    related: ["llm-security"],
    metadata: { phase: "ai-agents-foundation", primary: true },
  }),

  // ============================================================
  // PHASE 31 — TOOL CALLING
  // ============================================================

  node({
    id: "agent-tool-calling",
    title: "Agent Tool Orchestration",
    category: "agents",
    importance: "critical",
    description:
      "Design controlled tool selection, execution, validation and failure handling inside agent workflows.",
    whyItMatters:
      "Uncontrolled tool access can make AI agents unreliable and unsafe.",
    prerequisites: ["ai-agents-foundation", "tool-calling"],
    enables: ["agent-memory"],
    alternatives: [],
    related: ["llm-security"],
    metadata: { phase: "tool-calling" },
  }),

  // ============================================================
  // PHASE 32 — AGENT MEMORY
  // ============================================================

  node({
    id: "agent-memory",
    title: "Agent Memory",
    category: "agents",
    importance: "high",
    description:
      "Understand conversation state, persistent memory and retrieval-based memory.",
    whyItMatters:
      "Useful agents need controlled state and memory rather than unlimited conversation history.",
    prerequisites: ["ai-agents-foundation", "agent-tool-calling", "embeddings"],
    enables: ["multi-agent-systems"],
    alternatives: [],
    related: ["rag-foundation"],
    metadata: { phase: "agent-memory" },
  }),

  // ============================================================
  // PHASE 33 — MULTI-AGENT
  // ============================================================

  node({
    id: "multi-agent-systems",
    title: "Multi-Agent Systems",
    category: "agents",
    importance: "medium",
    description:
      "Understand architectures where multiple specialized agents coordinate to solve complex tasks.",
    whyItMatters:
      "Multi-agent systems can be useful for genuinely decomposable workflows but add complexity.",
    prerequisites: ["ai-agents-foundation", "agent-memory"],
    enables: ["advanced-llm-system-design"],
    alternatives: [],
    related: ["tool-calling"],
    metadata: {
      phase: "multi-agent-systems",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 34 — LLM EVALUATION
  // ============================================================

  node({
    id: "llm-evaluation",
    title: "LLM Evaluation",
    category: "evaluation",
    importance: "critical",
    description:
      "Evaluate correctness, relevance, faithfulness, safety, latency and cost of LLM applications.",
    whyItMatters: "Production AI systems require measurable quality gates.",
    prerequisites: [
      "model-evaluation-for-ai",
      "rag-evaluation",
      "structured-outputs",
    ],
    enables: ["llmops", "ai-safety-and-guardrails"],
    alternatives: [],
    related: ["llm-observability"],
    metadata: { phase: "llm-evaluation", primary: true },
  }),

  // ============================================================
  // PHASE 35 — OBSERVABILITY
  // ============================================================

  node({
    id: "llm-observability",
    title: "LLM Observability",
    category: "observability",
    importance: "critical",
    description:
      "Trace prompts, model calls, retrieval, tool calls, latency, failures and token usage.",
    whyItMatters:
      "LLM applications are difficult to debug without visibility into their execution chain.",
    prerequisites: [
      "llm-api-engineering",
      "rag-foundation",
      "ai-agents-foundation",
    ],
    enables: ["llmops"],
    alternatives: [],
    related: ["llm-evaluation"],
    metadata: { phase: "llm-observability", primary: true },
  }),

  // ============================================================
  // PHASE 36 — SECURITY
  // ============================================================

  node({
    id: "llm-security",
    title: "LLM Security",
    category: "security",
    importance: "critical",
    description:
      "Understand prompt injection, data leakage, insecure tool use, model abuse and AI application threats.",
    whyItMatters:
      "LLM applications create security boundaries that traditional application security alone does not cover.",
    prerequisites: [
      "llm-api-engineering",
      "tool-calling",
      "ai-agents-foundation",
    ],
    enables: ["ai-safety-and-guardrails"],
    alternatives: [],
    related: ["agent-tool-calling"],
    metadata: { phase: "llm-security", primary: true },
  }),

  // ============================================================
  // PHASE 37 — SAFETY & GUARDRAILS
  // ============================================================

  node({
    id: "ai-safety-and-guardrails",
    title: "AI Safety & Guardrails",
    category: "safety",
    importance: "critical",
    description:
      "Design input validation, output constraints, safety policies and application-level guardrails.",
    whyItMatters:
      "Production AI systems need controls around unpredictable model behavior.",
    prerequisites: ["llm-security", "llm-evaluation"],
    enables: ["ai-production-engineering"],
    alternatives: [],
    related: ["responsible-ai"],
    metadata: { phase: "ai-safety-and-guardrails", primary: true },
  }),

  // ============================================================
  // PHASE 38 — LLM SERVING
  // ============================================================

  node({
    id: "llm-serving",
    title: "LLM Serving",
    category: "deployment",
    importance: "critical",
    description:
      "Deploy hosted or open-source models as scalable inference services.",
    whyItMatters:
      "Running your own models requires reliable and scalable inference infrastructure.",
    prerequisites: ["hugging-face-ecosystem", "llm-inference", "peft-lora"],
    enables: ["llm-inference-optimization", "distributed-llm-systems"],
    alternatives: [],
    related: ["ai-cloud-infrastructure"],
    metadata: { phase: "llm-serving", primary: true },
  }),

  // ============================================================
  // PHASE 39 — INFERENCE OPTIMIZATION
  // ============================================================

  node({
    id: "llm-inference-optimization",
    title: "LLM Inference Optimization",
    category: "performance",
    importance: "critical",
    description:
      "Optimize batching, quantization, caching, KV cache, throughput and latency.",
    whyItMatters:
      "Inference efficiency directly affects cost, scalability and user experience.",
    prerequisites: ["llm-serving", "llm-inference"],
    enables: ["distributed-llm-systems", "advanced-llm-system-design"],
    alternatives: [],
    related: ["gpu-and-accelerators"],
    metadata: {
      phase: "llm-inference-optimization",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 40 — GPU
  // ============================================================

  node({
    id: "gpu-and-accelerators",
    title: "GPU & AI Accelerators",
    category: "infrastructure",
    importance: "critical",
    description:
      "Understand GPU memory, compute, batching and accelerator constraints for training and inference.",
    whyItMatters:
      "Modern AI workloads are heavily constrained by compute and memory resources.",
    prerequisites: ["pytorch-for-llm", "llm-pretraining"],
    enables: ["distributed-llm-systems", "ai-cloud-infrastructure"],
    alternatives: [],
    related: ["llm-inference-optimization"],
    metadata: { phase: "gpu-and-accelerators", primary: true },
  }),

  // ============================================================
  // PHASE 41 — DISTRIBUTED LLM
  // ============================================================

  node({
    id: "distributed-llm-systems",
    title: "Distributed LLM Systems",
    category: "distributed-systems",
    importance: "high",
    description:
      "Understand distributed training, data parallelism, model parallelism and large-scale inference.",
    whyItMatters:
      "Large models and workloads eventually exceed single-machine resources.",
    prerequisites: [
      "gpu-and-accelerators",
      "llm-serving",
      "llm-inference-optimization",
    ],
    enables: ["advanced-llm-system-design"],
    alternatives: [],
    related: ["ai-cloud-infrastructure"],
    metadata: { phase: "distributed-llm-systems" },
  }),

  // ============================================================
  // PHASE 42 — LLMOPS
  // ============================================================

  node({
    id: "llmops",
    title: "LLMOps",
    category: "operations",
    importance: "critical",
    description:
      "Apply versioning, testing, evaluation, observability, deployment and lifecycle management to LLM applications.",
    whyItMatters:
      "Production LLM applications need repeatable operational workflows.",
    prerequisites: [
      "llm-evaluation",
      "llm-observability",
      "ai-production-engineering",
    ],
    enables: ["advanced-llm-system-design"],
    alternatives: [],
    related: ["ai-cloud-infrastructure"],
    metadata: { phase: "llmops", primary: true },
  }),

  // ============================================================
  // PHASE 43 — CLOUD
  // ============================================================

  node({
    id: "ai-cloud-infrastructure",
    title: "Cloud Infrastructure for AI",
    category: "cloud",
    importance: "critical",
    description:
      "Understand cloud compute, storage, networking, GPUs, containers and managed AI infrastructure.",
    whyItMatters: "Production AI workloads require scalable infrastructure.",
    prerequisites: ["llm-serving", "gpu-and-accelerators"],
    enables: ["ai-production-engineering", "distributed-llm-systems"],
    alternatives: ["gcp-ai-infrastructure", "azure-ai-infrastructure"],
    related: ["llmops"],
    metadata: {
      phase: "ai-cloud-infrastructure",
      primary: true,
    },
  }),

  node({
    id: "gcp-ai-infrastructure",
    title: "GCP AI Infrastructure Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand Google Cloud infrastructure relevant to AI workloads.",
    whyItMatters: "GCP is highly relevant to AI and GPU workloads.",
    prerequisites: ["ai-cloud-infrastructure"],
    enables: [],
    alternatives: ["ai-cloud-infrastructure"],
    related: ["gpu-and-accelerators"],
    metadata: {
      phase: "ai-cloud-infrastructure",
      optional: true,
    },
  }),

  node({
    id: "azure-ai-infrastructure",
    title: "Azure AI Infrastructure Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand Azure infrastructure relevant to enterprise AI workloads.",
    whyItMatters: "Azure is widely used for enterprise AI deployments.",
    prerequisites: ["ai-cloud-infrastructure"],
    enables: [],
    alternatives: ["ai-cloud-infrastructure"],
    related: ["llm-serving"],
    metadata: {
      phase: "ai-cloud-infrastructure",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 44 — PRODUCTION AI
  // ============================================================

  node({
    id: "ai-production-engineering",
    title: "Production AI Engineering",
    category: "production",
    importance: "critical",
    description:
      "Combine APIs, databases, queues, caching, security, observability, cloud infrastructure and AI models.",
    whyItMatters:
      "Real AI products are distributed software systems, not isolated model calls.",
    prerequisites: [
      "llm-api-engineering",
      "ai-safety-and-guardrails",
      "ai-cloud-infrastructure",
    ],
    enables: ["llmops", "advanced-llm-system-design"],
    alternatives: [],
    related: ["llm-serving"],
    metadata: {
      phase: "ai-production-engineering",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 45 — ADVANCED LLM SYSTEM DESIGN
  // ============================================================

  node({
    id: "advanced-llm-system-design",
    title: "Advanced LLM System Design",
    category: "architecture",
    importance: "critical",
    description:
      "Design scalable AI platforms combining models, retrieval, agents, infrastructure, evaluation, security and observability.",
    whyItMatters:
      "Senior LLM engineers need to reason about complete AI platforms and their trade-offs.",
    prerequisites: [
      "distributed-llm-systems",
      "llmops",
      "ai-production-engineering",
    ],
    enables: [],
    alternatives: [],
    related: ["llm-serving", "rag-foundation", "ai-agents-foundation"],
    metadata: {
      phase: "advanced-llm-system-design",
      primary: true,
    },
  }),
];

/**
 * Closed-reference validation.
 *
 * Every prerequisite, enable, alternative and related reference
 * must point to a canonical node in this roadmap.
 */
const nodeIds = new Set(genAiLlmEngineerNodes.map((item) => item.id));

for (const item of genAiLlmEngineerNodes) {
  const references = [
    ...(item.prerequisites || []),
    ...(item.enables || []),
    ...(item.alternatives || []),
    ...(item.related || []),
  ];

  for (const reference of references) {
    if (!nodeIds.has(reference)) {
      throw new Error(
        `[GenAI/LLM Roadmap] Invalid node reference "${reference}" ` +
          `in node "${item.id}".`,
      );
    }
  }
}

export default genAiLlmEngineerNodes;
export { genAiLlmEngineerNodes };

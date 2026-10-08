const genAiLlmEngineerPhases = [
  {
    id: "genai-foundation",
    order: 1,
    title: "AI & Generative AI Foundation",
    description:
      "Understand AI, machine learning, deep learning and generative AI before specializing in large language models.",
    goal: "Build the conceptual foundation required to understand modern generative AI systems.",
    primaryPath: "AI → ML → Deep Learning → Generative AI",
    alternatives: [],
  },

  {
    id: "python-for-ai",
    order: 2,
    title: "Python for AI Engineering",
    description:
      "Build production-capable Python skills for numerical computing, data processing, experimentation and AI applications.",
    goal: "Use Python confidently across the complete AI/ML lifecycle.",
    primaryPath: "Python",
    alternatives: ["R awareness"],
  },

  {
    id: "math-for-ai",
    order: 3,
    title: "Mathematics for AI",
    description:
      "Learn the linear algebra, calculus, probability and optimization needed to understand machine learning and deep learning.",
    goal: "Develop mathematical intuition instead of treating AI models as black boxes.",
    primaryPath:
      "Linear Algebra + Probability + Statistics + Calculus + Optimization",
    alternatives: [],
  },

  {
    id: "data-foundation-for-ai",
    order: 4,
    title: "Data Engineering for AI",
    description:
      "Learn data collection, cleaning, preprocessing, transformation, quality and dataset preparation.",
    goal: "Understand how high-quality training and retrieval data is produced.",
    primaryPath: "Python + NumPy + Pandas",
    alternatives: [],
  },

  {
    id: "machine-learning-foundation",
    order: 5,
    title: "Machine Learning Foundation",
    description:
      "Understand supervised learning, unsupervised learning, features, training, validation and model evaluation.",
    goal: "Understand the machine learning concepts underneath modern AI systems.",
    primaryPath: "Classical Machine Learning",
    alternatives: [],
  },

  {
    id: "deep-learning-foundation",
    order: 6,
    title: "Deep Learning Foundation",
    description:
      "Learn neural networks, tensors, activations, loss functions, backpropagation and gradient-based optimization.",
    goal: "Build the foundation required to understand modern foundation models.",
    primaryPath: "Neural Networks + Deep Learning",
    alternatives: [],
  },

  {
    id: "pytorch-foundation",
    order: 7,
    title: "PyTorch",
    description:
      "Learn tensors, datasets, dataloaders, modules, optimizers, training loops and GPU-based deep learning.",
    goal: "Implement and experiment with deep learning models practically.",
    primaryPath: "PyTorch",
    alternatives: ["TensorFlow awareness", "JAX awareness"],
  },

  {
    id: "nlp-foundation",
    order: 8,
    title: "Natural Language Processing Foundation",
    description:
      "Learn text processing, representations, language modeling and sequence modeling.",
    goal: "Understand how language is represented and processed by AI systems.",
    primaryPath: "Modern NLP",
    alternatives: [],
  },

  {
    id: "sequence-models",
    order: 9,
    title: "Sequence Models",
    description:
      "Understand sequence modeling concepts including RNNs, LSTMs and GRUs before moving to transformers.",
    goal: "Understand why transformer architectures changed modern NLP.",
    primaryPath: "RNN → LSTM → GRU → Transformer",
    alternatives: [],
  },

  {
    id: "attention-foundation",
    order: 10,
    title: "Attention Mechanism",
    description:
      "Understand queries, keys, values, attention scores and self-attention.",
    goal: "Understand the central mechanism behind transformer architectures.",
    primaryPath: "Self-Attention",
    alternatives: [],
  },

  {
    id: "transformers",
    order: 11,
    title: "Transformer Architecture",
    description:
      "Understand transformer blocks, multi-head attention, positional information, encoder-decoder architecture and normalization.",
    goal: "Understand transformers deeply enough to reason about modern LLM architectures.",
    primaryPath: "Transformers",
    alternatives: [],
  },

  {
    id: "transformer-architectures",
    order: 12,
    title: "Modern Transformer Architectures",
    description:
      "Understand encoder-only, decoder-only and encoder-decoder transformer families and their use cases.",
    goal: "Know why different transformer architectures are used for different AI tasks.",
    primaryPath: "Decoder-only LLMs",
    alternatives: ["Encoder-only models", "Encoder-decoder models"],
  },

  {
    id: "llm-fundamentals",
    order: 13,
    title: "Large Language Model Fundamentals",
    description:
      "Understand tokens, vocabulary, context windows, pretraining, inference and language-model behavior.",
    goal: "Understand what an LLM actually is and how it processes language.",
    primaryPath: "LLM Fundamentals",
    alternatives: [],
  },

  {
    id: "tokenization",
    order: 14,
    title: "LLM Tokenization",
    description:
      "Understand tokenization algorithms, vocabulary construction, token IDs, context length and token economics.",
    goal: "Understand how text becomes model input and how tokenization affects applications.",
    primaryPath: "Subword Tokenization",
    alternatives: [],
  },

  {
    id: "embeddings",
    order: 15,
    title: "Embeddings",
    description:
      "Understand dense vector representations, semantic similarity and embedding models.",
    goal: "Build the foundation for semantic search and retrieval systems.",
    primaryPath: "Text Embeddings",
    alternatives: [],
  },

  {
    id: "llm-pretraining",
    order: 16,
    title: "LLM Pretraining",
    description:
      "Understand large-scale dataset preparation, pretraining objectives, next-token prediction and training infrastructure.",
    goal: "Understand how foundation language models are created.",
    primaryPath: "Autoregressive Pretraining",
    alternatives: [],
  },

  {
    id: "llm-inference",
    order: 17,
    title: "LLM Inference",
    description:
      "Understand autoregressive generation, decoding strategies, temperature, sampling and inference constraints.",
    goal: "Understand what happens when an LLM generates a response.",
    primaryPath: "Production LLM Inference",
    alternatives: [],
  },

  {
    id: "prompt-engineering",
    order: 18,
    title: "Prompt Engineering",
    description:
      "Learn instruction design, structured prompting, few-shot examples, output constraints and prompt composition.",
    goal: "Reliably control model behavior without unnecessary model modification.",
    primaryPath: "Structured Prompt Engineering",
    alternatives: [],
  },

  {
    id: "llm-api-engineering",
    order: 19,
    title: "LLM API Engineering",
    description:
      "Integrate hosted foundation models into applications using reliable API patterns.",
    goal: "Build production applications around LLM APIs.",
    primaryPath: "LLM APIs",
    alternatives: ["OpenAI-compatible APIs", "Hosted open-source models"],
  },

  {
    id: "structured-outputs",
    order: 20,
    title: "Structured Outputs & Function Calling",
    description:
      "Build reliable machine-readable model outputs and tool/function calling workflows.",
    goal: "Connect LLMs safely to application logic and external systems.",
    primaryPath: "Structured Outputs + Tool Calling",
    alternatives: [],
  },

  {
    id: "hugging-face-ecosystem",
    order: 21,
    title: "Hugging Face Ecosystem",
    description:
      "Understand model repositories, tokenizers, datasets and transformer tooling.",
    goal: "Work with open-source models and the modern LLM ecosystem.",
    primaryPath: "Hugging Face",
    alternatives: [],
  },

  {
    id: "fine-tuning-foundation",
    order: 22,
    title: "LLM Fine-Tuning",
    description:
      "Understand supervised fine-tuning, instruction tuning and model adaptation.",
    goal: "Know when and how to adapt pretrained models.",
    primaryPath: "Supervised Fine-Tuning",
    alternatives: [],
  },

  {
    id: "peft-lora",
    order: 23,
    title: "PEFT, LoRA & QLoRA",
    description:
      "Learn parameter-efficient fine-tuning techniques for adapting large models with limited compute.",
    goal: "Fine-tune capable models without requiring full-model training infrastructure.",
    primaryPath: "LoRA + QLoRA",
    alternatives: [],
  },

  {
    id: "dataset-engineering-for-llm",
    order: 24,
    title: "LLM Dataset Engineering",
    description:
      "Prepare instruction datasets, clean training examples, deduplicate data and manage dataset quality.",
    goal: "Understand how training data quality affects model behavior.",
    primaryPath: "Instruction Dataset Engineering",
    alternatives: [],
  },

  {
    id: "vector-search",
    order: 25,
    title: "Vector Search",
    description:
      "Understand vector indexes, similarity metrics, approximate nearest-neighbor search and vector databases.",
    goal: "Build scalable semantic retrieval systems.",
    primaryPath: "Vector Search",
    alternatives: [],
  },

  {
    id: "rag-foundation",
    order: 26,
    title: "Retrieval-Augmented Generation",
    description:
      "Build systems that retrieve external information and provide it as context to an LLM.",
    goal: "Build grounded LLM applications without relying exclusively on model parameters.",
    primaryPath: "RAG",
    alternatives: [],
  },

  {
    id: "rag-data-pipeline",
    order: 27,
    title: "RAG Data Pipeline",
    description:
      "Design document ingestion, parsing, chunking, metadata extraction, embedding and indexing pipelines.",
    goal: "Build the ingestion side of reliable RAG systems.",
    primaryPath: "Document → Chunk → Embed → Index",
    alternatives: [],
  },

  {
    id: "advanced-rag",
    order: 28,
    title: "Advanced RAG",
    description:
      "Learn query rewriting, hybrid retrieval, reranking, contextual compression and multi-stage retrieval.",
    goal: "Improve retrieval quality for production RAG applications.",
    primaryPath: "Hybrid Retrieval + Reranking",
    alternatives: [],
  },

  {
    id: "rag-evaluation",
    order: 29,
    title: "RAG Evaluation",
    description:
      "Evaluate retrieval relevance, groundedness, answer quality and hallucination behavior.",
    goal: "Measure RAG quality instead of relying on subjective testing.",
    primaryPath: "Retrieval + Generation Evaluation",
    alternatives: [],
  },

  {
    id: "ai-agents-foundation",
    order: 30,
    title: "AI Agents Foundation",
    description:
      "Understand agent loops, reasoning, planning, tool use, state and environment interaction.",
    goal: "Understand when an agent architecture is appropriate instead of using agents unnecessarily.",
    primaryPath: "LLM + Tools + State + Control Loop",
    alternatives: [],
  },

  {
    id: "tool-calling",
    order: 31,
    title: "Tool Calling",
    description:
      "Connect LLMs to APIs, databases, search systems and application capabilities through controlled tools.",
    goal: "Build AI systems capable of interacting with real-world systems.",
    primaryPath: "Function / Tool Calling",
    alternatives: [],
  },

  {
    id: "agent-memory",
    order: 32,
    title: "Agent Memory",
    description:
      "Understand short-term state, conversation history, persistent memory and retrieval-based memory.",
    goal: "Design useful memory systems without indiscriminately storing everything.",
    primaryPath: "State + Retrieval-Based Memory",
    alternatives: [],
  },

  {
    id: "multi-agent-systems",
    order: 33,
    title: "Multi-Agent Systems",
    description:
      "Understand architectures where multiple specialized agents coordinate to solve complex tasks.",
    goal: "Know when multi-agent architectures provide real value.",
    primaryPath: "Coordinated Specialized Agents",
    alternatives: [],
  },

  {
    id: "llm-evaluation",
    order: 34,
    title: "LLM Evaluation",
    description:
      "Evaluate correctness, relevance, faithfulness, safety, latency and cost of LLM applications.",
    goal: "Build measurable quality gates for AI applications.",
    primaryPath: "Automated + Human Evaluation",
    alternatives: [],
  },

  {
    id: "llm-observability",
    order: 35,
    title: "LLM Observability",
    description:
      "Trace prompts, model calls, retrieval steps, tool calls, latency, failures and token usage.",
    goal: "Debug and operate LLM applications in production.",
    primaryPath: "LLM Tracing + Metrics",
    alternatives: [],
  },

  {
    id: "llm-security",
    order: 36,
    title: "LLM Security",
    description:
      "Understand prompt injection, data leakage, insecure tool use, model abuse and application-layer AI threats.",
    goal: "Build LLM applications with realistic security boundaries.",
    primaryPath: "LLM Application Security",
    alternatives: [],
  },

  {
    id: "ai-safety-and-guardrails",
    order: 37,
    title: "AI Safety & Guardrails",
    description:
      "Design input validation, output constraints, content controls and policy enforcement around AI systems.",
    goal: "Prevent unsafe or unintended model behavior at the application layer.",
    primaryPath: "Application Guardrails",
    alternatives: [],
  },

  {
    id: "llm-serving",
    order: 38,
    title: "LLM Serving",
    description:
      "Deploy and serve open-source or custom models through scalable inference services.",
    goal: "Operate LLM inference as a production service.",
    primaryPath: "Production Model Serving",
    alternatives: [],
  },

  {
    id: "llm-inference-optimization",
    order: 39,
    title: "LLM Inference Optimization",
    description:
      "Understand batching, quantization, caching, KV cache, throughput and latency optimization.",
    goal: "Make LLM inference faster and more cost-efficient.",
    primaryPath: "Inference Optimization",
    alternatives: [],
  },

  {
    id: "gpu-and-accelerators",
    order: 40,
    title: "GPU & AI Accelerators",
    description:
      "Understand GPU memory, compute, batching and accelerator constraints for training and inference.",
    goal: "Reason about the infrastructure required by modern AI workloads.",
    primaryPath: "GPU Computing",
    alternatives: [],
  },

  {
    id: "distributed-llm-systems",
    order: 41,
    title: "Distributed LLM Systems",
    description:
      "Understand distributed training, distributed inference, parallelism and large-scale model serving.",
    goal: "Scale AI workloads beyond a single machine.",
    primaryPath: "Distributed AI Systems",
    alternatives: [],
  },

  {
    id: "llmops",
    order: 42,
    title: "LLMOps",
    description:
      "Apply CI/CD, versioning, evaluation, observability, deployment and lifecycle management to LLM applications.",
    goal: "Operate LLM systems reliably throughout their production lifecycle.",
    primaryPath: "LLMOps",
    alternatives: [],
  },

  {
    id: "ai-cloud-infrastructure",
    order: 43,
    title: "Cloud Infrastructure for AI",
    description:
      "Learn cloud compute, storage, networking, GPUs, containers and managed AI infrastructure.",
    goal: "Deploy scalable AI systems on cloud infrastructure.",
    primaryPath: "AWS",
    alternatives: ["GCP", "Azure"],
  },

  {
    id: "ai-production-engineering",
    order: 44,
    title: "Production AI Engineering",
    description:
      "Combine APIs, databases, queues, caching, security, observability and AI models into reliable applications.",
    goal: "Build complete production AI products rather than isolated model demos.",
    primaryPath: "AI + Backend + Cloud + DevOps",
    alternatives: [],
  },

  {
    id: "advanced-llm-system-design",
    order: 45,
    title: "Advanced LLM System Design",
    description:
      "Design scalable AI platforms combining models, retrieval, agents, infrastructure, evaluation, security and observability.",
    goal: "Reach senior-level LLM and AI systems thinking.",
    primaryPath: "Production LLM Architecture",
    alternatives: [],
  },
];

export default genAiLlmEngineerPhases;
export { genAiLlmEngineerPhases };

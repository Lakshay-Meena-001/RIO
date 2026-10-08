import { createKnowledgeNode } from "../../factory.js";

const node = (data) => createKnowledgeNode(data);

const dataEngineerNodes = [
  // ============================================================
  // PHASE 1 — DATA ENGINEERING FOUNDATION
  // ============================================================

  node({
    id: "data-engineering-fundamentals",
    title: "Data Engineering Fundamentals",
    category: "foundation",
    importance: "critical",
    description:
      "Understand data engineering, data lifecycle, data platforms, pipelines, storage and processing.",
    whyItMatters:
      "A strong mental model prevents learning data tools as disconnected technologies.",
    prerequisites: [],
    enables: [
      "programming-for-data-engineering",
      "sql-foundation",
      "data-storage",
    ],
    alternatives: [],
    related: ["data-pipelines"],
    metadata: { phase: "data-engineering-foundation", primary: true },
  }),

  node({
    id: "data-lifecycle",
    title: "Data Lifecycle",
    category: "foundation",
    importance: "high",
    description:
      "Understand how data is generated, collected, stored, processed, served, governed and eventually retired.",
    whyItMatters:
      "The lifecycle connects individual pipelines to the complete data platform.",
    prerequisites: ["data-engineering-fundamentals"],
    enables: ["data-pipelines", "data-governance"],
    alternatives: [],
    related: ["data-lineage"],
    metadata: { phase: "data-engineering-foundation" },
  }),

  node({
    id: "data-platform-concepts",
    title: "Data Platform Concepts",
    category: "foundation",
    importance: "high",
    description:
      "Understand operational databases, warehouses, lakes, processing systems and serving layers.",
    whyItMatters:
      "Different workloads require different data-system architectures.",
    prerequisites: ["data-engineering-fundamentals"],
    enables: ["data-warehouse", "data-lake", "lakehouse"],
    alternatives: [],
    related: ["data-platform-architecture"],
    metadata: { phase: "data-engineering-foundation" },
  }),

  // ============================================================
  // PHASE 2 — PROGRAMMING
  // ============================================================

  node({
    id: "programming-for-data-engineering",
    title: "Programming for Data Engineering",
    category: "programming",
    importance: "critical",
    description:
      "Build programming skills for ingestion, transformation, automation and data tooling.",
    whyItMatters:
      "Production data engineering requires more than writing SQL queries.",
    prerequisites: ["data-engineering-fundamentals"],
    enables: [
      "python-for-data-engineering",
      "data-ingestion",
      "data-pipelines",
    ],
    alternatives: ["java-for-data-engineering", "scala-awareness"],
    related: ["linux-and-cli"],
    metadata: { phase: "programming-for-data-engineering", primary: true },
  }),

  node({
    id: "python-for-data-engineering",
    title: "Python for Data Engineering",
    category: "programming",
    importance: "critical",
    description:
      "Use Python for data ingestion, APIs, transformations, automation and pipeline tooling.",
    whyItMatters: "Python has a broad ecosystem for modern data engineering.",
    prerequisites: ["programming-for-data-engineering"],
    enables: ["data-ingestion", "batch-processing", "workflow-orchestration"],
    alternatives: ["java-for-data-engineering", "scala-awareness"],
    related: ["python-data-libraries"],
    metadata: {
      phase: "programming-for-data-engineering",
      primary: true,
    },
  }),

  node({
    id: "python-data-libraries",
    title: "Python Data Libraries",
    category: "programming",
    importance: "high",
    description:
      "Use practical Python libraries for data loading, manipulation and integration.",
    whyItMatters: "Libraries accelerate common data engineering tasks.",
    prerequisites: ["python-for-data-engineering"],
    enables: ["data-transformation"],
    alternatives: [],
    related: ["batch-processing"],
    metadata: { phase: "programming-for-data-engineering" },
  }),

  node({
    id: "java-for-data-engineering",
    title: "Java for Data Engineering Awareness",
    category: "programming",
    importance: "medium",
    description:
      "Understand Java's role in distributed data systems and JVM-based data tooling.",
    whyItMatters: "Many large-scale data technologies run on the JVM.",
    prerequisites: ["programming-for-data-engineering"],
    enables: [],
    alternatives: ["python-for-data-engineering"],
    related: ["distributed-processing"],
    metadata: {
      phase: "programming-for-data-engineering",
      optional: true,
    },
  }),

  node({
    id: "scala-awareness",
    title: "Scala Awareness",
    category: "programming",
    importance: "low",
    description:
      "Understand Scala's role in Spark and JVM-based data engineering.",
    whyItMatters: "Scala remains relevant in some Spark-heavy environments.",
    prerequisites: ["programming-for-data-engineering"],
    enables: [],
    alternatives: ["python-for-data-engineering"],
    related: ["apache-spark"],
    metadata: {
      phase: "programming-for-data-engineering",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 3 — LINUX
  // ============================================================

  node({
    id: "linux-and-cli",
    title: "Linux & Command Line",
    category: "systems",
    importance: "critical",
    description:
      "Work with Linux filesystems, processes, permissions, networking and command-line tools.",
    whyItMatters:
      "Data workloads and distributed systems commonly run on Linux infrastructure.",
    prerequisites: ["data-engineering-fundamentals"],
    enables: ["bash-for-data-engineering", "data-infrastructure-operations"],
    alternatives: ["powershell-awareness"],
    related: ["data-infrastructure-as-code"],
    metadata: { phase: "linux-and-cli", primary: true },
  }),

  node({
    id: "bash-for-data-engineering",
    title: "Bash for Data Engineering",
    category: "systems",
    importance: "high",
    description:
      "Use shell pipelines and command-line utilities for data operations and automation.",
    whyItMatters:
      "Shell skills are useful for debugging and lightweight data workflows.",
    prerequisites: ["linux-and-cli"],
    enables: ["data-infrastructure-operations"],
    alternatives: [],
    related: ["python-for-data-engineering"],
    metadata: { phase: "linux-and-cli" },
  }),

  node({
    id: "powershell-awareness",
    title: "PowerShell Awareness",
    category: "systems",
    importance: "low",
    description: "Understand PowerShell in Microsoft-heavy data environments.",
    whyItMatters:
      "Some enterprise data platforms operate on Windows infrastructure.",
    prerequisites: ["linux-and-cli"],
    enables: [],
    alternatives: ["bash-for-data-engineering"],
    related: ["data-infrastructure-operations"],
    metadata: {
      phase: "linux-and-cli",
      optional: true,
    },
  }),

  node({
    id: "data-infrastructure-operations",
    title: "Data Infrastructure Operations",
    category: "operations",
    importance: "high",
    description:
      "Understand processes, resources, disks, services and operational troubleshooting for data workloads.",
    whyItMatters:
      "Data engineers must diagnose infrastructure problems affecting pipelines.",
    prerequisites: ["bash-for-data-engineering"],
    enables: ["data-observability", "data-reliability"],
    alternatives: [],
    related: ["data-platform-architecture"],
    metadata: { phase: "linux-and-cli" },
  }),

  // ============================================================
  // PHASE 4 — GIT
  // ============================================================

  node({
    id: "git-version-control",
    title: "Git & Version Control",
    category: "engineering",
    importance: "critical",
    description:
      "Use commits, branches, merges, tags and pull requests to manage data engineering code.",
    whyItMatters:
      "Data transformations and infrastructure need the same version-control discipline as application code.",
    prerequisites: ["data-engineering-fundamentals"],
    enables: ["git-collaboration", "data-cicd", "data-infrastructure-as-code"],
    alternatives: [],
    related: ["data-testing"],
    metadata: { phase: "git-and-engineering-workflow", primary: true },
  }),

  node({
    id: "git-collaboration",
    title: "Git Collaboration",
    category: "engineering",
    importance: "high",
    description: "Use pull requests, code review and protected branches.",
    whyItMatters: "Data-platform changes should be reviewable and auditable.",
    prerequisites: ["git-version-control"],
    enables: ["data-cicd"],
    alternatives: [],
    related: ["data-testing"],
    metadata: { phase: "git-and-engineering-workflow" },
  }),

  // ============================================================
  // PHASE 5 — SQL
  // ============================================================

  node({
    id: "sql-foundation",
    title: "SQL Foundation",
    category: "sql",
    importance: "critical",
    description:
      "Master SELECT, filtering, sorting, grouping, joins, aggregation and subqueries.",
    whyItMatters:
      "SQL is one of the most important languages in data engineering.",
    prerequisites: ["data-engineering-fundamentals"],
    enables: ["advanced-sql", "data-modeling", "database-engineering"],
    alternatives: [],
    related: ["data-transformation"],
    metadata: { phase: "sql-foundation", primary: true },
  }),

  node({
    id: "advanced-sql",
    title: "Advanced SQL",
    category: "sql",
    importance: "critical",
    description:
      "Use CTEs, window functions, complex joins, conditional logic and analytical SQL.",
    whyItMatters:
      "Production data work frequently requires complex transformations and analysis.",
    prerequisites: ["sql-foundation"],
    enables: ["query-optimization"],
    alternatives: [],
    related: ["data-transformation"],
    metadata: { phase: "advanced-sql" },
  }),

  node({
    id: "query-optimization",
    title: "SQL Query Optimization",
    category: "database",
    importance: "critical",
    description:
      "Understand indexes, execution plans, query costs and optimization techniques.",
    whyItMatters: "Poor queries can become major production bottlenecks.",
    prerequisites: ["advanced-sql", "database-engineering"],
    enables: ["database-performance"],
    alternatives: [],
    related: ["data-warehouse"],
    metadata: { phase: "advanced-sql" },
  }),

  // ============================================================
  // PHASE 6 — DATA MODELING
  // ============================================================

  node({
    id: "data-modeling",
    title: "Data Modeling",
    category: "modeling",
    importance: "critical",
    description:
      "Design relational, dimensional and analytical data structures.",
    whyItMatters:
      "Good data models make systems easier to query, maintain and scale.",
    prerequisites: ["sql-foundation"],
    enables: ["relational-modeling", "dimensional-modeling"],
    alternatives: [],
    related: ["data-warehouse"],
    metadata: { phase: "data-modeling", primary: true },
  }),

  node({
    id: "relational-modeling",
    title: "Relational Data Modeling",
    category: "modeling",
    importance: "critical",
    description:
      "Design entities, relationships, keys and normalized relational schemas.",
    whyItMatters:
      "Operational data systems depend on well-designed relational models.",
    prerequisites: ["data-modeling"],
    enables: ["database-engineering"],
    alternatives: [],
    related: ["advanced-sql"],
    metadata: { phase: "data-modeling" },
  }),

  node({
    id: "dimensional-modeling",
    title: "Dimensional Modeling",
    category: "modeling",
    importance: "critical",
    description:
      "Design fact tables, dimensions, star schemas and analytical models.",
    whyItMatters:
      "Dimensional models are foundational to analytical warehouses.",
    prerequisites: ["data-modeling", "sql-foundation"],
    enables: ["data-warehouse"],
    alternatives: [],
    related: ["data-transformation"],
    metadata: { phase: "data-modeling" },
  }),

  node({
    id: "data-vault-awareness",
    title: "Data Vault Awareness",
    category: "modeling",
    importance: "low",
    description:
      "Understand Data Vault concepts for scalable enterprise analytical modeling.",
    whyItMatters:
      "Data Vault can be useful in certain large enterprise data platforms.",
    prerequisites: ["data-modeling"],
    enables: [],
    alternatives: ["dimensional-modeling"],
    related: ["data-warehouse"],
    metadata: {
      phase: "data-modeling",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 7 — DATABASE ENGINEERING
  // ============================================================

  node({
    id: "database-engineering",
    title: "Database Engineering",
    category: "database",
    importance: "critical",
    description:
      "Understand transactions, indexes, replication, partitioning, backups and database operations.",
    whyItMatters:
      "Data engineers frequently interact directly with production databases.",
    prerequisites: ["sql-foundation", "relational-modeling"],
    enables: [
      "database-transactions",
      "database-indexing",
      "database-performance",
    ],
    alternatives: ["mysql", "sql-server"],
    related: ["data-ingestion"],
    metadata: { phase: "database-engineering", primary: true },
  }),

  node({
    id: "database-transactions",
    title: "Database Transactions",
    category: "database",
    importance: "high",
    description: "Understand ACID transactions, isolation and consistency.",
    whyItMatters:
      "Transactions protect correctness in operational data systems.",
    prerequisites: ["database-engineering"],
    enables: ["data-reliability"],
    alternatives: [],
    related: ["database-performance"],
    metadata: { phase: "database-engineering" },
  }),

  node({
    id: "database-indexing",
    title: "Database Indexing",
    category: "database",
    importance: "critical",
    description: "Understand indexes, index selection and trade-offs.",
    whyItMatters:
      "Indexes can dramatically improve query performance when used correctly.",
    prerequisites: ["database-engineering"],
    enables: ["query-optimization"],
    alternatives: [],
    related: ["database-performance"],
    metadata: { phase: "database-engineering" },
  }),

  node({
    id: "database-performance",
    title: "Database Performance",
    category: "database",
    importance: "critical",
    description:
      "Diagnose slow queries, resource bottlenecks and database performance issues.",
    whyItMatters:
      "Database bottlenecks can affect entire data pipelines and applications.",
    prerequisites: ["database-indexing", "query-optimization"],
    enables: ["data-reliability"],
    alternatives: [],
    related: ["database-engineering"],
    metadata: { phase: "database-engineering" },
  }),

  node({
    id: "mysql",
    title: "MySQL Awareness",
    category: "database",
    importance: "medium",
    description: "Understand MySQL as an alternative relational database.",
    whyItMatters:
      "MySQL is widely used across application and data environments.",
    prerequisites: ["database-engineering"],
    enables: [],
    alternatives: ["postgresql"],
    related: ["sql-foundation"],
    metadata: {
      phase: "database-engineering",
      optional: true,
    },
  }),

  node({
    id: "sql-server",
    title: "SQL Server Awareness",
    category: "database",
    importance: "medium",
    description: "Understand Microsoft's relational database platform.",
    whyItMatters: "SQL Server is common in enterprise environments.",
    prerequisites: ["database-engineering"],
    enables: [],
    alternatives: ["postgresql"],
    related: ["sql-foundation"],
    metadata: {
      phase: "database-engineering",
      optional: true,
    },
  }),

  node({
    id: "postgresql",
    title: "PostgreSQL",
    category: "database",
    importance: "high",
    description:
      "Use PostgreSQL as the primary relational database implementation.",
    whyItMatters:
      "PostgreSQL is a powerful open-source relational database with broad production usage.",
    prerequisites: ["database-engineering"],
    enables: ["data-ingestion"],
    alternatives: ["mysql", "sql-server"],
    related: ["advanced-sql"],
    metadata: {
      phase: "database-engineering",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 8 — STORAGE
  // ============================================================

  node({
    id: "data-storage",
    title: "Data Storage Systems",
    category: "storage",
    importance: "critical",
    description:
      "Understand databases, object storage, files and analytical storage systems.",
    whyItMatters:
      "Storage choice affects cost, performance, durability and accessibility.",
    prerequisites: ["data-engineering-fundamentals"],
    enables: ["data-formats", "data-lake", "data-warehouse"],
    alternatives: [],
    related: ["data-platform-concepts"],
    metadata: { phase: "data-storage", primary: true },
  }),

  node({
    id: "object-storage",
    title: "Object Storage",
    category: "storage",
    importance: "critical",
    description:
      "Understand object storage, buckets, objects, lifecycle policies and durability.",
    whyItMatters: "Object storage is the foundation of many modern data lakes.",
    prerequisites: ["data-storage"],
    enables: ["data-lake"],
    alternatives: [],
    related: ["aws-data-services"],
    metadata: { phase: "data-storage" },
  }),

  node({
    id: "data-formats",
    title: "Data Formats & Serialization",
    category: "storage",
    importance: "critical",
    description:
      "Understand CSV, JSON, Avro, Parquet, schemas and compression.",
    whyItMatters:
      "Efficient formats improve storage and analytical performance.",
    prerequisites: ["data-storage"],
    enables: ["data-ingestion", "data-transformation"],
    alternatives: [],
    related: ["apache-spark"],
    metadata: { phase: "data-formats", primary: true },
  }),

  node({
    id: "parquet",
    title: "Apache Parquet",
    category: "storage",
    importance: "critical",
    description: "Use columnar Parquet storage for analytical workloads.",
    whyItMatters:
      "Columnar storage can significantly reduce analytical scan costs.",
    prerequisites: ["data-formats"],
    enables: ["data-lake", "apache-spark"],
    alternatives: [],
    related: ["lakehouse"],
    metadata: { phase: "data-formats" },
  }),

  node({
    id: "avro",
    title: "Apache Avro",
    category: "storage",
    importance: "high",
    description:
      "Understand schema-based serialization for distributed systems and event pipelines.",
    whyItMatters: "Schema-aware serialization supports reliable data exchange.",
    prerequisites: ["data-formats"],
    enables: ["kafka"],
    alternatives: [],
    related: ["data-ingestion"],
    metadata: { phase: "data-formats" },
  }),

  // ============================================================
  // PHASE 9 — INGESTION
  // ============================================================

  node({
    id: "data-ingestion",
    title: "Data Ingestion",
    category: "ingestion",
    importance: "critical",
    description:
      "Bring data from databases, APIs, applications, files and events into data platforms.",
    whyItMatters: "Every data platform starts with reliable data ingestion.",
    prerequisites: [
      "python-for-data-engineering",
      "postgresql",
      "data-formats",
    ],
    enables: ["batch-ingestion", "stream-processing"],
    alternatives: [],
    related: ["data-pipelines"],
    metadata: { phase: "data-ingestion", primary: true },
  }),

  node({
    id: "batch-ingestion",
    title: "Batch Ingestion",
    category: "ingestion",
    importance: "critical",
    description: "Ingest data periodically from databases, APIs and files.",
    whyItMatters: "Many business datasets do not require real-time ingestion.",
    prerequisites: ["data-ingestion"],
    enables: ["batch-processing", "workflow-orchestration"],
    alternatives: [],
    related: ["data-reliability"],
    metadata: { phase: "data-ingestion" },
  }),

  node({
    id: "api-ingestion",
    title: "API & External Data Ingestion",
    category: "ingestion",
    importance: "high",
    description:
      "Build ingestion workflows for third-party APIs and external data sources.",
    whyItMatters:
      "Real-world platforms frequently depend on external data providers.",
    prerequisites: ["data-ingestion"],
    enables: ["batch-ingestion"],
    alternatives: [],
    related: ["data-quality"],
    metadata: { phase: "data-ingestion" },
  }),

  node({
    id: "cdc",
    title: "Change Data Capture",
    category: "ingestion",
    importance: "high",
    description:
      "Capture database changes and propagate them into downstream systems.",
    whyItMatters: "CDC enables efficient incremental data movement.",
    prerequisites: ["database-engineering", "data-ingestion"],
    enables: ["kafka", "stream-processing"],
    alternatives: [],
    related: ["data-pipelines"],
    metadata: { phase: "data-ingestion" },
  }),

  // ============================================================
  // PHASE 10 — BATCH PROCESSING
  // ============================================================

  node({
    id: "batch-processing",
    title: "Batch Data Processing",
    category: "processing",
    importance: "critical",
    description:
      "Transform and process large datasets through scheduled or distributed batch workloads.",
    whyItMatters:
      "Batch processing remains fundamental to many enterprise data systems.",
    prerequisites: ["batch-ingestion", "data-formats"],
    enables: ["distributed-processing", "apache-spark"],
    alternatives: [],
    related: ["data-transformation"],
    metadata: { phase: "batch-processing", primary: true },
  }),

  node({
    id: "distributed-processing",
    title: "Distributed Data Processing",
    category: "processing",
    importance: "critical",
    description:
      "Understand partitions, parallelism, shuffles, distributed execution and fault tolerance.",
    whyItMatters:
      "Large datasets require computation across multiple machines.",
    prerequisites: ["batch-processing"],
    enables: ["apache-spark"],
    alternatives: ["apache-flink"],
    related: ["data-platform-architecture"],
    metadata: { phase: "distributed-processing" },
  }),

  node({
    id: "apache-spark",
    title: "Apache Spark",
    category: "processing",
    importance: "critical",
    description:
      "Use Spark DataFrames, transformations, joins, partitioning and performance optimization.",
    whyItMatters: "Spark is a major distributed data-processing platform.",
    prerequisites: ["distributed-processing", "parquet"],
    enables: ["data-transformation"],
    alternatives: ["apache-flink"],
    related: ["lakehouse"],
    metadata: {
      phase: "apache-spark",
      primary: true,
    },
  }),

  node({
    id: "apache-flink",
    title: "Apache Flink Awareness",
    category: "processing",
    importance: "medium",
    description:
      "Understand distributed stream and batch processing with Flink.",
    whyItMatters: "Flink is valuable for advanced real-time data processing.",
    prerequisites: ["distributed-processing"],
    enables: ["stream-processing"],
    alternatives: ["apache-spark"],
    related: ["kafka"],
    metadata: {
      phase: "distributed-processing",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 11 — STREAMING
  // ============================================================

  node({
    id: "stream-processing",
    title: "Stream Processing",
    category: "streaming",
    importance: "critical",
    description:
      "Process continuously arriving events using windows, state, ordering and delivery semantics.",
    whyItMatters:
      "Real-time applications require continuous processing instead of periodic batch jobs.",
    prerequisites: ["data-ingestion", "kafka"],
    enables: ["streaming-analytics"],
    alternatives: ["apache-flink"],
    related: ["data-reliability"],
    metadata: { phase: "stream-processing", primary: true },
  }),

  node({
    id: "kafka",
    title: "Apache Kafka",
    category: "streaming",
    importance: "critical",
    description:
      "Understand topics, partitions, producers, consumers, consumer groups and offsets.",
    whyItMatters:
      "Kafka is a major event-streaming platform for scalable data pipelines.",
    prerequisites: ["data-ingestion", "avro"],
    enables: ["stream-processing", "cdc"],
    alternatives: ["kinesis", "pubsub"],
    related: ["data-pipelines"],
    metadata: {
      phase: "kafka",
      primary: true,
    },
  }),

  node({
    id: "streaming-analytics",
    title: "Streaming Analytics",
    category: "streaming",
    importance: "high",
    description:
      "Build real-time aggregations, windows and event-driven analytical pipelines.",
    whyItMatters:
      "Streaming analytics enables low-latency business and operational insights.",
    prerequisites: ["stream-processing"],
    enables: ["data-platform-architecture"],
    alternatives: [],
    related: ["data-observability"],
    metadata: { phase: "stream-processing" },
  }),

  node({
    id: "kinesis",
    title: "Amazon Kinesis Awareness",
    category: "streaming",
    importance: "medium",
    description: "Understand AWS-native event streaming.",
    whyItMatters: "Kinesis is useful in AWS-centric data platforms.",
    prerequisites: ["kafka"],
    enables: [],
    alternatives: ["pubsub"],
    related: ["aws-data-services"],
    metadata: {
      phase: "kafka",
      optional: true,
    },
  }),

  node({
    id: "pubsub",
    title: "Google Pub/Sub Awareness",
    category: "streaming",
    importance: "medium",
    description: "Understand managed event messaging on Google Cloud.",
    whyItMatters: "Pub/Sub is a core component of many GCP data architectures.",
    prerequisites: ["kafka"],
    enables: [],
    alternatives: ["kinesis"],
    related: ["gcp-data-services"],
    metadata: {
      phase: "kafka",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 12 — PIPELINES
  // ============================================================

  node({
    id: "data-pipelines",
    title: "Data Pipeline Engineering",
    category: "pipelines",
    importance: "critical",
    description:
      "Design end-to-end ingestion, transformation, validation and delivery pipelines.",
    whyItMatters:
      "Data engineering is fundamentally about reliable movement and transformation of data.",
    prerequisites: [
      "data-ingestion",
      "batch-processing",
      "data-transformation",
    ],
    enables: ["workflow-orchestration", "data-quality"],
    alternatives: [],
    related: ["data-reliability"],
    metadata: {
      phase: "data-pipelines",
      primary: true,
    },
  }),

  node({
    id: "workflow-orchestration",
    title: "Workflow Orchestration",
    category: "pipelines",
    importance: "critical",
    description:
      "Schedule, coordinate, retry and monitor multi-step data workflows.",
    whyItMatters:
      "Complex pipelines need dependency management and operational control.",
    prerequisites: ["data-pipelines", "python-for-data-engineering"],
    enables: ["airflow"],
    alternatives: ["dagster", "prefect"],
    related: ["data-observability"],
    metadata: { phase: "workflow-orchestration" },
  }),

  node({
    id: "airflow",
    title: "Apache Airflow",
    category: "orchestration",
    importance: "critical",
    description:
      "Build DAG-based data workflows with scheduling, dependencies and retries.",
    whyItMatters:
      "Airflow is widely used for batch data workflow orchestration.",
    prerequisites: ["workflow-orchestration"],
    enables: ["data-observability"],
    alternatives: ["dagster", "prefect"],
    related: ["data-reliability"],
    metadata: {
      phase: "workflow-orchestration",
      primary: true,
    },
  }),

  node({
    id: "dagster",
    title: "Dagster Awareness",
    category: "orchestration",
    importance: "medium",
    description:
      "Understand modern data orchestration with software-defined assets.",
    whyItMatters:
      "Dagster provides an alternative approach to data orchestration.",
    prerequisites: ["workflow-orchestration"],
    enables: [],
    alternatives: ["airflow", "prefect"],
    related: ["data-quality"],
    metadata: {
      phase: "workflow-orchestration",
      optional: true,
    },
  }),

  node({
    id: "prefect",
    title: "Prefect Awareness",
    category: "orchestration",
    importance: "low",
    description: "Understand workflow orchestration using Prefect.",
    whyItMatters:
      "Prefect is another Python-oriented orchestration alternative.",
    prerequisites: ["workflow-orchestration"],
    enables: [],
    alternatives: ["airflow", "dagster"],
    related: ["data-pipelines"],
    metadata: {
      phase: "workflow-orchestration",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 13 — DATA QUALITY
  // ============================================================

  node({
    id: "data-quality",
    title: "Data Quality & Validation",
    category: "quality",
    importance: "critical",
    description:
      "Validate completeness, freshness, uniqueness, consistency, schema and business rules.",
    whyItMatters:
      "Bad data can silently damage downstream systems and decisions.",
    prerequisites: ["data-pipelines"],
    enables: ["data-testing", "data-observability"],
    alternatives: [],
    related: ["data-governance"],
    metadata: { phase: "data-quality", primary: true },
  }),

  node({
    id: "schema-validation",
    title: "Schema Validation",
    category: "quality",
    importance: "high",
    description:
      "Validate incoming and transformed datasets against expected schemas.",
    whyItMatters: "Schema drift can break downstream consumers.",
    prerequisites: ["data-quality", "data-formats"],
    enables: ["data-testing"],
    alternatives: [],
    related: ["data-lineage"],
    metadata: { phase: "data-quality" },
  }),

  node({
    id: "data-testing",
    title: "Data Testing",
    category: "quality",
    importance: "critical",
    description:
      "Test transformations, schemas, business rules and pipeline behavior.",
    whyItMatters:
      "Data systems need automated quality checks just like application systems need tests.",
    prerequisites: ["data-quality", "schema-validation"],
    enables: ["data-cicd"],
    alternatives: [],
    related: ["dbt"],
    metadata: { phase: "data-testing" },
  }),

  // ============================================================
  // PHASE 14 — LINEAGE & METADATA
  // ============================================================

  node({
    id: "data-lineage",
    title: "Data Lineage",
    category: "metadata",
    importance: "high",
    description:
      "Track the origin, transformations and downstream usage of datasets.",
    whyItMatters:
      "Lineage makes data systems easier to debug, govern and change safely.",
    prerequisites: ["data-pipelines", "data-transformation"],
    enables: ["data-governance"],
    alternatives: [],
    related: ["data-quality"],
    metadata: { phase: "data-lineage", primary: true },
  }),

  node({
    id: "metadata-management",
    title: "Metadata Management",
    category: "metadata",
    importance: "high",
    description:
      "Manage dataset definitions, ownership, schemas, descriptions and operational metadata.",
    whyItMatters: "Good metadata makes data discoverable and understandable.",
    prerequisites: ["data-lineage"],
    enables: ["data-governance"],
    alternatives: [],
    related: ["data-warehouse"],
    metadata: { phase: "data-lineage" },
  }),

  node({
    id: "openlineage-awareness",
    title: "OpenLineage Awareness",
    category: "metadata",
    importance: "medium",
    description:
      "Understand open standards for collecting data lineage metadata.",
    whyItMatters:
      "Open lineage standards improve interoperability across data tools.",
    prerequisites: ["data-lineage"],
    enables: [],
    alternatives: [],
    related: ["metadata-management"],
    metadata: {
      phase: "data-lineage",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 15 — DATA WAREHOUSE
  // ============================================================

  node({
    id: "data-warehouse",
    title: "Data Warehousing",
    category: "analytics",
    importance: "critical",
    description:
      "Understand analytical warehouses, fact tables, dimensions and warehouse workloads.",
    whyItMatters:
      "Warehouses provide optimized environments for analytical workloads.",
    prerequisites: ["dimensional-modeling", "data-storage"],
    enables: ["warehouse-optimization", "data-transformation"],
    alternatives: ["snowflake", "bigquery", "redshift"],
    related: ["lakehouse"],
    metadata: {
      phase: "data-warehouse",
      primary: true,
    },
  }),

  node({
    id: "warehouse-optimization",
    title: "Warehouse Optimization",
    category: "analytics",
    importance: "high",
    description:
      "Optimize analytical workloads through partitioning, clustering, storage formats and query design.",
    whyItMatters:
      "Analytical workloads can become expensive and slow without optimization.",
    prerequisites: ["data-warehouse", "advanced-sql"],
    enables: ["data-platform-architecture"],
    alternatives: [],
    related: ["query-optimization"],
    metadata: { phase: "data-warehouse" },
  }),

  node({
    id: "snowflake",
    title: "Snowflake Awareness",
    category: "analytics",
    importance: "medium",
    description: "Understand Snowflake's cloud data warehouse architecture.",
    whyItMatters: "Snowflake is a major cloud data platform.",
    prerequisites: ["data-warehouse"],
    enables: [],
    alternatives: ["bigquery", "redshift"],
    related: ["lakehouse"],
    metadata: {
      phase: "data-warehouse",
      optional: true,
    },
  }),

  node({
    id: "bigquery",
    title: "BigQuery Awareness",
    category: "analytics",
    importance: "medium",
    description: "Understand Google's serverless analytical warehouse.",
    whyItMatters: "BigQuery is a major GCP analytical platform.",
    prerequisites: ["data-warehouse"],
    enables: [],
    alternatives: ["snowflake", "redshift"],
    related: ["gcp-data-services"],
    metadata: {
      phase: "data-warehouse",
      optional: true,
    },
  }),

  node({
    id: "redshift",
    title: "Amazon Redshift Awareness",
    category: "analytics",
    importance: "medium",
    description: "Understand AWS's cloud data warehouse.",
    whyItMatters: "Redshift integrates naturally with AWS data platforms.",
    prerequisites: ["data-warehouse"],
    enables: [],
    alternatives: ["snowflake", "bigquery"],
    related: ["aws-data-services"],
    metadata: {
      phase: "data-warehouse",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 16 — DATA LAKE
  // ============================================================

  node({
    id: "data-lake",
    title: "Data Lakes",
    category: "analytics",
    importance: "critical",
    description:
      "Build object-storage-based platforms for raw, curated and analytical datasets.",
    whyItMatters:
      "Data lakes provide scalable and flexible storage for diverse data.",
    prerequisites: ["object-storage", "data-formats"],
    enables: ["lakehouse"],
    alternatives: [],
    related: ["data-warehouse"],
    metadata: {
      phase: "data-lake",
      primary: true,
    },
  }),

  node({
    id: "lakehouse",
    title: "Lakehouse Architecture",
    category: "analytics",
    importance: "critical",
    description:
      "Combine data-lake flexibility with warehouse-style analytical capabilities.",
    whyItMatters:
      "Lakehouse architectures are central to many modern data platforms.",
    prerequisites: ["data-lake", "data-warehouse", "parquet"],
    enables: ["data-platform-architecture"],
    alternatives: ["delta-lake", "apache-iceberg", "apache-hudi"],
    related: ["apache-spark"],
    metadata: {
      phase: "lakehouse",
      primary: true,
    },
  }),

  node({
    id: "delta-lake",
    title: "Delta Lake Awareness",
    category: "analytics",
    importance: "medium",
    description: "Understand transactional lakehouse storage with Delta Lake.",
    whyItMatters:
      "Delta Lake provides table-management capabilities over object storage.",
    prerequisites: ["lakehouse"],
    enables: [],
    alternatives: ["apache-iceberg", "apache-hudi"],
    related: ["apache-spark"],
    metadata: {
      phase: "lakehouse",
      optional: true,
    },
  }),

  node({
    id: "apache-iceberg",
    title: "Apache Iceberg Awareness",
    category: "analytics",
    importance: "medium",
    description: "Understand open table formats for analytical data lakes.",
    whyItMatters: "Iceberg is an important open lakehouse table format.",
    prerequisites: ["lakehouse"],
    enables: [],
    alternatives: ["delta-lake", "apache-hudi"],
    related: ["apache-spark"],
    metadata: {
      phase: "lakehouse",
      optional: true,
    },
  }),

  node({
    id: "apache-hudi",
    title: "Apache Hudi Awareness",
    category: "analytics",
    importance: "low",
    description:
      "Understand Hudi's approach to incremental data processing and lakehouse tables.",
    whyItMatters: "Hudi is another lakehouse table-format ecosystem.",
    prerequisites: ["lakehouse"],
    enables: [],
    alternatives: ["delta-lake", "apache-iceberg"],
    related: ["apache-spark"],
    metadata: {
      phase: "lakehouse",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 17 — TRANSFORMATION
  // ============================================================

  node({
    id: "data-transformation",
    title: "Data Transformation",
    category: "transformation",
    importance: "critical",
    description:
      "Transform raw datasets into clean, reusable and analytical datasets.",
    whyItMatters:
      "Transformation is where raw data becomes useful business data.",
    prerequisites: ["advanced-sql", "data-pipelines", "apache-spark"],
    enables: ["dbt"],
    alternatives: [],
    related: ["data-quality"],
    metadata: {
      phase: "data-transformation",
      primary: true,
    },
  }),

  node({
    id: "dbt",
    title: "dbt",
    category: "transformation",
    importance: "critical",
    description:
      "Build SQL transformation models, tests, documentation and dependency graphs.",
    whyItMatters:
      "dbt brings software-engineering practices into analytical SQL development.",
    prerequisites: ["data-transformation", "data-testing"],
    enables: ["data-cicd"],
    alternatives: [],
    related: ["data-lineage"],
    metadata: {
      phase: "dbt",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 18 — CLOUD
  // ============================================================

  node({
    id: "cloud-data-platforms",
    title: "Cloud Data Platforms",
    category: "cloud",
    importance: "critical",
    description:
      "Understand cloud-native storage, processing, messaging and analytical services.",
    whyItMatters:
      "Most modern production data platforms use cloud infrastructure.",
    prerequisites: ["data-storage", "data-pipelines"],
    enables: ["aws-data-services", "gcp-data-services", "azure-data-services"],
    alternatives: [],
    related: ["data-platform-architecture"],
    metadata: {
      phase: "cloud-data-platforms",
      primary: true,
    },
  }),

  node({
    id: "aws-data-services",
    title: "AWS Data Engineering",
    category: "cloud",
    importance: "critical",
    description:
      "Understand S3, Glue, EMR, Redshift, Kinesis and related AWS data services.",
    whyItMatters:
      "AWS provides a broad ecosystem for building production data platforms.",
    prerequisites: ["cloud-data-platforms"],
    enables: ["data-platform-architecture"],
    alternatives: ["gcp-data-services", "azure-data-services"],
    related: ["data-lake", "kafka"],
    metadata: {
      phase: "aws-data-services",
      primary: true,
    },
  }),

  node({
    id: "gcp-data-services",
    title: "GCP Data Engineering Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand BigQuery, Dataflow, Pub/Sub and Google Cloud data services.",
    whyItMatters:
      "GCP is particularly strong for analytical and data-intensive workloads.",
    prerequisites: ["cloud-data-platforms"],
    enables: [],
    alternatives: ["aws-data-services", "azure-data-services"],
    related: ["bigquery", "pubsub"],
    metadata: {
      phase: "gcp-data-services",
      optional: true,
    },
  }),

  node({
    id: "azure-data-services",
    title: "Azure Data Engineering Awareness",
    category: "cloud",
    importance: "medium",
    description:
      "Understand Azure Data Factory, Synapse and Microsoft data services.",
    whyItMatters: "Azure is important in enterprise Microsoft environments.",
    prerequisites: ["cloud-data-platforms"],
    enables: [],
    alternatives: ["aws-data-services", "gcp-data-services"],
    related: ["data-warehouse"],
    metadata: {
      phase: "azure-data-services",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 19 — SECURITY
  // ============================================================

  node({
    id: "data-security",
    title: "Data Security",
    category: "security",
    importance: "critical",
    description:
      "Protect data using authentication, authorization, encryption, secrets and least privilege.",
    whyItMatters:
      "Data platforms often contain highly sensitive business and user information.",
    prerequisites: ["cloud-data-platforms", "database-engineering"],
    enables: ["data-governance", "data-privacy"],
    alternatives: [],
    related: ["data-reliability"],
    metadata: { phase: "data-security", primary: true },
  }),

  node({
    id: "data-encryption",
    title: "Data Encryption",
    category: "security",
    importance: "high",
    description:
      "Understand encryption at rest, in transit and key management.",
    whyItMatters: "Sensitive data must be protected throughout its lifecycle.",
    prerequisites: ["data-security"],
    enables: ["data-privacy"],
    alternatives: [],
    related: ["cloud-data-platforms"],
    metadata: { phase: "data-security" },
  }),

  // ============================================================
  // PHASE 20 — GOVERNANCE
  // ============================================================

  node({
    id: "data-governance",
    title: "Data Governance",
    category: "governance",
    importance: "critical",
    description:
      "Understand ownership, classification, policies, access, retention and responsible data usage.",
    whyItMatters:
      "Governance makes data trustworthy and manageable at organizational scale.",
    prerequisites: ["data-security", "data-lineage", "metadata-management"],
    enables: ["data-privacy"],
    alternatives: [],
    related: ["data-quality"],
    metadata: { phase: "data-governance", primary: true },
  }),

  node({
    id: "data-privacy",
    title: "Data Privacy & Compliance",
    category: "governance",
    importance: "critical",
    description:
      "Handle sensitive data, retention, access controls and privacy requirements.",
    whyItMatters:
      "Data systems must respect legal, organizational and user privacy requirements.",
    prerequisites: ["data-governance", "data-encryption"],
    enables: ["data-platform-architecture"],
    alternatives: [],
    related: ["data-security"],
    metadata: { phase: "data-privacy" },
  }),

  // ============================================================
  // PHASE 21 — OBSERVABILITY
  // ============================================================

  node({
    id: "data-observability",
    title: "Data Observability",
    category: "observability",
    importance: "critical",
    description:
      "Monitor pipeline health, freshness, volume, quality and operational failures.",
    whyItMatters:
      "Data problems need to be detected before downstream consumers discover them.",
    prerequisites: ["data-pipelines", "data-quality"],
    enables: ["data-reliability"],
    alternatives: [],
    related: ["workflow-orchestration"],
    metadata: {
      phase: "data-observability",
      primary: true,
    },
  }),

  node({
    id: "pipeline-monitoring",
    title: "Pipeline Monitoring",
    category: "observability",
    importance: "high",
    description:
      "Monitor pipeline execution, latency, failures and throughput.",
    whyItMatters:
      "Operational visibility is essential for production pipelines.",
    prerequisites: ["data-observability"],
    enables: ["data-reliability"],
    alternatives: [],
    related: ["airflow"],
    metadata: { phase: "data-observability" },
  }),

  // ============================================================
  // PHASE 22 — RELIABILITY
  // ============================================================

  node({
    id: "data-reliability",
    title: "Data Reliability Engineering",
    category: "reliability",
    importance: "critical",
    description:
      "Design pipelines with retries, idempotency, recovery, backfills and failure isolation.",
    whyItMatters: "Production data systems must recover safely from failures.",
    prerequisites: ["data-observability", "data-transactions"],
    enables: ["backfills-and-recovery"],
    alternatives: [],
    related: ["data-testing"],
    metadata: {
      phase: "data-reliability",
      primary: true,
    },
  }),

  node({
    id: "backfills-and-recovery",
    title: "Backfills & Recovery",
    category: "reliability",
    importance: "critical",
    description:
      "Recover missing or incorrect data through safe backfills and replay strategies.",
    whyItMatters:
      "Production pipelines inevitably encounter failures and historical data corrections.",
    prerequisites: ["data-reliability"],
    enables: ["data-platform-architecture"],
    alternatives: [],
    related: ["workflow-orchestration"],
    metadata: { phase: "data-reliability" },
  }),

  // ============================================================
  // PHASE 23 — INFRASTRUCTURE AS CODE
  // ============================================================

  node({
    id: "data-infrastructure-as-code",
    title: "Data Infrastructure as Code",
    category: "infrastructure",
    importance: "high",
    description:
      "Provision data-platform infrastructure reproducibly using infrastructure as code.",
    whyItMatters:
      "Data infrastructure should be versioned, repeatable and reviewable.",
    prerequisites: ["cloud-data-platforms", "git-version-control"],
    enables: ["terraform-for-data"],
    alternatives: [],
    related: ["data-cicd"],
    metadata: { phase: "data-infrastructure-as-code" },
  }),

  node({
    id: "terraform-for-data",
    title: "Terraform for Data Platforms",
    category: "infrastructure",
    importance: "high",
    description:
      "Use Terraform to provision storage, databases, messaging and data infrastructure.",
    whyItMatters:
      "Infrastructure automation reduces manual cloud configuration.",
    prerequisites: ["data-infrastructure-as-code"],
    enables: ["data-cicd"],
    alternatives: ["cloudformation-for-data", "pulumi-for-data"],
    related: ["cloud-data-platforms"],
    metadata: { phase: "data-infrastructure-as-code", primary: true },
  }),

  node({
    id: "cloudformation-for-data",
    title: "CloudFormation for Data Awareness",
    category: "infrastructure",
    importance: "low",
    description:
      "Understand AWS-native infrastructure as code for data services.",
    whyItMatters: "CloudFormation is useful in AWS-native organizations.",
    prerequisites: ["data-infrastructure-as-code"],
    enables: [],
    alternatives: ["terraform-for-data"],
    related: ["aws-data-services"],
    metadata: {
      phase: "data-infrastructure-as-code",
      optional: true,
    },
  }),

  node({
    id: "pulumi-for-data",
    title: "Pulumi for Data Awareness",
    category: "infrastructure",
    importance: "low",
    description:
      "Understand Pulumi as an alternative infrastructure-as-code approach.",
    whyItMatters:
      "Pulumi can integrate infrastructure provisioning with general-purpose programming languages.",
    prerequisites: ["data-infrastructure-as-code"],
    enables: [],
    alternatives: ["terraform-for-data"],
    related: ["cloud-data-platforms"],
    metadata: {
      phase: "data-infrastructure-as-code",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 24 — DATA CI/CD
  // ============================================================

  node({
    id: "data-cicd",
    title: "Data CI/CD",
    category: "delivery",
    importance: "critical",
    description:
      "Automate testing, validation and deployment of transformations, pipelines and infrastructure.",
    whyItMatters:
      "Data-platform changes should be delivered safely and repeatedly.",
    prerequisites: ["git-collaboration", "data-testing", "dbt"],
    enables: ["data-platform-architecture"],
    alternatives: ["gitlab-data-cicd", "jenkins-data-cicd"],
    related: ["data-infrastructure-as-code"],
    metadata: {
      phase: "data-cicd",
      primary: true,
    },
  }),

  node({
    id: "gitlab-data-cicd",
    title: "GitLab CI for Data Awareness",
    category: "delivery",
    importance: "low",
    description:
      "Understand GitLab CI as an alternative data-platform delivery system.",
    whyItMatters: "GitLab is common in enterprise engineering environments.",
    prerequisites: ["data-cicd"],
    enables: [],
    alternatives: ["data-cicd"],
    related: ["git-collaboration"],
    metadata: {
      phase: "data-cicd",
      optional: true,
    },
  }),

  node({
    id: "jenkins-data-cicd",
    title: "Jenkins for Data Awareness",
    category: "delivery",
    importance: "low",
    description:
      "Understand Jenkins as an alternative CI/CD system for data platforms.",
    whyItMatters: "Jenkins remains common in established organizations.",
    prerequisites: ["data-cicd"],
    enables: [],
    alternatives: ["data-cicd"],
    related: ["git-collaboration"],
    metadata: {
      phase: "data-cicd",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 25 — DATA PLATFORM ARCHITECTURE
  // ============================================================

  node({
    id: "data-platform-architecture",
    title: "Data Platform Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Design end-to-end platforms combining ingestion, storage, processing, orchestration, governance, quality and consumption.",
    whyItMatters:
      "Senior data engineers must reason about the complete platform rather than isolated tools.",
    prerequisites: [
      "streaming-analytics",
      "lakehouse",
      "data-privacy",
      "backfills-and-recovery",
      "data-cicd",
    ],
    enables: ["advanced-data-engineering"],
    alternatives: [],
    related: ["data-pipelines", "data-warehouse", "data-lake"],
    metadata: {
      phase: "data-platform-architecture",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 26 — ADVANCED DATA ENGINEERING
  // ============================================================

  node({
    id: "advanced-data-engineering",
    title: "Advanced Data Engineering",
    category: "advanced",
    importance: "critical",
    description:
      "Combine distributed processing, streaming, lakehouse architecture, governance, reliability and cloud infrastructure.",
    whyItMatters:
      "Advanced data engineering requires systems thinking across the entire data platform.",
    prerequisites: ["data-platform-architecture"],
    enables: [],
    alternatives: [],
    related: ["apache-spark", "kafka", "lakehouse", "data-reliability"],
    metadata: {
      phase: "advanced-data-engineering",
      primary: true,
    },
  }),
];

/**
 * Closed-reference validation.
 *
 * Every prerequisite, enable, alternative and related reference
 * must point to a node that exists in this roadmap.
 */
const nodeIds = new Set(dataEngineerNodes.map((item) => item.id));

for (const item of dataEngineerNodes) {
  const references = [
    ...(item.prerequisites || []),
    ...(item.enables || []),
    ...(item.alternatives || []),
    ...(item.related || []),
  ];

  for (const reference of references) {
    if (!nodeIds.has(reference)) {
      throw new Error(
        `[Data Engineer Roadmap] Invalid node reference "${reference}" ` +
          `in node "${item.id}".`,
      );
    }
  }
}

export default dataEngineerNodes;
export { dataEngineerNodes };

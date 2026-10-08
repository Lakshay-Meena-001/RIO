const dataEngineerPhases = [
  {
    id: "data-engineering-foundation",
    order: 1,
    title: "Data Engineering Foundation",
    description:
      "Understand the role of data engineering, data systems, pipelines, storage, processing and data lifecycle.",
    goal: "Build the mental model required to design and operate reliable data systems.",
    primaryPath: "Data engineering fundamentals",
    alternatives: [],
  },

  {
    id: "programming-for-data-engineering",
    order: 2,
    title: "Programming for Data Engineering",
    description:
      "Build practical programming skills for data ingestion, transformation, automation and tooling.",
    goal: "Write maintainable code for production data workflows.",
    primaryPath: "Python",
    alternatives: ["Java", "Scala"],
  },

  {
    id: "linux-and-cli",
    order: 3,
    title: "Linux & Command Line",
    description:
      "Learn Linux, shell commands, processes, filesystems, permissions and operational troubleshooting.",
    goal: "Operate data workloads and servers comfortably from the command line.",
    primaryPath: "Linux + Bash",
    alternatives: ["PowerShell awareness"],
  },

  {
    id: "git-and-engineering-workflow",
    order: 4,
    title: "Git & Engineering Workflow",
    description:
      "Learn version control, branching, pull requests, reviews and collaborative engineering workflows.",
    goal: "Manage data-engineering code and infrastructure safely.",
    primaryPath: "Git + GitHub",
    alternatives: ["GitLab", "Bitbucket"],
  },

  {
    id: "sql-foundation",
    order: 5,
    title: "SQL Foundation",
    description:
      "Master relational querying, filtering, joins, aggregation, subqueries and common SQL patterns.",
    goal: "Become highly effective at querying and understanding structured data.",
    primaryPath: "SQL",
    alternatives: [],
  },

  {
    id: "advanced-sql",
    order: 6,
    title: "Advanced SQL & Query Engineering",
    description:
      "Learn CTEs, window functions, query optimization, indexes, execution plans and complex analytical queries.",
    goal: "Write efficient production and analytical SQL.",
    primaryPath: "Advanced SQL",
    alternatives: [],
  },

  {
    id: "data-modeling",
    order: 7,
    title: "Data Modeling",
    description:
      "Understand relational modeling, normalization, dimensional modeling and analytical data structures.",
    goal: "Design data structures that support reliable applications and analytics.",
    primaryPath: "Relational + dimensional modeling",
    alternatives: ["Data Vault awareness"],
  },

  {
    id: "database-engineering",
    order: 8,
    title: "Database Engineering",
    description:
      "Understand transactions, indexing, replication, partitioning, backups and database operations.",
    goal: "Operate production databases and understand their performance characteristics.",
    primaryPath: "PostgreSQL",
    alternatives: ["MySQL", "SQL Server"],
  },

  {
    id: "data-storage",
    order: 9,
    title: "Data Storage Systems",
    description:
      "Understand files, object storage, block storage, databases and analytical storage systems.",
    goal: "Choose appropriate storage based on workload and access patterns.",
    primaryPath: "Object storage + databases",
    alternatives: [],
  },

  {
    id: "data-formats",
    order: 10,
    title: "Data Formats & Serialization",
    description:
      "Understand CSV, JSON, Avro, Parquet, schemas, compression and serialization.",
    goal: "Choose efficient formats for data movement and analytical workloads.",
    primaryPath: "Parquet + JSON + Avro",
    alternatives: ["CSV for simple interchange"],
  },

  {
    id: "data-ingestion",
    order: 11,
    title: "Data Ingestion",
    description:
      "Build batch and streaming ingestion systems from applications, databases, APIs and external sources.",
    goal: "Reliably bring data into a data platform.",
    primaryPath: "Batch + streaming ingestion",
    alternatives: [],
  },

  {
    id: "batch-processing",
    order: 12,
    title: "Batch Data Processing",
    description:
      "Process large datasets through scheduled and distributed batch workflows.",
    goal: "Build reliable and scalable batch transformations.",
    primaryPath: "Apache Spark",
    alternatives: ["Python-based processing for smaller workloads"],
  },

  {
    id: "distributed-processing",
    order: 13,
    title: "Distributed Data Processing",
    description:
      "Understand distributed computation, partitions, shuffles, parallelism and fault tolerance.",
    goal: "Reason about data processing at large scale.",
    primaryPath: "Apache Spark",
    alternatives: ["Flink awareness"],
  },

  {
    id: "apache-spark",
    order: 14,
    title: "Apache Spark",
    description:
      "Learn Spark DataFrames, transformations, actions, joins, partitioning and performance optimization.",
    goal: "Process large datasets using a production-grade distributed processing engine.",
    primaryPath: "Apache Spark",
    alternatives: ["Flink"],
  },

  {
    id: "stream-processing",
    order: 15,
    title: "Stream Processing",
    description:
      "Understand event streams, windows, stateful processing, ordering and real-time transformations.",
    goal: "Process continuously arriving data reliably.",
    primaryPath: "Kafka + stream processing",
    alternatives: ["Apache Flink", "Kafka Streams"],
  },

  {
    id: "kafka",
    order: 16,
    title: "Apache Kafka",
    description:
      "Learn topics, partitions, producers, consumers, consumer groups, offsets and delivery semantics.",
    goal: "Build scalable event-driven data pipelines.",
    primaryPath: "Apache Kafka",
    alternatives: ["Amazon Kinesis", "Google Pub/Sub"],
  },

  {
    id: "data-pipelines",
    order: 17,
    title: "Data Pipeline Engineering",
    description:
      "Design end-to-end ingestion, transformation, validation and delivery pipelines.",
    goal: "Build maintainable production data pipelines.",
    primaryPath: "Pipeline orchestration + processing",
    alternatives: [],
  },

  {
    id: "workflow-orchestration",
    order: 18,
    title: "Workflow Orchestration",
    description:
      "Schedule, coordinate, retry and monitor complex data workflows.",
    goal: "Make multi-step data pipelines reliable and observable.",
    primaryPath: "Apache Airflow",
    alternatives: ["Dagster", "Prefect"],
  },

  {
    id: "data-quality",
    order: 19,
    title: "Data Quality & Validation",
    description:
      "Validate schemas, completeness, freshness, uniqueness, accuracy and consistency.",
    goal: "Prevent bad data from silently propagating through the platform.",
    primaryPath: "Automated data quality checks",
    alternatives: [],
  },

  {
    id: "data-lineage",
    order: 20,
    title: "Data Lineage & Metadata",
    description:
      "Track where data originates, how it changes and where it is consumed.",
    goal: "Make data systems understandable and auditable.",
    primaryPath: "Metadata + lineage",
    alternatives: ["OpenLineage awareness"],
  },

  {
    id: "data-warehouse",
    order: 21,
    title: "Data Warehousing",
    description:
      "Understand analytical warehouses, fact tables, dimensions, workloads and warehouse architecture.",
    goal: "Build systems optimized for analytical queries.",
    primaryPath: "Cloud data warehouse",
    alternatives: ["Snowflake", "BigQuery", "Redshift"],
  },

  {
    id: "data-lake",
    order: 22,
    title: "Data Lakes",
    description:
      "Understand object-storage-based data platforms and raw, curated and analytical data layers.",
    goal: "Store large volumes of diverse data economically and flexibly.",
    primaryPath: "Cloud object storage",
    alternatives: [],
  },

  {
    id: "lakehouse",
    order: 23,
    title: "Lakehouse Architecture",
    description:
      "Combine data lake flexibility with warehouse-style analytical capabilities.",
    goal: "Understand modern unified analytical data architectures.",
    primaryPath: "Lakehouse",
    alternatives: ["Delta Lake", "Apache Iceberg", "Apache Hudi"],
  },

  {
    id: "data-transformation",
    order: 24,
    title: "Data Transformation",
    description:
      "Transform raw data into reliable analytical and application-ready datasets.",
    goal: "Build clean, reusable and testable transformation layers.",
    primaryPath: "SQL + dbt",
    alternatives: ["Spark transformations"],
  },

  {
    id: "dbt",
    order: 25,
    title: "dbt",
    description:
      "Build SQL-based transformation models, tests, documentation and dependency graphs.",
    goal: "Bring software-engineering practices into analytical transformations.",
    primaryPath: "dbt",
    alternatives: [],
  },

  {
    id: "cloud-data-platforms",
    order: 26,
    title: "Cloud Data Platforms",
    description:
      "Understand cloud-native data storage, processing, messaging and analytics services.",
    goal: "Deploy and operate data platforms in the cloud.",
    primaryPath: "AWS",
    alternatives: ["GCP", "Azure"],
  },

  {
    id: "aws-data-services",
    order: 27,
    title: "AWS Data Engineering",
    description:
      "Understand AWS services commonly used for ingestion, storage, processing and analytics.",
    goal: "Build practical cloud data platforms on AWS.",
    primaryPath: "S3 + Glue + EMR + Redshift + Kinesis",
    alternatives: ["Athena", "Lambda"],
  },

  {
    id: "gcp-data-services",
    order: 28,
    title: "GCP Data Engineering Awareness",
    description:
      "Understand Google's cloud data ecosystem and analytical services.",
    goal: "Build conceptual familiarity with GCP data platforms.",
    primaryPath: "BigQuery + Dataflow + Pub/Sub",
    alternatives: [],
  },

  {
    id: "azure-data-services",
    order: 29,
    title: "Azure Data Engineering Awareness",
    description: "Understand Microsoft's cloud data engineering ecosystem.",
    goal: "Build conceptual familiarity with Azure data platforms.",
    primaryPath: "Azure Data Factory + Synapse",
    alternatives: [],
  },

  {
    id: "data-security",
    order: 30,
    title: "Data Security",
    description:
      "Understand authentication, authorization, encryption, secrets, network controls and secure data access.",
    goal: "Protect data throughout its lifecycle.",
    primaryPath: "Cloud IAM + encryption + least privilege",
    alternatives: [],
  },

  {
    id: "data-governance",
    order: 31,
    title: "Data Governance",
    description:
      "Understand ownership, classification, policies, compliance, retention and responsible data usage.",
    goal: "Make data platforms trustworthy and governable.",
    primaryPath: "Data governance",
    alternatives: [],
  },

  {
    id: "data-privacy",
    order: 32,
    title: "Data Privacy & Compliance",
    description:
      "Understand handling of sensitive data, retention, access controls and privacy requirements.",
    goal: "Design data systems that respect privacy and regulatory requirements.",
    primaryPath: "Privacy-aware data engineering",
    alternatives: [],
  },

  {
    id: "data-observability",
    order: 33,
    title: "Data Observability",
    description:
      "Monitor pipeline health, data freshness, volume, quality and operational failures.",
    goal: "Detect data problems before downstream users discover them.",
    primaryPath: "Pipeline + data observability",
    alternatives: [],
  },

  {
    id: "data-reliability",
    order: 34,
    title: "Data Reliability Engineering",
    description:
      "Design pipelines with retries, idempotency, recovery, backfills and failure isolation.",
    goal: "Keep data platforms reliable under operational failure.",
    primaryPath: "Reliable pipeline engineering",
    alternatives: [],
  },

  {
    id: "data-testing",
    order: 35,
    title: "Data Testing",
    description:
      "Test transformations, schemas, business rules and pipeline behavior.",
    goal: "Apply software-engineering quality practices to data systems.",
    primaryPath: "Automated data testing",
    alternatives: [],
  },

  {
    id: "data-infrastructure-as-code",
    order: 36,
    title: "Data Infrastructure as Code",
    description:
      "Provision data infrastructure reproducibly using infrastructure-as-code practices.",
    goal: "Version and automate data-platform infrastructure.",
    primaryPath: "Terraform",
    alternatives: ["CloudFormation", "Pulumi"],
  },

  {
    id: "data-cicd",
    order: 37,
    title: "Data CI/CD",
    description:
      "Automate testing, validation and deployment of data pipelines and transformations.",
    goal: "Deliver data-platform changes safely and repeatedly.",
    primaryPath: "GitHub Actions + data testing",
    alternatives: ["GitLab CI", "Jenkins"],
  },

  {
    id: "data-platform-architecture",
    order: 38,
    title: "Data Platform Architecture",
    description:
      "Design complete data platforms combining ingestion, storage, processing, orchestration, governance and consumption.",
    goal: "Design production-grade end-to-end data architectures.",
    primaryPath: "Modern cloud data platform",
    alternatives: [],
  },

  {
    id: "advanced-data-engineering",
    order: 39,
    title: "Advanced Data Engineering",
    description:
      "Combine distributed processing, streaming, lakehouse architecture, governance, reliability and cloud infrastructure.",
    goal: "Operate and architect large-scale production data platforms.",
    primaryPath: "Production data platform engineering",
    alternatives: [],
  },
];

export default dataEngineerPhases;
export { dataEngineerPhases };

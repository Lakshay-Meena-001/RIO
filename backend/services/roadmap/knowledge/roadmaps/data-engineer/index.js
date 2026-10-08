import { createRoadmapTemplate } from "../../factory.js";

import dataEngineerPhases from "./phase.js";
import dataEngineerNodes from "./node.js";
import dataEngineerEdges from "./edge.js";

const dataEngineerRoadmap = createRoadmapTemplate({
  id: "data-engineer",
  version: 1,
  type: "career-roadmap",

  title: "Data Engineer",

  description:
    "A production-oriented Data Engineer roadmap covering programming, Linux, SQL, data modeling, databases, storage, ingestion, batch and stream processing, Kafka, Spark, orchestration, data quality, lineage, warehouses, data lakes, lakehouse architecture, cloud data platforms, security, governance, observability, reliability, infrastructure as code and CI/CD.",

  goal: "Build the ability to design, build, secure, operate and scale reliable production data platforms, with Python, SQL, PostgreSQL, Apache Spark, Kafka, Airflow, AWS and modern lakehouse technologies as the primary implementation path.",

  nodes: dataEngineerNodes,

  edges: dataEngineerEdges,

  alternatives: [
    {
      id: "programming",
      title: "Programming",
      type: "primary",
      description:
        "Python is the primary implementation language, with Java and Scala as alternatives for JVM-heavy data environments.",
      technologyPath: ["Python", "Java", "Scala"],
    },

    {
      id: "database",
      title: "Relational Databases",
      type: "primary",
      description:
        "PostgreSQL is the primary relational database path, with MySQL and SQL Server as alternatives.",
      technologyPath: ["PostgreSQL", "MySQL", "SQL Server"],
    },

    {
      id: "processing",
      title: "Distributed Processing",
      type: "primary",
      description:
        "Apache Spark is the primary distributed processing path, with Apache Flink as an advanced alternative.",
      technologyPath: ["Apache Spark", "Apache Flink"],
    },

    {
      id: "streaming",
      title: "Streaming",
      type: "primary",
      description:
        "Kafka is the primary event-streaming path, with cloud-native messaging alternatives.",
      technologyPath: ["Apache Kafka", "Amazon Kinesis", "Google Pub/Sub"],
    },

    {
      id: "orchestration",
      title: "Workflow Orchestration",
      type: "primary",
      description:
        "Apache Airflow is the primary orchestration path, with Dagster and Prefect as alternatives.",
      technologyPath: ["Apache Airflow", "Dagster", "Prefect"],
    },

    {
      id: "warehouse",
      title: "Data Warehouses",
      type: "primary",
      description:
        "Cloud data warehouses provide analytical serving capabilities. Learn the concepts first, then specialize in one platform.",
      technologyPath: ["Snowflake", "BigQuery", "Amazon Redshift"],
    },

    {
      id: "lakehouse",
      title: "Lakehouse",
      type: "advanced",
      description:
        "Modern lakehouse architectures combine object storage with transactional analytical table formats.",
      technologyPath: ["Delta Lake", "Apache Iceberg", "Apache Hudi"],
    },

    {
      id: "cloud",
      title: "Cloud Data Platforms",
      type: "primary",
      description:
        "AWS is the primary cloud implementation path, with GCP and Azure as alternatives.",
      technologyPath: ["AWS", "GCP", "Azure"],
    },

    {
      id: "transformation",
      title: "Data Transformation",
      type: "primary",
      description:
        "SQL and dbt form the primary transformation path, with Spark for larger distributed workloads.",
      technologyPath: ["SQL", "dbt", "Apache Spark"],
    },

    {
      id: "infrastructure",
      title: "Data Infrastructure",
      type: "advanced",
      description:
        "Terraform is the primary infrastructure-as-code path for reproducible data platforms.",
      technologyPath: ["Terraform", "CloudFormation", "Pulumi"],
    },
  ],

  metadata: {
    domain: "data-engineering",

    careerRoles: [
      "Data Engineer",
      "Analytics Engineer",
      "Big Data Engineer",
      "Data Platform Engineer",
      "Cloud Data Engineer",
      "Streaming Data Engineer",
      "Data Infrastructure Engineer",
    ],

    primaryTechnologyPath: {
      programming: "Python",
      operatingSystem: "Linux",
      shell: "Bash",
      versionControl: "Git + GitHub",
      sql: "SQL",
      relationalDatabase: "PostgreSQL",
      objectStorage: "Cloud Object Storage",
      batchProcessing: "Apache Spark",
      streaming: "Apache Kafka",
      orchestration: "Apache Airflow",
      transformation: "SQL + dbt",
      warehouse: "Cloud Data Warehouse",
      lakehouse: "Apache Iceberg / Delta Lake concepts",
      cloud: "AWS",
      infrastructureAsCode: "Terraform",
      testing: "Automated Data Testing",
      observability: "Pipeline + Data Observability",
      security: "Cloud IAM + Encryption + Least Privilege",
    },

    alternativeTechnologyPaths: {
      programming: ["Java", "Scala"],

      database: ["MySQL", "SQL Server"],

      processing: ["Apache Flink"],

      streaming: ["Amazon Kinesis", "Google Pub/Sub"],

      orchestration: ["Dagster", "Prefect"],

      warehouse: ["Snowflake", "BigQuery", "Amazon Redshift"],

      lakehouse: ["Delta Lake", "Apache Iceberg", "Apache Hudi"],

      cloud: ["GCP", "Azure"],

      infrastructureAsCode: ["CloudFormation", "Pulumi"],
    },

    technologyStrategy: {
      rule: "Master one primary data engineering path deeply and understand alternatives conceptually instead of learning every platform simultaneously.",

      primaryLanguage: "Python",

      primaryDatabase: "PostgreSQL",

      primaryProcessingEngine: "Apache Spark",

      primaryStreamingPlatform: "Apache Kafka",

      primaryOrchestrator: "Apache Airflow",

      primaryTransformationTool: "dbt",

      primaryCloud: "AWS",

      primaryIaC: "Terraform",

      primaryAnalyticalStorage: "Cloud Data Warehouse + Data Lake",
    },

    progression: dataEngineerPhases.map((phase) => ({
      order: phase.order,
      id: phase.id,
      title: phase.title,
    })),

    phases: dataEngineerPhases,

    roadmapPrinciples: [
      "SQL is a core skill and should be mastered deeply.",
      "Python is the primary programming path.",
      "Understand data systems before collecting data tools.",
      "Learn relational databases before advanced distributed systems.",
      "Understand data modeling before designing warehouses and lakes.",
      "Learn batch processing before advanced streaming systems.",
      "Spark is the primary distributed-processing path.",
      "Kafka is the primary event-streaming path.",
      "Airflow is the primary workflow-orchestration path.",
      "Data quality and testing are production requirements.",
      "Data lineage and metadata become increasingly important at scale.",
      "Cloud platforms are implementation environments, not substitutes for fundamentals.",
      "AWS is the primary cloud path.",
      "Security and governance must be integrated into the data lifecycle.",
      "Data observability is required for reliable production pipelines.",
      "Infrastructure as code makes data platforms reproducible.",
      "Master one primary technology path before exploring alternatives.",
      "Alternative technologies are awareness or specialization paths unless a role requires them.",
      "Advanced data engineering is about platform architecture and reliability, not tool collection.",
    ],

    knowledgeVersion: 1,
  },
});

export default dataEngineerRoadmap;
export { dataEngineerRoadmap };

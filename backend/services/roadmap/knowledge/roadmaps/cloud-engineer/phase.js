/**
 * Cloud Engineer Roadmap
 *
 * Phase ordering is intentional:
 *
 * Foundation
 *   ↓
 * Linux + Networking
 *   ↓
 * Cloud Fundamentals
 *   ↓
 * AWS Core
 *   ↓
 * Cloud Networking
 *   ↓
 * Cloud Storage + Databases
 *   ↓
 * IAM + Security
 *   ↓
 * Containers
 *   ↓
 * Kubernetes
 *   ↓
 * Infrastructure as Code
 *   ↓
 * CI/CD
 *   ↓
 * Observability
 *   ↓
 * Reliability + Architecture
 *   ↓
 * Advanced Cloud
 *
 * Primary cloud:
 * AWS
 *
 * Alternatives:
 * Azure / GCP
 *
 * Important:
 * Alternative technologies are awareness/branching paths.
 * They are NOT all mandatory.
 */

const cloudEngineerPhases = [
  {
    id: "cloud-foundation",
    order: 1,
    title: "Cloud & Infrastructure Foundation",
    description:
      "Understand what cloud computing is, why it exists, how infrastructure works, and the core concepts behind compute, storage, networking, virtualization and managed services.",
    goal: "Build a strong mental model of cloud infrastructure before learning specific cloud products.",
    primaryPath: "Cloud fundamentals",
    alternatives: [],
  },

  {
    id: "linux-and-system-foundation",
    order: 2,
    title: "Linux & System Administration",
    description:
      "Learn the operating-system and server fundamentals required to operate real cloud workloads.",
    goal: "Become comfortable working with Linux servers, processes, filesystems, users, permissions, services and system resources.",
    primaryPath: "Linux",
    alternatives: ["Windows Server awareness"],
  },

  {
    id: "networking-foundation",
    order: 3,
    title: "Networking for Cloud",
    description:
      "Build the networking knowledge required to understand how cloud workloads communicate securely and reliably.",
    goal: "Understand IP addressing, routing, DNS, TCP/UDP, HTTP/HTTPS, ports, firewalls, proxies and network segmentation.",
    primaryPath: "TCP/IP + DNS + HTTP/HTTPS",
    alternatives: [],
  },

  {
    id: "cloud-provider-fundamentals",
    order: 4,
    title: "Cloud Provider Fundamentals",
    description:
      "Understand how major cloud providers organize regions, availability zones, accounts, projects, subscriptions, services and billing.",
    goal: "Develop transferable cloud knowledge before going deep into one provider.",
    primaryPath: "AWS",
    alternatives: ["Azure", "GCP"],
  },

  {
    id: "aws-core-compute",
    order: 5,
    title: "AWS Core Compute",
    description:
      "Learn the primary AWS compute services and understand when to use virtual machines, serverless compute and managed application platforms.",
    goal: "Deploy and operate production-style workloads on AWS.",
    primaryPath: "EC2 + Lambda",
    alternatives: ["ECS", "Elastic Beanstalk"],
  },

  {
    id: "cloud-networking",
    order: 6,
    title: "Cloud Networking & VPC",
    description:
      "Design private and public cloud networks with subnets, routing, gateways, security controls and load balancing.",
    goal: "Understand how production cloud applications are securely connected.",
    primaryPath: "AWS VPC",
    alternatives: ["Azure VNet", "GCP VPC"],
  },

  {
    id: "cloud-storage",
    order: 7,
    title: "Cloud Storage",
    description:
      "Learn object, block and file storage and understand durability, availability, lifecycle management and access control.",
    goal: "Choose and operate the correct storage model for application workloads.",
    primaryPath: "Amazon S3",
    alternatives: ["EBS", "EFS", "Azure Blob Storage", "Google Cloud Storage"],
  },

  {
    id: "cloud-databases",
    order: 8,
    title: "Cloud Databases & Data Services",
    description:
      "Understand managed relational and NoSQL databases, backups, replication, scaling and cloud database trade-offs.",
    goal: "Run application data stores reliably in the cloud.",
    primaryPath: "RDS + DynamoDB awareness",
    alternatives: ["Aurora", "Azure SQL", "Cloud SQL", "MongoDB Atlas"],
  },

  {
    id: "cloud-identity-and-security",
    order: 9,
    title: "Cloud Identity & Security",
    description:
      "Learn identity, access control, least privilege, secrets, encryption, security groups, audit logs and cloud security fundamentals.",
    goal: "Design cloud infrastructure with security built in rather than added later.",
    primaryPath: "AWS IAM + KMS + Secrets Manager",
    alternatives: ["Azure Entra ID", "GCP IAM"],
  },

  {
    id: "load-balancing-and-edge",
    order: 10,
    title: "Load Balancing, CDN & Edge",
    description:
      "Understand how traffic is distributed, accelerated and protected at the edge and application layers.",
    goal: "Build scalable and resilient traffic architectures.",
    primaryPath: "ALB + CloudFront",
    alternatives: ["Nginx", "API Gateway", "Cloudflare"],
  },

  {
    id: "containers",
    order: 11,
    title: "Containers & Docker",
    description:
      "Learn containerization, images, registries, networking, volumes, resource limits and production container practices.",
    goal: "Package and run applications consistently across development and cloud environments.",
    primaryPath: "Docker",
    alternatives: [],
  },

  {
    id: "container-orchestration",
    order: 12,
    title: "Container Orchestration",
    description:
      "Learn why orchestration is required at scale and understand workloads, services, networking, configuration, secrets and scaling.",
    goal: "Operate containerized applications using Kubernetes concepts.",
    primaryPath: "Kubernetes",
    alternatives: ["ECS", "EKS"],
  },

  {
    id: "infrastructure-as-code",
    order: 13,
    title: "Infrastructure as Code",
    description:
      "Learn how infrastructure can be defined, reviewed, versioned and reproduced through code.",
    goal: "Replace manual infrastructure setup with repeatable infrastructure automation.",
    primaryPath: "Terraform",
    alternatives: ["AWS CloudFormation", "Pulumi"],
  },

  {
    id: "cloud-automation",
    order: 14,
    title: "Cloud Automation & Configuration",
    description:
      "Automate server configuration, infrastructure changes, environment setup and repeatable operational tasks.",
    goal: "Reduce manual infrastructure operations and configuration drift.",
    primaryPath: "Terraform + shell automation",
    alternatives: ["Ansible", "Cloud-native automation"],
  },

  {
    id: "ci-cd-cloud",
    order: 15,
    title: "CI/CD & Cloud Delivery",
    description:
      "Build automated pipelines that test, package, secure and deploy cloud workloads.",
    goal: "Create reliable production delivery pipelines.",
    primaryPath: "GitHub Actions",
    alternatives: ["GitLab CI", "Jenkins", "AWS CodePipeline"],
  },

  {
    id: "cloud-observability",
    order: 16,
    title: "Cloud Observability",
    description:
      "Understand logs, metrics, traces, dashboards, alerting and distributed observability for production systems.",
    goal: "Know what is happening inside production infrastructure and applications.",
    primaryPath: "CloudWatch + OpenTelemetry",
    alternatives: ["Prometheus", "Grafana", "ELK/OpenSearch"],
  },

  {
    id: "cloud-reliability",
    order: 17,
    title: "Cloud Reliability & Resilience",
    description:
      "Design systems that tolerate failures through health checks, retries, timeouts, redundancy, backups and recovery strategies.",
    goal: "Build cloud systems that remain reliable when components fail.",
    primaryPath: "Multi-AZ + backups + health checks",
    alternatives: [],
  },

  {
    id: "cloud-scaling",
    order: 18,
    title: "Cloud Scaling & Performance",
    description:
      "Learn horizontal scaling, autoscaling, caching, connection management, capacity planning and performance optimization.",
    goal: "Scale cloud workloads according to demand without unnecessary infrastructure cost.",
    primaryPath: "Auto Scaling + caching + load balancing",
    alternatives: [],
  },

  {
    id: "cloud-cost-management",
    order: 19,
    title: "Cloud Cost & FinOps Fundamentals",
    description:
      "Understand cloud pricing, resource utilization, budgets, rightsizing, tagging and cost-aware architecture.",
    goal: "Build systems that are technically sound and economically sustainable.",
    primaryPath: "AWS Cost Management",
    alternatives: ["Azure Cost Management", "GCP Cloud Billing"],
  },

  {
    id: "serverless-and-managed-services",
    order: 20,
    title: "Serverless & Managed Cloud Architecture",
    description:
      "Understand when managed and serverless services can reduce operational complexity.",
    goal: "Choose between self-managed infrastructure, containers and managed/serverless services based on requirements.",
    primaryPath: "Lambda + API Gateway + managed services",
    alternatives: ["Azure Functions", "Google Cloud Functions"],
  },

  {
    id: "cloud-security-engineering",
    order: 21,
    title: "Advanced Cloud Security",
    description:
      "Connect identity, networking, encryption, secrets, monitoring, workload security and secure delivery into a complete cloud security model.",
    goal: "Design and operate secure production cloud infrastructure.",
    primaryPath: "IAM + network security + encryption + auditability",
    alternatives: [],
  },

  {
    id: "cloud-architecture",
    order: 22,
    title: "Cloud Architecture",
    description:
      "Combine compute, networking, storage, databases, security, observability, reliability and cost into complete production architectures.",
    goal: "Design production-grade cloud systems from requirements instead of individual services.",
    primaryPath: "AWS architecture",
    alternatives: ["Azure architecture", "GCP architecture"],
  },

  {
    id: "multi-cloud-and-hybrid-cloud",
    order: 23,
    title: "Hybrid & Multi-Cloud Concepts",
    description:
      "Understand when organizations combine cloud providers or connect cloud environments with on-premises infrastructure.",
    goal: "Develop architectural awareness without treating multi-cloud as mandatory.",
    primaryPath: "Hybrid cloud concepts",
    alternatives: ["Multi-cloud"],
  },

  {
    id: "advanced-cloud-platform-engineering",
    order: 24,
    title: "Advanced Cloud Platform Engineering",
    description:
      "Move from operating individual workloads to building reusable cloud platforms, automation and engineering standards.",
    goal: "Operate cloud infrastructure at platform and organizational scale.",
    primaryPath: "Platform engineering",
    alternatives: ["Internal developer platforms", "GitOps"],
  },
];

export default cloudEngineerPhases;
export { cloudEngineerPhases };

import { createKnowledgeNode } from "../../factory.js";

const node = (data) => createKnowledgeNode(data);

const cloudEngineerNodes = [
  // ============================================================
  // PHASE 1 — CLOUD FOUNDATION
  // ============================================================

  node({
    id: "cloud-computing-fundamentals",
    title: "Cloud Computing Fundamentals",
    category: "foundation",
    importance: "critical",
    description:
      "Understand cloud computing, on-demand infrastructure, managed services and the major cloud service models.",
    whyItMatters:
      "Cloud engineering starts with understanding what problems cloud platforms actually solve.",
    prerequisites: [],
    enables: [
      "cloud-service-models",
      "cloud-deployment-models",
      "cloud-regions-availability-zones",
    ],
    alternatives: [],
    related: ["cloud-service-models", "cloud-deployment-models"],
    guidance: {
      beginner:
        "Understand the mental model before memorizing provider-specific services.",
      alreadyKnown:
        "Review the concepts quickly and move toward provider architecture.",
    },
    practice: {
      projects: ["Design a basic cloud architecture for a web application."],
    },
    metadata: {
      phase: "cloud-foundation",
      primary: true,
    },
  }),

  node({
    id: "cloud-service-models",
    title: "IaaS, PaaS, SaaS & Managed Services",
    category: "foundation",
    importance: "high",
    description:
      "Understand infrastructure, platform, software and managed-service abstractions.",
    whyItMatters:
      "Choosing the correct abstraction directly affects operational complexity and cost.",
    prerequisites: ["cloud-computing-fundamentals"],
    enables: ["cloud-deployment-models", "serverless-computing"],
    alternatives: [],
    related: ["cloud-deployment-models", "serverless-computing"],
    metadata: { phase: "cloud-foundation" },
  }),

  node({
    id: "cloud-deployment-models",
    title: "Public, Private, Hybrid & Multi-Cloud",
    category: "foundation",
    importance: "medium",
    description:
      "Understand public cloud, private infrastructure, hybrid architectures and multi-cloud strategies.",
    whyItMatters:
      "Enterprise infrastructure frequently combines multiple environments.",
    prerequisites: ["cloud-service-models"],
    enables: ["hybrid-cloud", "multi-cloud"],
    alternatives: [],
    related: ["hybrid-cloud", "multi-cloud"],
    metadata: { phase: "cloud-foundation" },
  }),

  node({
    id: "cloud-regions-availability-zones",
    title: "Regions & Availability Zones",
    category: "foundation",
    importance: "critical",
    description:
      "Understand cloud geographic regions, availability zones and failure domains.",
    whyItMatters:
      "Availability-zone and region choices affect latency, resilience and disaster recovery.",
    prerequisites: ["cloud-computing-fundamentals"],
    enables: ["cloud-high-availability", "cloud-disaster-recovery"],
    alternatives: [],
    related: ["cloud-high-availability"],
    metadata: { phase: "cloud-foundation" },
  }),

  node({
    id: "cloud-shared-responsibility",
    title: "Cloud Shared Responsibility Model",
    category: "foundation",
    importance: "high",
    description:
      "Understand which security and operational responsibilities belong to the provider and which belong to the customer.",
    whyItMatters:
      "Using a managed cloud service does not remove application and configuration security responsibilities.",
    prerequisites: ["cloud-computing-fundamentals"],
    enables: ["cloud-security-fundamentals"],
    alternatives: [],
    related: ["aws-iam"],
    metadata: { phase: "cloud-foundation" },
  }),

  // ============================================================
  // PHASE 2 — LINUX
  // ============================================================

  node({
    id: "linux-fundamentals",
    title: "Linux Fundamentals",
    category: "systems",
    importance: "critical",
    description:
      "Learn the Linux filesystem, shell, processes, users, permissions and system administration basics.",
    whyItMatters:
      "Linux is the dominant operating-system foundation for cloud workloads.",
    prerequisites: [],
    enables: [
      "linux-filesystem",
      "linux-process-management",
      "linux-users-permissions",
      "linux-services",
    ],
    alternatives: ["windows-server-awareness"],
    related: ["linux-process-management", "linux-services"],
    metadata: { phase: "linux-and-system-foundation", primary: true },
  }),

  node({
    id: "linux-filesystem",
    title: "Linux Filesystem & Shell",
    category: "systems",
    importance: "high",
    description:
      "Work with directories, files, paths, environment variables and shell commands.",
    whyItMatters:
      "Cloud troubleshooting and automation heavily depend on command-line skills.",
    prerequisites: ["linux-fundamentals"],
    enables: ["linux-automation"],
    alternatives: [],
    related: ["linux-automation"],
    metadata: { phase: "linux-and-system-foundation" },
  }),

  node({
    id: "linux-process-management",
    title: "Linux Processes & Resources",
    category: "systems",
    importance: "high",
    description:
      "Understand processes, signals, CPU, memory and resource usage.",
    whyItMatters:
      "Production troubleshooting often starts with identifying resource and process problems.",
    prerequisites: ["linux-fundamentals"],
    enables: ["linux-services", "cloud-observability"],
    alternatives: [],
    related: ["linux-services", "cloud-observability"],
    metadata: { phase: "linux-and-system-foundation" },
  }),

  node({
    id: "linux-users-permissions",
    title: "Linux Users, Groups & Permissions",
    category: "systems",
    importance: "high",
    description:
      "Understand users, groups, ownership, permissions and privilege boundaries.",
    whyItMatters: "Least privilege begins at the operating-system level.",
    prerequisites: ["linux-fundamentals"],
    enables: ["cloud-security-fundamentals"],
    alternatives: [],
    related: ["aws-iam"],
    metadata: { phase: "linux-and-system-foundation" },
  }),

  node({
    id: "linux-services",
    title: "Linux Services & System Management",
    category: "systems",
    importance: "high",
    description:
      "Manage long-running services, startup behavior, logs and service health.",
    whyItMatters:
      "Cloud servers commonly host application and infrastructure services.",
    prerequisites: ["linux-process-management", "linux-users-permissions"],
    enables: ["linux-automation", "cloud-observability"],
    alternatives: [],
    related: ["linux-process-management"],
    metadata: { phase: "linux-and-system-foundation" },
  }),

  node({
    id: "linux-automation",
    title: "Linux Automation & Shell Scripting",
    category: "systems",
    importance: "high",
    description: "Automate repeatable operational tasks using shell scripting.",
    whyItMatters:
      "Automation reduces manual operational work and configuration drift.",
    prerequisites: ["linux-filesystem", "linux-services"],
    enables: ["infrastructure-as-code", "configuration-automation"],
    alternatives: ["ansible"],
    related: ["configuration-automation"],
    metadata: { phase: "linux-and-system-foundation" },
  }),

  node({
    id: "windows-server-awareness",
    title: "Windows Server Awareness",
    category: "systems",
    importance: "low",
    description:
      "Understand the role of Windows Server in enterprise infrastructure.",
    whyItMatters:
      "Some enterprise environments depend on Microsoft infrastructure.",
    prerequisites: [],
    enables: [],
    alternatives: ["linux-fundamentals"],
    related: ["linux-fundamentals"],
    metadata: {
      phase: "linux-and-system-foundation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 3 — NETWORKING
  // ============================================================

  node({
    id: "ip-addressing",
    title: "IP Addressing & Subnetting",
    category: "networking",
    importance: "critical",
    description:
      "Understand IPv4 addressing, CIDR, subnets and address ranges.",
    whyItMatters:
      "Cloud networking is fundamentally built around IP addressing and subnet boundaries.",
    prerequisites: [],
    enables: ["cloud-networking", "cloud-routing"],
    alternatives: [],
    related: ["cloud-networking"],
    metadata: { phase: "networking-foundation" },
  }),

  node({
    id: "tcp-udp",
    title: "TCP & UDP",
    category: "networking",
    importance: "critical",
    description:
      "Understand transport-layer communication, ports, connections and delivery behavior.",
    whyItMatters:
      "Cloud services communicate over transport protocols and ports.",
    prerequisites: [],
    enables: ["network-security-groups", "load-balancing"],
    alternatives: [],
    related: ["ip-addressing"],
    metadata: { phase: "networking-foundation" },
  }),

  node({
    id: "dns",
    title: "DNS",
    category: "networking",
    importance: "critical",
    description:
      "Understand domain resolution, DNS records, TTL and DNS-based routing concepts.",
    whyItMatters: "Almost every production cloud application depends on DNS.",
    prerequisites: ["ip-addressing"],
    enables: ["cloud-dns", "cdn-and-edge"],
    alternatives: [],
    related: ["load-balancing"],
    metadata: { phase: "networking-foundation" },
  }),

  node({
    id: "http-https",
    title: "HTTP & HTTPS",
    category: "networking",
    importance: "critical",
    description:
      "Understand HTTP requests, responses, methods, headers, status codes and HTTPS.",
    whyItMatters: "Web workloads and APIs rely on HTTP/HTTPS.",
    prerequisites: ["tcp-udp"],
    enables: ["load-balancing", "cloud-api-gateway"],
    alternatives: [],
    related: ["tls"],
    metadata: { phase: "networking-foundation" },
  }),

  node({
    id: "tls",
    title: "TLS & Certificates",
    category: "networking",
    importance: "high",
    description:
      "Understand TLS encryption, certificates, certificate authorities and secure transport.",
    whyItMatters:
      "Production cloud applications must protect traffic in transit.",
    prerequisites: ["http-https"],
    enables: ["cloud-security-fundamentals", "load-balancing"],
    alternatives: [],
    related: ["cloud-security-fundamentals"],
    metadata: { phase: "networking-foundation" },
  }),

  node({
    id: "cloud-networking",
    title: "Cloud Networking Fundamentals",
    category: "networking",
    importance: "critical",
    description:
      "Understand virtual networks, subnets, routes, gateways and network boundaries.",
    whyItMatters:
      "Cloud applications need deliberate network architecture rather than a flat network.",
    prerequisites: ["ip-addressing", "dns"],
    enables: ["cloud-vpc", "cloud-routing", "network-security-groups"],
    alternatives: [],
    related: ["cloud-routing"],
    metadata: { phase: "networking-foundation", primary: true },
  }),

  // ============================================================
  // PHASE 4 — CLOUD PROVIDERS
  // ============================================================

  node({
    id: "aws-fundamentals",
    title: "AWS Fundamentals",
    category: "cloud-provider",
    importance: "critical",
    description:
      "Learn the AWS account model, core services, regions, availability zones and basic service organization.",
    whyItMatters: "AWS is the primary provider path for this roadmap.",
    prerequisites: [
      "cloud-regions-availability-zones",
      "cloud-shared-responsibility",
    ],
    enables: ["aws-compute", "aws-storage", "aws-iam", "aws-vpc"],
    alternatives: ["azure-fundamentals", "gcp-fundamentals"],
    related: ["azure-fundamentals", "gcp-fundamentals"],
    metadata: {
      phase: "cloud-provider-fundamentals",
      primary: true,
    },
  }),

  node({
    id: "azure-fundamentals",
    title: "Microsoft Azure Fundamentals",
    category: "cloud-provider",
    importance: "medium",
    description:
      "Understand Azure's core cloud concepts and service organization.",
    whyItMatters: "Azure is a major enterprise cloud alternative.",
    prerequisites: ["cloud-regions-availability-zones"],
    enables: [],
    alternatives: ["aws-fundamentals", "gcp-fundamentals"],
    related: ["aws-fundamentals", "gcp-fundamentals"],
    metadata: {
      phase: "cloud-provider-fundamentals",
      optional: true,
    },
  }),

  node({
    id: "gcp-fundamentals",
    title: "Google Cloud Fundamentals",
    category: "cloud-provider",
    importance: "medium",
    description:
      "Understand GCP's core cloud concepts and service organization.",
    whyItMatters:
      "GCP is an important alternative for data, AI and cloud-native workloads.",
    prerequisites: ["cloud-regions-availability-zones"],
    enables: [],
    alternatives: ["aws-fundamentals", "azure-fundamentals"],
    related: ["aws-fundamentals", "azure-fundamentals"],
    metadata: {
      phase: "cloud-provider-fundamentals",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 5 — AWS COMPUTE
  // ============================================================

  node({
    id: "aws-compute",
    title: "AWS Compute",
    category: "compute",
    importance: "critical",
    description:
      "Understand AWS compute options and when to use virtual machines, containers and serverless workloads.",
    whyItMatters: "Compute is the execution layer for cloud applications.",
    prerequisites: ["aws-fundamentals", "linux-fundamentals"],
    enables: ["aws-ec2", "aws-lambda"],
    alternatives: ["aws-ecs"],
    related: ["aws-ec2", "aws-lambda"],
    metadata: { phase: "aws-core-compute", primary: true },
  }),

  node({
    id: "aws-ec2",
    title: "Amazon EC2",
    category: "compute",
    importance: "critical",
    description: "Deploy and operate virtual machines on AWS.",
    whyItMatters:
      "EC2 provides the core virtual-machine model used across cloud infrastructure.",
    prerequisites: ["aws-compute", "linux-services"],
    enables: ["aws-auto-scaling", "aws-load-balancer"],
    alternatives: [],
    related: ["aws-auto-scaling"],
    metadata: { phase: "aws-core-compute" },
  }),

  node({
    id: "aws-lambda",
    title: "AWS Lambda",
    category: "serverless",
    importance: "high",
    description: "Run event-driven code without managing servers.",
    whyItMatters:
      "Serverless can reduce infrastructure management for suitable workloads.",
    prerequisites: ["aws-compute", "cloud-service-models"],
    enables: ["serverless-architecture"],
    alternatives: ["azure-functions", "gcp-functions"],
    related: ["serverless-architecture"],
    metadata: { phase: "aws-core-compute" },
  }),

  node({
    id: "aws-ecs",
    title: "Amazon ECS",
    category: "containers",
    importance: "medium",
    description: "Understand AWS-managed container orchestration using ECS.",
    whyItMatters:
      "ECS provides a simpler AWS-native container orchestration option.",
    prerequisites: ["aws-compute", "docker"],
    enables: [],
    alternatives: ["kubernetes", "aws-eks"],
    related: ["kubernetes"],
    metadata: {
      phase: "aws-core-compute",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 6 — VPC / NETWORKING
  // ============================================================

  node({
    id: "aws-vpc",
    title: "AWS VPC",
    category: "networking",
    importance: "critical",
    description:
      "Build isolated virtual networks using VPCs, subnets, routes and gateways.",
    whyItMatters:
      "VPC architecture is foundational to production AWS infrastructure.",
    prerequisites: ["aws-fundamentals", "cloud-networking"],
    enables: [
      "aws-subnets",
      "aws-route-tables",
      "aws-internet-gateway",
      "aws-nat-gateway",
    ],
    alternatives: ["azure-vnet", "gcp-vpc"],
    related: ["aws-subnets", "aws-route-tables"],
    metadata: { phase: "cloud-networking", primary: true },
  }),

  node({
    id: "aws-subnets",
    title: "AWS Public & Private Subnets",
    category: "networking",
    importance: "critical",
    description:
      "Design public and private subnet layouts for cloud workloads.",
    whyItMatters:
      "Subnet separation creates useful security and architecture boundaries.",
    prerequisites: ["aws-vpc", "ip-addressing"],
    enables: ["aws-route-tables", "aws-nat-gateway"],
    alternatives: [],
    related: ["network-security-groups"],
    metadata: { phase: "cloud-networking" },
  }),

  node({
    id: "aws-route-tables",
    title: "AWS Route Tables",
    category: "networking",
    importance: "high",
    description: "Control traffic paths between cloud network destinations.",
    whyItMatters:
      "Incorrect routes can make healthy workloads unreachable or expose private systems.",
    prerequisites: ["aws-subnets"],
    enables: ["aws-nat-gateway"],
    alternatives: [],
    related: ["aws-internet-gateway"],
    metadata: { phase: "cloud-networking" },
  }),

  node({
    id: "aws-internet-gateway",
    title: "AWS Internet Gateway",
    category: "networking",
    importance: "high",
    description:
      "Connect VPC resources to the public internet where appropriate.",
    whyItMatters: "Public workloads need controlled internet connectivity.",
    prerequisites: ["aws-route-tables"],
    enables: ["aws-load-balancer"],
    alternatives: [],
    related: ["aws-subnets"],
    metadata: { phase: "cloud-networking" },
  }),

  node({
    id: "aws-nat-gateway",
    title: "AWS NAT Gateway",
    category: "networking",
    importance: "high",
    description:
      "Allow private resources to initiate outbound internet connections without making them publicly reachable.",
    whyItMatters:
      "Private application servers frequently need controlled outbound connectivity.",
    prerequisites: ["aws-route-tables", "aws-subnets"],
    enables: ["aws-private-workloads"],
    alternatives: [],
    related: ["aws-vpc"],
    metadata: { phase: "cloud-networking" },
  }),

  node({
    id: "aws-private-workloads",
    title: "Private Cloud Workloads",
    category: "networking",
    importance: "critical",
    description:
      "Design workloads that remain private while exposing only the required public entry points.",
    whyItMatters:
      "Production architectures should minimize unnecessary public exposure.",
    prerequisites: ["aws-nat-gateway", "network-security-groups"],
    enables: ["cloud-security-architecture"],
    alternatives: [],
    related: ["cloud-security-architecture"],
    metadata: { phase: "cloud-networking" },
  }),

  node({
    id: "network-security-groups",
    title: "Network Security Groups & Firewalls",
    category: "security",
    importance: "critical",
    description:
      "Control inbound and outbound network traffic using cloud firewall rules.",
    whyItMatters:
      "Network-level access control is a core cloud security boundary.",
    prerequisites: ["tcp-udp", "aws-vpc"],
    enables: ["aws-private-workloads", "cloud-security-architecture"],
    alternatives: [],
    related: ["aws-iam"],
    metadata: { phase: "cloud-networking" },
  }),

  // ============================================================
  // PHASE 7 — STORAGE
  // ============================================================

  node({
    id: "aws-storage",
    title: "AWS Storage Fundamentals",
    category: "storage",
    importance: "critical",
    description: "Understand object, block and file storage options in AWS.",
    whyItMatters:
      "Different workloads require different storage semantics and performance characteristics.",
    prerequisites: ["aws-fundamentals"],
    enables: ["aws-s3", "aws-ebs", "aws-efs"],
    alternatives: [],
    related: ["aws-s3"],
    metadata: { phase: "cloud-storage" },
  }),

  node({
    id: "aws-s3",
    title: "Amazon S3",
    category: "storage",
    importance: "critical",
    description:
      "Use object storage for files, assets, backups, logs and application data.",
    whyItMatters:
      "S3 is one of the most important building blocks in cloud architectures.",
    prerequisites: ["aws-storage"],
    enables: ["object-storage-architecture", "cdn-and-edge"],
    alternatives: ["azure-blob-storage", "google-cloud-storage"],
    related: ["aws-s3-security"],
    metadata: { phase: "cloud-storage", primary: true },
  }),

  node({
    id: "aws-s3-security",
    title: "S3 Security & Access Control",
    category: "security",
    importance: "high",
    description:
      "Understand bucket policies, access control, encryption and secure object access.",
    whyItMatters:
      "Incorrect object-storage permissions can expose sensitive data.",
    prerequisites: ["aws-s3", "aws-iam"],
    enables: ["cloud-security-architecture"],
    alternatives: [],
    related: ["aws-kms", "aws-iam"],
    metadata: { phase: "cloud-storage" },
  }),

  node({
    id: "aws-ebs",
    title: "Amazon EBS",
    category: "storage",
    importance: "medium",
    description:
      "Understand persistent block storage attached to compute instances.",
    whyItMatters: "Virtual machines frequently require durable block storage.",
    prerequisites: ["aws-storage", "aws-ec2"],
    enables: [],
    alternatives: [],
    related: ["aws-ec2"],
    metadata: { phase: "cloud-storage" },
  }),

  node({
    id: "aws-efs",
    title: "Amazon EFS",
    category: "storage",
    importance: "medium",
    description:
      "Understand managed shared file storage for workloads requiring shared filesystem access.",
    whyItMatters:
      "Some distributed workloads need shared filesystem semantics.",
    prerequisites: ["aws-storage"],
    enables: [],
    alternatives: [],
    related: ["aws-ec2"],
    metadata: {
      phase: "cloud-storage",
      optional: true,
    },
  }),

  node({
    id: "object-storage-architecture",
    title: "Object Storage Architecture",
    category: "storage",
    importance: "high",
    description:
      "Design application file storage using object storage, metadata and secure access patterns.",
    whyItMatters:
      "Applications should not depend on local server disks for durable user files.",
    prerequisites: ["aws-s3"],
    enables: ["cdn-and-edge"],
    alternatives: [],
    related: ["cloud-disaster-recovery"],
    metadata: { phase: "cloud-storage" },
  }),

  // ============================================================
  // PHASE 8 — DATABASES
  // ============================================================

  node({
    id: "cloud-databases",
    title: "Cloud Database Fundamentals",
    category: "database",
    importance: "critical",
    description:
      "Understand managed relational and NoSQL databases, backups, replication and scaling.",
    whyItMatters:
      "Cloud applications depend on durable and scalable data services.",
    prerequisites: ["aws-fundamentals"],
    enables: ["aws-rds", "aws-dynamodb"],
    alternatives: ["mongodb-atlas"],
    related: ["cloud-database-scaling"],
    metadata: { phase: "cloud-databases" },
  }),

  node({
    id: "aws-rds",
    title: "Amazon RDS",
    category: "database",
    importance: "critical",
    description:
      "Run managed relational databases with backups, maintenance and high-availability options.",
    whyItMatters:
      "Managed relational databases reduce operational database work.",
    prerequisites: ["cloud-databases", "aws-vpc"],
    enables: ["cloud-database-scaling", "cloud-disaster-recovery"],
    alternatives: ["aurora", "azure-sql", "cloud-sql"],
    related: ["aws-vpc"],
    metadata: { phase: "cloud-databases", primary: true },
  }),

  node({
    id: "aws-dynamodb",
    title: "Amazon DynamoDB",
    category: "database",
    importance: "high",
    description:
      "Understand AWS managed NoSQL database design and access patterns.",
    whyItMatters:
      "NoSQL databases can provide scalable low-latency access for suitable workloads.",
    prerequisites: ["cloud-databases"],
    enables: ["cloud-database-scaling"],
    alternatives: ["mongodb-atlas"],
    related: ["cloud-database-scaling"],
    metadata: { phase: "cloud-databases" },
  }),

  node({
    id: "mongodb-atlas",
    title: "MongoDB Atlas",
    category: "database",
    importance: "medium",
    description:
      "Understand managed MongoDB deployment and cloud database operations.",
    whyItMatters:
      "MongoDB is relevant for MERN applications and managed database workflows.",
    prerequisites: ["cloud-databases"],
    enables: ["cloud-database-scaling"],
    alternatives: ["aws-rds", "aws-dynamodb"],
    related: ["cloud-database-scaling"],
    metadata: {
      phase: "cloud-databases",
      optional: true,
    },
  }),

  node({
    id: "aurora",
    title: "Amazon Aurora Awareness",
    category: "database",
    importance: "medium",
    description:
      "Understand Aurora as an AWS-managed relational database option.",
    whyItMatters:
      "Aurora is useful when higher-scale managed relational workloads require AWS-native capabilities.",
    prerequisites: ["aws-rds"],
    enables: [],
    alternatives: ["aws-rds"],
    related: ["aws-rds"],
    metadata: {
      phase: "cloud-databases",
      optional: true,
    },
  }),

  node({
    id: "azure-sql",
    title: "Azure SQL Awareness",
    category: "database",
    importance: "low",
    description: "Understand the role of managed SQL databases in Azure.",
    whyItMatters: "Provides transferable knowledge for Azure environments.",
    prerequisites: ["cloud-databases"],
    enables: [],
    alternatives: ["aws-rds"],
    related: ["aws-rds"],
    metadata: {
      phase: "cloud-databases",
      optional: true,
    },
  }),

  node({
    id: "cloud-sql",
    title: "Google Cloud SQL Awareness",
    category: "database",
    importance: "low",
    description:
      "Understand managed relational database services on Google Cloud.",
    whyItMatters: "Provides transferable knowledge for GCP environments.",
    prerequisites: ["cloud-databases"],
    enables: [],
    alternatives: ["aws-rds"],
    related: ["aws-rds"],
    metadata: {
      phase: "cloud-databases",
      optional: true,
    },
  }),

  node({
    id: "cloud-database-scaling",
    title: "Cloud Database Scaling & Operations",
    category: "database",
    importance: "critical",
    description:
      "Understand database backups, replicas, scaling, connection management and operational trade-offs.",
    whyItMatters:
      "Database bottlenecks often become the limiting factor in production systems.",
    prerequisites: ["aws-rds"],
    enables: ["cloud-high-availability", "cloud-disaster-recovery"],
    alternatives: [],
    related: ["aws-dynamodb"],
    metadata: { phase: "cloud-databases" },
  }),

  // ============================================================
  // PHASE 9 — IAM & SECURITY
  // ============================================================

  node({
    id: "cloud-security-fundamentals",
    title: "Cloud Security Fundamentals",
    category: "security",
    importance: "critical",
    description:
      "Understand least privilege, identity, encryption, network controls, logging and secure cloud configuration.",
    whyItMatters: "Security is a core cloud engineering responsibility.",
    prerequisites: ["cloud-shared-responsibility"],
    enables: ["aws-iam", "aws-kms", "cloud-security-architecture"],
    alternatives: [],
    related: ["network-security-groups"],
    metadata: { phase: "cloud-identity-and-security" },
  }),

  node({
    id: "aws-iam",
    title: "AWS IAM",
    category: "security",
    importance: "critical",
    description:
      "Manage identities, roles, policies and permissions using AWS IAM.",
    whyItMatters: "IAM controls who and what can access AWS resources.",
    prerequisites: ["cloud-security-fundamentals", "aws-fundamentals"],
    enables: ["aws-iam-roles", "aws-secrets-manager", "aws-s3-security"],
    alternatives: ["azure-entra-id", "gcp-iam"],
    related: ["aws-kms"],
    metadata: { phase: "cloud-identity-and-security", primary: true },
  }),

  node({
    id: "aws-iam-roles",
    title: "AWS IAM Roles & Least Privilege",
    category: "security",
    importance: "critical",
    description:
      "Use roles and narrowly scoped permissions instead of broad static credentials.",
    whyItMatters:
      "Least privilege reduces the blast radius of compromised identities.",
    prerequisites: ["aws-iam"],
    enables: ["cloud-security-architecture"],
    alternatives: [],
    related: ["aws-secrets-manager"],
    metadata: { phase: "cloud-identity-and-security" },
  }),

  node({
    id: "aws-kms",
    title: "AWS KMS & Encryption",
    category: "security",
    importance: "high",
    description:
      "Understand managed encryption keys and encryption-at-rest patterns.",
    whyItMatters:
      "Sensitive cloud data often requires controlled encryption and key management.",
    prerequisites: ["cloud-security-fundamentals", "aws-iam"],
    enables: ["cloud-security-architecture"],
    alternatives: [],
    related: ["aws-s3-security"],
    metadata: { phase: "cloud-identity-and-security" },
  }),

  node({
    id: "aws-secrets-manager",
    title: "AWS Secrets Management",
    category: "security",
    importance: "critical",
    description:
      "Store and retrieve application secrets without hardcoding sensitive values.",
    whyItMatters:
      "Secrets must not be committed to source code or exposed through infrastructure configuration.",
    prerequisites: ["aws-iam"],
    enables: ["cloud-security-architecture", "ci-cd-pipelines"],
    alternatives: [],
    related: ["aws-kms"],
    metadata: { phase: "cloud-identity-and-security" },
  }),

  node({
    id: "azure-entra-id",
    title: "Microsoft Entra ID Awareness",
    category: "security",
    importance: "low",
    description:
      "Understand identity and access management in Azure environments.",
    whyItMatters:
      "Enterprise Azure environments commonly use Microsoft identity services.",
    prerequisites: ["cloud-security-fundamentals"],
    enables: [],
    alternatives: ["aws-iam"],
    related: ["aws-iam"],
    metadata: {
      phase: "cloud-identity-and-security",
      optional: true,
    },
  }),

  node({
    id: "gcp-iam",
    title: "Google Cloud IAM Awareness",
    category: "security",
    importance: "low",
    description: "Understand identity and access management in Google Cloud.",
    whyItMatters: "IAM concepts transfer across cloud providers.",
    prerequisites: ["cloud-security-fundamentals"],
    enables: [],
    alternatives: ["aws-iam"],
    related: ["aws-iam"],
    metadata: {
      phase: "cloud-identity-and-security",
      optional: true,
    },
  }),

  node({
    id: "cloud-security-architecture",
    title: "Cloud Security Architecture",
    category: "security",
    importance: "critical",
    description:
      "Combine identity, network security, encryption, secrets and secure workload design.",
    whyItMatters:
      "Production security requires multiple layers working together.",
    prerequisites: [
      "aws-iam-roles",
      "aws-kms",
      "aws-secrets-manager",
      "network-security-groups",
    ],
    enables: ["advanced-cloud-security"],
    alternatives: [],
    related: ["aws-s3-security"],
    metadata: { phase: "cloud-identity-and-security" },
  }),

  // ============================================================
  // PHASE 10 — LOAD BALANCING / EDGE
  // ============================================================

  node({
    id: "load-balancing",
    title: "Load Balancing",
    category: "networking",
    importance: "critical",
    description:
      "Understand distributing incoming traffic across multiple application instances.",
    whyItMatters:
      "Load balancing supports availability and horizontal scaling.",
    prerequisites: ["http-https", "cloud-networking"],
    enables: ["aws-load-balancer", "cloud-scaling"],
    alternatives: ["nginx"],
    related: ["aws-auto-scaling"],
    metadata: { phase: "load-balancing-and-edge" },
  }),

  node({
    id: "aws-load-balancer",
    title: "AWS Application Load Balancer",
    category: "networking",
    importance: "critical",
    description:
      "Route HTTP/HTTPS traffic to scalable AWS application workloads.",
    whyItMatters:
      "ALB is a common entry point for production web applications.",
    prerequisites: ["load-balancing", "aws-subnets"],
    enables: ["aws-auto-scaling", "cloud-high-availability"],
    alternatives: ["nginx"],
    related: ["aws-ec2"],
    metadata: { phase: "load-balancing-and-edge", primary: true },
  }),

  node({
    id: "cdn-and-edge",
    title: "CDN & Edge Delivery",
    category: "networking",
    importance: "high",
    description: "Understand caching and content delivery closer to users.",
    whyItMatters:
      "CDNs reduce latency and origin load for static and cacheable content.",
    prerequisites: ["dns", "aws-s3"],
    enables: ["aws-cloudfront"],
    alternatives: ["cloudflare"],
    related: ["load-balancing"],
    metadata: { phase: "load-balancing-and-edge" },
  }),

  node({
    id: "aws-cloudfront",
    title: "Amazon CloudFront",
    category: "networking",
    importance: "high",
    description: "Use AWS CDN capabilities to distribute content globally.",
    whyItMatters:
      "CloudFront can reduce latency and protect origins through edge delivery patterns.",
    prerequisites: ["cdn-and-edge"],
    enables: ["cloud-edge-architecture"],
    alternatives: ["cloudflare"],
    related: ["aws-s3"],
    metadata: { phase: "load-balancing-and-edge" },
  }),

  node({
    id: "cloud-api-gateway",
    title: "Cloud API Gateway",
    category: "networking",
    importance: "high",
    description:
      "Understand managed API entry points, routing, authentication and throttling.",
    whyItMatters:
      "API gateways provide useful control at the boundary of distributed applications.",
    prerequisites: ["http-https", "cloud-security-fundamentals"],
    enables: ["serverless-architecture"],
    alternatives: [],
    related: ["load-balancing"],
    metadata: { phase: "load-balancing-and-edge" },
  }),

  node({
    id: "nginx",
    title: "Nginx Reverse Proxy Awareness",
    category: "networking",
    importance: "medium",
    description:
      "Understand reverse proxying, TLS termination and basic traffic routing with Nginx.",
    whyItMatters:
      "Nginx remains useful in self-managed and hybrid architectures.",
    prerequisites: ["http-https", "linux-services"],
    enables: ["load-balancing"],
    alternatives: ["aws-load-balancer"],
    related: ["aws-load-balancer"],
    metadata: {
      phase: "load-balancing-and-edge",
      optional: true,
    },
  }),

  node({
    id: "cloud-edge-architecture",
    title: "Cloud Edge Architecture",
    category: "architecture",
    importance: "high",
    description:
      "Combine DNS, CDN, TLS, load balancing and application origins into an edge architecture.",
    whyItMatters:
      "Production traffic architecture is more than a single load balancer.",
    prerequisites: ["aws-cloudfront", "aws-load-balancer", "tls"],
    enables: ["cloud-architecture"],
    alternatives: [],
    related: ["cloud-api-gateway"],
    metadata: { phase: "load-balancing-and-edge" },
  }),

  // ============================================================
  // PHASE 11 — DOCKER
  // ============================================================

  node({
    id: "docker",
    title: "Docker Fundamentals",
    category: "containers",
    importance: "critical",
    description:
      "Learn images, containers, Dockerfiles, registries, networking and volumes.",
    whyItMatters:
      "Containers provide consistent application packaging across environments.",
    prerequisites: ["linux-fundamentals"],
    enables: [
      "docker-images",
      "docker-networking",
      "docker-compose",
      "container-registry",
    ],
    alternatives: [],
    related: ["kubernetes"],
    metadata: { phase: "containers", primary: true },
  }),

  node({
    id: "docker-images",
    title: "Docker Images & Dockerfiles",
    category: "containers",
    importance: "critical",
    description:
      "Build reproducible container images using Dockerfiles and image-layer concepts.",
    whyItMatters:
      "Production containers must be reproducible and efficiently built.",
    prerequisites: ["docker"],
    enables: ["container-registry", "docker-security"],
    alternatives: [],
    related: ["docker-compose"],
    metadata: { phase: "containers" },
  }),

  node({
    id: "docker-networking",
    title: "Docker Networking",
    category: "containers",
    importance: "high",
    description: "Understand container-to-container and host networking.",
    whyItMatters: "Containerized services must communicate predictably.",
    prerequisites: ["docker"],
    enables: ["docker-compose", "kubernetes-networking"],
    alternatives: [],
    related: ["docker-compose"],
    metadata: { phase: "containers" },
  }),

  node({
    id: "docker-compose",
    title: "Docker Compose",
    category: "containers",
    importance: "high",
    description: "Run multi-container development and test environments.",
    whyItMatters:
      "Compose is useful for local development of distributed application stacks.",
    prerequisites: ["docker", "docker-networking"],
    enables: ["kubernetes"],
    alternatives: [],
    related: ["container-registry"],
    metadata: { phase: "containers" },
  }),

  node({
    id: "container-registry",
    title: "Container Registries",
    category: "containers",
    importance: "high",
    description: "Store, version and distribute container images.",
    whyItMatters:
      "Production deployment pipelines need reliable image distribution.",
    prerequisites: ["docker-images"],
    enables: ["kubernetes", "ci-cd-pipelines"],
    alternatives: [],
    related: ["docker-security"],
    metadata: { phase: "containers" },
  }),

  node({
    id: "docker-security",
    title: "Container Security Fundamentals",
    category: "security",
    importance: "high",
    description:
      "Understand non-root containers, minimal images, secrets and image scanning.",
    whyItMatters:
      "Container vulnerabilities can become production infrastructure vulnerabilities.",
    prerequisites: ["docker-images", "cloud-security-fundamentals"],
    enables: ["kubernetes-security", "advanced-cloud-security"],
    alternatives: [],
    related: ["aws-secrets-manager"],
    metadata: { phase: "containers" },
  }),

  // ============================================================
  // PHASE 12 — KUBERNETES
  // ============================================================

  node({
    id: "kubernetes",
    title: "Kubernetes Fundamentals",
    category: "orchestration",
    importance: "critical",
    description: "Understand clusters, nodes, pods, deployments and services.",
    whyItMatters:
      "Kubernetes is a major platform for operating containerized workloads at scale.",
    prerequisites: ["docker", "container-registry"],
    enables: [
      "kubernetes-workloads",
      "kubernetes-services",
      "kubernetes-networking",
    ],
    alternatives: ["aws-ecs"],
    related: ["aws-eks"],
    metadata: { phase: "container-orchestration", primary: true },
  }),

  node({
    id: "kubernetes-workloads",
    title: "Kubernetes Workloads",
    category: "orchestration",
    importance: "critical",
    description:
      "Understand pods, deployments, replica sets, jobs and workload lifecycle.",
    whyItMatters:
      "Workload controllers manage application lifecycle and scaling.",
    prerequisites: ["kubernetes"],
    enables: ["kubernetes-scaling", "kubernetes-configuration"],
    alternatives: [],
    related: ["kubernetes-services"],
    metadata: { phase: "container-orchestration" },
  }),

  node({
    id: "kubernetes-services",
    title: "Kubernetes Services",
    category: "orchestration",
    importance: "critical",
    description: "Expose and discover workloads inside and outside a cluster.",
    whyItMatters:
      "Distributed workloads require stable service discovery and networking.",
    prerequisites: ["kubernetes-workloads"],
    enables: ["kubernetes-networking", "kubernetes-ingress"],
    alternatives: [],
    related: ["kubernetes-ingress"],
    metadata: { phase: "container-orchestration" },
  }),

  node({
    id: "kubernetes-networking",
    title: "Kubernetes Networking",
    category: "networking",
    importance: "high",
    description:
      "Understand pod networking, services, DNS and cluster traffic.",
    whyItMatters:
      "Networking becomes complex when many containerized services communicate.",
    prerequisites: ["kubernetes-services", "docker-networking"],
    enables: ["kubernetes-ingress"],
    alternatives: [],
    related: ["kubernetes-security"],
    metadata: { phase: "container-orchestration" },
  }),

  node({
    id: "kubernetes-ingress",
    title: "Kubernetes Ingress",
    category: "networking",
    importance: "high",
    description: "Route external HTTP/HTTPS traffic to Kubernetes services.",
    whyItMatters:
      "Ingress provides an application-level entry point into cluster workloads.",
    prerequisites: ["kubernetes-networking"],
    enables: ["kubernetes-production"],
    alternatives: [],
    related: ["aws-load-balancer"],
    metadata: { phase: "container-orchestration" },
  }),

  node({
    id: "kubernetes-configuration",
    title: "Kubernetes Configuration & Secrets",
    category: "orchestration",
    importance: "high",
    description:
      "Manage application configuration and secrets inside Kubernetes.",
    whyItMatters:
      "Production workloads need configuration separated from application images.",
    prerequisites: ["kubernetes-workloads", "docker-security"],
    enables: ["kubernetes-security"],
    alternatives: [],
    related: ["aws-secrets-manager"],
    metadata: { phase: "container-orchestration" },
  }),

  node({
    id: "kubernetes-security",
    title: "Kubernetes Security",
    category: "security",
    importance: "high",
    description:
      "Understand RBAC, service accounts, secrets, pod security and network policies.",
    whyItMatters:
      "Kubernetes is a powerful control plane and must be securely configured.",
    prerequisites: ["kubernetes-configuration", "docker-security"],
    enables: ["kubernetes-production", "advanced-cloud-security"],
    alternatives: [],
    related: ["cloud-security-architecture"],
    metadata: { phase: "container-orchestration" },
  }),

  node({
    id: "kubernetes-scaling",
    title: "Kubernetes Scaling",
    category: "orchestration",
    importance: "high",
    description:
      "Understand horizontal workload scaling and cluster capacity concepts.",
    whyItMatters:
      "Container platforms must respond to changing workload demand.",
    prerequisites: ["kubernetes-workloads"],
    enables: ["kubernetes-production"],
    alternatives: [],
    related: ["cloud-scaling"],
    metadata: { phase: "container-orchestration" },
  }),

  node({
    id: "kubernetes-production",
    title: "Production Kubernetes",
    category: "orchestration",
    importance: "critical",
    description:
      "Combine networking, workloads, scaling, configuration, security and observability for production clusters.",
    whyItMatters:
      "Production Kubernetes requires more than knowing kubectl commands.",
    prerequisites: [
      "kubernetes-ingress",
      "kubernetes-security",
      "kubernetes-scaling",
    ],
    enables: ["cloud-platform-engineering"],
    alternatives: [],
    related: ["aws-eks", "cloud-observability"],
    metadata: { phase: "container-orchestration" },
  }),

  node({
    id: "aws-eks",
    title: "Amazon EKS Awareness",
    category: "orchestration",
    importance: "medium",
    description: "Understand managed Kubernetes on AWS.",
    whyItMatters: "EKS connects Kubernetes skills with AWS infrastructure.",
    prerequisites: ["kubernetes"],
    enables: ["kubernetes-production"],
    alternatives: ["aws-ecs"],
    related: ["aws-vpc"],
    metadata: {
      phase: "container-orchestration",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 13 — TERRAFORM / IaC
  // ============================================================

  node({
    id: "infrastructure-as-code",
    title: "Infrastructure as Code",
    category: "iac",
    importance: "critical",
    description:
      "Understand infrastructure definitions, state, plans, changes and reproducible environments.",
    whyItMatters:
      "Production infrastructure should be versioned and reproducible.",
    prerequisites: ["aws-fundamentals", "linux-automation"],
    enables: ["terraform"],
    alternatives: ["cloudformation", "pulumi"],
    related: ["configuration-automation"],
    metadata: { phase: "infrastructure-as-code", primary: true },
  }),

  node({
    id: "terraform",
    title: "Terraform Fundamentals",
    category: "iac",
    importance: "critical",
    description: "Define and provision cloud infrastructure using Terraform.",
    whyItMatters:
      "Terraform provides a provider-agnostic infrastructure-as-code workflow.",
    prerequisites: ["infrastructure-as-code"],
    enables: ["terraform-modules", "terraform-state", "terraform-production"],
    alternatives: ["cloudformation", "pulumi"],
    related: ["aws-vpc", "aws-ec2"],
    metadata: { phase: "infrastructure-as-code", primary: true },
  }),

  node({
    id: "terraform-state",
    title: "Terraform State",
    category: "iac",
    importance: "critical",
    description:
      "Understand Terraform state, state storage, locking and lifecycle.",
    whyItMatters:
      "State is central to how Terraform tracks managed infrastructure.",
    prerequisites: ["terraform"],
    enables: ["terraform-production"],
    alternatives: [],
    related: ["terraform-modules"],
    metadata: { phase: "infrastructure-as-code" },
  }),

  node({
    id: "terraform-modules",
    title: "Terraform Modules",
    category: "iac",
    importance: "high",
    description:
      "Create reusable infrastructure modules and environment structures.",
    whyItMatters:
      "Reusable modules prevent duplicated infrastructure definitions.",
    prerequisites: ["terraform"],
    enables: ["terraform-production"],
    alternatives: [],
    related: ["cloud-platform-engineering"],
    metadata: { phase: "infrastructure-as-code" },
  }),

  node({
    id: "terraform-production",
    title: "Production Terraform",
    category: "iac",
    importance: "critical",
    description:
      "Apply Terraform using safe workflows, reviewable changes, remote state and reusable modules.",
    whyItMatters:
      "Production IaC requires governance and safe change management.",
    prerequisites: ["terraform-state", "terraform-modules"],
    enables: ["cloud-platform-engineering"],
    alternatives: [],
    related: ["ci-cd-pipelines"],
    metadata: { phase: "infrastructure-as-code" },
  }),

  node({
    id: "cloudformation",
    title: "AWS CloudFormation Awareness",
    category: "iac",
    importance: "medium",
    description: "Understand AWS-native infrastructure as code.",
    whyItMatters:
      "CloudFormation is useful when teams prefer AWS-native tooling.",
    prerequisites: ["infrastructure-as-code"],
    enables: [],
    alternatives: ["terraform"],
    related: ["terraform"],
    metadata: {
      phase: "infrastructure-as-code",
      optional: true,
    },
  }),

  node({
    id: "pulumi",
    title: "Pulumi Awareness",
    category: "iac",
    importance: "low",
    description:
      "Understand infrastructure as code using general-purpose programming languages.",
    whyItMatters:
      "Pulumi is an alternative IaC model for teams preferring application languages.",
    prerequisites: ["infrastructure-as-code"],
    enables: [],
    alternatives: ["terraform"],
    related: ["terraform"],
    metadata: {
      phase: "infrastructure-as-code",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 14 — CONFIGURATION AUTOMATION
  // ============================================================

  node({
    id: "configuration-automation",
    title: "Configuration Automation",
    category: "automation",
    importance: "high",
    description:
      "Automate server configuration and repeatable operational setup.",
    whyItMatters:
      "Infrastructure and application configuration should be reproducible.",
    prerequisites: ["linux-automation"],
    enables: ["ansible"],
    alternatives: [],
    related: ["infrastructure-as-code"],
    metadata: { phase: "cloud-automation" },
  }),

  node({
    id: "ansible",
    title: "Ansible Awareness",
    category: "automation",
    importance: "medium",
    description:
      "Understand agentless configuration management and automation with Ansible.",
    whyItMatters:
      "Ansible remains useful for server configuration and operational automation.",
    prerequisites: ["configuration-automation"],
    enables: ["cloud-platform-engineering"],
    alternatives: ["terraform"],
    related: ["terraform"],
    metadata: {
      phase: "cloud-automation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 15 — CI/CD
  // ============================================================

  node({
    id: "ci-cd-fundamentals",
    title: "CI/CD Fundamentals",
    category: "delivery",
    importance: "critical",
    description:
      "Understand continuous integration, continuous delivery, deployment pipelines and release automation.",
    whyItMatters:
      "Cloud infrastructure becomes valuable when software can be delivered reliably.",
    prerequisites: ["git-and-version-control"],
    enables: ["ci-cd-pipelines"],
    alternatives: [],
    related: ["terraform-production"],
    metadata: { phase: "ci-cd-cloud" },
  }),

  node({
    id: "git-and-version-control",
    title: "Git & Version Control",
    category: "delivery",
    importance: "critical",
    description:
      "Understand Git workflows, branches, commits, pull requests and versioned infrastructure.",
    whyItMatters:
      "Infrastructure and application delivery depend on version control.",
    prerequisites: [],
    enables: ["ci-cd-fundamentals"],
    alternatives: [],
    related: ["terraform"],
    metadata: { phase: "ci-cd-cloud" },
  }),

  node({
    id: "ci-cd-pipelines",
    title: "CI/CD Pipelines",
    category: "delivery",
    importance: "critical",
    description:
      "Build automated workflows for testing, building, securing and deploying applications and infrastructure.",
    whyItMatters:
      "Automation makes production delivery repeatable and auditable.",
    prerequisites: ["ci-cd-fundamentals", "container-registry"],
    enables: ["github-actions", "cloud-deployment-automation"],
    alternatives: ["gitlab-ci", "jenkins"],
    related: ["terraform-production"],
    metadata: { phase: "ci-cd-cloud" },
  }),

  node({
    id: "github-actions",
    title: "GitHub Actions",
    category: "delivery",
    importance: "high",
    description: "Implement CI/CD workflows using GitHub Actions.",
    whyItMatters:
      "GitHub Actions provides an accessible production CI/CD path.",
    prerequisites: ["ci-cd-pipelines"],
    enables: ["cloud-deployment-automation"],
    alternatives: ["gitlab-ci", "jenkins"],
    related: ["aws-secrets-manager"],
    metadata: {
      phase: "ci-cd-cloud",
      primary: true,
    },
  }),

  node({
    id: "gitlab-ci",
    title: "GitLab CI Awareness",
    category: "delivery",
    importance: "medium",
    description: "Understand GitLab's CI/CD model.",
    whyItMatters: "GitLab CI is a common enterprise alternative.",
    prerequisites: ["ci-cd-pipelines"],
    enables: [],
    alternatives: ["github-actions"],
    related: ["github-actions"],
    metadata: {
      phase: "ci-cd-cloud",
      optional: true,
    },
  }),

  node({
    id: "jenkins",
    title: "Jenkins Awareness",
    category: "delivery",
    importance: "medium",
    description:
      "Understand Jenkins-based automation and its role in enterprise environments.",
    whyItMatters:
      "Jenkins remains present in many established engineering organizations.",
    prerequisites: ["ci-cd-pipelines"],
    enables: [],
    alternatives: ["github-actions"],
    related: ["github-actions"],
    metadata: {
      phase: "ci-cd-cloud",
      optional: true,
    },
  }),

  node({
    id: "cloud-deployment-automation",
    title: "Cloud Deployment Automation",
    category: "delivery",
    importance: "critical",
    description:
      "Automate application and infrastructure deployment into cloud environments.",
    whyItMatters:
      "Production deployments should not depend on manual server operations.",
    prerequisites: ["github-actions", "terraform-production"],
    enables: ["cloud-platform-engineering"],
    alternatives: [],
    related: ["cloud-observability"],
    metadata: { phase: "ci-cd-cloud" },
  }),

  // ============================================================
  // PHASE 16 — OBSERVABILITY
  // ============================================================

  node({
    id: "cloud-observability",
    title: "Cloud Observability Fundamentals",
    category: "observability",
    importance: "critical",
    description: "Understand logs, metrics, traces, dashboards and alerting.",
    whyItMatters:
      "Production systems must be observable to operate and troubleshoot them.",
    prerequisites: ["linux-process-management", "cloud-computing-fundamentals"],
    enables: ["cloudwatch", "opentelemetry", "cloud-alerting"],
    alternatives: [],
    related: ["cloud-reliability"],
    metadata: { phase: "cloud-observability" },
  }),

  node({
    id: "cloudwatch",
    title: "AWS CloudWatch",
    category: "observability",
    importance: "high",
    description: "Collect AWS metrics, logs and alarms using CloudWatch.",
    whyItMatters: "CloudWatch is the primary AWS-native observability service.",
    prerequisites: ["cloud-observability", "aws-fundamentals"],
    enables: ["cloud-alerting"],
    alternatives: ["prometheus", "grafana"],
    related: ["aws-ec2"],
    metadata: { phase: "cloud-observability", primary: true },
  }),

  node({
    id: "opentelemetry",
    title: "OpenTelemetry",
    category: "observability",
    importance: "high",
    description:
      "Understand vendor-neutral telemetry collection for traces, metrics and logs.",
    whyItMatters:
      "OpenTelemetry provides transferable observability knowledge across vendors.",
    prerequisites: ["cloud-observability"],
    enables: ["distributed-tracing"],
    alternatives: [],
    related: ["prometheus", "grafana"],
    metadata: { phase: "cloud-observability" },
  }),

  node({
    id: "prometheus",
    title: "Prometheus Awareness",
    category: "observability",
    importance: "medium",
    description:
      "Understand metrics collection and monitoring with Prometheus.",
    whyItMatters: "Prometheus is widely used in cloud-native environments.",
    prerequisites: ["cloud-observability"],
    enables: ["grafana"],
    alternatives: ["cloudwatch"],
    related: ["grafana"],
    metadata: {
      phase: "cloud-observability",
      optional: true,
    },
  }),

  node({
    id: "grafana",
    title: "Grafana Awareness",
    category: "observability",
    importance: "medium",
    description:
      "Understand dashboards and visualization for operational metrics.",
    whyItMatters:
      "Visualization helps engineers understand system behavior and trends.",
    prerequisites: ["cloud-observability"],
    enables: ["cloud-alerting"],
    alternatives: [],
    related: ["prometheus"],
    metadata: {
      phase: "cloud-observability",
      optional: true,
    },
  }),

  node({
    id: "distributed-tracing",
    title: "Distributed Tracing",
    category: "observability",
    importance: "high",
    description:
      "Trace requests across multiple services and infrastructure components.",
    whyItMatters:
      "Distributed systems require request-level visibility across service boundaries.",
    prerequisites: ["opentelemetry"],
    enables: ["cloud-reliability"],
    alternatives: [],
    related: ["cloud-alerting"],
    metadata: { phase: "cloud-observability" },
  }),

  node({
    id: "cloud-alerting",
    title: "Cloud Monitoring & Alerting",
    category: "observability",
    importance: "critical",
    description:
      "Define useful operational alerts based on system health and service behavior.",
    whyItMatters:
      "Monitoring without actionable alerts does not provide operational protection.",
    prerequisites: ["cloudwatch", "opentelemetry"],
    enables: ["cloud-reliability"],
    alternatives: [],
    related: ["cloud-disaster-recovery"],
    metadata: { phase: "cloud-observability" },
  }),

  // ============================================================
  // PHASE 17 — RELIABILITY
  // ============================================================

  node({
    id: "cloud-high-availability",
    title: "High Availability",
    category: "reliability",
    importance: "critical",
    description:
      "Design workloads to remain available when individual infrastructure components fail.",
    whyItMatters:
      "Production systems must tolerate expected infrastructure failures.",
    prerequisites: [
      "cloud-regions-availability-zones",
      "aws-load-balancer",
      "cloud-database-scaling",
    ],
    enables: ["cloud-reliability-architecture"],
    alternatives: [],
    related: ["cloud-disaster-recovery"],
    metadata: { phase: "cloud-reliability" },
  }),

  node({
    id: "cloud-disaster-recovery",
    title: "Cloud Disaster Recovery",
    category: "reliability",
    importance: "critical",
    description:
      "Plan backups, recovery strategies, recovery objectives and failure scenarios.",
    whyItMatters:
      "Availability is not enough when data or an entire environment is lost.",
    prerequisites: ["cloud-database-scaling", "aws-s3"],
    enables: ["cloud-reliability-architecture"],
    alternatives: [],
    related: ["cloud-high-availability"],
    metadata: { phase: "cloud-reliability" },
  }),

  node({
    id: "cloud-reliability-architecture",
    title: "Cloud Reliability Architecture",
    category: "reliability",
    importance: "critical",
    description:
      "Combine redundancy, backups, health checks, failure handling and observability.",
    whyItMatters:
      "Reliable systems require multiple layers of failure protection.",
    prerequisites: [
      "cloud-high-availability",
      "cloud-disaster-recovery",
      "cloud-alerting",
    ],
    enables: ["cloud-architecture"],
    alternatives: [],
    related: ["cloud-scaling"],
    metadata: { phase: "cloud-reliability" },
  }),

  // ============================================================
  // PHASE 18 — SCALING
  // ============================================================

  node({
    id: "cloud-scaling",
    title: "Cloud Scaling Fundamentals",
    category: "scaling",
    importance: "critical",
    description:
      "Understand vertical scaling, horizontal scaling, autoscaling and capacity planning.",
    whyItMatters:
      "Cloud infrastructure exists partly to scale resources with workload demand.",
    prerequisites: ["load-balancing", "aws-ec2"],
    enables: ["aws-auto-scaling", "cloud-performance"],
    alternatives: [],
    related: ["cloud-high-availability"],
    metadata: { phase: "cloud-scaling" },
  }),

  node({
    id: "aws-auto-scaling",
    title: "AWS Auto Scaling",
    category: "scaling",
    importance: "critical",
    description:
      "Automatically adjust compute capacity based on workload demand.",
    whyItMatters:
      "Autoscaling improves elasticity and reduces manual capacity management.",
    prerequisites: ["cloud-scaling", "aws-ec2", "aws-load-balancer"],
    enables: ["cloud-performance"],
    alternatives: [],
    related: ["cloud-high-availability"],
    metadata: { phase: "cloud-scaling" },
  }),

  node({
    id: "cloud-performance",
    title: "Cloud Performance Engineering",
    category: "performance",
    importance: "high",
    description:
      "Optimize compute, networking, storage and application architecture for performance.",
    whyItMatters:
      "Scaling infrastructure alone does not guarantee good application performance.",
    prerequisites: ["aws-auto-scaling", "cloud-observability"],
    enables: ["cloud-architecture"],
    alternatives: [],
    related: ["cloud-cost-management"],
    metadata: { phase: "cloud-scaling" },
  }),

  // ============================================================
  // PHASE 19 — COST
  // ============================================================

  node({
    id: "cloud-cost-management",
    title: "Cloud Cost Management",
    category: "finops",
    importance: "high",
    description:
      "Understand pricing, budgets, resource utilization, tagging and rightsizing.",
    whyItMatters:
      "A technically correct cloud architecture can still be financially unsustainable.",
    prerequisites: ["cloud-computing-fundamentals"],
    enables: ["cloud-cost-optimization"],
    alternatives: [],
    related: ["cloud-performance"],
    metadata: { phase: "cloud-cost-management" },
  }),

  node({
    id: "cloud-cost-optimization",
    title: "Cloud Cost Optimization",
    category: "finops",
    importance: "high",
    description:
      "Optimize infrastructure usage without compromising required reliability and performance.",
    whyItMatters:
      "Cloud engineering requires balancing cost, performance and reliability.",
    prerequisites: ["cloud-cost-management", "cloud-performance"],
    enables: ["cloud-architecture"],
    alternatives: [],
    related: ["cloud-scaling"],
    metadata: { phase: "cloud-cost-management" },
  }),

  // ============================================================
  // PHASE 20 — SERVERLESS
  // ============================================================

  node({
    id: "serverless-computing",
    title: "Serverless Computing",
    category: "serverless",
    importance: "high",
    description:
      "Understand event-driven managed compute and when serverless architecture is appropriate.",
    whyItMatters:
      "Serverless can reduce infrastructure management for suitable workloads.",
    prerequisites: ["cloud-service-models"],
    enables: ["serverless-architecture"],
    alternatives: [],
    related: ["aws-lambda"],
    metadata: { phase: "serverless-and-managed-services" },
  }),

  node({
    id: "serverless-architecture",
    title: "Serverless Architecture",
    category: "architecture",
    importance: "high",
    description:
      "Combine serverless compute, APIs, storage and managed services into application architectures.",
    whyItMatters:
      "Serverless requires architectural thinking around events, statelessness and managed dependencies.",
    prerequisites: ["serverless-computing", "aws-lambda", "cloud-api-gateway"],
    enables: ["cloud-architecture"],
    alternatives: [],
    related: ["aws-s3", "aws-dynamodb"],
    metadata: { phase: "serverless-and-managed-services" },
  }),

  node({
    id: "azure-functions",
    title: "Azure Functions Awareness",
    category: "serverless",
    importance: "low",
    description: "Understand Azure's serverless function model.",
    whyItMatters: "Provides transferable serverless knowledge.",
    prerequisites: ["serverless-computing"],
    enables: [],
    alternatives: ["aws-lambda"],
    related: ["aws-lambda"],
    metadata: {
      phase: "serverless-and-managed-services",
      optional: true,
    },
  }),

  node({
    id: "gcp-functions",
    title: "Google Cloud Functions Awareness",
    category: "serverless",
    importance: "low",
    description: "Understand Google Cloud's serverless function model.",
    whyItMatters: "Provides transferable serverless knowledge.",
    prerequisites: ["serverless-computing"],
    enables: [],
    alternatives: ["aws-lambda"],
    related: ["aws-lambda"],
    metadata: {
      phase: "serverless-and-managed-services",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 21 — ADVANCED SECURITY
  // ============================================================

  node({
    id: "advanced-cloud-security",
    title: "Advanced Cloud Security",
    category: "security",
    importance: "critical",
    description:
      "Connect identity, network isolation, encryption, secrets, workload security and observability into a defense-in-depth model.",
    whyItMatters:
      "Cloud security failures frequently occur across multiple layers rather than one service.",
    prerequisites: [
      "cloud-security-architecture",
      "docker-security",
      "kubernetes-security",
    ],
    enables: ["cloud-platform-engineering"],
    alternatives: [],
    related: ["cloud-security-fundamentals"],
    metadata: { phase: "cloud-security-engineering" },
  }),

  // ============================================================
  // PHASE 22 — ARCHITECTURE
  // ============================================================

  node({
    id: "cloud-architecture",
    title: "Cloud Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Design complete cloud architectures by combining compute, networking, storage, databases, security, reliability and observability.",
    whyItMatters:
      "Cloud engineers must reason about systems, not just individual services.",
    prerequisites: [
      "cloud-edge-architecture",
      "cloud-reliability-architecture",
      "cloud-performance",
      "cloud-cost-optimization",
      "serverless-architecture",
    ],
    enables: ["cloud-platform-engineering"],
    alternatives: [],
    related: ["cloud-high-availability", "advanced-cloud-security"],
    metadata: {
      phase: "cloud-architecture",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 23 — HYBRID / MULTI-CLOUD
  // ============================================================

  node({
    id: "hybrid-cloud",
    title: "Hybrid Cloud",
    category: "architecture",
    importance: "medium",
    description:
      "Understand architectures connecting cloud infrastructure with on-premises systems.",
    whyItMatters:
      "Many enterprises cannot move every workload entirely to public cloud.",
    prerequisites: ["cloud-deployment-models", "cloud-networking"],
    enables: ["cloud-platform-engineering"],
    alternatives: [],
    related: ["multi-cloud"],
    metadata: {
      phase: "multi-cloud-and-hybrid-cloud",
      optional: true,
    },
  }),

  node({
    id: "multi-cloud",
    title: "Multi-Cloud Architecture",
    category: "architecture",
    importance: "medium",
    description:
      "Understand why organizations may operate workloads across multiple cloud providers.",
    whyItMatters:
      "Multi-cloud introduces portability, operational and networking trade-offs.",
    prerequisites: ["cloud-deployment-models", "cloud-architecture"],
    enables: ["cloud-platform-engineering"],
    alternatives: [],
    related: ["hybrid-cloud"],
    metadata: {
      phase: "multi-cloud-and-hybrid-cloud",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 24 — PLATFORM ENGINEERING
  // ============================================================

  node({
    id: "cloud-platform-engineering",
    title: "Cloud Platform Engineering",
    category: "platform",
    importance: "critical",
    description:
      "Build reusable infrastructure, deployment workflows, security standards and developer platforms.",
    whyItMatters:
      "At scale, cloud engineering evolves from managing individual resources to building platforms for other engineers.",
    prerequisites: [
      "terraform-production",
      "cloud-deployment-automation",
      "kubernetes-production",
      "advanced-cloud-security",
      "cloud-architecture",
    ],
    enables: ["internal-developer-platforms", "gitops"],
    alternatives: [],
    related: ["cloud-architecture"],
    metadata: {
      phase: "advanced-cloud-platform-engineering",
      primary: true,
    },
  }),

  node({
    id: "internal-developer-platforms",
    title: "Internal Developer Platforms",
    category: "platform",
    importance: "high",
    description:
      "Understand self-service infrastructure and standardized developer workflows.",
    whyItMatters:
      "Platform teams reduce cognitive load by providing reusable engineering capabilities.",
    prerequisites: ["cloud-platform-engineering"],
    enables: ["gitops"],
    alternatives: [],
    related: ["terraform-production"],
    metadata: {
      phase: "advanced-cloud-platform-engineering",
      optional: true,
    },
  }),

  node({
    id: "gitops",
    title: "GitOps",
    category: "platform",
    importance: "high",
    description:
      "Manage infrastructure and application deployment through Git as the source of truth.",
    whyItMatters:
      "GitOps provides auditable and repeatable operational workflows for cloud-native platforms.",
    prerequisites: ["cloud-platform-engineering", "ci-cd-pipelines"],
    enables: [],
    alternatives: [],
    related: ["kubernetes-production"],
    metadata: {
      phase: "advanced-cloud-platform-engineering",
      optional: true,
    },
  }),
];

const nodeIds = new Set(cloudEngineerNodes.map((item) => item.id));

for (const item of cloudEngineerNodes) {
  const references = [
    ...(item.prerequisites || []),
    ...(item.enables || []),
    ...(item.alternatives || []),
    ...(item.related || []),
  ];

  for (const reference of references) {
    if (!nodeIds.has(reference)) {
      throw new Error(
        `[Cloud Roadmap] Invalid node reference "${reference}" in node "${item.id}".`,
      );
    }
  }
}

export default cloudEngineerNodes;
export { cloudEngineerNodes };

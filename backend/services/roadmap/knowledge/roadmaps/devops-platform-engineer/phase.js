/**
 * DevOps / Platform Engineer Roadmap
 *
 * Primary path:
 *
 * Linux
 *   ↓
 * Networking
 *   ↓
 * Git
 *   ↓
 * Shell & Automation
 *   ↓
 * Docker
 *   ↓
 * CI/CD
 *   ↓
 * Cloud
 *   ↓
 * Terraform / IaC
 *   ↓
 * Kubernetes
 *   ↓
 * Helm
 *   ↓
 * Observability
 *   ↓
 * Reliability / SRE
 *   ↓
 * Security / DevSecOps
 *   ↓
 * GitOps
 *   ↓
 * Platform Engineering
 *   ↓
 * Advanced DevOps
 *
 * Primary technologies:
 * Linux
 * Docker
 * GitHub Actions
 * AWS
 * Terraform
 * Kubernetes
 * Helm
 * Prometheus
 * Grafana
 * OpenTelemetry
 *
 * Alternatives are awareness/branching paths,
 * not simultaneous mandatory technologies.
 */

const devopsPlatformEngineerPhases = [
  {
    id: "devops-foundation",
    order: 1,
    title: "DevOps & Infrastructure Foundation",
    description:
      "Understand DevOps as an engineering practice connecting development, infrastructure, automation, delivery, operations and reliability.",
    goal: "Build the mental model required to understand why DevOps practices exist.",
    primaryPath: "DevOps fundamentals",
    alternatives: [],
  },

  {
    id: "linux-administration",
    order: 2,
    title: "Linux Administration",
    description:
      "Learn Linux systems, filesystems, processes, users, permissions, services, networking and troubleshooting.",
    goal: "Become comfortable operating Linux servers without depending on a GUI.",
    primaryPath: "Linux",
    alternatives: ["Windows Server awareness"],
  },

  {
    id: "networking-for-devops",
    order: 3,
    title: "Networking for DevOps",
    description:
      "Understand the networking concepts required to deploy, connect, secure and troubleshoot infrastructure.",
    goal: "Understand IP addressing, DNS, TCP/IP, HTTP/HTTPS, ports, routing, firewalls, proxies and load balancing.",
    primaryPath: "TCP/IP + DNS + HTTP/HTTPS",
    alternatives: [],
  },

  {
    id: "git-and-collaboration",
    order: 4,
    title: "Git & Engineering Collaboration",
    description:
      "Learn version control, branching, pull requests, code review and repository workflows.",
    goal: "Make application and infrastructure changes safely and collaboratively.",
    primaryPath: "Git + GitHub",
    alternatives: ["GitLab", "Bitbucket"],
  },

  {
    id: "shell-and-automation",
    order: 5,
    title: "Shell Scripting & Automation",
    description:
      "Automate repetitive operational tasks using shell scripting, environment variables, command-line tools and scheduling.",
    goal: "Replace repetitive manual operations with reliable automation.",
    primaryPath: "Bash",
    alternatives: ["Python automation", "PowerShell"],
  },

  {
    id: "infrastructure-fundamentals",
    order: 6,
    title: "Infrastructure Fundamentals",
    description:
      "Understand servers, virtualization, compute, storage, networking, processes and infrastructure resources.",
    goal: "Understand what is actually being automated before moving to cloud-native infrastructure.",
    primaryPath: "Compute + storage + networking",
    alternatives: [],
  },

  {
    id: "docker-and-containers",
    order: 7,
    title: "Docker & Containerization",
    description:
      "Learn containers, images, Dockerfiles, registries, networking, volumes and production container practices.",
    goal: "Package applications consistently and understand container-based deployment.",
    primaryPath: "Docker",
    alternatives: ["Podman"],
  },

  {
    id: "container-registries",
    order: 8,
    title: "Container Registries & Image Management",
    description:
      "Understand image versioning, registries, image lifecycle and secure image distribution.",
    goal: "Create a reliable path from source code to deployable container images.",
    primaryPath: "Container Registry",
    alternatives: ["Docker Hub", "Amazon ECR", "GitHub Container Registry"],
  },

  {
    id: "ci-cd-foundation",
    order: 9,
    title: "CI/CD Fundamentals",
    description:
      "Understand continuous integration, continuous delivery, continuous deployment, pipelines and release workflows.",
    goal: "Automate software validation and delivery.",
    primaryPath: "CI/CD concepts",
    alternatives: [],
  },

  {
    id: "github-actions",
    order: 10,
    title: "GitHub Actions & Pipeline Engineering",
    description:
      "Build practical CI/CD pipelines for testing, building, packaging and deploying applications.",
    goal: "Create production-style automated delivery workflows.",
    primaryPath: "GitHub Actions",
    alternatives: ["GitLab CI", "Jenkins"],
  },

  {
    id: "cloud-for-devops",
    order: 11,
    title: "Cloud Infrastructure for DevOps",
    description:
      "Understand cloud compute, networking, storage, identity and managed infrastructure from an operations perspective.",
    goal: "Operate workloads in a major cloud provider.",
    primaryPath: "AWS",
    alternatives: ["Azure", "GCP"],
  },

  {
    id: "infrastructure-as-code",
    order: 12,
    title: "Infrastructure as Code",
    description:
      "Define, version, review and provision infrastructure through code.",
    goal: "Make infrastructure reproducible instead of manually configured.",
    primaryPath: "Terraform",
    alternatives: ["AWS CloudFormation", "Pulumi"],
  },

  {
    id: "configuration-management",
    order: 13,
    title: "Configuration Management",
    description:
      "Automate server and application configuration and reduce configuration drift.",
    goal: "Make infrastructure configuration repeatable and predictable.",
    primaryPath: "Ansible awareness",
    alternatives: ["Cloud-init", "Puppet", "Chef"],
  },

  {
    id: "deployment-strategies",
    order: 14,
    title: "Deployment Strategies",
    description:
      "Understand rolling, blue-green, canary, recreate and progressive deployment strategies.",
    goal: "Deploy changes safely while minimizing production risk.",
    primaryPath: "Rolling + blue-green + canary",
    alternatives: [],
  },

  {
    id: "kubernetes-foundation",
    order: 15,
    title: "Kubernetes Foundation",
    description:
      "Learn clusters, nodes, pods, deployments, services and Kubernetes control-plane concepts.",
    goal: "Understand the fundamentals of container orchestration.",
    primaryPath: "Kubernetes",
    alternatives: ["Amazon ECS"],
  },

  {
    id: "kubernetes-production",
    order: 16,
    title: "Production Kubernetes",
    description:
      "Learn Kubernetes networking, configuration, secrets, ingress, storage, scaling and security.",
    goal: "Operate real production workloads on Kubernetes.",
    primaryPath: "Kubernetes",
    alternatives: ["EKS", "AKS", "GKE"],
  },

  {
    id: "helm-and-packaging",
    order: 17,
    title: "Helm & Kubernetes Packaging",
    description:
      "Package, configure and deploy Kubernetes applications using Helm.",
    goal: "Manage reusable Kubernetes application deployments.",
    primaryPath: "Helm",
    alternatives: ["Kustomize"],
  },

  {
    id: "cloud-native-networking",
    order: 18,
    title: "Cloud-Native Networking",
    description:
      "Understand service discovery, ingress, internal networking, load balancing and network policies.",
    goal: "Reason about traffic flow in distributed containerized systems.",
    primaryPath: "Kubernetes networking",
    alternatives: ["Service mesh awareness"],
  },

  {
    id: "observability-foundation",
    order: 19,
    title: "Observability Foundation",
    description:
      "Understand logs, metrics, traces, dashboards, alerting and telemetry pipelines.",
    goal: "Make infrastructure and applications observable in production.",
    primaryPath: "Logs + metrics + traces",
    alternatives: [],
  },

  {
    id: "monitoring-and-metrics",
    order: 20,
    title: "Monitoring & Metrics",
    description:
      "Collect infrastructure and application metrics and create meaningful operational dashboards.",
    goal: "Detect performance degradation and infrastructure problems.",
    primaryPath: "Prometheus + Grafana",
    alternatives: ["CloudWatch", "Datadog"],
  },

  {
    id: "logging",
    order: 21,
    title: "Centralized Logging",
    description:
      "Collect, search, structure and retain logs from distributed applications and infrastructure.",
    goal: "Make production failures diagnosable through centralized logs.",
    primaryPath: "Structured logging + centralized log platform",
    alternatives: ["ELK", "OpenSearch", "Loki"],
  },

  {
    id: "distributed-tracing",
    order: 22,
    title: "Distributed Tracing",
    description:
      "Trace requests across services and infrastructure using standardized telemetry.",
    goal: "Understand latency and failures across distributed systems.",
    primaryPath: "OpenTelemetry",
    alternatives: [],
  },

  {
    id: "reliability-engineering",
    order: 23,
    title: "Reliability Engineering",
    description:
      "Learn health checks, graceful shutdown, retries, timeouts, backoff, circuit breakers, redundancy and failure handling.",
    goal: "Design systems that continue operating intelligently when components fail.",
    primaryPath: "Reliability patterns",
    alternatives: [],
  },

  {
    id: "sre-foundation",
    order: 24,
    title: "SRE Foundations",
    description:
      "Understand SLI, SLO, SLA, error budgets, incident management and reliability-oriented engineering.",
    goal: "Connect infrastructure operations with measurable reliability outcomes.",
    primaryPath: "SRE principles",
    alternatives: [],
  },

  {
    id: "security-and-devsecops",
    order: 25,
    title: "DevSecOps & Infrastructure Security",
    description:
      "Integrate security into source control, CI/CD, containers, infrastructure and cloud operations.",
    goal: "Make security a continuous part of the delivery lifecycle.",
    primaryPath: "DevSecOps",
    alternatives: [],
  },

  {
    id: "secrets-and-identity",
    order: 26,
    title: "Secrets, Identity & Access",
    description:
      "Manage credentials, service identities, permissions, secrets and least-privilege access.",
    goal: "Prevent credential leakage and excessive infrastructure privileges.",
    primaryPath: "Cloud IAM + secret management",
    alternatives: ["Vault"],
  },

  {
    id: "supply-chain-security",
    order: 27,
    title: "Software Supply Chain Security",
    description:
      "Understand dependency scanning, image scanning, SBOMs, signing and software supply-chain risks.",
    goal: "Secure software from source code through production deployment.",
    primaryPath: "SCA + image scanning + SBOM",
    alternatives: [],
  },

  {
    id: "gitops",
    order: 28,
    title: "GitOps",
    description:
      "Use Git as the source of truth for declarative infrastructure and application deployment.",
    goal: "Create auditable and repeatable cloud-native operations.",
    primaryPath: "GitOps",
    alternatives: ["Argo CD", "Flux"],
  },

  {
    id: "platform-engineering-foundation",
    order: 29,
    title: "Platform Engineering",
    description:
      "Build reusable infrastructure capabilities and self-service workflows for development teams.",
    goal: "Move from operating infrastructure manually to building platforms that enable developers.",
    primaryPath: "Platform engineering",
    alternatives: [],
  },

  {
    id: "internal-developer-platforms",
    order: 30,
    title: "Internal Developer Platforms",
    description:
      "Understand self-service environments, golden paths, reusable templates and developer portals.",
    goal: "Reduce developer cognitive load while standardizing infrastructure and delivery.",
    primaryPath: "Internal developer platforms",
    alternatives: ["Backstage awareness"],
  },

  {
    id: "advanced-platform-engineering",
    order: 31,
    title: "Advanced Platform Engineering",
    description:
      "Combine infrastructure automation, Kubernetes, GitOps, observability, security and developer platforms.",
    goal: "Design organization-scale internal infrastructure platforms.",
    primaryPath: "Platform engineering",
    alternatives: [],
  },

  {
    id: "advanced-devops-architecture",
    order: 32,
    title: "Advanced DevOps Architecture",
    description:
      "Connect cloud, infrastructure, delivery, observability, security, reliability and platform engineering into complete production systems.",
    goal: "Design and operate highly automated production engineering environments.",
    primaryPath: "Cloud-native DevOps architecture",
    alternatives: [],
  },
];

export default devopsPlatformEngineerPhases;
export { devopsPlatformEngineerPhases };

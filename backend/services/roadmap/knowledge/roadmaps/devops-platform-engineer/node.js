import { createKnowledgeNode } from "../../factory.js";

const node = (data) => createKnowledgeNode(data);

const devopsPlatformEngineerNodes = [
  // ============================================================
  // PHASE 1 — DEVOPS FOUNDATION
  // ============================================================

  node({
    id: "devops-fundamentals",
    title: "DevOps Fundamentals",
    category: "foundation",
    importance: "critical",
    description:
      "Understand DevOps culture, collaboration, automation, continuous delivery, infrastructure and operations.",
    whyItMatters:
      "DevOps is primarily an engineering approach for reducing friction between development and operations.",
    prerequisites: [],
    enables: [
      "git-version-control",
      "infrastructure-fundamentals",
      "ci-cd-fundamentals",
    ],
    alternatives: [],
    related: ["reliability-engineering"],
    metadata: { phase: "devops-foundation", primary: true },
  }),

  node({
    id: "devops-lifecycle",
    title: "DevOps Lifecycle",
    category: "foundation",
    importance: "high",
    description:
      "Understand plan, code, build, test, release, deploy, operate and monitor as a continuous lifecycle.",
    whyItMatters:
      "The lifecycle provides the mental model for automation and continuous improvement.",
    prerequisites: ["devops-fundamentals"],
    enables: ["ci-cd-fundamentals", "observability-foundation"],
    alternatives: [],
    related: ["gitops"],
    metadata: { phase: "devops-foundation" },
  }),

  // ============================================================
  // PHASE 2 — LINUX
  // ============================================================

  node({
    id: "linux-administration",
    title: "Linux Administration",
    category: "systems",
    importance: "critical",
    description:
      "Learn Linux filesystem, processes, users, permissions, services and system administration.",
    whyItMatters:
      "Linux is the dominant operating-system environment for cloud and DevOps workloads.",
    prerequisites: ["devops-fundamentals"],
    enables: [
      "linux-shell",
      "linux-processes",
      "linux-users-permissions",
      "linux-services",
    ],
    alternatives: ["windows-server-awareness"],
    related: ["infrastructure-fundamentals"],
    metadata: { phase: "linux-administration", primary: true },
  }),

  node({
    id: "linux-shell",
    title: "Linux Shell & CLI",
    category: "systems",
    importance: "critical",
    description:
      "Use the Linux command line to inspect files, processes, networking and system state.",
    whyItMatters: "DevOps work heavily depends on command-line operations.",
    prerequisites: ["linux-administration"],
    enables: ["bash-scripting", "linux-troubleshooting"],
    alternatives: [],
    related: ["configuration-management"],
    metadata: { phase: "linux-administration" },
  }),

  node({
    id: "linux-processes",
    title: "Linux Processes & Resources",
    category: "systems",
    importance: "high",
    description:
      "Understand processes, signals, CPU, memory and resource consumption.",
    whyItMatters:
      "Resource and process problems are common production failure sources.",
    prerequisites: ["linux-administration"],
    enables: ["linux-services", "linux-troubleshooting"],
    alternatives: [],
    related: ["monitoring-and-metrics"],
    metadata: { phase: "linux-administration" },
  }),

  node({
    id: "linux-users-permissions",
    title: "Linux Users, Groups & Permissions",
    category: "security",
    importance: "high",
    description:
      "Understand users, groups, ownership, permissions and privilege boundaries.",
    whyItMatters: "Least privilege starts at the operating-system level.",
    prerequisites: ["linux-administration"],
    enables: ["secrets-and-identity"],
    alternatives: [],
    related: ["devsecops"],
    metadata: { phase: "linux-administration" },
  }),

  node({
    id: "linux-services",
    title: "Linux Services",
    category: "systems",
    importance: "high",
    description:
      "Manage system services, startup behavior, service status and logs.",
    whyItMatters:
      "Cloud servers frequently host long-running application and infrastructure services.",
    prerequisites: ["linux-processes", "linux-users-permissions"],
    enables: ["linux-troubleshooting"],
    alternatives: [],
    related: ["centralized-logging"],
    metadata: { phase: "linux-administration" },
  }),

  node({
    id: "linux-troubleshooting",
    title: "Linux Troubleshooting",
    category: "operations",
    importance: "critical",
    description:
      "Diagnose CPU, memory, disk, process, service and connectivity problems.",
    whyItMatters:
      "Production engineers must diagnose failures rather than simply restart systems.",
    prerequisites: ["linux-shell", "linux-processes", "linux-services"],
    enables: ["observability-foundation"],
    alternatives: [],
    related: ["reliability-engineering"],
    metadata: { phase: "linux-administration" },
  }),

  node({
    id: "bash-scripting",
    title: "Bash Scripting",
    category: "automation",
    importance: "critical",
    description:
      "Automate operational tasks using shell scripts, variables, conditions, loops and command pipelines.",
    whyItMatters:
      "Simple automation is often the first step toward eliminating repetitive manual operations.",
    prerequisites: ["linux-shell"],
    enables: ["automation-fundamentals"],
    alternatives: ["python-automation", "powershell-awareness"],
    related: ["configuration-management"],
    metadata: { phase: "linux-administration", primary: true },
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
    prerequisites: ["devops-fundamentals"],
    enables: [],
    alternatives: ["linux-administration"],
    related: ["secrets-and-identity"],
    metadata: {
      phase: "linux-administration",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 3 — NETWORKING
  // ============================================================

  node({
    id: "networking-fundamentals",
    title: "Networking Fundamentals",
    category: "networking",
    importance: "critical",
    description:
      "Understand IP addressing, subnetting, routing, ports and network communication.",
    whyItMatters:
      "Infrastructure problems frequently become networking problems.",
    prerequisites: ["devops-fundamentals"],
    enables: ["tcp-udp", "dns", "http-https", "firewalls", "load-balancing"],
    alternatives: [],
    related: ["cloud-infrastructure"],
    metadata: { phase: "networking-for-devops", primary: true },
  }),

  node({
    id: "tcp-udp",
    title: "TCP & UDP",
    category: "networking",
    importance: "critical",
    description:
      "Understand transport protocols, ports, connections and delivery behavior.",
    whyItMatters:
      "Cloud services communicate through transport-layer protocols and ports.",
    prerequisites: ["networking-fundamentals"],
    enables: ["firewalls", "http-https"],
    alternatives: [],
    related: ["network-troubleshooting"],
    metadata: { phase: "networking-for-devops" },
  }),

  node({
    id: "dns",
    title: "DNS",
    category: "networking",
    importance: "critical",
    description: "Understand DNS resolution, records, TTL and domain routing.",
    whyItMatters: "Production services depend heavily on DNS.",
    prerequisites: ["networking-fundamentals"],
    enables: ["http-https", "load-balancing"],
    alternatives: [],
    related: ["cloud-infrastructure"],
    metadata: { phase: "networking-for-devops" },
  }),

  node({
    id: "http-https",
    title: "HTTP & HTTPS",
    category: "networking",
    importance: "critical",
    description:
      "Understand HTTP requests, responses, headers, status codes and HTTPS.",
    whyItMatters: "Most modern application delivery happens over HTTP/HTTPS.",
    prerequisites: ["tcp-udp", "dns"],
    enables: ["reverse-proxy", "load-balancing"],
    alternatives: [],
    related: ["tls-certificates"],
    metadata: { phase: "networking-for-devops" },
  }),

  node({
    id: "tls-certificates",
    title: "TLS & Certificates",
    category: "security",
    importance: "high",
    description:
      "Understand TLS encryption, certificates and certificate authorities.",
    whyItMatters: "Production traffic must be protected in transit.",
    prerequisites: ["http-https"],
    enables: ["reverse-proxy", "devsecops"],
    alternatives: [],
    related: ["secrets-and-identity"],
    metadata: { phase: "networking-for-devops" },
  }),

  node({
    id: "firewalls",
    title: "Firewalls & Network Security",
    category: "security",
    importance: "critical",
    description:
      "Understand network access control, firewall rules and traffic restrictions.",
    whyItMatters: "Infrastructure should expose only required network paths.",
    prerequisites: ["networking-fundamentals", "tcp-udp"],
    enables: ["cloud-infrastructure", "secrets-and-identity"],
    alternatives: [],
    related: ["devsecops"],
    metadata: { phase: "networking-for-devops" },
  }),

  node({
    id: "reverse-proxy",
    title: "Reverse Proxy",
    category: "networking",
    importance: "high",
    description:
      "Understand reverse proxies, TLS termination, routing and upstream services.",
    whyItMatters: "Reverse proxies are common production traffic boundaries.",
    prerequisites: ["http-https", "linux-services"],
    enables: ["load-balancing"],
    alternatives: [],
    related: ["tls-certificates"],
    metadata: { phase: "networking-for-devops" },
  }),

  node({
    id: "load-balancing",
    title: "Load Balancing",
    category: "networking",
    importance: "critical",
    description:
      "Distribute incoming traffic across multiple application instances.",
    whyItMatters:
      "Load balancing supports availability and horizontal scaling.",
    prerequisites: ["networking-fundamentals", "reverse-proxy"],
    enables: ["cloud-infrastructure", "deployment-strategies"],
    alternatives: [],
    related: ["reliability-engineering"],
    metadata: { phase: "networking-for-devops" },
  }),

  node({
    id: "network-troubleshooting",
    title: "Network Troubleshooting",
    category: "operations",
    importance: "critical",
    description:
      "Diagnose DNS, connectivity, routing, ports and HTTP communication problems.",
    whyItMatters:
      "Networking failures are among the most common infrastructure incidents.",
    prerequisites: ["tcp-udp", "dns", "http-https"],
    enables: ["observability-foundation"],
    alternatives: [],
    related: ["linux-troubleshooting"],
    metadata: { phase: "networking-for-devops" },
  }),

  // ============================================================
  // PHASE 4 — GIT
  // ============================================================

  node({
    id: "git-version-control",
    title: "Git & Version Control",
    category: "collaboration",
    importance: "critical",
    description:
      "Learn commits, branches, merges, rebases, tags and versioned workflows.",
    whyItMatters:
      "Application and infrastructure changes must be version controlled.",
    prerequisites: ["devops-fundamentals"],
    enables: [
      "git-collaboration",
      "ci-cd-fundamentals",
      "infrastructure-as-code",
    ],
    alternatives: [],
    related: ["gitops"],
    metadata: { phase: "git-and-collaboration", primary: true },
  }),

  node({
    id: "git-collaboration",
    title: "Git Collaboration & Code Review",
    category: "collaboration",
    importance: "high",
    description:
      "Understand pull requests, branches, code reviews and protected branches.",
    whyItMatters: "Production changes should be reviewable and auditable.",
    prerequisites: ["git-version-control"],
    enables: ["ci-cd-fundamentals"],
    alternatives: [],
    related: ["gitops"],
    metadata: { phase: "git-and-collaboration" },
  }),

  node({
    id: "git-release-management",
    title: "Git Tags & Release Management",
    category: "delivery",
    importance: "high",
    description:
      "Use tags, release versions and commit history to manage software releases.",
    whyItMatters: "Reliable deployments need identifiable software versions.",
    prerequisites: ["git-version-control"],
    enables: ["deployment-strategies"],
    alternatives: [],
    related: ["ci-cd-pipelines"],
    metadata: { phase: "git-and-collaboration" },
  }),

  // ============================================================
  // PHASE 5 — AUTOMATION
  // ============================================================

  node({
    id: "automation-fundamentals",
    title: "Automation Fundamentals",
    category: "automation",
    importance: "critical",
    description:
      "Understand idempotence, repeatability, automation boundaries and operational scripting.",
    whyItMatters: "Good DevOps automation is predictable and repeatable.",
    prerequisites: ["bash-scripting", "git-version-control"],
    enables: ["configuration-management", "infrastructure-as-code"],
    alternatives: [],
    related: ["ci-cd-fundamentals"],
    metadata: { phase: "shell-and-automation" },
  }),

  node({
    id: "python-automation",
    title: "Python Automation Awareness",
    category: "automation",
    importance: "medium",
    description:
      "Use Python for automation when shell scripting becomes insufficient.",
    whyItMatters: "Python is useful for complex operational tooling and APIs.",
    prerequisites: ["automation-fundamentals"],
    enables: [],
    alternatives: ["bash-scripting"],
    related: ["configuration-management"],
    metadata: {
      phase: "shell-and-automation",
      optional: true,
    },
  }),

  node({
    id: "powershell-awareness",
    title: "PowerShell Awareness",
    category: "automation",
    importance: "low",
    description:
      "Understand PowerShell as an automation environment for Microsoft systems.",
    whyItMatters:
      "PowerShell is relevant in Windows-heavy infrastructure environments.",
    prerequisites: ["automation-fundamentals"],
    enables: [],
    alternatives: ["bash-scripting"],
    related: ["windows-server-awareness"],
    metadata: {
      phase: "shell-and-automation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 6 — INFRASTRUCTURE
  // ============================================================

  node({
    id: "infrastructure-fundamentals",
    title: "Infrastructure Fundamentals",
    category: "infrastructure",
    importance: "critical",
    description:
      "Understand compute, memory, storage, networking, virtualization and infrastructure resources.",
    whyItMatters:
      "Automation makes little sense without understanding what is being automated.",
    prerequisites: ["linux-administration", "networking-fundamentals"],
    enables: ["cloud-infrastructure", "virtualization"],
    alternatives: [],
    related: ["infrastructure-as-code"],
    metadata: { phase: "infrastructure-fundamentals" },
  }),

  node({
    id: "virtualization",
    title: "Virtualization Fundamentals",
    category: "infrastructure",
    importance: "high",
    description:
      "Understand virtual machines, hypervisors and resource abstraction.",
    whyItMatters:
      "Virtualization is foundational to many infrastructure platforms.",
    prerequisites: ["infrastructure-fundamentals"],
    enables: ["cloud-infrastructure"],
    alternatives: [],
    related: ["containers"],
    metadata: { phase: "infrastructure-fundamentals" },
  }),

  node({
    id: "cloud-infrastructure",
    title: "Cloud Infrastructure",
    category: "cloud",
    importance: "critical",
    description:
      "Understand cloud compute, networking, storage, identity and managed infrastructure.",
    whyItMatters:
      "Modern DevOps commonly operates workloads in cloud environments.",
    prerequisites: ["infrastructure-fundamentals", "networking-fundamentals"],
    enables: ["cloud-compute", "cloud-networking", "cloud-identity"],
    alternatives: ["aws", "azure", "gcp"],
    related: ["infrastructure-as-code"],
    metadata: { phase: "cloud-for-devops", primary: true },
  }),

  node({
    id: "aws",
    title: "AWS for DevOps",
    category: "cloud",
    importance: "critical",
    description:
      "Use AWS infrastructure services for production DevOps workflows.",
    whyItMatters: "AWS is the primary cloud implementation path.",
    prerequisites: ["cloud-infrastructure"],
    enables: ["cloud-compute", "cloud-networking", "cloud-identity"],
    alternatives: ["azure", "gcp"],
    related: ["infrastructure-as-code"],
    metadata: { phase: "cloud-for-devops", primary: true },
  }),

  node({
    id: "azure",
    title: "Azure for DevOps Awareness",
    category: "cloud",
    importance: "medium",
    description: "Understand Azure infrastructure and DevOps concepts.",
    whyItMatters: "Azure is widely used in enterprise environments.",
    prerequisites: ["cloud-infrastructure"],
    enables: [],
    alternatives: ["aws", "gcp"],
    related: ["cloud-identity"],
    metadata: {
      phase: "cloud-for-devops",
      optional: true,
    },
  }),

  node({
    id: "gcp",
    title: "Google Cloud for DevOps Awareness",
    category: "cloud",
    importance: "medium",
    description: "Understand GCP infrastructure and cloud-native operations.",
    whyItMatters: "GCP is important for cloud-native, data and AI workloads.",
    prerequisites: ["cloud-infrastructure"],
    enables: [],
    alternatives: ["aws", "azure"],
    related: ["cloud-compute"],
    metadata: {
      phase: "cloud-for-devops",
      optional: true,
    },
  }),

  node({
    id: "cloud-compute",
    title: "Cloud Compute",
    category: "cloud",
    importance: "critical",
    description:
      "Understand virtual machines, managed containers and serverless compute.",
    whyItMatters: "Compute services execute production workloads.",
    prerequisites: ["aws"],
    enables: ["containers"],
    alternatives: [],
    related: ["deployment-strategies"],
    metadata: { phase: "cloud-for-devops" },
  }),

  node({
    id: "cloud-networking",
    title: "Cloud Networking",
    category: "cloud",
    importance: "critical",
    description:
      "Understand virtual networks, subnets, routes, gateways and security boundaries.",
    whyItMatters: "Production workloads require controlled cloud networking.",
    prerequisites: ["aws", "networking-fundamentals"],
    enables: ["cloud-identity"],
    alternatives: [],
    related: ["firewalls"],
    metadata: { phase: "cloud-for-devops" },
  }),

  node({
    id: "cloud-identity",
    title: "Cloud Identity & Access",
    category: "security",
    importance: "critical",
    description:
      "Understand cloud identities, roles, policies and least privilege.",
    whyItMatters: "Infrastructure access must be controlled and auditable.",
    prerequisites: ["aws", "cloud-networking"],
    enables: ["secrets-and-identity", "devsecops"],
    alternatives: [],
    related: ["infrastructure-as-code"],
    metadata: { phase: "cloud-for-devops" },
  }),

  // ============================================================
  // PHASE 7 — DOCKER
  // ============================================================

  node({
    id: "containers",
    title: "Container Fundamentals",
    category: "containers",
    importance: "critical",
    description:
      "Understand containers, isolation, images and container lifecycle.",
    whyItMatters: "Containers provide a consistent deployment unit.",
    prerequisites: ["linux-administration", "infrastructure-fundamentals"],
    enables: ["docker"],
    alternatives: [],
    related: ["virtualization"],
    metadata: { phase: "docker-and-containers" },
  }),

  node({
    id: "docker",
    title: "Docker",
    category: "containers",
    importance: "critical",
    description:
      "Learn Dockerfiles, images, containers, networking, volumes and registries.",
    whyItMatters: "Docker is the primary container implementation path.",
    prerequisites: ["containers", "bash-scripting"],
    enables: [
      "docker-images",
      "docker-networking",
      "docker-compose",
      "container-registries",
    ],
    alternatives: ["podman"],
    related: ["kubernetes"],
    metadata: { phase: "docker-and-containers", primary: true },
  }),

  node({
    id: "docker-images",
    title: "Docker Images & Dockerfiles",
    category: "containers",
    importance: "critical",
    description: "Build efficient and reproducible container images.",
    whyItMatters: "Production deployment pipelines depend on reliable images.",
    prerequisites: ["docker"],
    enables: ["container-registries", "container-security"],
    alternatives: [],
    related: ["ci-cd-pipelines"],
    metadata: { phase: "docker-and-containers" },
  }),

  node({
    id: "docker-networking",
    title: "Docker Networking",
    category: "networking",
    importance: "high",
    description:
      "Understand container networks and service-to-service communication.",
    whyItMatters:
      "Containerized applications frequently consist of multiple services.",
    prerequisites: ["docker"],
    enables: ["docker-compose"],
    alternatives: [],
    related: ["kubernetes-networking"],
    metadata: { phase: "docker-and-containers" },
  }),

  node({
    id: "docker-compose",
    title: "Docker Compose",
    category: "containers",
    importance: "high",
    description:
      "Run multi-container application stacks locally and in development environments.",
    whyItMatters:
      "Compose simplifies local development for distributed applications.",
    prerequisites: ["docker", "docker-networking"],
    enables: ["kubernetes"],
    alternatives: [],
    related: ["container-registries"],
    metadata: { phase: "docker-and-containers" },
  }),

  node({
    id: "container-registries",
    title: "Container Registries",
    category: "containers",
    importance: "critical",
    description: "Store, version and distribute container images.",
    whyItMatters: "CI/CD systems need a reliable image distribution mechanism.",
    prerequisites: ["docker-images"],
    enables: ["ci-cd-pipelines", "kubernetes"],
    alternatives: [],
    related: ["container-security"],
    metadata: { phase: "container-registries" },
  }),

  node({
    id: "podman",
    title: "Podman Awareness",
    category: "containers",
    importance: "low",
    description: "Understand Podman as an alternative container engine.",
    whyItMatters: "Some environments prefer daemonless container tooling.",
    prerequisites: ["containers"],
    enables: [],
    alternatives: ["docker"],
    related: ["container-security"],
    metadata: {
      phase: "docker-and-containers",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 8 — CI/CD FOUNDATION
  // ============================================================

  node({
    id: "ci-cd-fundamentals",
    title: "CI/CD Fundamentals",
    category: "delivery",
    importance: "critical",
    description:
      "Understand continuous integration, delivery, deployment, pipelines and release automation.",
    whyItMatters:
      "Automation is the bridge between source code and reliable production delivery.",
    prerequisites: ["git-collaboration", "devops-lifecycle"],
    enables: ["ci-cd-pipelines", "github-actions"],
    alternatives: [],
    related: ["deployment-strategies"],
    metadata: { phase: "ci-cd-foundation" },
  }),

  node({
    id: "ci-cd-pipelines",
    title: "CI/CD Pipeline Engineering",
    category: "delivery",
    importance: "critical",
    description:
      "Design pipelines for validation, testing, building, packaging and deployment.",
    whyItMatters:
      "Production pipelines should be repeatable, observable and secure.",
    prerequisites: ["ci-cd-fundamentals", "container-registries"],
    enables: ["github-actions", "deployment-strategies"],
    alternatives: ["gitlab-ci", "jenkins"],
    related: ["devsecops"],
    metadata: { phase: "ci-cd-foundation" },
  }),

  // ============================================================
  // PHASE 9 — GITHUB ACTIONS
  // ============================================================

  node({
    id: "github-actions",
    title: "GitHub Actions",
    category: "delivery",
    importance: "critical",
    description: "Build CI/CD workflows using GitHub Actions.",
    whyItMatters:
      "GitHub Actions provides a practical primary automation path.",
    prerequisites: ["ci-cd-pipelines"],
    enables: ["deployment-automation"],
    alternatives: ["gitlab-ci", "jenkins"],
    related: ["secrets-and-identity"],
    metadata: {
      phase: "github-actions",
      primary: true,
    },
  }),

  node({
    id: "deployment-automation",
    title: "Deployment Automation",
    category: "delivery",
    importance: "critical",
    description:
      "Automate application deployments into cloud and container environments.",
    whyItMatters:
      "Manual deployments create operational risk and inconsistency.",
    prerequisites: ["github-actions", "deployment-strategies"],
    enables: ["gitops"],
    alternatives: [],
    related: ["infrastructure-as-code"],
    metadata: { phase: "github-actions" },
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
    related: ["deployment-automation"],
    metadata: {
      phase: "github-actions",
      optional: true,
    },
  }),

  node({
    id: "jenkins",
    title: "Jenkins Awareness",
    category: "delivery",
    importance: "medium",
    description:
      "Understand Jenkins pipelines and its role in enterprise automation.",
    whyItMatters: "Jenkins remains common in established organizations.",
    prerequisites: ["ci-cd-pipelines"],
    enables: [],
    alternatives: ["github-actions"],
    related: ["deployment-automation"],
    metadata: {
      phase: "github-actions",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 10 — CLOUD CONTINUATION
  // ============================================================

  node({
    id: "cloud-deployment",
    title: "Cloud Deployment Fundamentals",
    category: "cloud",
    importance: "critical",
    description:
      "Deploy application workloads to cloud compute, networking and storage infrastructure.",
    whyItMatters:
      "DevOps engineers must connect CI/CD systems with real infrastructure.",
    prerequisites: [
      "cloud-compute",
      "cloud-networking",
      "deployment-automation",
    ],
    enables: ["infrastructure-as-code"],
    alternatives: [],
    related: ["deployment-strategies"],
    metadata: { phase: "cloud-for-devops" },
  }),

  // ============================================================
  // PHASE 11 — IaC
  // ============================================================

  node({
    id: "infrastructure-as-code",
    title: "Infrastructure as Code",
    category: "iac",
    importance: "critical",
    description:
      "Define infrastructure declaratively, version it and provision it reproducibly.",
    whyItMatters:
      "Infrastructure should be reviewable and reproducible like application code.",
    prerequisites: [
      "automation-fundamentals",
      "git-version-control",
      "cloud-deployment",
    ],
    enables: ["terraform", "terraform-state", "terraform-modules"],
    alternatives: ["cloudformation", "pulumi"],
    related: ["gitops"],
    metadata: {
      phase: "infrastructure-as-code",
      primary: true,
    },
  }),

  node({
    id: "terraform",
    title: "Terraform",
    category: "iac",
    importance: "critical",
    description: "Provision and manage infrastructure using Terraform.",
    whyItMatters:
      "Terraform is the primary infrastructure-as-code implementation path.",
    prerequisites: ["infrastructure-as-code"],
    enables: ["terraform-state", "terraform-modules", "terraform-production"],
    alternatives: ["cloudformation", "pulumi"],
    related: ["cloud-infrastructure"],
    metadata: {
      phase: "infrastructure-as-code",
      primary: true,
    },
  }),

  node({
    id: "terraform-state",
    title: "Terraform State",
    category: "iac",
    importance: "critical",
    description:
      "Understand state, remote state, locking and infrastructure lifecycle tracking.",
    whyItMatters: "Terraform uses state to understand managed infrastructure.",
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
    description: "Build reusable Terraform modules and environment structures.",
    whyItMatters: "Reusable infrastructure components reduce duplication.",
    prerequisites: ["terraform"],
    enables: ["terraform-production"],
    alternatives: [],
    related: ["platform-engineering"],
    metadata: { phase: "infrastructure-as-code" },
  }),

  node({
    id: "terraform-production",
    title: "Production Terraform",
    category: "iac",
    importance: "critical",
    description:
      "Use remote state, safe plans, reviews, reusable modules and controlled infrastructure changes.",
    whyItMatters:
      "Production IaC requires governance and safe change management.",
    prerequisites: ["terraform-state", "terraform-modules"],
    enables: ["platform-engineering"],
    alternatives: [],
    related: ["gitops"],
    metadata: { phase: "infrastructure-as-code" },
  }),

  node({
    id: "cloudformation",
    title: "AWS CloudFormation Awareness",
    category: "iac",
    importance: "medium",
    description: "Understand AWS-native infrastructure as code.",
    whyItMatters: "CloudFormation is useful in AWS-native environments.",
    prerequisites: ["infrastructure-as-code"],
    enables: [],
    alternatives: ["terraform"],
    related: ["terraform-production"],
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
    whyItMatters: "Pulumi is an alternative IaC model.",
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
  // PHASE 12 — CONFIGURATION MANAGEMENT
  // ============================================================

  node({
    id: "configuration-management",
    title: "Configuration Management",
    category: "automation",
    importance: "high",
    description:
      "Automate server and application configuration while minimizing configuration drift.",
    whyItMatters:
      "Infrastructure should behave consistently across environments.",
    prerequisites: ["automation-fundamentals", "linux-administration"],
    enables: ["ansible"],
    alternatives: [],
    related: ["infrastructure-as-code"],
    metadata: { phase: "configuration-management" },
  }),

  node({
    id: "ansible",
    title: "Ansible Awareness",
    category: "automation",
    importance: "medium",
    description: "Understand agentless configuration management with Ansible.",
    whyItMatters:
      "Ansible remains useful for server configuration and operational automation.",
    prerequisites: ["configuration-management"],
    enables: ["platform-engineering"],
    alternatives: ["terraform"],
    related: ["configuration-management"],
    metadata: {
      phase: "configuration-management",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 13 — DEPLOYMENT STRATEGIES
  // ============================================================

  node({
    id: "deployment-strategies",
    title: "Deployment Strategies",
    category: "delivery",
    importance: "critical",
    description:
      "Understand rolling, blue-green, canary, recreate and progressive deployment strategies.",
    whyItMatters:
      "Deployment strategy controls production risk during releases.",
    prerequisites: [
      "git-release-management",
      "load-balancing",
      "ci-cd-pipelines",
    ],
    enables: ["reliability-engineering"],
    alternatives: [],
    related: ["deployment-automation"],
    metadata: { phase: "deployment-strategies" },
  }),

  node({
    id: "rolling-deployments",
    title: "Rolling Deployments",
    category: "delivery",
    importance: "high",
    description:
      "Gradually replace old application instances with new versions.",
    whyItMatters: "Rolling deployments reduce the need for full downtime.",
    prerequisites: ["deployment-strategies"],
    enables: ["kubernetes-production"],
    alternatives: [],
    related: ["reliability-engineering"],
    metadata: { phase: "deployment-strategies" },
  }),

  node({
    id: "blue-green-deployments",
    title: "Blue-Green Deployments",
    category: "delivery",
    importance: "high",
    description:
      "Maintain separate old and new environments and switch traffic between them.",
    whyItMatters: "Blue-green deployments can simplify rollback.",
    prerequisites: ["deployment-strategies"],
    enables: ["reliability-engineering"],
    alternatives: [],
    related: ["load-balancing"],
    metadata: { phase: "deployment-strategies" },
  }),

  node({
    id: "canary-deployments",
    title: "Canary Deployments",
    category: "delivery",
    importance: "high",
    description:
      "Release changes to a small percentage of traffic before wider rollout.",
    whyItMatters: "Canary releases reduce blast radius for risky changes.",
    prerequisites: ["deployment-strategies"],
    enables: ["reliability-engineering"],
    alternatives: [],
    related: ["observability-foundation"],
    metadata: { phase: "deployment-strategies" },
  }),

  // ============================================================
  // PHASE 14 — KUBERNETES
  // ============================================================

  node({
    id: "kubernetes",
    title: "Kubernetes Fundamentals",
    category: "orchestration",
    importance: "critical",
    description: "Understand clusters, nodes, pods, deployments and services.",
    whyItMatters:
      "Kubernetes is a major platform for operating containers at scale.",
    prerequisites: ["docker", "container-registries", "cloud-infrastructure"],
    enables: [
      "kubernetes-workloads",
      "kubernetes-services",
      "kubernetes-networking",
    ],
    alternatives: ["ecs"],
    related: ["kubernetes-production"],
    metadata: {
      phase: "kubernetes-foundation",
      primary: true,
    },
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
    metadata: { phase: "kubernetes-foundation" },
  }),

  node({
    id: "kubernetes-services",
    title: "Kubernetes Services",
    category: "orchestration",
    importance: "critical",
    description: "Expose and discover Kubernetes workloads.",
    whyItMatters: "Distributed applications require stable service discovery.",
    prerequisites: ["kubernetes-workloads"],
    enables: ["kubernetes-networking", "kubernetes-ingress"],
    alternatives: [],
    related: ["cloud-native-networking"],
    metadata: { phase: "kubernetes-foundation" },
  }),

  node({
    id: "kubernetes-networking",
    title: "Kubernetes Networking",
    category: "networking",
    importance: "critical",
    description:
      "Understand pod networking, service networking, DNS and traffic flow.",
    whyItMatters:
      "Networking is one of the hardest operational areas in Kubernetes.",
    prerequisites: ["kubernetes-services", "docker-networking"],
    enables: ["kubernetes-ingress", "cloud-native-networking"],
    alternatives: [],
    related: ["networking-fundamentals"],
    metadata: { phase: "kubernetes-production" },
  }),

  node({
    id: "kubernetes-ingress",
    title: "Kubernetes Ingress",
    category: "networking",
    importance: "high",
    description: "Route external HTTP/HTTPS traffic into Kubernetes workloads.",
    whyItMatters: "Ingress provides an application-level traffic entry point.",
    prerequisites: ["kubernetes-networking"],
    enables: ["kubernetes-production"],
    alternatives: [],
    related: ["load-balancing"],
    metadata: { phase: "kubernetes-production" },
  }),

  node({
    id: "kubernetes-configuration",
    title: "Kubernetes Configuration & Secrets",
    category: "security",
    importance: "high",
    description:
      "Manage configuration and secrets separately from application images.",
    whyItMatters:
      "Production workloads need controlled configuration management.",
    prerequisites: ["kubernetes-workloads"],
    enables: ["kubernetes-security"],
    alternatives: [],
    related: ["secrets-and-identity"],
    metadata: { phase: "kubernetes-production" },
  }),

  node({
    id: "kubernetes-security",
    title: "Kubernetes Security",
    category: "security",
    importance: "critical",
    description:
      "Understand RBAC, service accounts, secrets, pod security and network policies.",
    whyItMatters:
      "Kubernetes provides powerful infrastructure control and must be secured carefully.",
    prerequisites: [
      "kubernetes-configuration",
      "container-security",
      "cloud-identity",
    ],
    enables: ["kubernetes-production", "devsecops"],
    alternatives: [],
    related: ["secrets-and-identity"],
    metadata: { phase: "kubernetes-production" },
  }),

  node({
    id: "kubernetes-scaling",
    title: "Kubernetes Scaling",
    category: "orchestration",
    importance: "high",
    description: "Understand workload scaling and cluster capacity.",
    whyItMatters: "Container platforms must adapt to changing demand.",
    prerequisites: ["kubernetes-workloads"],
    enables: ["kubernetes-production"],
    alternatives: [],
    related: ["monitoring-and-metrics"],
    metadata: { phase: "kubernetes-production" },
  }),

  node({
    id: "kubernetes-production",
    title: "Production Kubernetes",
    category: "orchestration",
    importance: "critical",
    description:
      "Combine workloads, networking, ingress, security, scaling and observability.",
    whyItMatters:
      "Production Kubernetes requires operational knowledge beyond basic kubectl commands.",
    prerequisites: [
      "kubernetes-ingress",
      "kubernetes-security",
      "kubernetes-scaling",
    ],
    enables: ["helm"],
    alternatives: ["eks", "aks", "gke"],
    related: ["observability-foundation"],
    metadata: {
      phase: "kubernetes-production",
      primary: true,
    },
  }),

  node({
    id: "ecs",
    title: "Amazon ECS Awareness",
    category: "orchestration",
    importance: "medium",
    description: "Understand AWS-native container orchestration using ECS.",
    whyItMatters: "ECS can be simpler than Kubernetes for some AWS workloads.",
    prerequisites: ["docker", "aws"],
    enables: [],
    alternatives: ["kubernetes"],
    related: ["cloud-deployment"],
    metadata: {
      phase: "kubernetes-foundation",
      optional: true,
    },
  }),

  node({
    id: "eks",
    title: "Amazon EKS Awareness",
    category: "orchestration",
    importance: "medium",
    description: "Understand managed Kubernetes on AWS.",
    whyItMatters: "EKS connects Kubernetes with AWS-managed infrastructure.",
    prerequisites: ["kubernetes-production", "aws"],
    enables: ["helm"],
    alternatives: ["kubernetes"],
    related: ["cloud-networking"],
    metadata: {
      phase: "kubernetes-production",
      optional: true,
    },
  }),

  node({
    id: "aks",
    title: "Azure Kubernetes Service Awareness",
    category: "orchestration",
    importance: "low",
    description: "Understand managed Kubernetes on Azure.",
    whyItMatters: "AKS is relevant in Azure enterprise environments.",
    prerequisites: ["kubernetes-production", "azure"],
    enables: [],
    alternatives: ["eks", "gke"],
    related: ["kubernetes"],
    metadata: {
      phase: "kubernetes-production",
      optional: true,
    },
  }),

  node({
    id: "gke",
    title: "Google Kubernetes Engine Awareness",
    category: "orchestration",
    importance: "low",
    description: "Understand managed Kubernetes on Google Cloud.",
    whyItMatters: "GKE is a major managed Kubernetes platform.",
    prerequisites: ["kubernetes-production", "gcp"],
    enables: [],
    alternatives: ["eks", "aks"],
    related: ["kubernetes"],
    metadata: {
      phase: "kubernetes-production",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 15 — HELM
  // ============================================================

  node({
    id: "helm",
    title: "Helm",
    category: "kubernetes",
    importance: "high",
    description:
      "Package, configure and deploy Kubernetes applications using Helm charts.",
    whyItMatters:
      "Helm provides reusable packaging for Kubernetes applications.",
    prerequisites: ["kubernetes-production"],
    enables: ["helm-production"],
    alternatives: ["kustomize"],
    related: ["gitops"],
    metadata: {
      phase: "helm-and-packaging",
      primary: true,
    },
  }),

  node({
    id: "helm-production",
    title: "Production Helm",
    category: "kubernetes",
    importance: "high",
    description:
      "Manage reusable charts, values, environments and controlled Helm releases.",
    whyItMatters:
      "Production Kubernetes needs consistent application packaging.",
    prerequisites: ["helm"],
    enables: ["gitops"],
    alternatives: [],
    related: ["deployment-strategies"],
    metadata: { phase: "helm-and-packaging" },
  }),

  node({
    id: "kustomize",
    title: "Kustomize Awareness",
    category: "kubernetes",
    importance: "medium",
    description: "Understand Kubernetes-native configuration customization.",
    whyItMatters:
      "Kustomize is a common alternative to Helm for configuration management.",
    prerequisites: ["kubernetes-production"],
    enables: [],
    alternatives: ["helm"],
    related: ["gitops"],
    metadata: {
      phase: "helm-and-packaging",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 16 — CLOUD-NATIVE NETWORKING
  // ============================================================

  node({
    id: "cloud-native-networking",
    title: "Cloud-Native Networking",
    category: "networking",
    importance: "critical",
    description:
      "Understand service discovery, ingress, internal traffic, network policies and cloud-native load balancing.",
    whyItMatters:
      "Distributed containerized systems introduce additional networking layers.",
    prerequisites: [
      "kubernetes-networking",
      "kubernetes-ingress",
      "cloud-networking",
    ],
    enables: ["service-mesh-awareness"],
    alternatives: [],
    related: ["kubernetes-security"],
    metadata: { phase: "cloud-native-networking" },
  }),

  node({
    id: "service-mesh-awareness",
    title: "Service Mesh Awareness",
    category: "networking",
    importance: "medium",
    description:
      "Understand service-to-service traffic management, telemetry and security provided by service mesh systems.",
    whyItMatters:
      "Service meshes can solve specific distributed-service networking problems.",
    prerequisites: ["cloud-native-networking"],
    enables: ["advanced-devops-architecture"],
    alternatives: [],
    related: ["distributed-tracing"],
    metadata: {
      phase: "cloud-native-networking",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 17 — OBSERVABILITY
  // ============================================================

  node({
    id: "observability-foundation",
    title: "Observability Fundamentals",
    category: "observability",
    importance: "critical",
    description:
      "Understand logs, metrics, traces, telemetry, dashboards and alerting.",
    whyItMatters:
      "Production systems cannot be operated reliably without visibility.",
    prerequisites: [
      "linux-troubleshooting",
      "network-troubleshooting",
      "devops-lifecycle",
    ],
    enables: [
      "monitoring-and-metrics",
      "centralized-logging",
      "distributed-tracing",
    ],
    alternatives: [],
    related: ["reliability-engineering"],
    metadata: {
      phase: "observability-foundation",
      primary: true,
    },
  }),

  node({
    id: "monitoring-and-metrics",
    title: "Monitoring & Metrics",
    category: "observability",
    importance: "critical",
    description:
      "Collect infrastructure and application metrics and build operational dashboards.",
    whyItMatters:
      "Metrics expose system health, performance and capacity trends.",
    prerequisites: ["observability-foundation"],
    enables: ["alerting"],
    alternatives: ["cloudwatch", "datadog"],
    related: ["sre-foundation"],
    metadata: { phase: "monitoring-and-metrics", primary: true },
  }),

  node({
    id: "centralized-logging",
    title: "Centralized Logging",
    category: "observability",
    importance: "critical",
    description:
      "Collect, structure, search and retain logs across distributed systems.",
    whyItMatters:
      "Centralized logs are essential for debugging production failures.",
    prerequisites: ["observability-foundation"],
    enables: ["alerting"],
    alternatives: ["elk", "opensearch", "loki"],
    related: ["distributed-tracing"],
    metadata: { phase: "logging" },
  }),

  node({
    id: "distributed-tracing",
    title: "Distributed Tracing",
    category: "observability",
    importance: "high",
    description:
      "Trace requests across multiple services and infrastructure components.",
    whyItMatters:
      "Tracing helps identify latency and failures across distributed boundaries.",
    prerequisites: ["observability-foundation"],
    enables: ["alerting"],
    alternatives: [],
    related: ["service-mesh-awareness"],
    metadata: { phase: "distributed-tracing" },
  }),

  node({
    id: "alerting",
    title: "Monitoring & Alerting",
    category: "observability",
    importance: "critical",
    description:
      "Create actionable alerts based on system health and service behavior.",
    whyItMatters:
      "Monitoring without actionable alerts does not provide operational protection.",
    prerequisites: [
      "monitoring-and-metrics",
      "centralized-logging",
      "distributed-tracing",
    ],
    enables: ["reliability-engineering", "incident-management"],
    alternatives: [],
    related: ["sre-foundation"],
    metadata: { phase: "observability-foundation" },
  }),

  node({
    id: "cloudwatch",
    title: "CloudWatch Awareness",
    category: "observability",
    importance: "medium",
    description: "Understand AWS-native metrics, logs and alarms.",
    whyItMatters: "CloudWatch is useful when operating AWS workloads.",
    prerequisites: ["monitoring-and-metrics", "aws"],
    enables: [],
    alternatives: ["prometheus", "datadog"],
    related: ["centralized-logging"],
    metadata: {
      phase: "monitoring-and-metrics",
      optional: true,
    },
  }),

  node({
    id: "prometheus",
    title: "Prometheus",
    category: "observability",
    importance: "high",
    description:
      "Understand metrics collection and monitoring with Prometheus.",
    whyItMatters: "Prometheus is widely used in cloud-native environments.",
    prerequisites: ["monitoring-and-metrics"],
    enables: ["grafana"],
    alternatives: ["cloudwatch"],
    related: ["kubernetes-production"],
    metadata: {
      phase: "monitoring-and-metrics",
      primary: true,
    },
  }),

  node({
    id: "grafana",
    title: "Grafana",
    category: "observability",
    importance: "high",
    description: "Build dashboards and visualize operational metrics.",
    whyItMatters:
      "Dashboards help engineers understand system behavior and trends.",
    prerequisites: ["prometheus"],
    enables: ["alerting"],
    alternatives: [],
    related: ["sre-foundation"],
    metadata: {
      phase: "monitoring-and-metrics",
      primary: true,
    },
  }),

  node({
    id: "datadog",
    title: "Datadog Awareness",
    category: "observability",
    importance: "medium",
    description: "Understand an integrated commercial observability platform.",
    whyItMatters:
      "Commercial observability platforms are common in production organizations.",
    prerequisites: ["monitoring-and-metrics"],
    enables: [],
    alternatives: ["prometheus"],
    related: ["alerting"],
    metadata: {
      phase: "monitoring-and-metrics",
      optional: true,
    },
  }),

  node({
    id: "elk",
    title: "ELK Stack Awareness",
    category: "observability",
    importance: "medium",
    description:
      "Understand centralized logging using Elasticsearch, Logstash and Kibana concepts.",
    whyItMatters: "ELK remains a common logging architecture.",
    prerequisites: ["centralized-logging"],
    enables: [],
    alternatives: ["loki"],
    related: ["monitoring-and-metrics"],
    metadata: {
      phase: "logging",
      optional: true,
    },
  }),

  node({
    id: "opensearch",
    title: "OpenSearch Awareness",
    category: "observability",
    importance: "low",
    description: "Understand OpenSearch-based log search and analytics.",
    whyItMatters: "OpenSearch is an alternative search and analytics stack.",
    prerequisites: ["centralized-logging"],
    enables: [],
    alternatives: ["elk"],
    related: [],
    metadata: {
      phase: "logging",
      optional: true,
    },
  }),

  node({
    id: "loki",
    title: "Loki Awareness",
    category: "observability",
    importance: "medium",
    description:
      "Understand lightweight log aggregation integrated with Grafana.",
    whyItMatters: "Loki is useful for Kubernetes-centric logging environments.",
    prerequisites: ["centralized-logging", "grafana"],
    enables: [],
    alternatives: ["elk"],
    related: ["kubernetes-production"],
    metadata: {
      phase: "logging",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 18 — RELIABILITY
  // ============================================================

  node({
    id: "reliability-engineering",
    title: "Reliability Engineering",
    category: "reliability",
    importance: "critical",
    description:
      "Design systems that tolerate failures using timeouts, retries, backoff, health checks and redundancy.",
    whyItMatters:
      "Production engineering is about handling failure, not only happy paths.",
    prerequisites: [
      "deployment-strategies",
      "alerting",
      "cloud-infrastructure",
    ],
    enables: ["sre-foundation", "incident-management"],
    alternatives: [],
    related: ["cloud-native-networking"],
    metadata: {
      phase: "reliability-engineering",
      primary: true,
    },
  }),

  node({
    id: "timeouts-retries-backoff",
    title: "Timeouts, Retries & Backoff",
    category: "reliability",
    importance: "critical",
    description:
      "Understand timeouts, retry policies, exponential backoff and retry limits.",
    whyItMatters: "Poor retry behavior can amplify outages.",
    prerequisites: ["reliability-engineering"],
    enables: ["advanced-devops-architecture"],
    alternatives: [],
    related: ["circuit-breaker"],
    metadata: { phase: "reliability-engineering" },
  }),

  node({
    id: "circuit-breaker",
    title: "Circuit Breaker",
    category: "reliability",
    importance: "high",
    description: "Prevent repeatedly calling unhealthy dependencies.",
    whyItMatters: "Circuit breakers reduce cascading failures.",
    prerequisites: ["timeouts-retries-backoff"],
    enables: ["advanced-devops-architecture"],
    alternatives: [],
    related: ["reliability-engineering"],
    metadata: { phase: "reliability-engineering" },
  }),

  node({
    id: "health-checks",
    title: "Health Checks",
    category: "reliability",
    importance: "critical",
    description: "Design liveness, readiness and dependency health checks.",
    whyItMatters:
      "Automated systems need accurate health signals to route traffic and restart workloads.",
    prerequisites: ["reliability-engineering"],
    enables: ["kubernetes-production"],
    alternatives: [],
    related: ["alerting"],
    metadata: { phase: "reliability-engineering" },
  }),

  // ============================================================
  // PHASE 19 — SRE
  // ============================================================

  node({
    id: "sre-foundation",
    title: "SRE Foundations",
    category: "sre",
    importance: "critical",
    description:
      "Understand SLI, SLO, SLA, error budgets and reliability objectives.",
    whyItMatters: "SRE turns reliability into measurable engineering goals.",
    prerequisites: ["reliability-engineering", "monitoring-and-metrics"],
    enables: ["error-budgets", "incident-management"],
    alternatives: [],
    related: ["alerting"],
    metadata: {
      phase: "sre-foundation",
      primary: true,
    },
  }),

  node({
    id: "error-budgets",
    title: "Error Budgets",
    category: "sre",
    importance: "high",
    description:
      "Use error budgets to balance release velocity and reliability.",
    whyItMatters:
      "Error budgets connect operational reliability with engineering decisions.",
    prerequisites: ["sre-foundation"],
    enables: ["advanced-devops-architecture"],
    alternatives: [],
    related: ["deployment-strategies"],
    metadata: { phase: "sre-foundation" },
  }),

  node({
    id: "incident-management",
    title: "Incident Management",
    category: "sre",
    importance: "critical",
    description:
      "Handle incidents through detection, response, mitigation, communication and recovery.",
    whyItMatters:
      "Production reliability depends on disciplined incident response.",
    prerequisites: ["sre-foundation", "alerting"],
    enables: ["postmortems"],
    alternatives: [],
    related: ["reliability-engineering"],
    metadata: { phase: "sre-foundation" },
  }),

  node({
    id: "postmortems",
    title: "Incident Postmortems",
    category: "sre",
    importance: "high",
    description:
      "Analyze incidents without blame and convert failures into engineering improvements.",
    whyItMatters:
      "Organizations improve reliability by learning systematically from failures.",
    prerequisites: ["incident-management"],
    enables: ["advanced-devops-architecture"],
    alternatives: [],
    related: ["error-budgets"],
    metadata: { phase: "sre-foundation" },
  }),

  // ============================================================
  // PHASE 20 — DEVSECOPS
  // ============================================================

  node({
    id: "devsecops",
    title: "DevSecOps Fundamentals",
    category: "security",
    importance: "critical",
    description:
      "Integrate security checks into source control, CI/CD, containers, infrastructure and operations.",
    whyItMatters: "Security should be continuous throughout software delivery.",
    prerequisites: ["ci-cd-pipelines", "container-security", "cloud-identity"],
    enables: [
      "dependency-scanning",
      "secret-scanning",
      "container-scanning",
      "iac-security",
    ],
    alternatives: [],
    related: ["supply-chain-security"],
    metadata: {
      phase: "security-and-devsecops",
      primary: true,
    },
  }),

  node({
    id: "container-security",
    title: "Container Security",
    category: "security",
    importance: "critical",
    description:
      "Understand non-root containers, minimal images, secrets, permissions and image security.",
    whyItMatters: "Containers are part of the production attack surface.",
    prerequisites: ["docker-images", "cloud-identity"],
    enables: ["devsecops", "container-scanning"],
    alternatives: [],
    related: ["kubernetes-security"],
    metadata: { phase: "security-and-devsecops" },
  }),

  node({
    id: "dependency-scanning",
    title: "Dependency Scanning",
    category: "security",
    importance: "high",
    description: "Scan application dependencies for known vulnerabilities.",
    whyItMatters:
      "Third-party dependencies can introduce vulnerabilities into otherwise secure applications.",
    prerequisites: ["devsecops"],
    enables: ["supply-chain-security"],
    alternatives: [],
    related: ["secret-scanning"],
    metadata: { phase: "security-and-devsecops" },
  }),

  node({
    id: "secret-scanning",
    title: "Secret Scanning",
    category: "security",
    importance: "critical",
    description:
      "Detect accidentally committed credentials and sensitive values.",
    whyItMatters:
      "Leaked credentials can provide direct infrastructure access.",
    prerequisites: ["devsecops"],
    enables: ["supply-chain-security"],
    alternatives: [],
    related: ["secrets-and-identity"],
    metadata: { phase: "security-and-devsecops" },
  }),

  node({
    id: "container-scanning",
    title: "Container Image Scanning",
    category: "security",
    importance: "high",
    description: "Scan container images for vulnerabilities before deployment.",
    whyItMatters:
      "Vulnerable base images can propagate security issues into production.",
    prerequisites: ["container-security"],
    enables: ["supply-chain-security"],
    alternatives: [],
    related: ["dependency-scanning"],
    metadata: { phase: "security-and-devsecops" },
  }),

  node({
    id: "iac-security",
    title: "Infrastructure as Code Security",
    category: "security",
    importance: "high",
    description:
      "Scan infrastructure definitions for insecure cloud configurations.",
    whyItMatters: "Infrastructure mistakes can expose entire environments.",
    prerequisites: ["terraform-production", "devsecops"],
    enables: ["supply-chain-security"],
    alternatives: [],
    related: ["cloud-identity"],
    metadata: { phase: "security-and-devsecops" },
  }),

  // ============================================================
  // PHASE 21 — IDENTITY & SECRETS
  // ============================================================

  node({
    id: "secrets-and-identity",
    title: "Secrets & Identity Management",
    category: "security",
    importance: "critical",
    description:
      "Manage credentials, service identities, permissions and secrets securely.",
    whyItMatters: "Credentials should never be hardcoded or broadly shared.",
    prerequisites: ["cloud-identity", "linux-users-permissions"],
    enables: ["secret-management"],
    alternatives: [],
    related: ["devsecops"],
    metadata: {
      phase: "secrets-and-identity",
      primary: true,
    },
  }),

  node({
    id: "secret-management",
    title: "Secret Management",
    category: "security",
    importance: "critical",
    description:
      "Store, rotate and inject secrets securely into applications and infrastructure.",
    whyItMatters: "Centralized secret management reduces credential leakage.",
    prerequisites: ["secrets-and-identity"],
    enables: ["devsecops", "gitops"],
    alternatives: ["vault"],
    related: ["kubernetes-security"],
    metadata: { phase: "secrets-and-identity" },
  }),

  node({
    id: "vault",
    title: "HashiCorp Vault Awareness",
    category: "security",
    importance: "medium",
    description: "Understand centralized secret management using Vault.",
    whyItMatters: "Vault is a common enterprise secret-management alternative.",
    prerequisites: ["secret-management"],
    enables: [],
    alternatives: ["cloud-native-secret-management"],
    related: ["kubernetes-security"],
    metadata: {
      phase: "secrets-and-identity",
      optional: true,
    },
  }),

  node({
    id: "cloud-native-secret-management",
    title: "Cloud-Native Secret Management",
    category: "security",
    importance: "high",
    description: "Use managed cloud secret systems and workload identities.",
    whyItMatters:
      "Managed secret services integrate naturally with cloud workloads.",
    prerequisites: ["secret-management"],
    enables: ["kubernetes-security"],
    alternatives: ["vault"],
    related: ["cloud-identity"],
    metadata: { phase: "secrets-and-identity" },
  }),

  // ============================================================
  // PHASE 22 — SUPPLY CHAIN
  // ============================================================

  node({
    id: "supply-chain-security",
    title: "Software Supply Chain Security",
    category: "security",
    importance: "critical",
    description:
      "Secure source code, dependencies, build artifacts, container images and deployment pipelines.",
    whyItMatters:
      "Modern production systems depend on many external components and build steps.",
    prerequisites: [
      "dependency-scanning",
      "secret-scanning",
      "container-scanning",
      "iac-security",
    ],
    enables: ["advanced-devsecops"],
    alternatives: [],
    related: ["devsecops"],
    metadata: {
      phase: "supply-chain-security",
      primary: true,
    },
  }),

  node({
    id: "advanced-devsecops",
    title: "Advanced DevSecOps",
    category: "security",
    importance: "high",
    description:
      "Integrate security gates, artifact integrity, SBOMs, policy checks and continuous security validation.",
    whyItMatters:
      "Production security requires controls throughout the software lifecycle.",
    prerequisites: ["supply-chain-security"],
    enables: ["advanced-devops-architecture"],
    alternatives: [],
    related: ["platform-engineering"],
    metadata: { phase: "supply-chain-security" },
  }),

  // ============================================================
  // PHASE 23 — GITOPS
  // ============================================================

  node({
    id: "gitops",
    title: "GitOps Fundamentals",
    category: "platform",
    importance: "critical",
    description:
      "Use Git as the source of truth for declarative infrastructure and application deployment.",
    whyItMatters:
      "GitOps makes operational changes auditable and reproducible.",
    prerequisites: [
      "git-version-control",
      "terraform-production",
      "kubernetes-production",
      "helm-production",
    ],
    enables: ["argocd", "flux"],
    alternatives: [],
    related: ["platform-engineering"],
    metadata: {
      phase: "gitops",
      primary: true,
    },
  }),

  node({
    id: "argocd",
    title: "Argo CD Awareness",
    category: "gitops",
    importance: "high",
    description: "Understand Kubernetes continuous delivery using Argo CD.",
    whyItMatters: "Argo CD is a major GitOps implementation.",
    prerequisites: ["gitops"],
    enables: ["platform-engineering"],
    alternatives: ["flux"],
    related: ["kubernetes-production"],
    metadata: {
      phase: "gitops",
      optional: true,
    },
  }),

  node({
    id: "flux",
    title: "Flux Awareness",
    category: "gitops",
    importance: "medium",
    description: "Understand GitOps-based Kubernetes delivery using Flux.",
    whyItMatters: "Flux is another established GitOps implementation.",
    prerequisites: ["gitops"],
    enables: ["platform-engineering"],
    alternatives: ["argocd"],
    related: ["kubernetes-production"],
    metadata: {
      phase: "gitops",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 24 — PLATFORM ENGINEERING
  // ============================================================

  node({
    id: "platform-engineering",
    title: "Platform Engineering",
    category: "platform",
    importance: "critical",
    description:
      "Build reusable infrastructure capabilities and self-service workflows for development teams.",
    whyItMatters:
      "Platform engineering reduces developer cognitive load and standardizes infrastructure delivery.",
    prerequisites: [
      "terraform-production",
      "kubernetes-production",
      "gitops",
      "advanced-devsecops",
    ],
    enables: ["internal-developer-platforms", "golden-paths"],
    alternatives: [],
    related: ["advanced-platform-engineering"],
    metadata: {
      phase: "platform-engineering-foundation",
      primary: true,
    },
  }),

  node({
    id: "internal-developer-platforms",
    title: "Internal Developer Platforms",
    category: "platform",
    importance: "high",
    description:
      "Provide self-service infrastructure, deployment and operational capabilities to developers.",
    whyItMatters:
      "A good platform hides unnecessary infrastructure complexity while keeping engineers productive.",
    prerequisites: ["platform-engineering"],
    enables: ["advanced-platform-engineering"],
    alternatives: [],
    related: ["golden-paths"],
    metadata: { phase: "internal-developer-platforms" },
  }),

  node({
    id: "golden-paths",
    title: "Golden Paths",
    category: "platform",
    importance: "high",
    description:
      "Create standardized recommended workflows for common engineering tasks.",
    whyItMatters:
      "Golden paths provide safe defaults without preventing advanced teams from deviating when necessary.",
    prerequisites: ["platform-engineering"],
    enables: ["advanced-platform-engineering"],
    alternatives: [],
    related: ["internal-developer-platforms"],
    metadata: { phase: "internal-developer-platforms" },
  }),

  node({
    id: "advanced-platform-engineering",
    title: "Advanced Platform Engineering",
    category: "platform",
    importance: "critical",
    description:
      "Combine infrastructure automation, Kubernetes, GitOps, observability, security and developer platforms.",
    whyItMatters:
      "Large engineering organizations require reusable internal infrastructure platforms.",
    prerequisites: ["internal-developer-platforms", "golden-paths"],
    enables: ["advanced-devops-architecture"],
    alternatives: [],
    related: ["gitops"],
    metadata: { phase: "advanced-platform-engineering" },
  }),

  // ============================================================
  // PHASE 25 — ADVANCED DEVOPS ARCHITECTURE
  // ============================================================

  node({
    id: "advanced-devops-architecture",
    title: "Advanced DevOps Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Combine infrastructure, cloud, automation, delivery, Kubernetes, observability, security, reliability and platform engineering.",
    whyItMatters:
      "Senior DevOps and platform engineers must reason about the entire production engineering system.",
    prerequisites: [
      "reliability-engineering",
      "postmortems",
      "advanced-devsecops",
      "advanced-platform-engineering",
    ],
    enables: [],
    alternatives: [],
    related: [
      "cloud-infrastructure",
      "kubernetes-production",
      "platform-engineering",
    ],
    metadata: {
      phase: "advanced-devops-architecture",
      primary: true,
    },
  }),
];

/**
 * Closed-reference validation.
 *
 * Every relationship must point to a node that actually exists
 * inside this roadmap.
 */
const nodeIds = new Set(devopsPlatformEngineerNodes.map((item) => item.id));

for (const item of devopsPlatformEngineerNodes) {
  const references = [
    ...(item.prerequisites || []),
    ...(item.enables || []),
    ...(item.alternatives || []),
    ...(item.related || []),
  ];

  for (const reference of references) {
    if (!nodeIds.has(reference)) {
      throw new Error(
        `[DevOps Roadmap] Invalid node reference "${reference}" ` +
          `in node "${item.id}".`,
      );
    }
  }
}

export default devopsPlatformEngineerNodes;
export { devopsPlatformEngineerNodes };

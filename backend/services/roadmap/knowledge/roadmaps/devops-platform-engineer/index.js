import { createRoadmapTemplate } from "../../factory.js";

import devopsPlatformEngineerPhases from "./phase.js";
import devopsPlatformEngineerNodes from "./node.js";
import devopsPlatformEngineerEdges from "./edge.js";

const devopsPlatformEngineerRoadmap = createRoadmapTemplate({
  id: "devops-platform-engineer",
  version: 1,
  type: "career-roadmap",

  title: "DevOps / Platform Engineer",

  description:
    "A production-oriented DevOps and Platform Engineering roadmap covering Linux, networking, Git, automation, Docker, CI/CD, cloud infrastructure, infrastructure as code, Kubernetes, Helm, observability, reliability, SRE, DevSecOps, GitOps and platform engineering.",

  goal: "Build the ability to automate, deploy, secure, observe, operate and scale production infrastructure and application delivery systems, with Linux, AWS, Docker, GitHub Actions, Terraform and Kubernetes as the primary implementation path.",

  nodes: devopsPlatformEngineerNodes,

  edges: devopsPlatformEngineerEdges,

  alternatives: [
    {
      id: "cloud",
      title: "Cloud Platforms",
      type: "primary",
      description:
        "AWS is the primary cloud implementation path, while Azure and GCP are important alternatives.",
      technologyPath: ["AWS", "Azure", "GCP"],
    },

    {
      id: "container-runtime",
      title: "Container Runtime",
      type: "primary",
      description: "Docker is the primary container implementation path.",
      technologyPath: ["Docker", "Podman"],
    },

    {
      id: "orchestration",
      title: "Container Orchestration",
      type: "primary",
      description:
        "Kubernetes is the primary orchestration path, with managed Kubernetes and AWS ECS as alternatives.",
      technologyPath: ["Kubernetes", "EKS", "AKS", "GKE", "ECS"],
    },

    {
      id: "ci-cd",
      title: "CI/CD",
      type: "primary",
      description: "GitHub Actions is the primary CI/CD implementation path.",
      technologyPath: ["GitHub Actions", "GitLab CI", "Jenkins"],
    },

    {
      id: "infrastructure-as-code",
      title: "Infrastructure as Code",
      type: "primary",
      description:
        "Terraform is the primary IaC path, with CloudFormation and Pulumi as alternatives.",
      technologyPath: ["Terraform", "CloudFormation", "Pulumi"],
    },

    {
      id: "configuration-management",
      title: "Configuration Management",
      type: "secondary",
      description:
        "Configuration management is useful for server automation, with Ansible as the primary awareness path.",
      technologyPath: ["Ansible"],
    },

    {
      id: "observability",
      title: "Observability",
      type: "primary",
      description:
        "Prometheus, Grafana and OpenTelemetry-style distributed observability form the primary cloud-native direction.",
      technologyPath: [
        "Prometheus",
        "Grafana",
        "OpenTelemetry",
        "CloudWatch",
        "Datadog",
      ],
    },

    {
      id: "gitops",
      title: "GitOps",
      type: "advanced",
      description:
        "GitOps becomes important for Kubernetes and platform engineering workflows.",
      technologyPath: ["Argo CD", "Flux"],
    },

    {
      id: "platform-engineering",
      title: "Platform Engineering",
      type: "advanced",
      description:
        "Platform engineering builds reusable infrastructure and self-service capabilities for development teams.",
      technologyPath: [
        "Internal Developer Platforms",
        "Golden Paths",
        "GitOps",
        "Kubernetes",
        "Terraform",
      ],
    },
  ],

  metadata: {
    domain: "devops-platform-engineering",

    careerRoles: [
      "DevOps Engineer",
      "DevOps Platform Engineer",
      "Platform Engineer",
      "Cloud DevOps Engineer",
      "Infrastructure Engineer",
      "Site Reliability Engineer",
      "Cloud Platform Engineer",
    ],

    primaryTechnologyPath: {
      operatingSystem: "Linux",
      shell: "Bash",
      versionControl: "Git + GitHub",
      networking: "TCP/IP + DNS + HTTP/HTTPS",
      containerization: "Docker",
      cloud: "AWS",
      cicd: "GitHub Actions",
      infrastructureAsCode: "Terraform",
      orchestration: "Kubernetes",
      packaging: "Helm",
      observability: "Prometheus + Grafana + OpenTelemetry",
      reliability: "SRE principles",
      security: "DevSecOps",
      deploymentModel: "GitOps",
      platformEngineering: "Internal Developer Platforms",
    },

    alternativeTechnologyPaths: {
      cloud: ["Azure", "GCP"],

      containerRuntime: ["Podman"],

      orchestration: ["ECS", "EKS", "AKS", "GKE"],

      cicd: ["GitLab CI", "Jenkins"],

      infrastructureAsCode: ["CloudFormation", "Pulumi"],

      configurationManagement: ["Ansible"],

      observability: ["CloudWatch", "Datadog", "ELK", "OpenSearch", "Loki"],

      gitops: ["Argo CD", "Flux"],
    },

    technologyStrategy: {
      rule: "Master one primary implementation path deeply and understand alternatives conceptually rather than learning every tool simultaneously.",

      primaryOperatingSystem: "Linux",

      primaryCloud: "AWS",

      primaryContainerRuntime: "Docker",

      primaryCICD: "GitHub Actions",

      primaryIaC: "Terraform",

      primaryOrchestration: "Kubernetes",

      primaryPackaging: "Helm",

      primaryObservability: ["Prometheus", "Grafana", "OpenTelemetry"],

      primaryGitOps: "Argo CD",
    },

    progression: devopsPlatformEngineerPhases.map((phase) => ({
      order: phase.order,
      id: phase.id,
      title: phase.title,
    })),

    phases: devopsPlatformEngineerPhases,

    roadmapPrinciples: [
      "Understand systems before automating them.",
      "Linux and networking are mandatory foundations.",
      "Git is the source of truth for application and infrastructure changes.",
      "Automation should be repeatable and idempotent.",
      "Docker is the primary containerization path.",
      "CI/CD should progressively eliminate manual delivery steps.",
      "AWS is the primary cloud implementation path.",
      "Terraform is the primary infrastructure-as-code path.",
      "Kubernetes is the primary orchestration path.",
      "Observability is a production requirement, not an optional add-on.",
      "Reliability and security must be designed into delivery systems.",
      "DevSecOps integrates security throughout the software lifecycle.",
      "GitOps provides an auditable model for declarative operations.",
      "Platform engineering should reduce developer cognitive load.",
      "Master one primary technology deeply before branching into alternatives.",
      "Alternative technologies are awareness paths unless a specific environment requires them.",
      "Advanced DevOps is about systems thinking rather than collecting tools.",
    ],

    knowledgeVersion: 1,
  },
});

export default devopsPlatformEngineerRoadmap;
export { devopsPlatformEngineerRoadmap };

import { createRoadmapTemplate } from "../../factory.js";

import cloudEngineerPhases from "./phase.js";
import cloudEngineerNodes from "./node.js";
import cloudEngineerEdges from "./edge.js";

const cloudEngineerRoadmap = createRoadmapTemplate({
  id: "cloud-engineer",
  version: 1,
  type: "career-roadmap",

  title: "Cloud Engineer",

  description:
    "A production-oriented Cloud Engineer roadmap covering cloud fundamentals, Linux, networking, AWS, storage, databases, IAM, containers, Kubernetes, infrastructure as code, CI/CD, observability, reliability, scaling, security, architecture and platform engineering.",

  goal: "Build the ability to design, deploy, secure, observe, operate and scale production workloads in the cloud, with AWS as the primary implementation path and Azure/GCP as alternative cloud ecosystems.",

  nodes: cloudEngineerNodes,

  edges: cloudEngineerEdges,

  alternatives: [
    {
      id: "aws",
      title: "AWS",
      type: "primary",
      description: "Primary cloud implementation path for this roadmap.",
      technologyPath: [
        "AWS",
        "EC2",
        "VPC",
        "S3",
        "RDS",
        "IAM",
        "Lambda",
        "CloudFront",
        "CloudWatch",
        "EKS",
      ],
    },

    {
      id: "azure",
      title: "Microsoft Azure",
      type: "alternative",
      description:
        "Major enterprise cloud alternative with transferable cloud concepts.",
      technologyPath: [
        "Azure",
        "Virtual Machines",
        "VNet",
        "Blob Storage",
        "Azure SQL",
        "Entra ID",
        "Azure Functions",
      ],
    },

    {
      id: "gcp",
      title: "Google Cloud",
      type: "alternative",
      description:
        "Strong alternative cloud ecosystem, particularly relevant to data, AI and cloud-native workloads.",
      technologyPath: [
        "GCP",
        "Compute Engine",
        "VPC",
        "Cloud Storage",
        "Cloud SQL",
        "IAM",
        "Cloud Functions",
      ],
    },

    {
      id: "iac",
      title: "Infrastructure as Code",
      type: "primary",
      description:
        "Terraform is the primary IaC path, with CloudFormation and Pulumi as alternatives.",
      technologyPath: ["Terraform", "CloudFormation", "Pulumi"],
    },

    {
      id: "containers",
      title: "Container Platforms",
      type: "primary",
      description:
        "Docker is the primary container technology and Kubernetes is the primary orchestration path.",
      technologyPath: ["Docker", "Kubernetes", "ECS", "EKS"],
    },

    {
      id: "delivery",
      title: "Cloud Delivery",
      type: "primary",
      description: "GitHub Actions is the primary CI/CD implementation path.",
      technologyPath: [
        "Git",
        "GitHub Actions",
        "Terraform",
        "Container Registry",
      ],
    },
  ],

  metadata: {
    domain: "cloud-engineering",

    careerRoles: [
      "Cloud Engineer",
      "Cloud Infrastructure Engineer",
      "Cloud Platform Engineer",
      "Infrastructure Engineer",
      "Site Reliability Engineer",
      "DevOps Engineer",
    ],

    primaryTechnologyPath: {
      cloud: "AWS",
      operatingSystem: "Linux",
      networking: "TCP/IP + DNS + HTTP/HTTPS",
      compute: "EC2 + Lambda",
      storage: "S3",
      relationalDatabase: "RDS",
      identity: "IAM",
      containers: "Docker",
      orchestration: "Kubernetes",
      infrastructureAsCode: "Terraform",
      cicd: "GitHub Actions",
      observability: "CloudWatch + OpenTelemetry",
    },

    alternativeTechnologyPaths: {
      cloud: ["Azure", "GCP"],
      infrastructureAsCode: ["CloudFormation", "Pulumi"],
      containerOrchestration: ["ECS"],
      cicd: ["GitLab CI", "Jenkins"],
      observability: ["Prometheus", "Grafana"],
    },

    technologyStrategy: {
      rule: "Master one primary implementation path deeply and understand alternatives conceptually.",
      primaryCloud: "AWS",
      primaryIaC: "Terraform",
      primaryContainers: "Docker",
      primaryOrchestration: "Kubernetes",
      primaryCICD: "GitHub Actions",
    },

    progression: cloudEngineerPhases.map((phase) => ({
      order: phase.order,
      id: phase.id,
      title: phase.title,
    })),

    phases: cloudEngineerPhases,

    roadmapPrinciples: [
      "Cloud fundamentals before provider-specific memorization.",
      "Linux and networking are mandatory foundations.",
      "AWS is the primary implementation path.",
      "Azure and GCP are alternative paths, not simultaneous mandatory tracks.",
      "Master concepts before collecting cloud services.",
      "Docker before Kubernetes.",
      "Infrastructure as Code before advanced platform engineering.",
      "CI/CD and observability are production engineering essentials.",
      "Security is integrated throughout the roadmap.",
      "Reliability, performance and cost are architectural concerns.",
      "Prefer managed services when they reduce unnecessary operational complexity.",
      "Use one primary technology deeply and maintain awareness of alternatives.",
    ],

    knowledgeVersion: 1,
  },
});

export default cloudEngineerRoadmap;
export { cloudEngineerRoadmap };

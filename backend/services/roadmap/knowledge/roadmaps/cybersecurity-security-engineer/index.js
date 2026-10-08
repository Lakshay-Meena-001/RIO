import { createRoadmapTemplate } from "../../factory.js";

import cybersecuritySecurityEngineerPhases from "./phase.js";
import cybersecuritySecurityEngineerNodes from "./node.js";
import cybersecuritySecurityEngineerEdges from "./edge.js";

const cybersecuritySecurityEngineerRoadmap = createRoadmapTemplate({
  id: "cybersecurity-security-engineer",
  version: 1,
  type: "career-roadmap",

  title: "Cybersecurity / Security Engineer",

  description:
    "A comprehensive security engineering roadmap covering cybersecurity foundations, computer systems, networking, Linux, Windows security, security programming, cryptography, identity and access management, web and application security, API security, threat modeling, vulnerability management, security testing, penetration-testing foundations, network and endpoint security, SIEM, detection engineering, incident response, digital forensics, malware analysis awareness, cloud security, IAM, container and Kubernetes security, DevSecOps, security automation, secrets management, software supply-chain security, Zero Trust, security architecture, data security, privacy, governance, risk management, security observability, resilience and advanced security engineering.",

  goal: "Build the ability to design, implement, assess, monitor and operate secure production systems across applications, infrastructure, cloud, identity and enterprise environments.",

  nodes: cybersecuritySecurityEngineerNodes,

  edges: cybersecuritySecurityEngineerEdges,

  alternatives: [
    {
      id: "security-engineering",
      title: "Security Engineering",
      type: "primary",
      description:
        "Build and operate technical security controls across applications, infrastructure, cloud and identity.",
      technologyPath: [
        "Security Fundamentals",
        "Application Security",
        "Cloud Security",
        "Identity",
        "Security Architecture",
      ],
    },

    {
      id: "application-security",
      title: "Application Security",
      type: "primary",
      description:
        "Focus on secure software design, threat modeling, secure coding and application security testing.",
      technologyPath: [
        "OWASP",
        "Secure Coding",
        "Threat Modeling",
        "API Security",
        "Security Testing",
      ],
    },

    {
      id: "cloud-security",
      title: "Cloud Security",
      type: "primary",
      description:
        "Secure cloud identities, networks, workloads, containers and Kubernetes environments.",
      technologyPath: [
        "Cloud Security",
        "Cloud IAM",
        "Cloud Network Security",
        "Container Security",
        "Kubernetes Security",
      ],
    },

    {
      id: "security-operations",
      title: "Security Operations",
      type: "specialization",
      description:
        "Focus on monitoring, SIEM, detection engineering and incident response.",
      technologyPath: [
        "Security Monitoring",
        "SIEM",
        "Detection Engineering",
        "Incident Response",
        "Digital Forensics",
      ],
    },

    {
      id: "offensive-security",
      title: "Offensive Security",
      type: "specialization",
      description:
        "Develop attacker-oriented understanding through ethical security testing and controlled penetration testing.",
      technologyPath: [
        "Networking",
        "Web Security",
        "Security Testing",
        "Penetration Testing",
      ],
    },

    {
      id: "devsecops",
      title: "DevSecOps",
      type: "specialization",
      description:
        "Integrate security controls into software delivery, infrastructure and cloud workflows.",
      technologyPath: [
        "Secure Coding",
        "Security Testing",
        "CI/CD Security",
        "Container Security",
        "Supply Chain Security",
      ],
    },

    {
      id: "identity-security",
      title: "Identity Security",
      type: "specialization",
      description:
        "Focus on authentication, authorization, IAM, federation, privileged access and Zero Trust.",
      technologyPath: [
        "IAM",
        "Authentication",
        "Authorization",
        "Cloud IAM",
        "Zero Trust",
      ],
    },

    {
      id: "digital-forensics",
      title: "Digital Forensics",
      type: "specialization",
      description:
        "Investigate security incidents through evidence collection, system artifacts and timelines.",
      technologyPath: [
        "Incident Response",
        "Digital Forensics",
        "Endpoint Security",
        "Malware Analysis",
      ],
    },

    {
      id: "security-architecture",
      title: "Security Architecture",
      type: "advanced",
      description:
        "Design security controls across identity, applications, networks, cloud, infrastructure and data.",
      technologyPath: [
        "Threat Modeling",
        "Zero Trust",
        "Defense in Depth",
        "Cloud Security",
        "Security Architecture",
      ],
    },

    {
      id: "cloud-provider",
      title: "Cloud Provider Path",
      type: "primary",
      description:
        "AWS is the primary cloud-security path, with GCP and Azure as alternatives.",
      technologyPath: ["AWS Security", "GCP Security", "Azure Security"],
    },

    {
      id: "siem-platform",
      title: "SIEM Platform Path",
      type: "primary",
      description:
        "Choose one SIEM deeply rather than attempting to master every platform.",
      technologyPath: [
        "SIEM Fundamentals",
        "Splunk",
        "Microsoft Sentinel",
        "Elastic Security",
      ],
    },

    {
      id: "security-scripting",
      title: "Security Scripting",
      type: "primary",
      description:
        "Python is the primary security-automation language, supported by Bash and PowerShell.",
      technologyPath: ["Python", "Bash", "PowerShell"],
    },
  ],

  metadata: {
    domain: "cybersecurity-security-engineering",

    careerRoles: [
      "Security Engineer",
      "Application Security Engineer",
      "Cloud Security Engineer",
      "DevSecOps Engineer",
      "Security Operations Engineer",
      "Detection Engineer",
      "Security Architect",
      "IAM Engineer",
      "Incident Response Engineer",
      "Product Security Engineer",
    ],

    primaryTechnologyPath: {
      programming: "Python",
      scripting: ["Bash", "PowerShell"],
      operatingSystem: "Linux",
      networking: "TCP/IP + DNS + HTTP/HTTPS + TLS",
      applicationSecurity: "OWASP",
      identity: "IAM + Authentication + Authorization",
      cryptography: "Applied Cryptography",
      cloud: "AWS",
      cloudSecurity: "Cloud IAM + Network Security",
      containers: "Docker",
      orchestration: "Kubernetes",
      delivery: "DevSecOps",
      monitoring: "SIEM + Security Observability",
      detection: "Detection Engineering",
      response: "Incident Response",
      architecture: "Zero Trust + Defense in Depth",
    },

    alternativeTechnologyPaths: {
      cloud: ["GCP", "Azure"],

      operatingSystems: ["Linux", "Windows"],

      siem: ["Splunk", "Microsoft Sentinel", "Elastic Security"],

      scripting: ["Python", "Bash", "PowerShell"],

      secretsManagement: ["HashiCorp Vault", "Cloud-native Secret Managers"],
    },

    technologyStrategy: {
      rule: "Master security fundamentals and one primary engineering path deeply before specializing. Security operations, offensive security, application security, cloud security, identity security and DevSecOps are specialization branches rather than separate mandatory tracks.",

      primaryLanguage: "Python",

      primaryOperatingSystem: "Linux",

      primaryCloud: "AWS",

      primaryApplicationSecurityPath:
        "OWASP + Secure Coding + Threat Modeling + API Security",

      primaryIdentityPath: "IAM + Authentication + Authorization + Zero Trust",

      primaryCloudSecurityPath:
        "Cloud IAM + Cloud Network Security + Container Security + Kubernetes Security",

      primaryOperationsPath:
        "Security Monitoring + SIEM + Detection Engineering + Incident Response",

      primaryDeliveryPath:
        "DevSecOps + Security Testing + Supply Chain Security",

      primaryArchitecturePath:
        "Threat Modeling + Zero Trust + Defense in Depth",
    },

    progression: cybersecuritySecurityEngineerPhases.map((phase) => ({
      order: phase.order,
      id: phase.id,
      title: phase.title,
    })),

    phases: cybersecuritySecurityEngineerPhases,

    roadmapPrinciples: [
      "Security engineering is broader than penetration testing.",
      "Security fundamentals come before specialized tooling.",
      "Computer systems and networking are mandatory foundations.",
      "Linux is the primary operating-system path.",
      "Windows security awareness is included for enterprise environments.",
      "Python is the primary security-programming language.",
      "Bash and PowerShell are supporting automation skills.",
      "Cryptography should be understood as an applied engineering discipline.",
      "Identity is a major security boundary.",
      "Authentication and authorization must be treated as separate concepts.",
      "Web security and API security are core application-security skills.",
      "OWASP provides a practical foundation for common application vulnerabilities.",
      "Secure coding and threat modeling shift security earlier into engineering.",
      "Security testing validates that controls actually work.",
      "Penetration testing is an important specialization but is not the whole security field.",
      "Network and endpoint security provide foundational defensive controls.",
      "Security monitoring must lead into detection and response.",
      "SIEM is a platform category; one implementation should be learned deeply.",
      "Incident response should be grounded in evidence and repeatable processes.",
      "Cloud security is a first-class security engineering discipline.",
      "Cloud IAM and least privilege are critical.",
      "Containers and Kubernetes require their own security controls.",
      "DevSecOps integrates security into software delivery.",
      "Secrets management is mandatory for production security.",
      "Software supply-chain security protects dependencies and build systems.",
      "Zero Trust emphasizes identity, least privilege and continuous verification.",
      "Security architecture combines multiple controls into a coherent defense.",
      "Data security and privacy protect information throughout its lifecycle.",
      "Risk and governance connect technical security decisions to organizational priorities.",
      "Security observability improves detection, investigation and resilience.",
      "Advanced security engineering requires cross-domain system thinking.",
      "Master one primary technology path before exploring every security product.",
    ],

    knowledgeVersion: 1,
  },
});

export default cybersecuritySecurityEngineerRoadmap;
export { cybersecuritySecurityEngineerRoadmap };

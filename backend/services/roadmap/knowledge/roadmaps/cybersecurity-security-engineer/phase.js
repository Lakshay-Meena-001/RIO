const cybersecuritySecurityEngineerPhases = [
  {
    id: "security-foundation",
    order: 1,
    title: "Cybersecurity Foundation",
    description:
      "Understand cybersecurity principles, threat models, security objectives, attack surfaces and defensive thinking.",
    goal: "Build the mental model required to reason about security across applications, systems, networks and organizations.",
    primaryPath: "Security fundamentals",
    alternatives: [],
  },

  {
    id: "computer-systems-foundation",
    order: 2,
    title: "Computer Systems Foundation",
    description:
      "Understand operating systems, processes, memory, filesystems, permissions and system-level behavior.",
    goal: "Understand the systems that security engineers protect and investigate.",
    primaryPath: "Linux + Operating Systems",
    alternatives: ["Windows internals awareness"],
  },

  {
    id: "networking-foundation",
    order: 3,
    title: "Networking for Security",
    description:
      "Learn TCP/IP, DNS, HTTP, TLS, routing, ports, firewalls and network communication.",
    goal: "Understand how systems communicate and where network security controls operate.",
    primaryPath: "TCP/IP + DNS + HTTP/HTTPS + TLS",
    alternatives: [],
  },

  {
    id: "linux-security",
    order: 4,
    title: "Linux Security",
    description:
      "Understand Linux users, groups, permissions, processes, services, logs and system hardening.",
    goal: "Operate and secure Linux systems confidently.",
    primaryPath: "Linux",
    alternatives: [],
  },

  {
    id: "windows-security-awareness",
    order: 5,
    title: "Windows Security Awareness",
    description:
      "Understand Windows authentication, permissions, services, event logs and enterprise security concepts.",
    goal: "Develop enough Windows knowledge to work in mixed enterprise environments.",
    primaryPath: "Windows security fundamentals",
    alternatives: [],
  },

  {
    id: "security-programming",
    order: 6,
    title: "Programming for Security",
    description:
      "Learn programming and scripting for automation, security tooling, analysis and secure software development.",
    goal: "Automate repetitive security work and understand software behavior.",
    primaryPath: "Python",
    alternatives: ["Bash", "PowerShell", "C/C++ awareness"],
  },

  {
    id: "cryptography-foundation",
    order: 7,
    title: "Cryptography Foundation",
    description:
      "Understand hashing, encryption, symmetric and asymmetric cryptography, digital signatures and key management.",
    goal: "Understand the cryptographic primitives used throughout modern security systems.",
    primaryPath: "Applied Cryptography",
    alternatives: [],
  },

  {
    id: "identity-and-access",
    order: 8,
    title: "Identity & Access Management",
    description:
      "Understand identity, authentication, authorization, sessions, roles, permissions and federation.",
    goal: "Design systems that correctly control who can access what.",
    primaryPath: "IAM + Authentication + Authorization",
    alternatives: [],
  },

  {
    id: "web-security-foundation",
    order: 9,
    title: "Web Security Foundation",
    description:
      "Understand browser security, HTTP security, cookies, sessions, CORS and common web attack surfaces.",
    goal: "Build a strong foundation for application security.",
    primaryPath: "Web Application Security",
    alternatives: [],
  },

  {
    id: "owasp-web-security",
    order: 10,
    title: "OWASP Web Application Security",
    description:
      "Study major web application vulnerabilities including injection, broken access control, authentication failures and insecure design.",
    goal: "Identify and prevent common production web application vulnerabilities.",
    primaryPath: "OWASP",
    alternatives: [],
  },

  {
    id: "secure-backend-development",
    order: 11,
    title: "Secure Backend Development",
    description:
      "Apply security principles to APIs, databases, validation, authentication, authorization and business logic.",
    goal: "Build backend systems resistant to common application attacks.",
    primaryPath: "Secure API + Backend Engineering",
    alternatives: [],
  },

  {
    id: "api-security",
    order: 12,
    title: "API Security",
    description:
      "Secure REST APIs, authentication flows, authorization boundaries, rate limits and API inputs.",
    goal: "Design secure production APIs.",
    primaryPath: "REST API Security",
    alternatives: ["GraphQL security awareness", "gRPC security awareness"],
  },

  {
    id: "application-security",
    order: 13,
    title: "Application Security",
    description:
      "Understand secure software design, threat modeling, vulnerability management and application security testing.",
    goal: "Integrate security throughout the software development lifecycle.",
    primaryPath: "Application Security",
    alternatives: [],
  },

  {
    id: "secure-coding",
    order: 14,
    title: "Secure Coding",
    description:
      "Learn defensive coding practices for input validation, output encoding, secrets, errors, dependencies and unsafe operations.",
    goal: "Prevent vulnerabilities at implementation time.",
    primaryPath: "Secure Software Development",
    alternatives: [],
  },

  {
    id: "threat-modeling",
    order: 15,
    title: "Threat Modeling",
    description:
      "Identify assets, trust boundaries, threats, attack paths and mitigations.",
    goal: "Reason about security before vulnerabilities reach production.",
    primaryPath: "Threat Modeling",
    alternatives: [],
  },

  {
    id: "vulnerability-management",
    order: 16,
    title: "Vulnerability Management",
    description:
      "Understand vulnerability discovery, severity, prioritization, remediation and lifecycle management.",
    goal: "Turn security findings into prioritized engineering actions.",
    primaryPath: "Vulnerability Management",
    alternatives: [],
  },

  {
    id: "security-testing",
    order: 17,
    title: "Security Testing",
    description:
      "Learn security-focused testing techniques for applications, APIs and infrastructure.",
    goal: "Detect vulnerabilities before attackers exploit them.",
    primaryPath: "Automated + Manual Security Testing",
    alternatives: [],
  },

  {
    id: "penetration-testing-foundation",
    order: 18,
    title: "Penetration Testing Foundation",
    description:
      "Understand reconnaissance, enumeration, vulnerability validation and controlled exploitation concepts.",
    goal: "Understand offensive security methodology from a defensive engineering perspective.",
    primaryPath: "Ethical Security Testing",
    alternatives: [],
  },

  {
    id: "network-security",
    order: 19,
    title: "Network Security",
    description:
      "Understand firewalls, segmentation, IDS/IPS, VPNs, proxies and network monitoring.",
    goal: "Protect networks and control traffic between trusted and untrusted zones.",
    primaryPath: "Network Defense",
    alternatives: [],
  },

  {
    id: "endpoint-security",
    order: 20,
    title: "Endpoint Security",
    description:
      "Understand endpoint hardening, host monitoring, malware concepts and endpoint detection.",
    goal: "Protect individual systems and detect suspicious endpoint activity.",
    primaryPath: "Endpoint Security",
    alternatives: [],
  },

  {
    id: "security-monitoring",
    order: 21,
    title: "Security Monitoring",
    description:
      "Collect, normalize and analyze security-relevant logs and events.",
    goal: "Detect suspicious activity using centralized security telemetry.",
    primaryPath: "Security Monitoring",
    alternatives: [],
  },

  {
    id: "siem",
    order: 22,
    title: "SIEM",
    description:
      "Understand centralized security event collection, correlation, detection rules and investigation workflows.",
    goal: "Build practical security monitoring and detection capabilities.",
    primaryPath: "SIEM",
    alternatives: ["Splunk", "Microsoft Sentinel", "Elastic Security"],
  },

  {
    id: "detection-engineering",
    order: 23,
    title: "Detection Engineering",
    description:
      "Design, test and maintain detections for suspicious behavior and attack techniques.",
    goal: "Build reliable security detections rather than relying only on generic alerts.",
    primaryPath: "Detection Engineering",
    alternatives: [],
  },

  {
    id: "incident-response",
    order: 24,
    title: "Incident Response",
    description:
      "Learn incident identification, containment, eradication, recovery and post-incident analysis.",
    goal: "Respond systematically when security incidents occur.",
    primaryPath: "Incident Response",
    alternatives: [],
  },

  {
    id: "digital-forensics-foundation",
    order: 25,
    title: "Digital Forensics Foundation",
    description:
      "Understand evidence collection, system artifacts, timelines and forensic investigation concepts.",
    goal: "Investigate security incidents using reliable evidence.",
    primaryPath: "Digital Forensics",
    alternatives: [],
  },

  {
    id: "malware-analysis-awareness",
    order: 26,
    title: "Malware Analysis Awareness",
    description:
      "Understand malware behavior, static analysis, dynamic analysis and common malicious techniques.",
    goal: "Recognize and investigate malicious software behavior.",
    primaryPath: "Malware Analysis",
    alternatives: [],
  },

  {
    id: "cloud-security-foundation",
    order: 27,
    title: "Cloud Security Foundation",
    description:
      "Understand shared responsibility, cloud identities, networking, storage, compute and security controls.",
    goal: "Secure workloads running on modern cloud platforms.",
    primaryPath: "AWS Security",
    alternatives: ["GCP Security", "Azure Security"],
  },

  {
    id: "cloud-iam-security",
    order: 28,
    title: "Cloud IAM & Identity Security",
    description:
      "Design least-privilege identities, roles, policies and workload identities.",
    goal: "Prevent unauthorized access in cloud environments.",
    primaryPath: "Cloud IAM",
    alternatives: [],
  },

  {
    id: "cloud-network-security",
    order: 29,
    title: "Cloud Network Security",
    description:
      "Secure VPCs, subnets, security groups, network ACLs, private connectivity and traffic flows.",
    goal: "Build secure cloud network architectures.",
    primaryPath: "Cloud Network Security",
    alternatives: [],
  },

  {
    id: "container-security",
    order: 30,
    title: "Container Security",
    description:
      "Secure container images, registries, runtime configurations and container workloads.",
    goal: "Reduce security risks in containerized environments.",
    primaryPath: "Docker Security",
    alternatives: [],
  },

  {
    id: "kubernetes-security",
    order: 31,
    title: "Kubernetes Security",
    description:
      "Understand Kubernetes identities, RBAC, network policies, secrets, admission controls and workload security.",
    goal: "Secure production Kubernetes environments.",
    primaryPath: "Kubernetes Security",
    alternatives: [],
  },

  {
    id: "devsecops-foundation",
    order: 32,
    title: "DevSecOps Foundation",
    description:
      "Integrate security into CI/CD, infrastructure and software delivery workflows.",
    goal: "Shift security controls earlier into the development lifecycle.",
    primaryPath: "DevSecOps",
    alternatives: [],
  },

  {
    id: "security-automation",
    order: 33,
    title: "Security Automation",
    description:
      "Automate vulnerability scanning, enrichment, alert handling, remediation and repetitive security workflows.",
    goal: "Scale security operations through engineering and automation.",
    primaryPath: "Python + APIs + Security Automation",
    alternatives: [],
  },

  {
    id: "secrets-management",
    order: 34,
    title: "Secrets Management",
    description:
      "Understand secret storage, rotation, access control and workload identity.",
    goal: "Prevent credentials and sensitive configuration from becoming security vulnerabilities.",
    primaryPath: "Secrets Management",
    alternatives: ["HashiCorp Vault awareness", "Cloud-native secret managers"],
  },

  {
    id: "security-supply-chain",
    order: 35,
    title: "Software Supply Chain Security",
    description:
      "Secure dependencies, packages, source code, build systems, artifacts and software provenance.",
    goal: "Protect software from compromise across the development and delivery pipeline.",
    primaryPath: "Software Supply Chain Security",
    alternatives: [],
  },

  {
    id: "identity-security-architecture",
    order: 36,
    title: "Identity Security Architecture",
    description:
      "Design centralized identity, federation, SSO, privileged access and zero-trust access models.",
    goal: "Build scalable identity architectures for modern organizations.",
    primaryPath: "Zero Trust + Identity",
    alternatives: [],
  },

  {
    id: "zero-trust",
    order: 37,
    title: "Zero Trust Security",
    description:
      "Understand continuous verification, least privilege, device trust, identity-centric access and segmentation.",
    goal: "Design security architectures that do not implicitly trust network location.",
    primaryPath: "Zero Trust",
    alternatives: [],
  },

  {
    id: "security-architecture",
    order: 38,
    title: "Security Architecture",
    description:
      "Design layered security controls across applications, networks, identities, infrastructure and data.",
    goal: "Move from individual security controls to complete security architecture.",
    primaryPath: "Defense-in-Depth",
    alternatives: [],
  },

  {
    id: "data-security",
    order: 39,
    title: "Data Security",
    description:
      "Protect sensitive data using classification, encryption, access control, masking and lifecycle controls.",
    goal: "Secure data throughout its lifecycle.",
    primaryPath: "Data Security",
    alternatives: [],
  },

  {
    id: "privacy-engineering",
    order: 40,
    title: "Privacy Engineering",
    description:
      "Understand privacy-by-design, data minimization, retention and protection of personal information.",
    goal: "Integrate privacy requirements into technical systems.",
    primaryPath: "Privacy Engineering",
    alternatives: [],
  },

  {
    id: "security-governance",
    order: 41,
    title: "Security Governance",
    description:
      "Understand security policies, risk management, controls, compliance and organizational security programs.",
    goal: "Connect technical security work with organizational risk.",
    primaryPath: "Security Governance",
    alternatives: [],
  },

  {
    id: "security-risk-management",
    order: 42,
    title: "Security Risk Management",
    description: "Identify, assess, prioritize and mitigate security risks.",
    goal: "Make security decisions based on business and technical risk.",
    primaryPath: "Cyber Risk Management",
    alternatives: [],
  },

  {
    id: "security-observability",
    order: 43,
    title: "Security Observability",
    description:
      "Combine logs, traces, metrics and security telemetry to understand system behavior and threats.",
    goal: "Create broad visibility across production systems.",
    primaryPath: "Security Observability",
    alternatives: [],
  },

  {
    id: "security-reliability",
    order: 44,
    title: "Security Reliability & Resilience",
    description:
      "Design systems that remain secure and recover effectively during failures and attacks.",
    goal: "Connect security with availability, resilience and recovery.",
    primaryPath: "Security Resilience",
    alternatives: [],
  },

  {
    id: "advanced-security-engineering",
    order: 45,
    title: "Advanced Security Engineering",
    description:
      "Combine application, cloud, infrastructure, identity, detection and response into scalable security platforms.",
    goal: "Reach senior-level security engineering and security architecture capability.",
    primaryPath: "Enterprise Security Engineering",
    alternatives: [],
  },
];

export default cybersecuritySecurityEngineerPhases;
export { cybersecuritySecurityEngineerPhases };

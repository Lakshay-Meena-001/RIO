import { createKnowledgeNode } from "../../factory.js";

const node = (data) => createKnowledgeNode(data);

const cybersecuritySecurityEngineerNodes = [
  // ============================================================
  // PHASE 1 — SECURITY FOUNDATION
  // ============================================================

  node({
    id: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    category: "foundation",
    importance: "critical",
    description:
      "Understand confidentiality, integrity, availability, threats, vulnerabilities, risk, attack surfaces and defense-in-depth.",
    whyItMatters:
      "Security engineering requires a common mental model for threats, assets, controls and risk.",
    prerequisites: [],
    enables: [
      "threat-modeling",
      "computer-systems-foundation",
      "networking-for-security",
    ],
    alternatives: [],
    related: ["security-architecture"],
    metadata: {
      phase: "security-foundation",
      primary: true,
    },
  }),

  node({
    id: "security-threat-model",
    title: "Security Threat Model",
    category: "foundation",
    importance: "critical",
    description:
      "Understand assets, attackers, trust boundaries, attack paths, threats and mitigations.",
    whyItMatters:
      "Security decisions become much more effective when they are driven by explicit threat models.",
    prerequisites: ["cybersecurity-fundamentals"],
    enables: ["threat-modeling"],
    alternatives: [],
    related: ["security-risk-management"],
    metadata: { phase: "security-foundation" },
  }),

  // ============================================================
  // PHASE 2 — COMPUTER SYSTEMS
  // ============================================================

  node({
    id: "computer-systems-foundation",
    title: "Computer Systems Foundation",
    category: "systems",
    importance: "critical",
    description:
      "Understand processes, memory, filesystems, system calls, users, permissions and operating-system behavior.",
    whyItMatters:
      "Security engineers must understand the systems they protect and investigate.",
    prerequisites: ["cybersecurity-fundamentals"],
    enables: [
      "linux-security",
      "windows-security-awareness",
      "security-programming",
    ],
    alternatives: [],
    related: ["endpoint-security"],
    metadata: {
      phase: "computer-systems-foundation",
      primary: true,
    },
  }),

  node({
    id: "operating-system-security",
    title: "Operating System Security",
    category: "systems",
    importance: "critical",
    description:
      "Understand process isolation, permissions, privilege boundaries and OS security mechanisms.",
    whyItMatters:
      "Many security boundaries ultimately depend on operating-system primitives.",
    prerequisites: ["computer-systems-foundation"],
    enables: ["linux-security"],
    alternatives: [],
    related: ["endpoint-security"],
    metadata: { phase: "computer-systems-foundation" },
  }),

  // ============================================================
  // PHASE 3 — NETWORKING
  // ============================================================

  node({
    id: "networking-for-security",
    title: "Networking for Security",
    category: "networking",
    importance: "critical",
    description:
      "Understand TCP/IP, ports, routing, DNS, HTTP, HTTPS, TLS and network communication.",
    whyItMatters:
      "Most modern attacks and defenses involve network communication.",
    prerequisites: ["cybersecurity-fundamentals"],
    enables: [
      "network-security",
      "web-security-foundation",
      "cloud-network-security",
    ],
    alternatives: [],
    related: ["security-monitoring"],
    metadata: {
      phase: "networking-foundation",
      primary: true,
    },
  }),

  node({
    id: "tcp-ip-security",
    title: "TCP/IP Security",
    category: "networking",
    importance: "critical",
    description:
      "Understand IP addressing, TCP, UDP, ports and common network attack surfaces.",
    whyItMatters:
      "Network-level security requires understanding how packets move between systems.",
    prerequisites: ["networking-for-security"],
    enables: ["network-security"],
    alternatives: [],
    related: ["security-monitoring"],
    metadata: { phase: "networking-foundation" },
  }),

  node({
    id: "dns-security",
    title: "DNS Security",
    category: "networking",
    importance: "high",
    description:
      "Understand DNS resolution, records, caching and common DNS security concerns.",
    whyItMatters:
      "DNS is a foundational service and a common security boundary.",
    prerequisites: ["networking-for-security"],
    enables: ["network-security"],
    alternatives: [],
    related: ["web-security-foundation"],
    metadata: { phase: "networking-foundation" },
  }),

  node({
    id: "tls-security",
    title: "TLS & Transport Security",
    category: "cryptography",
    importance: "critical",
    description:
      "Understand certificates, TLS handshakes, encryption and secure transport.",
    whyItMatters: "HTTPS and secure service communication depend on TLS.",
    prerequisites: ["networking-for-security"],
    enables: ["web-security-foundation", "cryptography-foundation"],
    alternatives: [],
    related: ["api-security"],
    metadata: { phase: "networking-foundation" },
  }),

  // ============================================================
  // PHASE 4 — LINUX
  // ============================================================

  node({
    id: "linux-security",
    title: "Linux Security",
    category: "systems",
    importance: "critical",
    description:
      "Secure Linux users, groups, permissions, processes, services, files and logs.",
    whyItMatters:
      "Linux is heavily used across servers, cloud infrastructure and security tooling.",
    prerequisites: ["computer-systems-foundation", "operating-system-security"],
    enables: ["endpoint-security", "security-monitoring"],
    alternatives: [],
    related: ["container-security"],
    metadata: {
      phase: "linux-security",
      primary: true,
    },
  }),

  node({
    id: "linux-hardening",
    title: "Linux Hardening",
    category: "systems",
    importance: "critical",
    description:
      "Apply secure configurations, least privilege, service minimization and system hardening.",
    whyItMatters:
      "Hardening reduces the attack surface before vulnerabilities are exploited.",
    prerequisites: ["linux-security"],
    enables: ["endpoint-security"],
    alternatives: [],
    related: ["security-architecture"],
    metadata: { phase: "linux-security" },
  }),

  // ============================================================
  // PHASE 5 — WINDOWS
  // ============================================================

  node({
    id: "windows-security-awareness",
    title: "Windows Security Awareness",
    category: "systems",
    importance: "high",
    description:
      "Understand Windows authentication, permissions, services, event logs and enterprise security concepts.",
    whyItMatters:
      "Enterprise security environments commonly contain Windows systems.",
    prerequisites: ["computer-systems-foundation"],
    enables: ["endpoint-security"],
    alternatives: [],
    related: ["identity-security-architecture"],
    metadata: { phase: "windows-security-awareness" },
  }),

  // ============================================================
  // PHASE 6 — SECURITY PROGRAMMING
  // ============================================================

  node({
    id: "security-programming",
    title: "Programming for Security",
    category: "programming",
    importance: "critical",
    description:
      "Use programming and scripting for security automation, analysis and tooling.",
    whyItMatters:
      "Security engineering increasingly requires automation rather than manual repetitive work.",
    prerequisites: ["computer-systems-foundation"],
    enables: ["security-automation", "security-testing"],
    alternatives: ["bash-security-scripting", "powershell-security-awareness"],
    related: ["application-security"],
    metadata: {
      phase: "security-programming",
      primary: true,
    },
  }),

  node({
    id: "bash-security-scripting",
    title: "Bash for Security",
    category: "programming",
    importance: "high",
    description:
      "Automate Linux security operations and investigation tasks with shell scripting.",
    whyItMatters:
      "Bash is useful for Linux administration and security automation.",
    prerequisites: ["security-programming"],
    enables: ["security-automation"],
    alternatives: ["powershell-security-awareness"],
    related: ["linux-security"],
    metadata: { phase: "security-programming" },
  }),

  node({
    id: "powershell-security-awareness",
    title: "PowerShell Security Awareness",
    category: "programming",
    importance: "medium",
    description:
      "Understand PowerShell for Windows administration, automation and security investigation.",
    whyItMatters:
      "PowerShell is important in Windows-heavy security environments.",
    prerequisites: ["security-programming"],
    enables: ["security-automation"],
    alternatives: ["bash-security-scripting"],
    related: ["windows-security-awareness"],
    metadata: { phase: "security-programming" },
  }),

  // ============================================================
  // PHASE 7 — CRYPTOGRAPHY
  // ============================================================

  node({
    id: "cryptography-foundation",
    title: "Cryptography Foundation",
    category: "cryptography",
    importance: "critical",
    description:
      "Understand hashing, encryption, symmetric and asymmetric cryptography, signatures and key management.",
    whyItMatters:
      "Cryptography protects data, communication and identity across modern systems.",
    prerequisites: ["tls-security"],
    enables: ["identity-and-access", "data-security"],
    alternatives: [],
    related: ["cloud-iam-security"],
    metadata: {
      phase: "cryptography-foundation",
      primary: true,
    },
  }),

  node({
    id: "hashing-and-password-security",
    title: "Hashing & Password Security",
    category: "cryptography",
    importance: "critical",
    description:
      "Understand cryptographic hashing, password hashing, salts and secure credential storage.",
    whyItMatters: "Credentials are among the most sensitive security assets.",
    prerequisites: ["cryptography-foundation"],
    enables: ["identity-and-access"],
    alternatives: [],
    related: ["secure-backend-development"],
    metadata: { phase: "cryptography-foundation" },
  }),

  node({
    id: "public-key-cryptography",
    title: "Public-Key Cryptography",
    category: "cryptography",
    importance: "high",
    description:
      "Understand public/private keys, asymmetric encryption and digital signatures.",
    whyItMatters:
      "Public-key cryptography enables secure communication and identity verification.",
    prerequisites: ["cryptography-foundation"],
    enables: ["identity-and-access"],
    alternatives: [],
    related: ["tls-security"],
    metadata: { phase: "cryptography-foundation" },
  }),

  // ============================================================
  // PHASE 8 — IAM
  // ============================================================

  node({
    id: "identity-and-access",
    title: "Identity & Access Management",
    category: "identity",
    importance: "critical",
    description:
      "Understand identity, authentication, authorization, roles, permissions and sessions.",
    whyItMatters: "Identity is a central security boundary in modern systems.",
    prerequisites: ["cryptography-foundation", "hashing-and-password-security"],
    enables: [
      "cloud-iam-security",
      "web-security-foundation",
      "identity-security-architecture",
    ],
    alternatives: [],
    related: ["zero-trust"],
    metadata: {
      phase: "identity-and-access",
      primary: true,
    },
  }),

  node({
    id: "authentication-security",
    title: "Authentication Security",
    category: "identity",
    importance: "critical",
    description:
      "Secure passwords, MFA, sessions, tokens and authentication flows.",
    whyItMatters:
      "Authentication failures can provide attackers direct access to accounts.",
    prerequisites: ["identity-and-access"],
    enables: ["web-security-foundation", "api-security"],
    alternatives: [],
    related: ["identity-security-architecture"],
    metadata: { phase: "identity-and-access" },
  }),

  node({
    id: "authorization-security",
    title: "Authorization Security",
    category: "identity",
    importance: "critical",
    description:
      "Design roles, permissions, resource ownership and least-privilege access controls.",
    whyItMatters:
      "Correct authentication is useless if authorization boundaries are weak.",
    prerequisites: ["identity-and-access"],
    enables: ["web-security-foundation", "api-security"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: { phase: "identity-and-access" },
  }),

  // ============================================================
  // PHASE 9 — WEB SECURITY
  // ============================================================

  node({
    id: "web-security-foundation",
    title: "Web Security Foundation",
    category: "application-security",
    importance: "critical",
    description:
      "Understand browser security, HTTP security, cookies, sessions, CORS and web attack surfaces.",
    whyItMatters:
      "Web applications expose large and frequently targeted attack surfaces.",
    prerequisites: [
      "networking-for-security",
      "authentication-security",
      "authorization-security",
    ],
    enables: ["owasp-web-security", "secure-backend-development"],
    alternatives: [],
    related: ["api-security"],
    metadata: {
      phase: "web-security-foundation",
      primary: true,
    },
  }),

  node({
    id: "browser-security",
    title: "Browser Security",
    category: "application-security",
    importance: "high",
    description:
      "Understand same-origin policy, cookies, browser storage, CORS and browser security boundaries.",
    whyItMatters: "Frontend behavior directly affects application security.",
    prerequisites: ["web-security-foundation"],
    enables: ["owasp-web-security"],
    alternatives: [],
    related: ["api-security"],
    metadata: { phase: "web-security-foundation" },
  }),

  // ============================================================
  // PHASE 10 — OWASP
  // ============================================================

  node({
    id: "owasp-web-security",
    title: "OWASP Web Application Security",
    category: "application-security",
    importance: "critical",
    description:
      "Study major web vulnerabilities including injection, broken access control, authentication failures and insecure design.",
    whyItMatters:
      "OWASP provides a practical framework for understanding common application vulnerabilities.",
    prerequisites: ["web-security-foundation", "browser-security"],
    enables: ["application-security", "security-testing"],
    alternatives: [],
    related: ["secure-coding"],
    metadata: {
      phase: "owasp-web-security",
      primary: true,
    },
  }),

  node({
    id: "injection-security",
    title: "Injection Security",
    category: "application-security",
    importance: "critical",
    description:
      "Understand SQL injection, command injection and related untrusted-input attacks.",
    whyItMatters:
      "Injection vulnerabilities can allow attackers to execute unintended operations.",
    prerequisites: ["owasp-web-security"],
    enables: ["secure-coding"],
    alternatives: [],
    related: ["api-security"],
    metadata: { phase: "owasp-web-security" },
  }),

  node({
    id: "broken-access-control",
    title: "Broken Access Control",
    category: "application-security",
    importance: "critical",
    description:
      "Understand authorization flaws, IDOR and privilege escalation.",
    whyItMatters:
      "Access-control failures can expose data and capabilities to unauthorized users.",
    prerequisites: ["owasp-web-security", "authorization-security"],
    enables: ["secure-coding"],
    alternatives: [],
    related: ["identity-security-architecture"],
    metadata: { phase: "owasp-web-security" },
  }),

  node({
    id: "xss-security",
    title: "Cross-Site Scripting Security",
    category: "application-security",
    importance: "high",
    description:
      "Understand reflected, stored and DOM-based XSS and their mitigations.",
    whyItMatters:
      "Unsafe handling of untrusted browser content can compromise users and sessions.",
    prerequisites: ["owasp-web-security"],
    enables: ["secure-coding"],
    alternatives: [],
    related: ["browser-security"],
    metadata: { phase: "owasp-web-security" },
  }),

  // ============================================================
  // PHASE 11 — SECURE BACKEND
  // ============================================================

  node({
    id: "secure-backend-development",
    title: "Secure Backend Development",
    category: "application-security",
    importance: "critical",
    description:
      "Apply security to APIs, databases, validation, authentication, authorization and business logic.",
    whyItMatters:
      "Backend services contain critical business logic and sensitive data.",
    prerequisites: ["owasp-web-security", "secure-coding"],
    enables: ["api-security", "application-security"],
    alternatives: [],
    related: ["threat-modeling"],
    metadata: {
      phase: "secure-backend-development",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 12 — API SECURITY
  // ============================================================

  node({
    id: "api-security",
    title: "API Security",
    category: "application-security",
    importance: "critical",
    description:
      "Secure REST APIs using authentication, authorization, validation, rate limits and secure error handling.",
    whyItMatters:
      "APIs are common entry points into modern distributed applications.",
    prerequisites: [
      "secure-backend-development",
      "authentication-security",
      "authorization-security",
    ],
    enables: ["application-security"],
    alternatives: ["graphql-security-awareness", "grpc-security-awareness"],
    related: ["rate-limiting-security"],
    metadata: {
      phase: "api-security",
      primary: true,
    },
  }),

  node({
    id: "graphql-security-awareness",
    title: "GraphQL Security Awareness",
    category: "application-security",
    importance: "medium",
    description:
      "Understand GraphQL-specific authorization, query complexity and abuse concerns.",
    whyItMatters:
      "GraphQL introduces security considerations different from traditional REST APIs.",
    prerequisites: ["api-security"],
    enables: [],
    alternatives: ["api-security"],
    related: ["application-security"],
    metadata: {
      phase: "api-security",
      optional: true,
    },
  }),

  node({
    id: "grpc-security-awareness",
    title: "gRPC Security Awareness",
    category: "application-security",
    importance: "medium",
    description:
      "Understand authentication, authorization and TLS considerations for gRPC services.",
    whyItMatters: "Internal microservice architectures often use gRPC.",
    prerequisites: ["api-security"],
    enables: [],
    alternatives: ["api-security"],
    related: ["service-to-service-security"],
    metadata: {
      phase: "api-security",
      optional: true,
    },
  }),

  node({
    id: "rate-limiting-security",
    title: "Rate Limiting & Abuse Prevention",
    category: "application-security",
    importance: "high",
    description:
      "Protect APIs and services from excessive requests, brute force and application abuse.",
    whyItMatters:
      "Rate limiting is an important control against automated abuse.",
    prerequisites: ["api-security"],
    enables: ["application-security"],
    alternatives: [],
    related: ["network-security"],
    metadata: { phase: "api-security" },
  }),

  // ============================================================
  // PHASE 13 — APPLICATION SECURITY
  // ============================================================

  node({
    id: "application-security",
    title: "Application Security",
    category: "application-security",
    importance: "critical",
    description:
      "Integrate threat modeling, secure design, secure coding, testing and vulnerability management into software development.",
    whyItMatters:
      "Application security must be part of engineering rather than a final-stage audit.",
    prerequisites: [
      "owasp-web-security",
      "secure-backend-development",
      "api-security",
    ],
    enables: ["threat-modeling", "security-testing", "devsecops-foundation"],
    alternatives: [],
    related: ["secure-coding"],
    metadata: {
      phase: "application-security",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 14 — SECURE CODING
  // ============================================================

  node({
    id: "secure-coding",
    title: "Secure Coding",
    category: "application-security",
    importance: "critical",
    description:
      "Apply defensive coding practices for input validation, output encoding, secrets, dependencies and error handling.",
    whyItMatters:
      "Preventing vulnerabilities during development is cheaper than fixing them after exploitation.",
    prerequisites: ["application-security", "injection-security"],
    enables: ["security-testing"],
    alternatives: [],
    related: ["secure-backend-development"],
    metadata: { phase: "secure-coding" },
  }),

  // ============================================================
  // PHASE 15 — THREAT MODELING
  // ============================================================

  node({
    id: "threat-modeling",
    title: "Threat Modeling",
    category: "application-security",
    importance: "critical",
    description:
      "Identify assets, trust boundaries, threats, attack paths and mitigations before implementation.",
    whyItMatters:
      "Threat modeling helps engineers prevent entire classes of security problems.",
    prerequisites: ["security-threat-model", "application-security"],
    enables: ["security-architecture", "security-risk-management"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: {
      phase: "threat-modeling",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 16 — VULNERABILITY MANAGEMENT
  // ============================================================

  node({
    id: "vulnerability-management",
    title: "Vulnerability Management",
    category: "security-operations",
    importance: "critical",
    description:
      "Discover, classify, prioritize, remediate and track security vulnerabilities.",
    whyItMatters:
      "Organizations need a systematic way to convert findings into risk reduction.",
    prerequisites: ["application-security", "security-testing"],
    enables: ["security-automation"],
    alternatives: [],
    related: ["security-risk-management"],
    metadata: {
      phase: "vulnerability-management",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 17 — SECURITY TESTING
  // ============================================================

  node({
    id: "security-testing",
    title: "Security Testing",
    category: "security-testing",
    importance: "critical",
    description:
      "Use automated and manual techniques to identify security vulnerabilities in software and systems.",
    whyItMatters:
      "Security testing provides evidence that controls work as intended.",
    prerequisites: ["application-security", "secure-coding"],
    enables: ["penetration-testing-foundation", "devsecops-foundation"],
    alternatives: [],
    related: ["vulnerability-management"],
    metadata: {
      phase: "security-testing",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 18 — PEN TESTING
  // ============================================================

  node({
    id: "penetration-testing-foundation",
    title: "Penetration Testing Foundation",
    category: "offensive-security",
    importance: "high",
    description:
      "Understand reconnaissance, enumeration, vulnerability validation and controlled exploitation.",
    whyItMatters:
      "Offensive thinking helps defenders understand how vulnerabilities are chained into attacks.",
    prerequisites: [
      "networking-for-security",
      "security-testing",
      "owasp-web-security",
    ],
    enables: ["security-architecture"],
    alternatives: [],
    related: ["vulnerability-management"],
    metadata: {
      phase: "penetration-testing-foundation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 19 — NETWORK SECURITY
  // ============================================================

  node({
    id: "network-security",
    title: "Network Security",
    category: "network-security",
    importance: "critical",
    description:
      "Understand firewalls, segmentation, VPNs, proxies, IDS/IPS and network traffic controls.",
    whyItMatters: "Network controls reduce attack paths and isolate systems.",
    prerequisites: ["networking-for-security", "tcp-ip-security"],
    enables: ["cloud-network-security", "security-monitoring"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: {
      phase: "network-security",
      primary: true,
    },
  }),

  node({
    id: "firewalls-and-segmentation",
    title: "Firewalls & Network Segmentation",
    category: "network-security",
    importance: "critical",
    description:
      "Design firewall policies, segmentation boundaries and controlled traffic flows.",
    whyItMatters: "Segmentation limits lateral movement after compromise.",
    prerequisites: ["network-security"],
    enables: ["cloud-network-security"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: { phase: "network-security" },
  }),

  // ============================================================
  // PHASE 20 — ENDPOINT SECURITY
  // ============================================================

  node({
    id: "endpoint-security",
    title: "Endpoint Security",
    category: "endpoint-security",
    importance: "critical",
    description:
      "Secure endpoints through hardening, monitoring, malware prevention and endpoint detection.",
    whyItMatters:
      "Endpoints are frequent targets and valuable sources of security telemetry.",
    prerequisites: ["linux-hardening", "windows-security-awareness"],
    enables: ["security-monitoring", "incident-response"],
    alternatives: [],
    related: ["malware-analysis-foundation"],
    metadata: {
      phase: "endpoint-security",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 21 — SECURITY MONITORING
  // ============================================================

  node({
    id: "security-monitoring",
    title: "Security Monitoring",
    category: "security-operations",
    importance: "critical",
    description:
      "Collect, normalize and analyze security-relevant logs, events and telemetry.",
    whyItMatters:
      "Defenders need visibility into suspicious behavior across systems.",
    prerequisites: [
      "security-automation",
      "network-security",
      "endpoint-security",
    ],
    enables: ["siem"],
    alternatives: [],
    related: ["security-observability"],
    metadata: {
      phase: "security-monitoring",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 22 — SIEM
  // ============================================================

  node({
    id: "siem",
    title: "SIEM",
    category: "security-operations",
    importance: "critical",
    description:
      "Understand centralized event collection, correlation, detection rules and investigation workflows.",
    whyItMatters:
      "SIEM systems provide centralized visibility for security operations.",
    prerequisites: ["security-monitoring"],
    enables: ["detection-engineering"],
    alternatives: ["splunk-security", "microsoft-sentinel", "elastic-security"],
    related: ["incident-response"],
    metadata: {
      phase: "siem",
      primary: true,
    },
  }),

  node({
    id: "splunk-security",
    title: "Splunk Security Awareness",
    category: "security-operations",
    importance: "medium",
    description:
      "Understand Splunk-based security monitoring and search concepts.",
    whyItMatters: "Splunk is widely used in enterprise security operations.",
    prerequisites: ["siem"],
    enables: [],
    alternatives: ["siem"],
    related: ["detection-engineering"],
    metadata: {
      phase: "siem",
      optional: true,
    },
  }),

  node({
    id: "microsoft-sentinel",
    title: "Microsoft Sentinel Awareness",
    category: "security-operations",
    importance: "medium",
    description: "Understand Microsoft Sentinel security monitoring concepts.",
    whyItMatters:
      "Sentinel is relevant in Microsoft and cloud-heavy enterprise environments.",
    prerequisites: ["siem"],
    enables: [],
    alternatives: ["siem"],
    related: ["cloud-security-foundation"],
    metadata: {
      phase: "siem",
      optional: true,
    },
  }),

  node({
    id: "elastic-security",
    title: "Elastic Security Awareness",
    category: "security-operations",
    importance: "medium",
    description:
      "Understand Elastic-based security analytics and detection concepts.",
    whyItMatters:
      "Elastic provides widely used open-source-oriented security analytics capabilities.",
    prerequisites: ["siem"],
    enables: [],
    alternatives: ["siem"],
    related: ["security-observability"],
    metadata: {
      phase: "siem",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 23 — DETECTION ENGINEERING
  // ============================================================

  node({
    id: "detection-engineering",
    title: "Detection Engineering",
    category: "security-operations",
    importance: "critical",
    description:
      "Design, test, tune and maintain detections for suspicious behavior and attack techniques.",
    whyItMatters:
      "Reliable detections are essential for finding threats before significant damage occurs.",
    prerequisites: ["siem"],
    enables: ["incident-response"],
    alternatives: [],
    related: ["security-monitoring"],
    metadata: {
      phase: "detection-engineering",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 24 — INCIDENT RESPONSE
  // ============================================================

  node({
    id: "incident-response",
    title: "Incident Response",
    category: "security-operations",
    importance: "critical",
    description:
      "Handle identification, containment, eradication, recovery and post-incident analysis.",
    whyItMatters: "Security incidents require a repeatable response process.",
    prerequisites: ["detection-engineering", "endpoint-security"],
    enables: ["digital-forensics-foundation"],
    alternatives: [],
    related: ["security-resilience"],
    metadata: {
      phase: "incident-response",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 25 — DIGITAL FORENSICS
  // ============================================================

  node({
    id: "digital-forensics-foundation",
    title: "Digital Forensics Foundation",
    category: "forensics",
    importance: "high",
    description:
      "Understand evidence collection, system artifacts, timelines and forensic investigation.",
    whyItMatters:
      "Forensic evidence helps determine what happened during security incidents.",
    prerequisites: ["incident-response", "endpoint-security"],
    enables: ["malware-analysis-foundation"],
    alternatives: [],
    related: ["security-monitoring"],
    metadata: {
      phase: "digital-forensics-foundation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 26 — MALWARE
  // ============================================================

  node({
    id: "malware-analysis-foundation",
    title: "Malware Analysis Foundation",
    category: "malware-analysis",
    importance: "medium",
    description:
      "Understand malware behavior, static analysis, dynamic analysis and malicious techniques.",
    whyItMatters:
      "Understanding malware behavior improves incident investigation and endpoint defense.",
    prerequisites: ["digital-forensics-foundation", "security-programming"],
    enables: ["advanced-security-engineering"],
    alternatives: [],
    related: ["endpoint-security"],
    metadata: {
      phase: "malware-analysis-awareness",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 27 — CLOUD SECURITY
  // ============================================================

  node({
    id: "cloud-security-foundation",
    title: "Cloud Security Foundation",
    category: "cloud-security",
    importance: "critical",
    description:
      "Understand shared responsibility, cloud identities, networking, compute, storage and security controls.",
    whyItMatters:
      "Modern applications increasingly run on cloud infrastructure.",
    prerequisites: [
      "networking-for-security",
      "identity-and-access",
      "security-architecture",
    ],
    enables: ["cloud-iam-security", "cloud-network-security"],
    alternatives: ["aws-security", "gcp-security", "azure-security"],
    related: ["container-security"],
    metadata: {
      phase: "cloud-security-foundation",
      primary: true,
    },
  }),

  node({
    id: "aws-security",
    title: "AWS Security Awareness",
    category: "cloud-security",
    importance: "high",
    description:
      "Understand AWS identity, networking, storage, compute and security controls.",
    whyItMatters:
      "AWS is a major cloud platform used in production environments.",
    prerequisites: ["cloud-security-foundation"],
    enables: ["cloud-iam-security"],
    alternatives: ["gcp-security", "azure-security"],
    related: ["cloud-network-security"],
    metadata: {
      phase: "cloud-security-foundation",
      primary: true,
    },
  }),

  node({
    id: "gcp-security",
    title: "GCP Security Awareness",
    category: "cloud-security",
    importance: "medium",
    description:
      "Understand Google Cloud identity, networking and security controls.",
    whyItMatters:
      "GCP is relevant for cloud-native and data/AI-heavy organizations.",
    prerequisites: ["cloud-security-foundation"],
    enables: [],
    alternatives: ["aws-security", "azure-security"],
    related: ["cloud-iam-security"],
    metadata: {
      phase: "cloud-security-foundation",
      optional: true,
    },
  }),

  node({
    id: "azure-security",
    title: "Azure Security Awareness",
    category: "cloud-security",
    importance: "medium",
    description:
      "Understand Azure identity, networking and enterprise security controls.",
    whyItMatters: "Azure is heavily used in enterprise environments.",
    prerequisites: ["cloud-security-foundation"],
    enables: [],
    alternatives: ["aws-security", "gcp-security"],
    related: ["identity-security-architecture"],
    metadata: {
      phase: "cloud-security-foundation",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 28 — CLOUD IAM
  // ============================================================

  node({
    id: "cloud-iam-security",
    title: "Cloud IAM & Identity Security",
    category: "cloud-security",
    importance: "critical",
    description:
      "Design least-privilege identities, policies, roles and workload identities.",
    whyItMatters:
      "Misconfigured cloud identities are a major source of cloud security risk.",
    prerequisites: ["cloud-security-foundation", "identity-and-access"],
    enables: ["identity-security-architecture"],
    alternatives: [],
    related: ["zero-trust"],
    metadata: {
      phase: "cloud-iam-security",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 29 — CLOUD NETWORK SECURITY
  // ============================================================

  node({
    id: "cloud-network-security",
    title: "Cloud Network Security",
    category: "cloud-security",
    importance: "critical",
    description:
      "Secure VPCs, subnets, security groups, network ACLs and private connectivity.",
    whyItMatters:
      "Cloud networking determines which workloads can communicate with each other.",
    prerequisites: ["network-security", "cloud-security-foundation"],
    enables: ["container-security", "kubernetes-security"],
    alternatives: [],
    related: ["firewalls-and-segmentation"],
    metadata: {
      phase: "cloud-network-security",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 30 — CONTAINER SECURITY
  // ============================================================

  node({
    id: "container-security",
    title: "Container Security",
    category: "cloud-security",
    importance: "critical",
    description:
      "Secure container images, registries, runtime configuration and container workloads.",
    whyItMatters:
      "Containerized applications introduce new image and runtime security boundaries.",
    prerequisites: ["cloud-network-security", "linux-security"],
    enables: ["kubernetes-security"],
    alternatives: [],
    related: ["security-supply-chain"],
    metadata: {
      phase: "container-security",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 31 — KUBERNETES SECURITY
  // ============================================================

  node({
    id: "kubernetes-security",
    title: "Kubernetes Security",
    category: "cloud-security",
    importance: "critical",
    description:
      "Understand Kubernetes RBAC, secrets, network policies, admission controls and workload security.",
    whyItMatters:
      "Kubernetes security requires controls at cluster, workload and network levels.",
    prerequisites: ["container-security", "cloud-network-security"],
    enables: ["devsecops-foundation"],
    alternatives: [],
    related: ["security-architecture"],
    metadata: {
      phase: "kubernetes-security",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 32 — DEVSECOPS
  // ============================================================

  node({
    id: "devsecops-foundation",
    title: "DevSecOps Foundation",
    category: "devsecops",
    importance: "critical",
    description:
      "Integrate security into source control, CI/CD, infrastructure and deployment workflows.",
    whyItMatters:
      "Security must become part of the delivery pipeline instead of a final manual gate.",
    prerequisites: [
      "application-security",
      "kubernetes-security",
      "security-testing",
    ],
    enables: ["security-supply-chain", "security-automation"],
    alternatives: [],
    related: ["secure-coding"],
    metadata: {
      phase: "devsecops-foundation",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 33 — SECURITY AUTOMATION
  // ============================================================

  node({
    id: "security-automation",
    title: "Security Automation",
    category: "automation",
    importance: "critical",
    description:
      "Automate vulnerability scanning, alert enrichment, remediation and repetitive security workflows.",
    whyItMatters:
      "Security teams need automation to operate effectively at scale.",
    prerequisites: [
      "security-programming",
      "vulnerability-management",
      "devsecops-foundation",
    ],
    enables: ["security-observability"],
    alternatives: [],
    related: ["detection-engineering"],
    metadata: {
      phase: "security-automation",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 34 — SECRETS
  // ============================================================

  node({
    id: "secrets-management",
    title: "Secrets Management",
    category: "identity",
    importance: "critical",
    description:
      "Secure API keys, credentials, certificates and sensitive configuration using controlled storage and rotation.",
    whyItMatters: "Leaked secrets can directly compromise production systems.",
    prerequisites: ["identity-and-access", "cloud-iam-security"],
    enables: ["security-supply-chain"],
    alternatives: ["vault-awareness", "cloud-secret-managers"],
    related: ["secure-coding"],
    metadata: {
      phase: "secrets-management",
      primary: true,
    },
  }),

  node({
    id: "vault-awareness",
    title: "HashiCorp Vault Awareness",
    category: "secrets-management",
    importance: "medium",
    description:
      "Understand Vault concepts for centralized secret storage and access.",
    whyItMatters:
      "Vault is a widely known solution for centralized secret management.",
    prerequisites: ["secrets-management"],
    enables: [],
    alternatives: ["secrets-management"],
    related: ["security-automation"],
    metadata: {
      phase: "secrets-management",
      optional: true,
    },
  }),

  node({
    id: "cloud-secret-managers",
    title: "Cloud Secret Managers",
    category: "secrets-management",
    importance: "high",
    description:
      "Understand cloud-native secret storage and controlled workload access.",
    whyItMatters:
      "Cloud-native applications often use managed secret services.",
    prerequisites: ["secrets-management"],
    enables: [],
    alternatives: ["vault-awareness"],
    related: ["cloud-iam-security"],
    metadata: {
      phase: "secrets-management",
      optional: true,
    },
  }),

  // ============================================================
  // PHASE 35 — SUPPLY CHAIN
  // ============================================================

  node({
    id: "security-supply-chain",
    title: "Software Supply Chain Security",
    category: "devsecops",
    importance: "critical",
    description:
      "Secure dependencies, packages, source code, build systems, artifacts and software provenance.",
    whyItMatters:
      "Attackers increasingly target software dependencies and build pipelines.",
    prerequisites: ["devsecops-foundation", "secrets-management"],
    enables: ["security-architecture"],
    alternatives: [],
    related: ["container-security"],
    metadata: {
      phase: "security-supply-chain",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 36 — IDENTITY ARCHITECTURE
  // ============================================================

  node({
    id: "identity-security-architecture",
    title: "Identity Security Architecture",
    category: "identity",
    importance: "critical",
    description:
      "Design centralized identity, federation, SSO, privileged access and workload identity.",
    whyItMatters: "Identity is increasingly the primary security perimeter.",
    prerequisites: ["identity-and-access", "cloud-iam-security"],
    enables: ["zero-trust"],
    alternatives: [],
    related: ["security-architecture"],
    metadata: {
      phase: "identity-security-architecture",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 37 — ZERO TRUST
  // ============================================================

  node({
    id: "zero-trust",
    title: "Zero Trust Security",
    category: "architecture",
    importance: "critical",
    description:
      "Understand continuous verification, least privilege, identity-centric access and segmentation.",
    whyItMatters:
      "Modern systems cannot safely rely on implicit trust based on network location.",
    prerequisites: ["identity-security-architecture", "network-security"],
    enables: ["security-architecture"],
    alternatives: [],
    related: ["cloud-iam-security"],
    metadata: {
      phase: "zero-trust",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 38 — SECURITY ARCHITECTURE
  // ============================================================

  node({
    id: "security-architecture",
    title: "Security Architecture",
    category: "architecture",
    importance: "critical",
    description:
      "Design layered security controls across applications, networks, identities, infrastructure and data.",
    whyItMatters:
      "Senior security engineers need to reason about complete systems rather than isolated controls.",
    prerequisites: ["threat-modeling", "zero-trust", "security-supply-chain"],
    enables: [
      "data-security",
      "privacy-engineering",
      "advanced-security-engineering",
    ],
    alternatives: [],
    related: ["security-resilience"],
    metadata: {
      phase: "security-architecture",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 39 — DATA SECURITY
  // ============================================================

  node({
    id: "data-security",
    title: "Data Security",
    category: "data-security",
    importance: "critical",
    description:
      "Protect sensitive data using classification, encryption, access control, masking and lifecycle controls.",
    whyItMatters:
      "Sensitive data must remain protected regardless of where it is stored or processed.",
    prerequisites: ["cryptography-foundation", "security-architecture"],
    enables: ["privacy-engineering"],
    alternatives: [],
    related: ["cloud-security-foundation"],
    metadata: {
      phase: "data-security",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 40 — PRIVACY
  // ============================================================

  node({
    id: "privacy-engineering",
    title: "Privacy Engineering",
    category: "privacy",
    importance: "high",
    description:
      "Apply privacy-by-design, data minimization, retention and protection principles to technical systems.",
    whyItMatters:
      "Privacy requirements increasingly affect system architecture and data handling.",
    prerequisites: ["data-security", "security-architecture"],
    enables: ["security-governance"],
    alternatives: [],
    related: ["security-risk-management"],
    metadata: { phase: "privacy-engineering" },
  }),

  // ============================================================
  // PHASE 41 — GOVERNANCE
  // ============================================================

  node({
    id: "security-governance",
    title: "Security Governance",
    category: "governance",
    importance: "high",
    description:
      "Understand security policies, controls, compliance and organizational security programs.",
    whyItMatters:
      "Technical security controls operate within organizational risk and governance requirements.",
    prerequisites: ["security-architecture", "privacy-engineering"],
    enables: ["security-risk-management"],
    alternatives: [],
    related: ["security-resilience"],
    metadata: { phase: "security-governance" },
  }),

  // ============================================================
  // PHASE 42 — RISK
  // ============================================================

  node({
    id: "security-risk-management",
    title: "Security Risk Management",
    category: "risk",
    importance: "critical",
    description: "Identify, assess, prioritize and mitigate security risks.",
    whyItMatters:
      "Security engineering ultimately exists to reduce meaningful risk.",
    prerequisites: ["threat-modeling", "security-governance"],
    enables: ["advanced-security-engineering"],
    alternatives: [],
    related: ["security-architecture"],
    metadata: {
      phase: "security-risk-management",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 43 — SECURITY OBSERVABILITY
  // ============================================================

  node({
    id: "security-observability",
    title: "Security Observability",
    category: "observability",
    importance: "critical",
    description:
      "Combine logs, traces, metrics and security telemetry to understand system behavior and threats.",
    whyItMatters:
      "Broad telemetry improves detection, investigation and response.",
    prerequisites: ["security-monitoring", "security-automation"],
    enables: ["security-resilience"],
    alternatives: [],
    related: ["siem"],
    metadata: {
      phase: "security-observability",
      primary: true,
    },
  }),

  // ============================================================
  // PHASE 44 — SECURITY RESILIENCE
  // ============================================================

  node({
    id: "security-resilience",
    title: "Security Reliability & Resilience",
    category: "resilience",
    importance: "high",
    description:
      "Design systems that remain secure and recover effectively during failures and attacks.",
    whyItMatters:
      "Security incidents must be handled without causing prolonged operational failure.",
    prerequisites: ["security-architecture", "security-observability"],
    enables: ["advanced-security-engineering"],
    alternatives: [],
    related: ["incident-response"],
    metadata: { phase: "security-reliability" },
  }),

  // ============================================================
  // PHASE 45 — ADVANCED SECURITY ENGINEERING
  // ============================================================

  node({
    id: "advanced-security-engineering",
    title: "Advanced Security Engineering",
    category: "architecture",
    importance: "critical",
    description:
      "Combine application, cloud, infrastructure, identity, detection, response and governance into scalable security platforms.",
    whyItMatters:
      "Senior security engineers must design security as an integrated system.",
    prerequisites: [
      "security-risk-management",
      "security-resilience",
      "security-architecture",
    ],
    enables: [],
    alternatives: [],
    related: [
      "cloud-security-foundation",
      "application-security",
      "identity-security-architecture",
    ],
    metadata: {
      phase: "advanced-security-engineering",
      primary: true,
    },
  }),
];

/**
 * Closed-reference validation.
 *
 * Every prerequisite, enable, alternative and related reference
 * must point to a canonical node inside this roadmap.
 */
const nodeIds = new Set(
  cybersecuritySecurityEngineerNodes.map((item) => item.id),
);

for (const item of cybersecuritySecurityEngineerNodes) {
  const references = [
    ...(item.prerequisites || []),
    ...(item.enables || []),
    ...(item.alternatives || []),
    ...(item.related || []),
  ];

  for (const reference of references) {
    if (!nodeIds.has(reference)) {
      throw new Error(
        `[Cybersecurity Roadmap] Invalid node reference "${reference}" ` +
          `in node "${item.id}".`,
      );
    }
  }
}

export default cybersecuritySecurityEngineerNodes;
export { cybersecuritySecurityEngineerNodes };

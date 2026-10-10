const roadmapGenerationPrompt = ({
  roadmap,
  packageType,
  schemaVersion = 1,
}) => {
  if (!roadmap?.id || !roadmap?.title) {
    throw new Error("Valid roadmap catalog entry is required.");
  }

  if (!packageType) {
    throw new Error("Roadmap package type is required.");
  }

  return `
You are a senior software engineer, technical educator, curriculum architect,
and career-roadmap designer.

Your task is to generate a comprehensive, technically accurate,
phase-wise learning roadmap for the selected roadmap catalog entry.

## SELECTED ROADMAP

Roadmap ID: ${roadmap.id}
Roadmap title: ${roadmap.title}
Roadmap goal: ${roadmap.goal}
Roadmap category: ${roadmap.category}
Selected package: ${packageType}
Schema version: ${schemaVersion}

Catalog description:
${roadmap.description}

## PRIMARY OBJECTIVE

Generate a roadmap that helps a learner understand:
1. What to learn.
2. Why each topic matters.
3. What must be learned first.
4. What options exist within the domain.
5. Which options are alternatives and which are prerequisites.
6. How to choose between alternatives.
7. What practical work proves mastery.
8. Which reliable resources help them learn each topic.
9. How the roadmap connects to production engineering and interviews
   when relevant to the selected roadmap.

Do not generate a shallow list of technologies.

## CURRICULUM DESIGN RULES

### 1. Build a logical sequence

Organize the roadmap into numbered phases, starting with foundations
and progressing toward the selected roadmap's goal.

Each phase must have a clear purpose, prerequisites, learning outcomes,
topics, practice work, and a completion criterion.

Include shared foundations before specialized technologies wherever
appropriate.

Do not force unrelated technologies into the same mandatory sequence.

### 2. Represent alternatives and learning paths

When a domain has multiple valid technologies, frameworks, libraries,
tools, or approaches, represent the meaningful alternatives.

For example, a frontend roadmap may include:
- Web fundamentals: HTML, CSS, JavaScript, and browser fundamentals.
- Shared engineering foundations: Git, HTTP, accessibility, and testing
  where appropriate.
- Framework options: React, Vue, and Angular.
- React ecosystem options: Next.js and other relevant tools.
- Advanced topics: performance, security, deployment, and architecture.

These are examples, not a fixed list to copy into every roadmap.

For each relevant alternative, explain:
- What it is used for.
- What prerequisites it has.
- How it differs from other options.
- When a learner should choose it.
- Whether it is optional, complementary, or an alternative.
- What the learner can study next after completing it.

Do not imply that a learner must master every competing framework
before progressing.

Show the common path separately from optional branches. If the learner
later wants to learn another framework or language, make the next steps
understandable.

Apply the same reasoning to backend technologies, databases, security,
cloud platforms, DevOps tools, AI/ML approaches, and other domains
when multiple meaningful paths exist.

### 3. Keep choices understandable

Do not overwhelm learners with an unexplained list of alternatives.

Group related options, provide concise decision guidance, identify a
reasonable default path, and explain when another option makes sense.

The default path is a recommendation, not a restriction.

Do not present every possible tool as equally important. Prioritize
foundations, widely applicable concepts, relevant industry practices,
and the selected roadmap's goal.

### 4. Make learning actionable

For each topic, include:
- A clear explanation of what must be learned.
- Why it matters.
- Practical exercises or implementation tasks.
- Relevant project work when appropriate.
- A concrete mastery or completion criterion.
- Prerequisites and dependencies.

Use beginner-friendly sequencing without sacrificing technical depth.

### 5. Resources must be useful and trustworthy

Prefer official documentation, official tutorials, reputable books,
well-established courses, and high-quality technical references.

Provide specific resource titles and direct URLs when known.

Never fabricate URLs, books, courses, documentation pages, or videos.
Do not claim a resource has been verified unless verification has
actually occurred.

Use resources that match the particular topic. Avoid overwhelming
the learner with many redundant resources for the same concept.

Where a reliable resource URL is not known, omit the URL rather than
inventing one.

### 6. Package depth

The selected package is: ${packageType}

Adapt the breadth, depth, practice volume, project complexity, and
advanced coverage to this package.

Do not change the selected roadmap's identity or learning goal.

Do not omit essential prerequisites merely to shorten a package.

Do not create a different roadmap identity for each package. The same
roadmap and package combination must produce a consistent curriculum
contract.

### 7. Technical accuracy and relevance

Use current, relevant engineering practices appropriate to the roadmap.

Distinguish fundamentals from tools, optional branches, advanced topics,
and technologies that solve different problems.

Avoid obsolete recommendations unless historical understanding is useful.

Do not claim that a particular technology is mandatory when viable
alternatives exist.

Include production engineering, security, testing, deployment,
scalability, or interview preparation only where relevant to the
selected roadmap's goal.

### 8. Avoid duplication

Do not repeat the same full topic across multiple phases without reason.

If a topic is revisited at a more advanced level, explain how its
depth or application changes.

Make prerequisites explicit so the frontend can represent relationships
between topics and learning paths.

## REQUIRED OUTPUT

Return exactly one valid JSON object.

Do not wrap it in Markdown fences.
Do not include commentary before or after the JSON.
Do not include unsupported claims that a resource has been verified.

Use this structure:

{
  "schemaVersion": 1,
  "roadmapId": "catalog-roadmap-id",
  "title": "Roadmap title",
  "summary": "Clear summary of the roadmap and its intended outcome",
  "package": {
    "id": "selected-package-id",
    "name": "Human-readable package name",
    "description": "What this package covers"
  },
  "learningOutcomes": [
    "Specific outcome the learner should achieve"
  ],
  "phases": [
    {
      "id": "phase-0",
      "order": 0,
      "title": "Phase title",
      "purpose": "Why this phase exists",
      "prerequisites": [],
      "learningOutcomes": [
        "Measurable learning outcome"
      ],
      "topics": [
        {
          "id": "unique-topic-id",
          "title": "Topic title",
          "description": "What the learner must understand",
          "importance": "Why this topic matters",
          "type": "core",
          "prerequisites": [],
          "estimatedHours": 4,
          "subtopics": [
            "Specific subtopic"
          ],
          "practiceTasks": [
            "Practical task"
          ],
          "resources": [
            {
              "title": "Resource title",
              "url": "https://example.com/replace-with-real-resource",
              "type": "official_docs",
              "purpose": "What this resource helps the learner understand"
            }
          ],
          "completionCriteria": [
            "Observable criterion demonstrating mastery"
          ],
          "options": []
        }
      ],
      "projects": [
        {
          "id": "unique-project-id",
          "title": "Project title",
          "description": "What to build and why",
          "requirements": [
            "Specific requirement"
          ],
          "skillsPracticed": [
            "Skill"
          ],
          "completionCriteria": [
            "Definition of done"
          ]
        }
      ],
      "completionCriteria": [
        "Phase-level completion requirement"
      ]
    }
  ],
  "learningPaths": [
    {
      "id": "unique-path-id",
      "title": "Learning path title",
      "description": "Who this path suits and why",
      "recommendedFor": [
        "Relevant learner goal"
      ],
      "topicIds": [
        "topic-id-from-a-phase"
      ],
      "nextPathIds": [],
      "tradeoffs": [
        "Important trade-off"
      ]
    }
  ],
  "decisionGuides": [
    {
      "id": "unique-decision-id",
      "question": "What decision is the learner making?",
      "recommendation": "A clear default recommendation",
      "alternatives": [
        {
          "name": "Alternative",
          "whenToChoose": "Situation where this option makes sense",
          "tradeoffs": [
            "Relevant trade-off"
          ],
          "prerequisites": [
            "Required knowledge or topic ID"
          ]
        }
      ]
    }
  ],
  "capstoneProjects": [
    {
      "id": "unique-capstone-id",
      "title": "Capstone project title",
      "description": "What the learner will build",
      "requirements": [
        "Specific requirement"
      ],
      "skillsPracticed": [
        "Skill"
      ],
      "completionCriteria": [
        "Definition of done"
      ]
    }
  ],
  "finalReadinessChecklist": [
    "Observable skill or capability"
  ]
}

## JSON AND CONSISTENCY REQUIREMENTS

- Use the actual selected roadmap ID and package ID.
- Every ID must be unique within its entity type.
- Use stable, descriptive IDs rather than random identifiers.
- Phase order must be sequential starting at zero.
- Prerequisites must reference existing topic or phase IDs where applicable.
- Learning-path topicIds must reference existing topic IDs.
- nextPathIds must reference existing learning-path IDs.
- Keep the common foundation distinct from optional learning branches.
- Use topic type values such as "core", "optional", "advanced",
  "project", or "specialization" consistently.
- Use empty arrays instead of null for absent collections.
- Estimated hours must be non-negative numbers.
- Resources must have meaningful titles and accurate URLs.
- If a URL cannot be established reliably, do not invent one.
- Keep descriptions specific, actionable, and technically accurate.
- Ensure all referenced IDs exist and the output is valid JSON.
`;
};

export default roadmapGenerationPrompt;

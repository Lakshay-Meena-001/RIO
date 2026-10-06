const LEARNING_SYSTEM_VERSION = 1;

const LEARNING_SYSTEM = {
  version: LEARNING_SYSTEM_VERSION,

  title: "How to Actually Follow This Roadmap",

  description:
    "Use this system to turn the roadmap into actual learning and practical ability. The goal is progress, not endless preparation.",

  sections: [
    {
      id: "learn",
      title: "How to Learn",
      rules: [
        "Understand the concept before chasing completion.",
        "Focus on why the concept exists, what problem it solves, and how it works.",
        "Do not measure learning only by watching videos or finishing chapters.",
        "Use one primary resource for a topic instead of continuously switching resources.",
      ],
    },

    {
      id: "practice",
      title: "How to Practice",
      rules: [
        "After learning a concept, close the tutorial and try to reproduce the idea from memory.",
        "Write code, solve problems, or implement the concept instead of only rereading it.",
        "When stuck, identify the exact missing piece instead of restarting the entire topic.",
        "Look up only what is necessary to unblock yourself, then continue practicing.",
      ],
    },

    {
      id: "enough",
      title: "Know When You Are Good Enough",
      rules: [
        "You do not need perfect mastery before moving forward.",
        "Move forward when you can explain the core idea, implement the important parts, apply it to a realistic problem, and understand your common mistakes.",
        "Return for deeper revision later when the concept becomes relevant again.",
      ],
    },

    {
      id: "recall",
      title: "Active Recall",
      rules: [
        "Try to remember the concept before opening your notes or resource.",
        "Explain the idea in your own words.",
        "Recreate important code or steps without copying.",
        "Use questions and small problems to test whether you actually remember the concept.",
      ],
    },

    {
      id: "revision",
      title: "Revision",
      rules: [
        "Revision should be based on recall and application, not passive rereading.",
        "Revisit weak concepts more often than concepts you already remember.",
        "Use previous mistakes, failed implementations, and difficult problems as revision material.",
        "Keep revision connected to actual work so that knowledge becomes usable.",
      ],
    },

    {
      id: "apply",
      title: "Apply What You Learn",
      rules: [
        "Apply important concepts while learning instead of waiting until the entire roadmap is finished.",
        "Build small implementations when a concept benefits from hands-on practice.",
        "Connect related concepts together through realistic features or projects.",
        "Prefer building and debugging over copying finished solutions.",
      ],
    },

    {
      id: "learning-record",
      title: "Keep a Learning Record",
      rules: [
        "Record what you learned.",
        "Record what you can explain without help.",
        "Record what you can implement.",
        "Record what confused you or required external help.",
        "Record mistakes and concepts that need revision.",
      ],
    },

    {
      id: "explain",
      title: "Explain What You Learned",
      rules: [
        "Explain important concepts as if you were teaching someone else.",
        "Be able to explain why a particular approach was chosen.",
        "For technical decisions, explain alternatives and tradeoffs when relevant.",
        "If you cannot explain a concept simply, treat that as a signal to revisit it.",
      ],
    },

    {
      id: "stuck",
      title: "What To Do When You Are Stuck",
      rules: [
        "Stop and identify the exact point of confusion.",
        "Separate a knowledge gap from a coding or debugging mistake.",
        "Fix the smallest blocker first.",
        "Do not restart an entire course or roadmap because of one difficult concept.",
        "After fixing the blocker, continue from where you stopped.",
      ],
    },

    {
      id: "tutorial-hell",
      title: "Tutorial Hell Protection",
      rules: [
        "Do not continuously switch between courses, playlists, books, and tutorials.",
        "Choose one primary learning resource for the current topic.",
        "Use supplementary resources only when the primary resource does not resolve a specific gap.",
        "Prefer implementing from memory over repeatedly watching the same explanation.",
      ],
    },

    {
      id: "fomo",
      title: "FOMO Protection",
      rules: [
        "Do not chase a technology simply because it is trending.",
        "If a technology is not required by your current goal or roadmap, do not add it automatically.",
        "Re-evaluate new technologies only when your target role, project, or actual requirement makes them relevant.",
        "Depth in relevant skills is more valuable than shallow exposure to everything.",
      ],
    },

    {
      id: "consistency",
      title: "Consistency and Environment",
      rules: [
        "Follow one roadmap at a time.",
        "Keep a predictable learning schedule that you can realistically maintain.",
        "Reduce unnecessary context switching between unrelated topics.",
        "Keep your active resources and tasks limited so that the next action is obvious.",
        "Build a process that continues even when motivation is low.",
      ],
    },

    {
      id: "soft-skills",
      title: "Technical Communication",
      rules: [
        "Practice explaining technical decisions clearly.",
        "Write concise documentation for meaningful work.",
        "Learn to ask precise technical questions.",
        "Communicate assumptions, tradeoffs, limitations, and failure cases.",
        "Practice presenting projects and explaining your implementation choices.",
      ],
    },

    {
      id: "interview-job",
      title: "Interview and Job Applications",
      rules: [
        "Do not wait for 100 percent completion of the roadmap before applying.",
        "Start interviewing when you have enough relevant preparation for the target role.",
        "Use interview failures and feedback as information about specific gaps.",
        "Improve the identified gap instead of restarting the entire preparation process.",
      ],
    },

    {
      id: "failure-feedback",
      title: "Failure Becomes Feedback",
      rules: [
        "A failed problem, project, interview, or implementation is useful feedback.",
        "Identify what caused the failure.",
        "Convert the failure into a specific improvement task.",
        "Re-test the same skill later to confirm that the gap was actually fixed.",
      ],
    },

    {
      id: "move-forward",
      title: "When To Move Forward",
      rules: [
        "Move forward when the current module has achieved its intended learning outcomes.",
        "Do not stay indefinitely because you have not mastered every edge case.",
        "Keep difficult or incomplete areas in your weakness log for later revision.",
        "The roadmap is a progression system, not a requirement to become perfect before continuing.",
      ],
    },
  ],
};

export { LEARNING_SYSTEM, LEARNING_SYSTEM_VERSION };
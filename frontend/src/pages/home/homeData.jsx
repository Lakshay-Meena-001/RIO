import { FiBarChart2, FiFileText, FiMap, FiMic } from "react-icons/fi";

export const agents = [
  {
    icon: <FiFileText />,
    number: "01",
    title: "Resume Agent",
    desc: "Turn your experience into a stronger, role-aligned resume and identify what is holding your profile back.",
  },
  {
    icon: <FiMic />,
    number: "02",
    title: "Interview Agent",
    desc: "Practice realistic HR, technical and coding interviews with questions shaped around your target role.",
  },
  {
    icon: <FiBarChart2 />,
    number: "03",
    title: "Feedback Agent",
    desc: "Understand how you performed, where you lost points, and which skills need attention next.",
  },
  {
    icon: <FiMap />,
    number: "04",
    title: "Roadmap Agent",
    desc: "Convert your gaps into a focused learning path instead of another endless list of resources.",
  },
];

export const journey = [
  {
    step: "01",
    title: "Build your profile",
    desc: "Bring your resume, target role, experience and goals into one persistent career profile.",
  },
  {
    step: "02",
    title: "Get assessed",
    desc: "Use role-aware interviews and assessments to understand your current technical and communication level.",
  },
  {
    step: "03",
    title: "See the gaps",
    desc: "RIO turns performance into clear skill signals so you know what actually needs work.",
  },
  {
    step: "04",
    title: "Follow the path",
    desc: "Get a measurable roadmap, practice deliberately, then reassess and track the change.",
  },
];

export const skills = [
  { name: "Data Structures & Algorithms", value: 78 },
  { name: "System Design", value: 62 },
  { name: "Communication", value: 84 },
  { name: "Problem Solving", value: 71 },
];

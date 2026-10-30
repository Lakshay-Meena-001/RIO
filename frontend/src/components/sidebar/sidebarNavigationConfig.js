import {
  FiBarChart2,
  FiCreditCard,
  FiFileText,
  FiHome,
  FiMap,
  FiSettings,
  FiStar,
  FiUser,
} from "react-icons/fi";

export const navigationItems = [
  { label: "Overview", icon: FiHome, path: "/dashboard" },
  { label: "Resume Builder", icon: FiFileText, path: "/builder/dashboard" },
  { label: "Resume Scorer", icon: FiStar, path: "/scorer" },
  { label: "Mock Interview", icon: FiBarChart2, path: "/mock-interview" },
  { label: "Roadmap Builder", icon: FiMap, path: "/roadmap" },
  { label: "Progress", icon: FiBarChart2, path: "/progress" },
];

export const accountItems = [
  { label: "Billing", icon: FiCreditCard, path: "/billing" },
  { label: "Profile", icon: FiUser, path: "/profile" },
  { label: "Settings", icon: FiSettings, path: "/settings" },
];

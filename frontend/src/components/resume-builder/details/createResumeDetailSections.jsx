import {
  Award,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  GraduationCap,
  Languages,
  UserRound,
  Wrench,
} from "lucide-react";
import { DetailText, EntryList } from "../details/ResumeHistoryDetails";

/** Build the read-only sections shown for a selected resume. */
export function createResumeDetailSections(data = {}) {
  const profile = data?.profile || {};
  return [
    {
      title: "Profile",
      icon: UserRound,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailText label="Full name" value={profile.name} />
          <DetailText
            label="Professional title"
            value={profile.title || profile.headline}
          />
          <DetailText label="Email" value={profile.email} />
          <DetailText label="Phone" value={profile.phone} />
          <DetailText label="Location" value={profile.location} />
          <DetailText label="LinkedIn" value={profile.linkedIn} />
          <DetailText label="GitHub" value={profile.github} />
          <DetailText label="Portfolio" value={profile.portfolio} />
          <DetailText label="LeetCode" value={profile.leetcode} />
        </div>
      ),
    },
    {
      title: "Professional summary",
      icon: FileText,
      content: (
        <p className="rounded-2xl border border-white/[.08] bg-[linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.015))] p-4 text-[14px] leading-7 text-white/75 sm:p-5">
          {data.summary || "No professional summary added yet."}
        </p>
      ),
    },
    {
      title: "Work experience",
      icon: BriefcaseBusiness,
      count: data.experience?.length || 0,
      content: (
        <EntryList
          items={data.experience}
          titleKeys={["role", "title", "position"]}
          subtitleKeys={["company", "organization"]}
          dateKeys={["startDate", "endDate", "duration"]}
          descriptionKeys={["description", "responsibilities", "achievements"]}
        />
      ),
    },
    {
      title: "Education",
      icon: GraduationCap,
      count: data.education?.length || 0,
      content: (
        <EntryList
          items={data.education}
          titleKeys={["degree", "qualification", "school", "institution"]}
          subtitleKeys={["institution", "school", "field", "major"]}
          dateKeys={["startDate", "endDate", "year"]}
          descriptionKeys={["description", "details"]}
        />
      ),
    },
    {
      title: "Projects",
      icon: FolderKanban,
      count: data.projects?.length || 0,
      content: (
        <EntryList
          items={data.projects}
          titleKeys={["name", "title"]}
          subtitleKeys={["technologies", "techStack", "role"]}
          dateKeys={["startDate", "endDate"]}
          descriptionKeys={["description", "details", "impact"]}
        />
      ),
    },
    {
      title: "Skills",
      icon: Wrench,
      count: data.skills?.length || 0,
      content: (
        <div className="flex flex-wrap gap-2.5">
          {data.skills?.length ? (
            data.skills.map((skill, i) => (
              <span
                key={i}
                className="rounded-xl border border-white/[.09] bg-white/[.04] px-3.5 py-2 text-[13px] font-medium text-white/80"
              >
                {typeof skill === "string"
                  ? skill
                  : skill.name || skill.skill || JSON.stringify(skill)}
              </span>
            ))
          ) : (
            <p className="text-xs text-white/35">No skills added yet.</p>
          )}
        </div>
      ),
    },
    {
      title: "Certifications",
      icon: Award,
      count: data.certifications?.length || 0,
      content: (
        <EntryList
          items={data.certifications}
          titleKeys={["name", "title", "certification"]}
          subtitleKeys={["issuer", "organization"]}
          dateKeys={["date", "year"]}
          descriptionKeys={["description"]}
        />
      ),
    },
    {
      title: "Achievements",
      icon: Award,
      count: data.achievements?.length || 0,
      content: (
        <EntryList
          items={data.achievements}
          titleKeys={["name", "title"]}
          subtitleKeys={["issuer", "organization"]}
          dateKeys={["date", "year"]}
          descriptionKeys={["description"]}
        />
      ),
    },
    {
      title: "Languages",
      icon: Languages,
      count: data.languages?.length || 0,
      content: (
        <div className="flex flex-wrap gap-2.5">
          {data.languages?.length ? (
            data.languages.map((language, i) => (
              <span
                key={i}
                className="rounded-xl border border-white/[.09] bg-white/[.04] px-3.5 py-2 text-[13px] font-medium text-white/80"
              >
                {typeof language === "string"
                  ? language
                  : [
                      language.name || language.language,
                      language.proficiency || language.level,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
              </span>
            ))
          ) : (
            <p className="text-xs text-white/35">No languages added yet.</p>
          )}
        </div>
      ),
    },
  ];
}

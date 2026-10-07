import ResourceCard from "./ResourceCard";

const ResourceList = ({ resources = [] }) => {
  if (!resources.length) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
        <p className="text-xs leading-5 text-white/30">
          No resources are available for this module yet.
        </p>
      </div>
    );
  }

  const sortedResources = [...resources].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  return (
    <div className="space-y-2.5">
      {sortedResources.map((resource, index) => (
        <ResourceCard
          key={
            resource.url ||
            `${resource.type || "resource"}-${resource.title || index}`
          }
          resource={resource}
        />
      ))}
    </div>
  );
};

export default ResourceList;

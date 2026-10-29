import roadmapCatalog from "../data/roadmapCatalog.data.js";

const catalogById = new Map(
  roadmapCatalog.map((roadmap) => [roadmap.id, roadmap]),
);

export function getAllRoadmaps() {
  return roadmapCatalog.map((roadmap) => ({ ...roadmap }));
}

export function getRoadmapsByCategory(category) {
  if (typeof category !== "string" || !category.trim()) {
    return getAllRoadmaps();
  }

  const normalizedCategory = category.trim().toLowerCase();

  return roadmapCatalog
    .filter((roadmap) => roadmap.category.toLowerCase() === normalizedCategory)
    .map((roadmap) => ({ ...roadmap }));
}

export function getRoadmapById(roadmapId) {
  if (typeof roadmapId !== "string" || !roadmapId.trim()) {
    return null;
  }

  const roadmap = catalogById.get(roadmapId.trim());

  return roadmap ? { ...roadmap } : null;
}

export function roadmapExists(roadmapId) {
  return typeof roadmapId === "string" && catalogById.has(roadmapId.trim());
}

export function getRoadmapCategories() {
  return [...new Set(roadmapCatalog.map((roadmap) => roadmap.category))].sort(
    (a, b) => a.localeCompare(b),
  );
}

export function searchRoadmaps(query) {
  if (typeof query !== "string" || !query.trim()) {
    return getAllRoadmaps();
  }

  const normalizedQuery = query.trim().toLowerCase();

  return roadmapCatalog
    .filter((roadmap) => {
      const searchableText = [
        roadmap.id,
        roadmap.title,
        roadmap.description,
        roadmap.goal,
        roadmap.category,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    })
    .map((roadmap) => ({ ...roadmap }));
}

export default {
  getAllRoadmaps,
  getRoadmapsByCategory,
  getRoadmapById,
  roadmapExists,
  getRoadmapCategories,
  searchRoadmaps,
};

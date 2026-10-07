const createRoadmapDefinition = ({
  id,
  version = 1,
  type = "role",
  title,
  description,
  goal,
  nodes = [],
  edges = [],
  alternatives = [],
  metadata = {},
}) => ({
  id,
  version,
  type,
  title,
  description,
  goal,
  nodes,
  edges,
  alternatives,
  metadata,
});

export { createRoadmapDefinition };

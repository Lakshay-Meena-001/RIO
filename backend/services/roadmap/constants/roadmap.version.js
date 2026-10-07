/**
 * RIO Roadmap Versioning
 *
 * Canonical version information for roadmap knowledge.
 *
 * Important:
 * - Every canonical roadmap has its own version.
 * - User roadmaps store the template version they were generated from.
 * - Updating canonical knowledge should create a new version.
 */

/* -------------------------------------------------------------------------- */
/* Knowledge Version                                                           */
/* -------------------------------------------------------------------------- */

export const ROADMAP_KNOWLEDGE_VERSION = 1;

/* -------------------------------------------------------------------------- */
/* Template Versions                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Canonical roadmap template versions.
 *
 * Keep these explicit instead of deriving them dynamically.
 * A version change is a deliberate product/content change.
 */
export const ROADMAP_TEMPLATE_VERSIONS = Object.freeze({
  "frontend-developer": 1,
});

/* -------------------------------------------------------------------------- */
/* Version Helpers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Return the current version of a roadmap template.
 */
export const getRoadmapTemplateVersion = (templateId) => {
  return ROADMAP_TEMPLATE_VERSIONS[templateId] || null;
};

/**
 * Check whether a roadmap template is registered and versioned.
 */
export const hasRoadmapTemplateVersion = (templateId) => {
  return Object.prototype.hasOwnProperty.call(
    ROADMAP_TEMPLATE_VERSIONS,
    templateId
  );
};

/**
 * Check whether two template versions are identical.
 */
export const isSameTemplateVersion = (
  templateId,
  version
) => {
  const currentVersion = getRoadmapTemplateVersion(templateId);

  return currentVersion !== null && currentVersion === version;
};

/* -------------------------------------------------------------------------- */
/* Public Export                                                              */
/* -------------------------------------------------------------------------- */

export default {
  ROADMAP_KNOWLEDGE_VERSION,
  ROADMAP_TEMPLATE_VERSIONS,
  getRoadmapTemplateVersion,
  hasRoadmapTemplateVersion,
  isSameTemplateVersion,
};
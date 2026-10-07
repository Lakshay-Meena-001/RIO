import templateService from "../services/template.service.js";

// ============================================================
// HELPERS
// ============================================================

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

// ============================================================
// PARAM VALIDATION
// ============================================================

function requireParam(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    const error = new Error(`${name} is required`);

    error.statusCode = 400;

    throw error;
  }

  return value.trim();
}

// ============================================================
// GET TEMPLATES
// ============================================================

async function getTemplates(req, res, next) {
  try {
    const templates = templateService.getAvailableTemplates();

    return sendSuccess(res, templates);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET TEMPLATE
// ============================================================

async function getTemplate(req, res, next) {
  try {
    const templateId = requireParam(req.params.templateId, "templateId");

    const template = templateService.getTemplate(templateId);

    return sendSuccess(res, template);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET TEMPLATE PHASES
// ============================================================

async function getTemplatePhases(req, res, next) {
  try {
    const templateId = requireParam(req.params.templateId, "templateId");

    const phases = templateService.getTemplatePhases(templateId);

    return sendSuccess(res, phases);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET TEMPLATE NODE
// ============================================================

async function getTemplateNode(req, res, next) {
  try {
    const templateId = requireParam(req.params.templateId, "templateId");

    const nodeId = requireParam(req.params.nodeId, "nodeId");

    const node = templateService.getTemplateNode(templateId, nodeId);

    return sendSuccess(res, node);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET NODE NEXT STEPS
// ============================================================

async function getNodeNextSteps(req, res, next) {
  try {
    const templateId = requireParam(req.params.templateId, "templateId");

    const nodeId = requireParam(req.params.nodeId, "nodeId");

    const nextSteps = templateService.getNodeNextSteps(templateId, nodeId);

    return sendSuccess(res, nextSteps);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// GET NODE DEPENDENCIES
// ============================================================

async function getNodeDependencies(req, res, next) {
  try {
    const templateId = requireParam(req.params.templateId, "templateId");

    const nodeId = requireParam(req.params.nodeId, "nodeId");

    const dependencies = templateService.getNodeDependencies(
      templateId,
      nodeId,
    );

    return sendSuccess(res, dependencies);
  } catch (error) {
    return next(error);
  }
}

// ============================================================
// EXPORTS
// ============================================================

export {
  getTemplates,
  getTemplate,
  getTemplatePhases,
  getTemplateNode,
  getNodeNextSteps,
  getNodeDependencies,
};

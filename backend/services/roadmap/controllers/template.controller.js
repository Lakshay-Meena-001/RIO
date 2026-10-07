import templateService from "../services/template.service.js";

const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const errorResponse = (res, error) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error." : error.message,
  });
};

/*
|--------------------------------------------------------------------------
| Get Available Templates
|--------------------------------------------------------------------------
*/

const getTemplates = async (req, res) => {
  try {
    const templates = templateService.getAvailableTemplates();

    return successResponse(res, templates);
  } catch (error) {
    return errorResponse(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Template
|--------------------------------------------------------------------------
*/

const getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = templateService.getTemplateSummary(templateId);

    return successResponse(res, template);
  } catch (error) {
    return errorResponse(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Template Phases
|--------------------------------------------------------------------------
*/

const getTemplatePhases = async (req, res) => {
  try {
    const { templateId } = req.params;

    const phases = templateService.getTemplatePhases(templateId);

    return successResponse(res, phases);
  } catch (error) {
    return errorResponse(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Template Node
|--------------------------------------------------------------------------
*/

const getTemplateNode = async (req, res) => {
  try {
    const { templateId, nodeId } = req.params;

    const node = templateService.getTemplateNode(templateId, nodeId);

    return successResponse(res, node);
  } catch (error) {
    return errorResponse(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Node Next Steps
|--------------------------------------------------------------------------
*/

const getNodeNextSteps = async (req, res) => {
  try {
    const { templateId, nodeId } = req.params;

    const nextSteps = templateService.getNodeNextSteps(templateId, nodeId);

    return successResponse(res, nextSteps);
  } catch (error) {
    return errorResponse(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Node Dependencies
|--------------------------------------------------------------------------
*/

const getNodeDependencies = async (req, res) => {
  try {
    const { templateId, nodeId } = req.params;

    const dependencies = templateService.getNodeDependencies(
      templateId,
      nodeId,
    );

    return successResponse(res, dependencies);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export {
  getTemplates,
  getTemplate,
  getTemplatePhases,
  getTemplateNode,
  getNodeNextSteps,
  getNodeDependencies,
};

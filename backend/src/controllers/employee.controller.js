const employeeService = require('../services/employee.service');
const { submitSchema, draftSchema } = require('../validators/feedback.validator');

async function getProfile(req, res, next) {
  try {
    const profile = await employeeService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function getFeedbackGiven(req, res, next) {
  try {
    const assignments = await employeeService.getFeedbackGiven(req.user.id, req.user.companyId);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

async function getFeedbackReceived(req, res, next) {
  try {
    const feedback = await employeeService.getFeedbackReceived(req.user.id, req.user.companyId);
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}

async function getFeedbackHistory(req, res, next) {
  try {
    const history = await employeeService.getFeedbackHistory(req.user.id, req.user.companyId);
    res.json(history);
  } catch (err) {
    next(err);
  }
}

async function getAssignment(req, res, next) {
  try {
    const data = await employeeService.getAssignment(req.params.id, req.user.id, req.user.companyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function saveDraft(req, res, next) {
  try {
    const { error, value } = draftSchema.validate(req.body);
    if (error) {
      error.status = 400;
      return next(error);
    }
    const result = await employeeService.saveDraft(req.params.id, req.user.id, req.user.companyId, value.items);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function submitFeedback(req, res, next) {
  try {
    const { error, value } = submitSchema.validate(req.body);
    if (error) {
      error.status = 400;
      return next(error);
    }
    const result = await employeeService.submitFeedback(req.params.id, req.user.id, req.user.companyId, value.items);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getReceivedFeedbackDetail(req, res, next) {
  try {
    const data = await employeeService.getReceivedFeedbackDetail(req.params.id, req.user.id, req.user.companyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getTeam(req, res, next) {
  try {
    const team = await employeeService.getTeam(req.user.id, req.user.companyId);
    res.json(team);
  } catch (err) {
    next(err);
  }
}

async function initiateFeedback(req, res, next) {
  try {
    const { employeeId } = req.params;
    const result = await employeeService.initiateFeedback(req.user.id, employeeId, req.user.companyId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  getFeedbackGiven,
  getFeedbackReceived,
  getFeedbackHistory,
  getAssignment,
  saveDraft,
  submitFeedback,
  getReceivedFeedbackDetail,
  getTeam,
  initiateFeedback,
};

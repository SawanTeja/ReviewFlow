const hrService = require('../services/hr.service');

async function getEmployees(req, res, next) {
  try {
    const employees = await hrService.getEmployees(req.user.companyId);
    res.json(employees);
  } catch (err) {
    next(err);
  }
}

async function getReviewPeriods(req, res, next) {
  try {
    const periods = await hrService.getReviewPeriods(req.user.companyId);
    res.json(periods);
  } catch (err) {
    next(err);
  }
}

async function getReviewPeriodStatus(req, res, next) {
  try {
    const status = await hrService.getReviewPeriodStatus(req.params.id, req.user.companyId);
    res.json(status);
  } catch (err) {
    next(err);
  }
}

async function getPendingAssignments(req, res, next) {
  try {
    const pending = await hrService.getPendingAssignments(req.params.id, req.user.companyId);
    res.json(pending);
  } catch (err) {
    next(err);
  }
}

async function getFeedback(req, res, next) {
  try {
    const filters = {
      reviewPeriodId: req.query.reviewPeriodId,
      reviewerId: req.query.reviewerId,
      recipientId: req.query.recipientId,
    };
    const feedback = await hrService.getFeedback(req.user.companyId, filters);
    res.json(feedback);
  } catch (err) {
    next(err);
  }
}

async function getAllAssignments(req, res, next) {
  try {
    const assignments = await hrService.getAllAssignments(req.params.id, req.user.companyId);
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getEmployees,
  getReviewPeriods,
  getReviewPeriodStatus,
  getPendingAssignments,
  getFeedback,
  getAllAssignments,
};

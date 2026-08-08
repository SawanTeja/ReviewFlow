const adminService = require('../services/admin.service');

async function createCompany(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Company name is required' });
    const company = await adminService.createCompany(name);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { companyId, name, email, password, role, managerId } = req.body;
    if (!companyId || !name || !email || !password) {
      return res.status(400).json({ error: 'companyId, name, email, and password are required' });
    }
    const user = await adminService.createUser({ companyId, name, email, password, role, managerId });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function createReviewPeriod(req, res, next) {
  try {
    const { companyId, year, month, status, startDate, endDate } = req.body;
    if (!companyId || !year || !month) {
      return res.status(400).json({ error: 'companyId, year, and month are required' });
    }
    const period = await adminService.createReviewPeriod({ companyId, year, month, status, startDate, endDate });
    res.status(201).json(period);
  } catch (err) {
    next(err);
  }
}

async function createFeedbackAssignment(req, res, next) {
  try {
    const { companyId, reviewPeriodId, reviewerId, recipientId } = req.body;
    if (!companyId || !reviewPeriodId || !reviewerId || !recipientId) {
      return res.status(400).json({ error: 'companyId, reviewPeriodId, reviewerId, and recipientId are required' });
    }
    const assignment = await adminService.createFeedbackAssignment({ companyId, reviewPeriodId, reviewerId, recipientId });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

module.exports = { createCompany, createUser, createReviewPeriod, createFeedbackAssignment };

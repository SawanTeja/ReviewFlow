const bcrypt = require('bcrypt');
const db = require('../db/knex');

async function createCompany(name) {
  const [company] = await db('companies').insert({ name }).returning('*');
  return company;
}

async function createUser({ companyId, name, email, password, role, managerId }) {
  const existing = await db('users').where({ email }).first();
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const company = await db('companies').where({ id: companyId }).first();
  if (!company) {
    const err = new Error('Company not found');
    err.status = 404;
    throw err;
  }

  if (managerId) {
    const manager = await db('users').where({ id: managerId, company_id: companyId }).first();
    if (!manager) {
      const err = new Error('Manager not found or belongs to a different company');
      err.status = 400;
      throw err;
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db('users')
    .insert({
      company_id: companyId,
      name,
      email,
      password_hash: passwordHash,
      role: role || 'EMPLOYEE',
      manager_id: managerId || null,
    })
    .returning(['id', 'company_id', 'name', 'email', 'role', 'manager_id', 'is_active']);

  return user;
}

async function createReviewPeriod({ companyId, year, month, status, startDate, endDate }) {
  const company = await db('companies').where({ id: companyId }).first();
  if (!company) {
    const err = new Error('Company not found');
    err.status = 404;
    throw err;
  }

  const existing = await db('review_periods')
    .where({ company_id: companyId, year, month })
    .first();

  if (existing) {
    const err = new Error(`Review period ${month}/${year} already exists for this company`);
    err.status = 409;
    throw err;
  }

  const [period] = await db('review_periods')
    .insert({
      company_id: companyId,
      year,
      month,
      status: status || 'OPEN',
      start_date: startDate || null,
      end_date: endDate || null,
    })
    .returning('*');

  return period;
}

async function createFeedbackAssignment({ companyId, reviewPeriodId, reviewerId, recipientId }) {
  const period = await db('review_periods')
    .where({ id: reviewPeriodId, company_id: companyId })
    .first();

  if (!period) {
    const err = new Error('Review period not found or belongs to a different company');
    err.status = 400;
    throw err;
  }

  const reviewer = await db('users').where({ id: reviewerId, company_id: companyId }).first();
  if (!reviewer) {
    const err = new Error('Reviewer not found or belongs to a different company');
    err.status = 400;
    throw err;
  }

  const recipient = await db('users').where({ id: recipientId, company_id: companyId }).first();
  if (!recipient) {
    const err = new Error('Recipient not found or belongs to a different company');
    err.status = 400;
    throw err;
  }

  if (reviewerId === recipientId) {
    const err = new Error('Reviewer and recipient cannot be the same person');
    err.status = 400;
    throw err;
  }

  const existing = await db('feedback_assignments')
    .where({ review_period_id: reviewPeriodId, reviewer_id: reviewerId, recipient_id: recipientId })
    .first();

  if (existing) {
    const err = new Error('Assignment already exists for this reviewer/recipient/period');
    err.status = 409;
    throw err;
  }

  const [assignment] = await db('feedback_assignments')
    .insert({
      company_id: companyId,
      review_period_id: reviewPeriodId,
      reviewer_id: reviewerId,
      recipient_id: recipientId,
      status: 'PENDING',
    })
    .returning('*');

  return assignment;
}

module.exports = { createCompany, createUser, createReviewPeriod, createFeedbackAssignment };

const db = require('../db/knex');

async function getEmployees(companyId) {
  return db('users')
    .where({ company_id: companyId })
    .select('id', 'name', 'email', 'role', 'manager_id', 'is_active')
    .orderBy('name');
}

async function getReviewPeriods(companyId) {
  return db('review_periods')
    .where({ company_id: companyId })
    .select('id', 'year', 'month', 'status', 'start_date', 'end_date')
    .orderBy([{ column: 'year', order: 'desc' }, { column: 'month', order: 'desc' }]);
}

async function getReviewPeriodStatus(periodId, companyId) {
  const period = await db('review_periods')
    .where({ id: periodId, company_id: companyId })
    .first();

  if (!period) {
    const err = new Error('Review period not found');
    err.status = 404;
    throw err;
  }

  const assignments = await db('feedback_assignments')
    .where({ review_period_id: periodId, company_id: companyId })
    .select('status');

  const total = assignments.length;
  const submitted = assignments.filter((a) => a.status === 'SUBMITTED').length;
  const pending = total - submitted;
  const completionPercentage = total > 0 ? Math.round((submitted / total) * 10000) / 100 : 0;

  return {
    period: {
      id: period.id,
      year: period.year,
      month: period.month,
      status: period.status,
    },
    total,
    submitted,
    pending,
    completionPercentage,
  };
}

async function getPendingAssignments(periodId, companyId) {
  const period = await db('review_periods')
    .where({ id: periodId, company_id: companyId })
    .first();

  if (!period) {
    const err = new Error('Review period not found');
    err.status = 404;
    throw err;
  }

  return db('feedback_assignments as fa')
    .join('users as reviewer', 'fa.reviewer_id', 'reviewer.id')
    .join('users as recipient', 'fa.recipient_id', 'recipient.id')
    .where({ 'fa.review_period_id': periodId, 'fa.company_id': companyId })
    .whereIn('fa.status', ['PENDING', 'DRAFT'])
    .select(
      'fa.id',
      'fa.status',
      'reviewer.name as reviewer_name',
      'reviewer.id as reviewer_id',
      'recipient.name as recipient_name',
      'recipient.id as recipient_id'
    )
    .orderBy('reviewer.name');
}

async function getFeedback(companyId, filters = {}) {
  let query = db('feedback_assignments as fa')
    .join('feedback as f', 'f.assignment_id', 'fa.id')
    .join('feedback_items as fi', 'fi.feedback_id', 'f.id')
    .join('parameters as p', 'fi.parameter_id', 'p.id')
    .join('users as reviewer', 'fa.reviewer_id', 'reviewer.id')
    .join('users as recipient', 'fa.recipient_id', 'recipient.id')
    .join('review_periods as rp', 'fa.review_period_id', 'rp.id')
    .where({ 'fa.company_id': companyId, 'fa.status': 'SUBMITTED' });

  if (filters.reviewPeriodId) {
    query = query.where('fa.review_period_id', filters.reviewPeriodId);
  }

  if (filters.reviewerId) {
    query = query.where('fa.reviewer_id', filters.reviewerId);
  }

  if (filters.recipientId) {
    query = query.where('fa.recipient_id', filters.recipientId);
  }

  const rows = await query
    .select(
      'fa.id as assignment_id',
      'reviewer.name as reviewer_name',
      'recipient.name as recipient_name',
      'rp.month',
      'rp.year',
      'p.name as parameter_name',
      'p.display_order',
      'fi.score',
      'fi.comment',
      'f.submitted_at'
    )
    .orderBy([
      { column: 'rp.year', order: 'desc' },
      { column: 'rp.month', order: 'desc' },
      'reviewer.name',
      'recipient.name',
      'p.display_order',
    ]);

  const grouped = {};
  for (const row of rows) {
    const key = row.assignment_id;
    if (!grouped[key]) {
      grouped[key] = {
        assignmentId: row.assignment_id,
        reviewerName: row.reviewer_name,
        recipientName: row.recipient_name,
        month: row.month,
        year: row.year,
        submittedAt: row.submitted_at,
        items: [],
      };
    }
    grouped[key].items.push({
      parameterName: row.parameter_name,
      score: row.score,
      comment: row.comment,
    });
  }

  return Object.values(grouped);
}

async function getAllAssignments(periodId, companyId) {
  const period = await db('review_periods')
    .where({ id: periodId, company_id: companyId })
    .first();

  if (!period) {
    const err = new Error('Review period not found');
    err.status = 404;
    throw err;
  }

  return db('feedback_assignments as fa')
    .join('users as reviewer', 'fa.reviewer_id', 'reviewer.id')
    .join('users as recipient', 'fa.recipient_id', 'recipient.id')
    .where({ 'fa.review_period_id': periodId, 'fa.company_id': companyId })
    .select(
      'fa.id',
      'fa.status',
      'reviewer.name as reviewer_name',
      'reviewer.id as reviewer_id',
      'recipient.name as recipient_name',
      'recipient.id as recipient_id'
    )
    .orderBy(['reviewer.name', 'recipient.name']);
}

module.exports = {
  getEmployees,
  getReviewPeriods,
  getReviewPeriodStatus,
  getPendingAssignments,
  getFeedback,
  getAllAssignments,
};

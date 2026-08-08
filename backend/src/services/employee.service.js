const db = require('../db/knex');

async function getProfile(userId) {
  const user = await db('users')
    .join('companies', 'users.company_id', 'companies.id')
    .where('users.id', userId)
    .select(
      'users.id',
      'users.name',
      'users.email',
      'users.role',
      'users.manager_id',
      'users.company_id',
      'companies.name as company_name'
    )
    .first();

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return user;
}

async function getFeedbackGiven(userId, companyId) {
  return db('feedback_assignments as fa')
    .join('users as recipient', 'fa.recipient_id', 'recipient.id')
    .join('review_periods as rp', 'fa.review_period_id', 'rp.id')
    .where({ 'fa.reviewer_id': userId, 'fa.company_id': companyId })
    .select(
      'fa.id',
      'fa.status',
      'recipient.name as recipient_name',
      'recipient.id as recipient_id',
      'rp.month',
      'rp.year',
      'rp.status as period_status'
    )
    .orderBy([{ column: 'rp.year', order: 'desc' }, { column: 'rp.month', order: 'desc' }]);
}

async function getFeedbackReceived(userId, companyId) {
  return db('feedback_assignments as fa')
    .join('users as reviewer', 'fa.reviewer_id', 'reviewer.id')
    .join('review_periods as rp', 'fa.review_period_id', 'rp.id')
    .leftJoin('feedback as f', 'f.assignment_id', 'fa.id')
    .where({ 'fa.recipient_id': userId, 'fa.company_id': companyId, 'fa.status': 'SUBMITTED' })
    .select(
      'fa.id as assignment_id',
      'reviewer.name as reviewer_name',
      'reviewer.id as reviewer_id',
      'rp.month',
      'rp.year',
      'f.submitted_at'
    )
    .orderBy([{ column: 'rp.year', order: 'desc' }, { column: 'rp.month', order: 'desc' }]);
}

async function getFeedbackHistory(userId, companyId) {
  const rows = await db('feedback_assignments as fa')
    .join('feedback as f', 'f.assignment_id', 'fa.id')
    .join('feedback_items as fi', 'fi.feedback_id', 'f.id')
    .join('parameters as p', 'fi.parameter_id', 'p.id')
    .join('review_periods as rp', 'fa.review_period_id', 'rp.id')
    .where({ 'fa.recipient_id': userId, 'fa.company_id': companyId, 'fa.status': 'SUBMITTED' })
    .select(
      'p.id as parameter_id',
      'p.name as parameter_name',
      'p.display_order',
      'rp.month',
      'rp.year',
      'fi.score',
      'fi.comment'
    )
    .orderBy(['p.display_order', { column: 'rp.year' }, { column: 'rp.month' }]);

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.parameter_id]) {
      grouped[row.parameter_id] = {
        parameterId: row.parameter_id,
        parameterName: row.parameter_name,
        displayOrder: row.display_order,
        scores: [],
      };
    }
    grouped[row.parameter_id].scores.push({
      month: row.month,
      year: row.year,
      score: row.score,
      comment: row.comment,
    });
  }

  return Object.values(grouped).sort((a, b) => a.displayOrder - b.displayOrder);
}

async function getAssignment(assignmentId, userId, companyId) {
  const assignment = await db('feedback_assignments as fa')
    .join('users as reviewer', 'fa.reviewer_id', 'reviewer.id')
    .join('users as recipient', 'fa.recipient_id', 'recipient.id')
    .join('review_periods as rp', 'fa.review_period_id', 'rp.id')
    .where('fa.id', assignmentId)
    .select(
      'fa.*',
      'reviewer.name as reviewer_name',
      'recipient.name as recipient_name',
      'rp.month',
      'rp.year',
      'rp.status as period_status'
    )
    .first();

  if (!assignment) {
    const err = new Error('Assignment not found');
    err.status = 404;
    throw err;
  }

  if (assignment.company_id !== companyId) {
    const err = new Error('Access denied');
    err.status = 403;
    throw err;
  }

  if (assignment.reviewer_id !== userId) {
    const err = new Error('You are not the reviewer for this assignment');
    err.status = 403;
    throw err;
  }

  const feedback = await db('feedback').where({ assignment_id: assignmentId }).first();
  let items = [];
  if (feedback) {
    items = await db('feedback_items as fi')
      .join('parameters as p', 'fi.parameter_id', 'p.id')
      .where('fi.feedback_id', feedback.id)
      .select('fi.*', 'p.name as parameter_name', 'p.display_order')
      .orderBy('p.display_order');
  }

  const parameters = await db('parameters').where({ active: true }).orderBy('display_order');

  return { assignment, feedback, items, parameters };
}

async function saveDraft(assignmentId, userId, companyId, draftItems) {
  const assignment = await db('feedback_assignments')
    .where({ id: assignmentId, reviewer_id: userId, company_id: companyId })
    .first();

  if (!assignment) {
    const err = new Error('Assignment not found or access denied');
    err.status = 404;
    throw err;
  }

  if (assignment.status === 'SUBMITTED') {
    const err = new Error('Cannot modify submitted feedback');
    err.status = 400;
    throw err;
  }

  return db.transaction(async (trx) => {
    let feedback = await trx('feedback').where({ assignment_id: assignmentId }).first();

    if (!feedback) {
      const [created] = await trx('feedback')
        .insert({ assignment_id: assignmentId })
        .returning('*');
      feedback = created;
    }

    await trx('feedback_items').where({ feedback_id: feedback.id }).del();

    const itemsToInsert = draftItems
      .filter((item) => item.score !== null || item.comment)
      .map((item) => ({
        feedback_id: feedback.id,
        parameter_id: item.parameterId,
        score: item.score || null,
        comment: item.comment || null,
      }));

    if (itemsToInsert.length > 0) {
      await trx('feedback_items').insert(itemsToInsert);
    }

    await trx('feedback_assignments')
      .where({ id: assignmentId })
      .update({ status: 'DRAFT', updated_at: new Date() });

    return { message: 'Draft saved' };
  });
}

async function submitFeedback(assignmentId, userId, companyId, feedbackItems) {
  const assignment = await db('feedback_assignments')
    .where({ id: assignmentId, reviewer_id: userId, company_id: companyId })
    .first();

  if (!assignment) {
    const err = new Error('Assignment not found or access denied');
    err.status = 404;
    throw err;
  }

  if (assignment.status === 'SUBMITTED') {
    const err = new Error('Feedback already submitted');
    err.status = 400;
    throw err;
  }

  const period = await db('review_periods').where({ id: assignment.review_period_id }).first();
  if (period.status === 'CLOSED') {
    const err = new Error('Review period is closed');
    err.status = 400;
    throw err;
  }

  const activeParams = await db('parameters').where({ active: true }).orderBy('display_order');
  const activeParamIds = activeParams.map((p) => p.id);
  const submittedParamIds = feedbackItems.map((item) => item.parameterId);

  const allPresent = activeParamIds.every((id) => submittedParamIds.includes(id));
  if (!allPresent || submittedParamIds.length !== activeParamIds.length) {
    const err = new Error('All 5 parameters must be scored');
    err.status = 400;
    throw err;
  }

  return db.transaction(async (trx) => {
    let feedback = await trx('feedback').where({ assignment_id: assignmentId }).first();

    if (feedback) {
      await trx('feedback_items').where({ feedback_id: feedback.id }).del();
      await trx('feedback').where({ id: feedback.id }).update({ submitted_at: new Date() });
    } else {
      const [created] = await trx('feedback')
        .insert({ assignment_id: assignmentId, submitted_at: new Date() })
        .returning('*');
      feedback = created;
    }

    const itemsToInsert = feedbackItems.map((item) => ({
      feedback_id: feedback.id,
      parameter_id: item.parameterId,
      score: item.score,
      comment: item.comment,
    }));

    await trx('feedback_items').insert(itemsToInsert);

    await trx('feedback_assignments')
      .where({ id: assignmentId })
      .update({ status: 'SUBMITTED', updated_at: new Date() });

    return { message: 'Feedback submitted successfully' };
  });
}

async function getReceivedFeedbackDetail(assignmentId, userId, companyId) {
  const assignment = await db('feedback_assignments as fa')
    .join('users as reviewer', 'fa.reviewer_id', 'reviewer.id')
    .join('review_periods as rp', 'fa.review_period_id', 'rp.id')
    .where({ 'fa.id': assignmentId, 'fa.recipient_id': userId, 'fa.company_id': companyId, 'fa.status': 'SUBMITTED' })
    .select('fa.*', 'reviewer.name as reviewer_name', 'rp.month', 'rp.year')
    .first();

  if (!assignment) {
    const err = new Error('Feedback not found or access denied');
    err.status = 404;
    throw err;
  }

  const feedback = await db('feedback').where({ assignment_id: assignmentId }).first();
  const items = await db('feedback_items as fi')
    .join('parameters as p', 'fi.parameter_id', 'p.id')
    .where('fi.feedback_id', feedback.id)
    .select('p.name as parameter_name', 'p.display_order', 'fi.score', 'fi.comment')
    .orderBy('p.display_order');

  return {
    reviewerName: assignment.reviewer_name,
    month: assignment.month,
    year: assignment.year,
    submittedAt: feedback.submitted_at,
    items,
  };
}

async function getTeam(userId, companyId) {
  return db('users')
    .where({ manager_id: userId, company_id: companyId, is_active: true })
    .select('id', 'name', 'email', 'role');
}

async function initiateFeedback(reviewerId, recipientId, companyId) {
  const period = await db('review_periods')
    .where({ company_id: companyId, status: 'OPEN' })
    .first();

  if (!period) {
    const err = new Error('No open review period found for this company');
    err.status = 400;
    throw err;
  }

  let assignment = await db('feedback_assignments')
    .where({ reviewer_id: reviewerId, recipient_id: recipientId, review_period_id: period.id })
    .first();

  if (!assignment) {
    const [created] = await db('feedback_assignments')
      .insert({
        company_id: companyId,
        review_period_id: period.id,
        reviewer_id: reviewerId,
        recipient_id: recipientId,
        status: 'PENDING'
      })
      .returning('*');
    assignment = created;
  }

  return { assignmentId: assignment.id };
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

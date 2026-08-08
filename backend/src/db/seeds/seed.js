const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const PASSWORD = 'password123';

const paramIds = {
  ownership: uuidv4(),
  communication: uuidv4(),
  quality: uuidv4(),
  teamwork: uuidv4(),
  problemSolving: uuidv4(),
};

const companyIds = {
  ashoka: uuidv4(),
  brightPath: uuidv4(),
};

function makeUsers(companyId, prefix, names, roles, managers) {
  return names.map((name, i) => ({
    id: uuidv4(),
    company_id: companyId,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@${prefix}.com`,
    role: roles[i] || 'EMPLOYEE',
    manager_id: managers[i] || null,
  }));
}

function createFeedbackItems(feedbackId, scores) {
  const paramKeys = Object.keys(paramIds);
  return paramKeys.map((key, i) => ({
    id: uuidv4(),
    feedback_id: feedbackId,
    parameter_id: paramIds[key],
    score: scores[i],
    comment: `Rating ${scores[i]} for ${key}.`,
  }));
}

exports.seed = async function (knex) {
  await knex('feedback_items').del();
  await knex('feedback').del();
  await knex('feedback_assignments').del();
  await knex('review_periods').del();
  await knex('users').del();
  await knex('parameters').del();
  await knex('companies').del();

  const hash = await bcrypt.hash(PASSWORD, 10);

  await knex('companies').insert([
    { id: companyIds.ashoka, name: 'Ashoka Textiles' },
    { id: companyIds.brightPath, name: 'Bright Path Consulting' },
  ]);

  const paramList = [
    { id: paramIds.ownership, name: 'Ownership', description: 'Takes responsibility for outcomes', display_order: 1 },
    { id: paramIds.communication, name: 'Communication', description: 'Clarity and effectiveness of communication', display_order: 2 },
    { id: paramIds.quality, name: 'Quality of Work', description: 'Accuracy and thoroughness of deliverables', display_order: 3 },
    { id: paramIds.teamwork, name: 'Teamwork', description: 'Collaboration and support for teammates', display_order: 4 },
    { id: paramIds.problemSolving, name: 'Problem Solving', description: 'Analytical and creative problem resolution', display_order: 5 },
  ];
  await knex('parameters').insert(paramList);

  // --- Ashoka Textiles ---
  const rohanId = uuidv4();
  const priyaId = uuidv4();
  const ashokaEmpIds = Array.from({ length: 6 }, () => uuidv4());

  const ashokaUsers = [
    { id: rohanId, company_id: companyIds.ashoka, name: 'Rohan', email: 'rohan@ashoka.com', role: 'HR', manager_id: null },
    { id: priyaId, company_id: companyIds.ashoka, name: 'Priya', email: 'priya@ashoka.com', role: 'EMPLOYEE', manager_id: rohanId },
    ...ashokaEmpIds.map((id, i) => ({
      id,
      company_id: companyIds.ashoka,
      name: `Ashoka Employee ${i + 1}`,
      email: `emp${i + 1}@ashoka.com`,
      role: 'EMPLOYEE',
      manager_id: priyaId,
    })),
  ];

  for (const u of ashokaUsers) {
    await knex('users').insert({ ...u, password_hash: hash });
  }

  // --- Bright Path Consulting ---
  const founderId = uuidv4();
  const bpEmpIds = Array.from({ length: 8 }, () => uuidv4());

  const bpUsers = [
    { id: founderId, company_id: companyIds.brightPath, name: 'Founder', email: 'founder@brightpath.com', role: 'HR', manager_id: null },
    ...bpEmpIds.map((id, i) => ({
      id,
      company_id: companyIds.brightPath,
      name: `BP Employee ${i + 1}`,
      email: `emp${i + 1}@brightpath.com`,
      role: 'EMPLOYEE',
      manager_id: founderId,
    })),
  ];

  for (const u of bpUsers) {
    await knex('users').insert({ ...u, password_hash: hash });
  }

  // --- Review Periods (June, July, August 2026 for both companies) ---
  const months = [
    { month: 6, year: 2026, label: 'June' },
    { month: 7, year: 2026, label: 'July' },
    { month: 8, year: 2026, label: 'August' },
  ];

  const ashokaPeriods = {};
  const bpPeriods = {};

  for (const m of months) {
    const ashokaId = uuidv4();
    const bpId = uuidv4();
    ashokaPeriods[m.label] = ashokaId;
    bpPeriods[m.label] = bpId;

    await knex('review_periods').insert([
      {
        id: ashokaId,
        company_id: companyIds.ashoka,
        year: m.year,
        month: m.month,
        status: m.month === 8 ? 'OPEN' : 'CLOSED',
        start_date: `${m.year}-${String(m.month).padStart(2, '0')}-01`,
        end_date: `${m.year}-${String(m.month).padStart(2, '0')}-28`,
      },
      {
        id: bpId,
        company_id: companyIds.brightPath,
        year: m.year,
        month: m.month,
        status: m.month === 8 ? 'OPEN' : 'CLOSED',
        start_date: `${m.year}-${String(m.month).padStart(2, '0')}-01`,
        end_date: `${m.year}-${String(m.month).padStart(2, '0')}-28`,
      },
    ]);
  }

  // Helper to create assignment + feedback
  async function createAssignment(companyId, periodId, reviewerId, recipientId, status, scores) {
    const assignmentId = uuidv4();
    await knex('feedback_assignments').insert({
      id: assignmentId,
      company_id: companyId,
      review_period_id: periodId,
      reviewer_id: reviewerId,
      recipient_id: recipientId,
      status,
    });

    if (status === 'SUBMITTED' || status === 'DRAFT') {
      const feedbackId = uuidv4();
      await knex('feedback').insert({
        id: feedbackId,
        assignment_id: assignmentId,
        submitted_at: status === 'SUBMITTED' ? new Date() : null,
      });

      if (scores) {
        const items = createFeedbackItems(feedbackId, scores);
        await knex('feedback_items').insert(items);
      }
    }

    return assignmentId;
  }

  // --- Ashoka June (all submitted — historical) ---
  for (let i = 0; i < 6; i++) {
    await createAssignment(companyIds.ashoka, ashokaPeriods.June, priyaId, ashokaEmpIds[i], 'SUBMITTED', [3, 3, 4, 3, 4]);
  }
  await createAssignment(companyIds.ashoka, ashokaPeriods.June, rohanId, priyaId, 'SUBMITTED', [3, 4, 4, 3, 4]);

  // --- Ashoka July (all submitted — historical) ---
  for (let i = 0; i < 6; i++) {
    await createAssignment(companyIds.ashoka, ashokaPeriods.July, priyaId, ashokaEmpIds[i], 'SUBMITTED', [4, 4, 4, 4, 4]);
  }
  await createAssignment(companyIds.ashoka, ashokaPeriods.July, rohanId, priyaId, 'SUBMITTED', [4, 4, 5, 4, 4]);

  // --- Ashoka August (mixed statuses — current cycle to test all inputs) ---
  const augStatuses = ['PENDING', 'PENDING', 'DRAFT', 'DRAFT', 'SUBMITTED', 'SUBMITTED'];
  const augScores = [null, null, [3, 4, null, null, null], [4, null, 4, null, null], [5, 4, 5, 4, 5], [4, 4, 4, 4, 4]];

  for (let i = 0; i < 6; i++) {
    await createAssignment(companyIds.ashoka, ashokaPeriods.August, priyaId, ashokaEmpIds[i], augStatuses[i], augScores[i]);
  }
  // Rohan reviews Priya in August (DRAFT)
  await createAssignment(companyIds.ashoka, ashokaPeriods.August, rohanId, priyaId, 'DRAFT', [4, 5, null, null, null]);

  // --- Bright Path June & July (all submitted — historical) ---
  for (let i = 0; i < 8; i++) {
    await createAssignment(companyIds.brightPath, bpPeriods.June, founderId, bpEmpIds[i], 'SUBMITTED', [3, 3, 3, 4, 3]);
  }
  for (let i = 0; i < 8; i++) {
    await createAssignment(companyIds.brightPath, bpPeriods.July, founderId, bpEmpIds[i], 'SUBMITTED', [4, 4, 4, 4, 4]);
  }

  // --- Bright Path August (mixed) ---
  const bpAugStatuses = ['PENDING', 'PENDING', 'PENDING', 'DRAFT', 'DRAFT', 'SUBMITTED', 'SUBMITTED', 'SUBMITTED'];
  const bpAugScores = [null, null, null, [4, 5, null, null, null], [3, 3, null, null, null], [4, 4, 5, 4, 4], [5, 5, 5, 5, 5], [3, 4, 4, 3, 4]];
  for (let i = 0; i < 8; i++) {
    await createAssignment(companyIds.brightPath, bpPeriods.August, founderId, bpEmpIds[i], bpAugStatuses[i], bpAugScores[i]);
  }

  console.log('Seed complete.');
  console.log('Login credentials (all users): password123');
  console.log('Ashoka: rohan@ashoka.com, priya@ashoka.com, emp1@ashoka.com ... emp6@ashoka.com');
  console.log('Bright Path: founder@brightpath.com, emp1@brightpath.com ... emp8@brightpath.com');
};

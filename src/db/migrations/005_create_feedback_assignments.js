exports.up = function (knex) {
  return knex.schema.createTable('feedback_assignments', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('company_id').notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.uuid('review_period_id').notNullable().references('id').inTable('review_periods').onDelete('CASCADE');
    table.uuid('reviewer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('recipient_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['PENDING', 'DRAFT', 'SUBMITTED']).notNullable().defaultTo('PENDING');
    table.timestamps(true, true);
    table.unique(['review_period_id', 'reviewer_id', 'recipient_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('feedback_assignments');
};

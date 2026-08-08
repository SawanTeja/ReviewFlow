exports.up = function (knex) {
  return knex.schema
    .createTable('feedback', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('assignment_id').notNullable().unique().references('id').inTable('feedback_assignments').onDelete('CASCADE');
      table.timestamp('submitted_at');
      table.timestamps(true, true);
    })
    .then(() => {
      return knex.schema.createTable('feedback_items', (table) => {
        table.uuid('id').primary().defaultTo(knex.fn.uuid());
        table.uuid('feedback_id').notNullable().references('id').inTable('feedback').onDelete('CASCADE');
        table.uuid('parameter_id').notNullable().references('id').inTable('parameters').onDelete('CASCADE');
        table.integer('score').checkBetween([1, 5]);
        table.text('comment');
        table.unique(['feedback_id', 'parameter_id']);
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('feedback_items')
    .then(() => knex.schema.dropTableIfExists('feedback'));
};

exports.up = function (knex) {
  return knex.schema.createTable('review_periods', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('company_id').notNullable().references('id').inTable('companies').onDelete('CASCADE');
    table.integer('year').notNullable();
    table.integer('month').notNullable();
    table.enum('status', ['DRAFT', 'OPEN', 'CLOSED']).notNullable().defaultTo('OPEN');
    table.date('start_date');
    table.date('end_date');
    table.timestamps(true, true);
    table.unique(['company_id', 'year', 'month']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('review_periods');
};

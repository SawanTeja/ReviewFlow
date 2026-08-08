exports.up = function (knex) {
  return knex.schema.createTable('parameters', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name').notNullable();
    table.string('description');
    table.integer('display_order').notNullable();
    table.boolean('active').defaultTo(true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('parameters');
};

const { onUpdateTrigger
  , ON_UPDATE_TIMESTAMP_FUNCTION
  , DROP_ON_UPDATE_TIMESTAMP_FUNCTION } = require('../knexfile')

exports.up = function (knex) {
  return knex.schema.raw(ON_UPDATE_TIMESTAMP_FUNCTION)
    .then(() => knex.schema.createTable('comment', (table) => {
      table.increments("id").primary()

      table.string('wisId', 100)
      table.string('context', 100)
      table.string('body', 255)
      table.string('writerId', 100)
      table.boolean('deleted').defaultTo('false')

      table.timestamps(true, true)
    })
    )
    .then(() => knex.schema.createTable('reaction', (table) => {
      table.bigIncrements("id").primary()

      table.string('body', 255)
      table.string('reactorId', 100)
      table.integer('comment')

      table
        .foreign('comment')
        .references('id')
        .inTable('comment')

      table.timestamps(true, true)

      table.unique(['body', 'reactorId', 'comment'])
    })
    )
    .then(() => knex.schema.createTable('reported_comment', (table) => {
      table.increments("id").primary()

      table.integer('comment')
      table.string('reporterId', 100)
      table.string('extraDescription', 255)
      table.string('reason', 255)

      table
        .foreign('comment')
        .references('id')
        .inTable('comment')

      table.timestamps(true, true)

      table.unique(['comment', 'reporterId'])


    })
    )
    .then(() => knex.schema.raw(onUpdateTrigger('reaction')))
    .then(() => knex.schema.raw(onUpdateTrigger('comment')))
    .then(() => knex.schema.raw(onUpdateTrigger('reported_comment')))

};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('reaction')
    .then(() => knex.schema.dropTableIfExists('reported_comment'))
    .then(() => knex.schema.dropTableIfExists('comment'))
    .then(() => knex.schema.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION))

};

// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      user: "weblite", 
      password: "allmosts",    
      host: "localhost",
      port: "5432",
      database: "weblite"    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  onUpdateTrigger: table => `
    CREATE TRIGGER ${table}_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE on_update_timestamp();
  `
  ,
  ON_UPDATE_TIMESTAMP_FUNCTION: `
      CREATE OR REPLACE FUNCTION on_update_timestamp()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
    $$ language 'plpgsql';
    `
  ,
  DROP_ON_UPDATE_TIMESTAMP_FUNCTION: 
    `DROP FUNCTION on_update_timestamp`
};

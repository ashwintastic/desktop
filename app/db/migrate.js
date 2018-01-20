const path = require('path');
const Umzug = require('umzug');

const logger = global.logger;

class Migrate {

  runPendingMigrations(conn) {
    let migrationDir = path.resolve(__dirname, './migrations/');
    if (process.env.NODE_ENV === 'production') {
      migrationDir = path.resolve(__dirname, './db/migrations/');
    }

  // TODO:y make migration task synchronous. application should not load till all migration scripts are run.

  // Find and Run migration scripts IF ANY.
    const umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: conn,
        tableName: 'sequelize_meta'
      },

      // see: https://github.com/sequelize/umzug/issues/17
      migrations: {
        params: [
          conn.getQueryInterface(), // queryInterface
          conn.constructor, // DataTypes
          () => {
            throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
          }
        ],
        path: migrationDir,
        pattern: /\.js$/
      },

      logging() {
        logger.info(arguments);
      },
    });

    function logUmzugEvent(eventName) {
      return (name, migration) => {
        logger.info(`${name} ${eventName} ${migration}`);
      };
    }

    umzug.on('migrating', logUmzugEvent('migrating'));
    umzug.on('migrated', logUmzugEvent('migrated'));

  // RUN all pending migration scripts.
    umzug.up();
  }
}

export default new Migrate();

const models = require('./models/index');

const conn = models.conn;
const env = process.env.NODE_ENV || 'development';

const logger = global.logger;

// Sync all models that aren't already in the database
conn.sync().then(() => {
  require('./migrate.js').runPendingMigrations(conn);
  if (env === 'development') { require('./testData.js').generateTestData(models); }
  return true;
}).catch(err => {
  logger.error('ERROR in db sync', err);
});

module.exports = models;

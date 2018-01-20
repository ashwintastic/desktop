const fs = require('fs-extra');
const Sequelize = require('sequelize');
const path = require('path');
const os = require('os');

const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];

const appDataDir = path.resolve(os.homedir(), './.cytenaNerve/data');
// Make sure the app output directory is there.
fs.ensureDirSync(appDataDir);
config.storage = path.resolve(appDataDir, './database.sqlite3');

// TODO:y Check if new connections are getting created everytime we import this?
const conn = new Sequelize(config.database, config.username, config.password, config);

module.exports = conn;

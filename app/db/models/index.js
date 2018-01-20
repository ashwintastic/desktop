const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const conn = require('../conn.js');

const basename = 'index.js';

let modelDir = path.resolve(__dirname);
if (process.env.NODE_ENV === 'production') {
  modelDir = path.resolve(__dirname, './db/models/');
}

const db = {};

fs.readdirSync(modelDir)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = conn.import(path.join(modelDir, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.conn = conn;
db.Sequelize = Sequelize;

module.exports = db;

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('fastapi-ca2', 'admin', 'oracle', {
  host: 'localhost',
  port: 5438,
  dialect: 'postgres',
  logging: console.log
});

module.exports = sequelize;
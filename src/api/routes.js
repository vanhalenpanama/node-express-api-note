const express = require('express');
const router = express.Router();
const {
  validateCsrfToken
} = require('./middlewares/auth');



const userController = require('./controllers/userController');
const noteController = require('./controllers/noteController');


router.use('/users', (req, res, next) => {
  if (req.method === 'GET') {
      return validateCsrfToken(req, res, next);
  }
  next();
}, userController);


router.use('/notes', (req, res, next) => {
  if (req.method === 'GET') {
      return validateCsrfToken(req, res, next);
  }
  next();
}, noteController);

module.exports = router;

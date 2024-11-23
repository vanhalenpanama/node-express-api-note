const express = require('express');
const router = express.Router();

const userController = require('./controllers/userController');
const noteController = require('./controllers/noteController');



router.use('/users', userController);
router.use('/notes', noteController);



module.exports = router;
const express = require('express');
const controller = require('../controllers/seansController');
const router = express.Router();

router.get("/", controller.homePage);

module.exports = router;
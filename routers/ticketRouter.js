const express = require('express');
const controller = require('../controllers/ticketController');
const router = express.Router();

router.get("/:seansID", controller.homePage);

module.exports = router;
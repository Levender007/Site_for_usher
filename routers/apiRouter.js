const express = require('express');
const controller = require('../controllers/apiController');
const {apiHalls, apiSessions} = require("../conf");
const router = express.Router();

router.get(apiHalls, controller.GetHalls);

router.get(apiSessions + "/fd/:date", controller.GetSessions);
router.get(apiSessions + "/:id", controller.GetSession);
router.post(apiSessions, controller.CreateSession);
router.put(apiSessions + "/:id", controller.UpdateSession);
router.delete(apiSessions + "/:id", controller.DeleteSession);

module.exports = router;
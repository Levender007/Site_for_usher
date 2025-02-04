const express = require('express');
const controller = require('../controllers/apiController');
const {apiHalls, apiSessions, apiTickets} = require("../conf");
const router = express.Router();

router.get(apiHalls, controller.GetHalls);

router.get(apiSessions + "/fk/:date/:idForName", controller.GetSameSessions);
router.get(apiSessions + "/fd/:date", controller.GetSessions);
router.get(apiSessions + "/:id", controller.GetSession);
router.post(apiSessions, controller.CreateSession);
router.put(apiSessions + "/:id", controller.UpdateSession);
router.delete(apiSessions + "/:id", controller.DeleteSession);

router.get(apiTickets + "/s/:sessionID", controller.GetTickets);
router.get(apiTickets + "/t/:id", controller.GetTicket);
router.post(apiTickets, controller.CreateTicket);
router.put(apiTickets + "/t/:id/ns/:newSeans", controller.RebaseTicket);
router.put(apiTickets + "/t/:id", controller.UpdateTicket);
router.delete(apiTickets + "/t/:id", controller.DeleteTicket);

module.exports = router;
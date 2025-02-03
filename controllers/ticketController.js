const {homeWay, apiWay, apiSessions, apiTickets} = require('../conf.js');

exports.homePage = function (req, res) {
    res.render('ticketPage.hbs', {
        homeWay: homeWay,
        apWay: apiWay,
        apiSessions: apiSessions,
        apiTickets: apiTickets,
        seansID: req.params.seansID
    });
}
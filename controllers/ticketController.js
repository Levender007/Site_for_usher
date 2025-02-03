const {homeWay} = require('../conf.js');

exports.homePage = function (req, res) {
    res.render('ticketPage.hbs', {
        homeWay: homeWay,
        seansID: req.params.seansID
    });
}
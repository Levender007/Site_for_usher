const {homeWay, apiWay, apiHalls, apiSessions} = require('../conf.js');

exports.homePage = function (_, res) {
    res.render('seansPage.hbs', {
        title: 'Управление сеансами',
        homeWay: homeWay,
        apiWay: apiWay,
        apiHalls: apiHalls,
        apiSessions: apiSessions
    })
}
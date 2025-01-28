const {seansWay, ticketWay} = require("../conf.js");

exports.homePage = function(_, res) {
    res.render('home.hbs', {
        layout: 'homeLayout',
        title: 'Главная страница',
        seansWay: seansWay,
        ticketWay: ticketWay
    });
}
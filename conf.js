const {passwd} = require("./pass")

module.exports.homeWay = "/";
module.exports.apiWay = "/api";
module.exports.apiHalls = "/halls";
module.exports.apiSessions = "/sessions";
module.exports.apiTickets = "/tickets";
module.exports.seansWay = "/seans";
module.exports.ticketWay = "/ticket";

module.exports.M = "00:10:00";
module.exports.N = 5;

module.exports.hbsEngine = {
  layoutsDir: "views/layouts",
  defaultLayout: "defLayout",
  extname: "hbs"
};
module.exports.partialsDir = "views/partials";

module.exports.dbConnect = {
  host: "localhost",
  user: "root",
  database: "kino",
  password: passwd
};
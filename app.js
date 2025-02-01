const express = require("express");
const expressHbs = require("express-handlebars");
const hbs = require("hbs");
const app = express();
const apiRouter = require("./routers/apiRouter.js");
const homeRouter = require("./routers/homeRouter.js");
const seansRouter = require("./routers/seansRouter.js");
const ticketRouter = require("./routers/ticketRouter.js");

const {homeWay, apiWay, seansWay, ticketWay, hbsEngine, partialsDir} = require("./conf.js");

app.engine("hbs", expressHbs.engine(hbsEngine))
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + partialsDir);

app.use(express.json());

app.use(homeWay, homeRouter);
app.use(apiWay, apiRouter);
app.use(seansWay, seansRouter);
app.use(ticketWay, ticketRouter);

app.use(function (_, res) {
    res.status(404).send("Not Found")
});

app.listen(3000, ()=>console.log("Server started on port 3000"));
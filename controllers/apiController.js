const mysql = require("mysql2");
const {dbConnect} = require('../conf.js');

exports.DeleteSession = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const id = [req.params.id];
    const sql = "DELETE FROM sessions WHERE id = ?";
    conn.query(sql, id)
        .then(([result, _]) => {
            if (result["affectedRows"] > 0) {
                res.send("Session Deleted");
            }
            else {
                res.status(500).send("Session Not Deleted");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.UpdateSession = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "UPDATE sessions SET Film = ?, Date = ?, Duration = ?, HallID = ? WHERE ID = ?";
    const param = [req.body.film, req.body.date, req.body.duration, req.body.hallID, req.params.id];
    conn.query(sql, param)
        .then(([result, _]) => {
            if (result["affectedRows"] > 0) {
                res.send("Session Updated");
            }
            else {
                res.status(500).send("Session Not Updated");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.CreateSession = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "INSERT INTO sessions (Film, Date, Duration, HallID, UnsoldTickets) VALUES (?, ?, ?, ?, (SELECT Capacity FROM halls WHERE ID = ?))";
    const param = [req.body.film, req.body.date, req.body.duration, req.body.hallID, req.body.hallID];
    conn.query(sql, param)
        .then(([result, _]) => {
            if (result["affectedRows"] > 0) {
                res.send("Session Created");
            }
            else {
                res.status(500).send("Session Not Created");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.GetSession = function (req, res) {
    const id = [req.params.id];
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "SELECT * FROM sessions WHERE id = ?";
    conn.query(sql, id)
        .then(([result, _]) => {
            if (result.length > 0) {
                res.send(result[0]);
            }
            else {
                res.status(404).send("No such session");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.GetSessions = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const DateTime = new Date(req.params.date);
    const sql = "SELECT * FROM sessions WHERE Date > '?-?-? ?:?:?'";
    const date = [DateTime.getFullYear(), DateTime.getMonth() + 1, DateTime.getDate(), DateTime.getHours(), DateTime.getMinutes(), DateTime.getSeconds()];
    conn.query(sql, date)
        .then(result => {
            res.send(result[0]);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.GetHalls = function (_, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "SELECT * FROM halls";
    conn.query(sql)
        .then(result => {
            res.send(result[0]);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

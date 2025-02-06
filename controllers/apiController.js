const mysql = require("mysql2");
const {dbConnect, M} = require('../conf.js');

async function SessionsHasIntersection (date, duration, hallID, sessionID = 0) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "SELECT COUNT(*) as s FROM sessions WHERE HallID = ? and !(addtime(addtime(Date, Duration), ?) < ? or Date > addtime(addtime(?, ?), ?)) and ID != ?";
    const dat = date.replace("T", " ");
    const param = [hallID, M, dat, dat, duration, M, sessionID];
    let res = 0;
    await conn.query(sql, param)
        .then(([result, _]) => {
            res = result[0]["s"] > 0;
        })
        .catch((err) => {
            console.log(err);
            res = "Error";
        });
    return res;
}

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

exports.UpdateSession = async function (req, res) {
    const HasIntersection =  await SessionsHasIntersection(req.body.date, req.body.duration, req.body.hallID, req.params.id);
    if(HasIntersection === "Error") {
        res.status(500).send("Intersection Check Error");
        return;
    }
    else if(HasIntersection) {
        res.send("HasIntersection");
        return;
    }
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

exports.CreateSession = async function (req, res) {
    const HasIntersection = await SessionsHasIntersection(req.body.date, req.body.duration, req.body.hallID);
    if(HasIntersection === "Error") {
        res.status(500).send("Intersection Check Error");
        return;
    }
    else if(HasIntersection) {
        res.send("HasIntersection");
        return;
    }
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

exports.GetSameSessions = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const DateTime = new Date(req.params.date);
    const sessionID = req.params.idForName;
    const sql = "SELECT * FROM sessions WHERE Date > '?-?-? ?:?:?' and Film = (SELECT Film from sessions WHERE ID = ?) and ID != ? ORDER BY Date, HallID";
    const param = [DateTime.getFullYear(), DateTime.getMonth() + 1, DateTime.getDate(), DateTime.getHours(), DateTime.getMinutes(), DateTime.getSeconds(), sessionID, sessionID];
    conn.query(sql, param)
        .then(([result, _]) => {
            res.send(result);
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
    const sql = "SELECT * FROM sessions WHERE Date > '?-?-? ?:?:?' ORDER BY Date, HallID";
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

exports.DeleteTicket = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "DELETE FROM reservations WHERE ID = ?"
    const param = [req.params.id];
    conn.query(sql, param)
        .then(([result, _]) => {
            if (result["affectedRows"] > 0) {
                res.send("Reservation Deleted");
            }
            else {
                res.status(500).send("Reservation Not Deleted");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.UpdateTicket = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "UPDATE reservations SET Tickets = ?, FIO = ? WHERE ID = ?";
    const param = [req.body.ticketsCount, req.body.fio, req.params.id];
    conn.query(sql, param)
        .then(([result, _]) => {
            if (result["affectedRows"] > 0) {
                res.send("Reservation Updated");
            }
            else {
                res.status(500).send("Reservation Not Updated");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.CreateTicket = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    let sql = "SELECT ID FROM reservations WHERE SessionID = ? and FIO = ?";
    let param = [req.body.seansID, req.body.fio];
    conn.query(sql, param)
        .then(([result, _]) => {
            if (result.length > 0) {
                sql = "UPDATE reservations SET Tickets = Tickets + ? WHERE ID = ?";
                param[0] = req.body.ticketsCount;
                param[1] = result[0]["ID"];
                conn.query(sql, param)
                    .then(([result2, _]) => {
                        if (result2["affectedRows"] > 0) {
                            res.send("Reservation Updated");
                        }
                        else {
                            res.status(500).send("Reservation Not Updated");
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).send("Internal Server Error");
                    });
            }
            else {
                sql = "INSERT INTO reservations (Tickets, FIO, SessionID) VALUES (?, ?, ?)"
                param[0] = req.body.ticketsCount;
                param[1] = req.body.fio;
                param[2] = req.body.seansID;
                conn.query(sql, param)
                    .then(([result, _]) => {
                        if (result["affectedRows"] > 0) {
                            res.send("Reservation Created");
                        }
                        else {
                            res.status(500).send("Reservation Not Created");
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).send("Internal Server Error");
                    });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.GetTicket = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "SELECT * FROM reservations WHERE ID = ?";
    const param = [req.params.id];
    conn.query(sql, param)
        .then(([result, _]) => {
            if (result.length > 0) {
                res.send(result[0]);
            }
            else {
                res.status(404).send("No such reservation");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.GetTickets = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "SELECT * FROM reservations WHERE SessionID = ? ORDER BY FIO";
    const param = [req.params.sessionID];
    conn.query(sql, param)
        .then(([result, _]) => {
            res.send(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

exports.RebaseTicket = function (req, res) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "UPDATE reservations SET SessionID = ? WHERE ID = ?";
    const param = [req.params.newSeans, req.params.id];
    conn.query(sql, param)
        .then(([result, _]) => {
            if (result["affectedRows"] > 0) {
                res.send("Reservation Rebased");
            }
            else {
                res.status(500).send("Reservation Not Rebased");
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
}

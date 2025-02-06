const mysql = require("mysql2");
const {dbConnect, M, N} = require('../conf.js');

function TooMuchInOneHands(tickets) {
    return tickets > N;
}

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

async function NoSpaceInHall(seansID, tickets, id = "0", invertOldTickets = false) {
    const conn = mysql.createConnection(dbConnect).promise();
    let oldTickets = 0;
    if(id !== "0") {
        const fsql = "SELECT Tickets FROM reservations WHERE ID = ?";
        const fparam = [id];
        await conn.query(fsql, fparam)
            .then(([result, _]) => {
                oldTickets = result[0]["Tickets"];
                if(invertOldTickets)
                    oldTickets *= -1;
            })
            .catch((err) => {
                console.log(err);
                return "Error";
            })
    }
    const sql = "SELECT Capacity, IFNULL(SUM(Tickets), 0) as s FROM reservations RIGHT JOIN sessions ON sessions.ID = reservations.SessionID LEFT JOIN halls ON halls.ID = sessions.HallID WHERE sessions.ID = ?";
    const param = [seansID];
    let res = 0;
    await conn.query(sql, param)
        .then(([result, _]) => {
            res = parseInt(result[0]["Capacity"]) < result[0]["s"] + tickets - oldTickets;
        })
        .catch((err) => {
            console.log(err);
            res = "Error";
        })
    return res;
}

async function NewHallHasNoSpace (seansID, hallID) {
    const conn = mysql.createConnection(dbConnect).promise();
    const sql = "SELECT (SELECT Capacity FROM halls WHERE ID = ?) - IFNULL(SUM(Tickets), 0) as s FROM sessions LEFT JOIN reservations ON reservations.SessionID = sessions.ID WHERE sessions.ID = ?";
    const param = [hallID, seansID];
    let res = 0;
    await conn.query(sql, param)
        .then(([result, _]) => {
            res = result[0]["s"] < 0;
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
    const NoSpace =  await NewHallHasNoSpace(req.params.id, req.body.hallID);
    if(NoSpace === "Error") {
        res.status(500).send("New hall space Check Error");
        return;
    }
    else if(NoSpace) {
        res.send("NewHallHasNoSpace");
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
    const sql = "INSERT INTO sessions (Film, Date, Duration, HallID) VALUES (?, ?, ?, ?)";
    const param = [req.body.film, req.body.date, req.body.duration, req.body.hallID];
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
    const sql = "SELECT sessions.*, Capacity - IFNULL(SUM(Tickets), 0) as UnsoldTickets FROM sessions LEFT JOIN halls ON halls.ID = sessions.HallID LEFT JOIN reservations ON reservations.SessionID = sessions.ID WHERE Date > '?-?-? ?:?:?' GROUP BY sessions.ID ORDER BY Date, HallID";
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

exports.UpdateTicket = async function (req, res) {
    if(TooMuchInOneHands(req.body.ticketsCount)) {
        res.send("TooMuchInOneHands");
        return;
    }
    const NoSpace =  await NoSpaceInHall(req.body.seansID, req.body.ticketsCount, req.params.id);
    if(NoSpace === "Error") {
        res.status(500).send("Hall space Check Error");
        return;
    }
    else if(NoSpace) {
        res.send("NoSpaceInHall");
        return;
    }
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

exports.CreateTicket = async function (req, res) {
    if(TooMuchInOneHands(req.body.ticketsCount)) {
        res.send("TooMuchInOneHands");
        return;
    }
    const NoSpace =  await NoSpaceInHall(req.body.seansID, req.body.ticketsCount);
    if(NoSpace === "Error") {
        res.status(500).send("Hall space Check Error");
        return;
    }
    else if(NoSpace) {
        res.send("NoSpaceInHall");
        return;
    }
    const conn = mysql.createConnection(dbConnect).promise();
    let sql = "SELECT ID, Tickets FROM reservations WHERE SessionID = ? and FIO = ?";
    let param = [req.body.seansID, req.body.fio];
    conn.query(sql, param)
        .then(([result, _]) => {
            if (result.length > 0) {
                if(TooMuchInOneHands(parseInt(req.body.ticketsCount) + parseInt(result[0]["Tickets"]))) {
                    res.send("TooMuchInOneHands");
                    return;
                }
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

exports.RebaseTicket =  async function (req, res) {
    const NoSpace =  await NoSpaceInHall(req.params.newSeans, 0, req.params.id, true);
    if(NoSpace === "Error") {
        res.status(500).send("Hall space Check Error");
        return;
    }
    else if(NoSpace) {
        res.send("NoSpaceInHall");
        return;
    }
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

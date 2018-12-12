"use strict";

const express = require('express');
const sqlite3 = require('sqlite3');
const promise = require('db-promise.js');
const bodyParser = require('body-parser');

const port = 8585;
const db = new sqlite3.Database('databases/fake-twitter.sqlt');
const app = express();


function confirmLogin(req, res, next) {
    promise.all(db, `SELECT * FROM user WHERE login = ?`, req.body.login)
        .then(rows => {
            if (rows.length === 0) {
                res.json({ ok: false, message: "No such user" });
            } else {
                var user = rows[0];
                if (user.password === req.body.passwd) {
                    next();
                } else {
                    res.json({ ok: false, message: "Incorrect password" });

                }

            }
        });
}

function confirmFeedExists(req, res, next) {
    promise.all(db, `SELECT * FROM User WHERE login = ?`, req.body.feed)
        .then(rows => {
            if (rows.length === 0) {
                res.json({ ok: false, message: "No such feed" });
            } else {
                next();
            }
        });
}

function confirmNotFollowing(req, res, next) {
    promise.all(db, `SELECT * FROM Following WHERE follower = ? AND feed = ?`, req.body.login, req.body.feed)
        .then(rows => {
            if (rows.length === 0) {
                next();
            } else {
                res.json({ ok: false, message: "Already following this person" });

            }
        });
}

function confirmFollowing(req, res, next) {
    promise.all(db, `SELECT * FROM Following WHERE follower = ? AND feed = ?`, req.body.login, req.body.feed)
        .then(rows => {
            if (rows.length === 0) {
                res.json({ ok: false, message: "Already NOT following this person" });
            } else {
                next();
            }
        });
}

function confirmLengthRequirements(req, res, next) {
    if (!/^\w{1,10}$/.test(req.body.login)) {
        res.json({ ok: false, message: "Sorry! Login must be 1-10 characters long" });
    } else if (!/^.{1,10}$/.test(req.body.passwd)) {
        res.json({ ok: false, message: "Sorry! Password must be 1-10 characters long " });
    } else {
        next();
    }

}

function confirmLoginAvailable(req, res, next) {
    promise.all(db, `SELECT * FROM User  WHERE login = ?`, req.body.login)
        .then(rows => {
            if (rows.length === 0) {
                next();
            } else {
                res.json({ ok: false, message: 'Sorry! User name already taken' });
            }
        });

}





app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});


app.post('/login', confirmLogin, (req, res) => {
    // Check that the req.query.userId and req.query.userPass are in our User table
    res.json({ ok: true });
});

app.post('/fetch', (req, res) => {
    // console.log(req.body.login, req.body.passwd);
    promise.all(db, `SELECT DISTINCT user, message, post_time,      
                    profile_pic FROM Tweet t
                    LEFT JOIN following f ON f.feed = t.user
                    JOIN User u ON u.login = t.user
                    WHERE user = ? OR  follower = ?
                    ORDER BY post_time DESC;`, req.body.login, req.body.login)
        .then((rows) => res.json({ ok: true, rows: rows }))
        .catch(err => res.json(`Error: ${err.message}`));



});


app.post('/add', (req, res) => {
    // console.log(req.body.login, req.body.passwd);
    if (req.body.message.length <= 100) {
        promise.run(db, `INSERT INTO Tweet (user, message) VALUES
    (?, ?);`, req.body.login, req.body.message)
            .then(() => res.json({ ok: true }))
            .catch(err => res.json({ ok: false, message: `Error: ${err.message}` }));

    } else {
        res.json({ ok: false, message: "Sorry! The Maximum is 100 Characters per message" });

    }

});


app.post('/feeds', (req, res) => {
    // console.log(req.body.login, req.body.passwd);
    promise.all(db, `SELECT Login, Login IN ( SELECT feed FROM following
                WHERE follower = ?) AS subscribed FROM User ORDER BY login; ;`, req.body.login)
        .then((rows) => res.json({ ok: true, rows: rows }))
        .catch(err => res.json(`Error: ${err.message}`));

});


app.post('/subscribe', confirmFeedExists, confirmNotFollowing, (req, res) => {
    // console.log(req.body.login, req.body.passwd);
    promise.run(db, `INSERT INTO following VALUES   (?, ?);`,
            req.body.login, req.body.feed)
        .then(() => res.json({ ok: true }))
        .catch(err => res.json({ ok: false, message: `Error: ${err.message}` }));

});

app.post('/unsubscribe', confirmFeedExists, confirmFollowing, (req, res) => {
    // console.log(req.body.login, req.body.passwd);
    promise.run(db, `DELETE FROM following 
                    WHERE follower = ? AND feed = ?;`,
            req.body.login, req.body.feed)
        .then(() => res.json({ ok: true }))
        .catch(err => res.json({ ok: false, message: `Error: ${err.message}` }));

});

app.post('/register', confirmLengthRequirements, confirmLoginAvailable, (req, res) => {
    promise.run(db, `INSERT INTO User (login, password) VALUES (?, ?)`,
            req.body.login, req.body.passwd)
        .then(() => res.json({ ok: true }))
        .catch(err => res.json({ ok: false, message: `Error: ${err.message}` }));


});
// USING THE TESTS:
// With the server running, open the address below: 
// http://localhost:8585/test/

"use strict";

var express = require("express"),
    Promise = require("bluebird"),
    request = require("request"),
    nconf = require("nconf");

nconf.env().file("config/test.json");

express()
.get("/tweet.txt", (req, res) => {
    Promise.promisify(request.get)({
        url: nconf.get("TWEET_API_URL"),
        json: true
    })
    .then((r) => {
        res.send(r.body.text);
    })
    .catch((e) => {
        res.status(500).json({ error: e.toString() });
    });
})
.listen(nconf.get("PORT"))
;

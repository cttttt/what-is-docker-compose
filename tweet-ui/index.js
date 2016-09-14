"use strict";

var express = require("express"),
    Promise = require("bluebird"),
    request = Promise.promisifyAll(require("request")),
    hoffman = require("hoffman"),
    path = require("path"),
    util = require("util"),
    nconf = require("nconf");

nconf.env().file("config/test.json");

express()
.set("views", path.join(__dirname, "public", "templates"))
.set("view engine", "dust")
.engine("dust", hoffman.__express())
.get("/tweet.html", (req, res) => {
    request.getAsync({
        url: nconf.get("TWEET_API_URL"),
        json: true
    })
    .then((r) => {
        var tweet = r.body;

        var tweet_url = util.format(
            "https://twitter.com/%s/status/%s",
            tweet.user.screen_name,
            tweet.id_str
        );

        return request.getAsync({
            url: "https://publish.twitter.com/oembed",
            qs: {
                url: tweet_url,
                omit_script: true
            },
            json: true
        });
    })
    .then((r) => {
        var tweetHtml = r.body.html;

        res.render("index", { html: tweetHtml });
    })
    .catch((e) => {
        res.status(500).json({ error: e.toString() });
    });
})
.listen(nconf.get("PORT"))
;

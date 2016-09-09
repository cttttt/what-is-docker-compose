"use strict";

var express = require("express"),
    Promise = require("bluebird"),
    request = require("request"),
    nconf = require("nconf");

nconf.env().file("config/test.json");

express()
.get("/api/tweet", (req, res) => {
    loadTweet()
    .then((r) => {
        res.json(r);
    })
    .catch((e) => {
        res.status(500).json({ error: e.toString() });
    });
})
.listen(nconf.get("PORT"))
;

// Loads a tweet
var loadTweet = (() => {
    var tweetQueue = [];

    return () => {
        return Promise.try(() => {
            // Load queue of tweets.
            //
            // Since Twitter does very aggressive rate limiting, buffer a bunch
            // of tweets so we can service 100 requests for the price of one
            // Twitter API call.
            //
            if (tweetQueue.length !== 0) {
                return tweetQueue;
            }

            return Promise.promisify(request.get)({
                json: true,
                url: "https://api.twitter.com/1.1/search/tweets.json",
                qs: {
                    q: "@nodejs",
                    count: 100
                },
                oauth: {
                    consumer_key: nconf.get("CONSUMER_KEY"),
                    consumer_secret: nconf.get("CONSUMER_SECRET"),
                    token: nconf.get("TOKEN"),
                    token_secret: nconf.get("TOKEN_SECRET")
                }
            }).then((r) => {
                tweetQueue = r.body.statuses;
                return tweetQueue;
            });
        })
        .then((q) => {
            // return the latest element of the queue.
            return q.shift();
        });
    };
})();

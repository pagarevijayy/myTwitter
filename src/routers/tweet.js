const express = require('express');
const auth = require('../middleware/auth');
const Tweet = require("../models/tweet");
const Retweet = require("../models/retweet");
const Replie = require("../models/reply");

const router = new express.Router();

//Note: integrate auth later.
//mongoose below to be removed later
const mongoose = require('mongoose');


router.post("/tweet", async (req, res) => {
    const tweet = new Tweet({
        ...req.body,
        //user: req.user._id
        //(after auth implementation include above parameter)
        user: mongoose.Types.ObjectId("5d4173bc7a5cc55b1444ccdf")
    });
    try {
        await tweet.save();
        res.status(201).send(tweet);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete("/tweet/:id", async (req, res) => {
    try {
        const tweet = await Tweet.findOneAndDelete({ _id: req.params.id });
        if (!tweet) {
            return res.status(400).send()
        }
        res.send(tweet);
    } catch (e) {
        res.status(500).send(e);
    }
});


router.post("/retweet/:id", async (req, res) => {
    const retweet = new Retweet({
        //user: req.user._id
        //(after auth implementation include above parameter)
        tweet: req.params.id,
        user: mongoose.Types.ObjectId(),
        timePosted: Date.now()
    });
    try {
        await Tweet.findOneAndUpdate({_id : req.params.id}, {$inc : {'retweetCount' : 1}}, {new: true});
        await retweet.save();
        res.status(201).send(retweet);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post("/reply/:id", async (req, res) => {
    const reply = new Replie({
        ...req.body,
        //user: req.user._id
        //(after auth implementation include above parameter)
        tweet: req.params.id,
        user: mongoose.Types.ObjectId(),
        timePosted: Date.now()
    });
    try {
        await reply.save();
        res.status(201).send(reply);
    } catch (e) {
        res.status(400).send(e);
    }
});


router.post("/reply/:id/like", async (req, res) => {
    try {
        const reply = await Replie.findOneAndUpdate({_id :req.params.id}, {$inc : {'likeCount' : 1}},{new: true});
        if (!reply) {
            return res.status(400).send()
        }
        res.send(reply);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post("/tweet/:id/like", async (req, res) => {
    try {
        const tweet = await Tweet.findOneAndUpdate({_id :req.params.id}, {$inc : {'likeCount' : 1}},{new: true});
        if (!tweet) {
            return res.status(400).send()
        }
        res.send(tweet);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;

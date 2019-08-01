const express = require('express');
const auth = require('../middleware/auth');
const Tweet = require("../models/tweet");
const Retweet = require("../models/retweet");
const Replie = require("../models/reply");

const router = new express.Router();

//Note: integrate auth later.


router.post("/tweet", auth, async (req, res) => {
    const tweet = new Tweet({
        ...req.body,
        user: req.user._id
    });
    try {
        await tweet.save();
        res.status(201).send(tweet);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete("/tweet",auth, async (req, res) => {
    try {
        const tweet = await Tweet.findOneAndDelete({ _id: req.body.tweet, user: req.user._id });
        if (!tweet) {
            return res.status(400).send()
        }
        res.send(tweet);
    } catch (e) {
        res.status(500).send(e);
    }
});


router.post("/retweet", auth, async (req, res) => {
    const retweet = new Retweet({
        user: req.user._id,
        tweet: req.body.tweet,
    });
    try {
        const existingRetweet = await Retweet.findOne({user: req.user._id, tweet: req.body.tweet});
        if(existingRetweet){
            await existingRetweet.remove();
            await Tweet.findOneAndUpdate({_id : req.body.tweet}, {$inc : {'retweetCount' : -1}});
            return res.send(existingRetweet);
        }

        await retweet.save();
        await Tweet.findOneAndUpdate({_id : req.body.tweet}, {$inc : {'retweetCount' : 1}});
        res.status(201).send(retweet);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post("/reply", auth, async (req, res) => {
    const reply = new Replie({
        ...req.body,
        user: req.user._id,
    });
    try {
        await reply.save();
        res.status(201).send(reply);
    } catch (e) {
        res.status(400).send(e);
    }
});

//delete reply
//unlike logic for both reply and tweet


router.post("/reply/like", auth, async (req, res) => { 
    try {
        const reply = await Replie.findOneAndUpdate({_id :req.body.reply}, {$inc : {'likeCount' : 1}},{new: true});
        if (!reply) {
            return res.status(400).send()
        }
        res.send(reply);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post("/tweet/like", auth, async (req, res) => {
    try {
        const tweet = await Tweet.findOneAndUpdate({_id :req.body.tweet}, {$inc : {'likeCount' : 1}},{new: true});
        if (!tweet) {
            return res.status(400).send()
        }
        res.send(tweet);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;

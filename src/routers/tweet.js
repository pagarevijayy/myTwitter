const express = require('express');
const auth = require('../middleware/auth');
const extract = require('mention-hashtag');
const shuffle = require('shuffle-array');

const Tweet = require("../models/tweet");
const Retweet = require("../models/retweet");
const Replie = require("../models/reply");
const Like = require('../models/like');
const User = require('../models/user');

const utils = require('../utils/utils');

const router = new express.Router();

//search - handle and hastags
// GET /search?handle=abc%20xyz
// GET /search?hashtag=xyz
router.get("/search", auth, async (req, res) => {
    try {
        const searchHandle = await User.findOne({ handle: req.query.handle });

        const searchHashtag = await Tweet.find({ hashtags: req.query.hashtag });

        if (req.query.handle) {
            if (searchHandle.length === 0) {
                return res.status(404).send();
            }

            res.send(searchHandle);
        } else {
            if (searchHashtag.length === 0) {
                return res.status(404).send();
            }

            res.send(searchHashtag);
        }

    } catch (e) {
        res.status(500).send();
    }
});

router.post("/tweet", auth, async (req, res) => {

    const allowedFields = ['text'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {
        const tweet = new Tweet({
            ...req.body,
            user: req.user._id,
            name: req.user.name,
            handle: req.user.handle,
            hashtags: extract(req.body.text, { symbol: false, type: '#' })
        });

        await tweet.save();

        const tweetObject = tweet.toObject();
        tweetObject.followerList = req.user.followerList;
        res.status(201).send(tweetObject);

    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete("/tweet", auth, async (req, res) => {

    const allowedFields = ['tweet'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const tweet = await Tweet.findOne({ _id: req.body.tweet, user: req.user._id });
        if (!tweet) {
            return res.status(400).send();
        }
        await tweet.remove();
        res.send(tweet);

    } catch (e) {
        res.status(500).send(e);
    }
});

router.post("/retweet", auth, async (req, res) => {

    const allowedFields = ['tweet'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const existingRetweet = await Retweet.findOne({ user: req.user._id, tweet: req.body.tweet });

        if (existingRetweet) {

            await existingRetweet.remove();
            const tweet = await Tweet.findOneAndUpdate({ _id: req.body.tweet }, { $inc: { 'retweetCount': -1 } }, { new: true });
            return res.send(tweet);

        }

        const retweet = new Retweet({ user: req.user._id, tweet: req.body.tweet });
        await retweet.save();

        const tweet = await Tweet.findOneAndUpdate({ _id: req.body.tweet }, { $inc: { 'retweetCount': 1 } }, { new: true });

        res.status(201).send(tweet);

    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete("/retweet", auth, async (req, res) => {

    const allowedFields = ['retweet'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const retweet = await Retweet.findOne({ _id: req.body.retweet, user: req.user._id });

        if (!retweet) {
            return res.status(400).send();
        }

        await retweet.remove();

        const retweetObject = retweet.toObject();
        const tweet = await Tweet.findOneAndUpdate({ _id: retweetObject.tweet }, { $inc: { retweetCount: -1 } }, { new: true });

        res.send(tweet);

    } catch (e) {
        res.status(500).send(e);
    }

});

router.post("/reply", auth, async (req, res) => {

    const allowedFields = ['tweet', 'text'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const reply = new Replie({
            ...req.body,
            user: req.user._id,
        });

        await reply.save();
        await Tweet.findOneAndUpdate({ _id: req.body.tweet }, { $inc: { replyCount: 1 } });
        res.status(201).send(reply);

    } catch (e) {
        res.status(400).send(e);
    }

});

router.delete("/reply", auth, async (req, res) => {

    const allowedFields = ['reply'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const reply = await Replie.findOne({ _id: req.body.reply, user: req.user._id });

        if (!reply) {
            return res.status(400).send();
        }

        const replyObject = reply.toObject();

        await reply.remove();
        await Tweet.findOneAndUpdate({ _id: replyObject.tweet }, { $inc: { replyCount: -1 } });

        res.send(reply);

    } catch (e) {
        res.status(500).send(e);
    }

});

router.post("/reply/like", auth, async (req, res) => {

    const allowedFields = ['reply'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }


    try {
        const existingLike = await Like.findOne({ user: req.user._id, reply: req.body.reply });

        if (existingLike) {
            await existingLike.remove();
            const reply = await Replie.findOneAndUpdate({ _id: req.body.reply }, { $inc: { 'likeCount': -1 } }, { new: true });
            return res.send(reply);
        }

        const like = new Like({ user: req.user._id, reply: req.body.reply });

        await like.save();
        const reply = await Replie.findOneAndUpdate({ _id: req.body.reply }, { $inc: { 'likeCount': 1 } }, { new: true });

        //to be removed after connecting frontend
        if (!reply) {
            return res.status(400).send();
        }

        res.send(reply);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post("/tweet/like", auth, async (req, res) => {

    const allowedFields = ['tweet'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const existingLike = await Like.findOne({ user: req.user._id, tweet: req.body.tweet });
        if (existingLike) {
            await existingLike.remove();
            const tweet = await Tweet.findOneAndUpdate({ _id: req.body.tweet }, { $inc: { 'likeCount': -1 } }, { new: true });
            return res.send(tweet);
        }
        const like = new Like({ user: req.user._id, tweet: req.body.tweet });

        await like.save();

        const tweet = await Tweet.findOneAndUpdate({ _id: req.body.tweet }, { $inc: { 'likeCount': 1 } }, { new: true });

        //to be removed after connecting frontend
        if (!tweet) {
            return res.status(400).send();
        }

        res.send(tweet);

    } catch (e) {
        res.status(500).send(e);
    }

});

router.get("/home", auth, async (req, res) => {

    try {

        let arr = [];

        for (const userId of req.user.followingList) {

            const latestTweets = await utils.getTweets(userId);
            const latestRetweets = await utils.getRetweets(userId);
            const latestRepies = await utils.getReplies(userId);

            if (latestTweets) arr = arr.concat(latestTweets);
            if (latestRetweets) arr = arr.concat(latestRetweets);
            if (latestRepies) arr = arr.concat(latestRepies);

        }

        if(arr.length === 0) {
            return res.render('home', {
                message: 'Try following someone to get new feed.'
            });
    
        }

        //res.send(shuffle(arr));
        res.render('home', {
            arr
        });

    } catch (e) {
        console.log(e);
        res.status(500).send();
    }

});

module.exports = router;
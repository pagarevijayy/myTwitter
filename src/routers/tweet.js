const express = require('express');
const auth = require('../middleware/auth');
const extract = require('mention-hashtag');

const Tweet = require("../models/tweet");
const Retweet = require("../models/retweet");
const Replie = require("../models/reply");
const Like = require('../models/like');
const User = require('../models/user');

const router = new express.Router();


//search - username and hastags
// GET /search?name=abc%20xyz
// GET /search?hashtag=xyz
router.get("/search", auth , async (req, res) => {
    try{
        const searchName = await User.find({ name: req.query.name});

        const searchHashtag = await Tweet.find({ hashtags: req.query.hashtag});

        if(req.query.name)
        {
            if(searchName.length === 0){
                return res.status(404).send();
            }
    
            res.send(searchName);
        } else {
            if(searchHashtag.length === 0){
                return res.status(404).send();
            }
    
            res.send(searchHashtag);
        }
        
    } catch (e) {
        res.status(500).send();
    }
});

// view profile
router.get("/profile", auth, async (req, res) => {
    try{
        await req.user.populate([{ path: 'tweets'},{ path: 'retweets'}]).execPopulate();

        let arr = req.user.tweets;
        arr = arr.concat(req.user.retweets);

        arr.sort(function(a, b){
            var keyA = new Date(a.createdAt),
                keyB = new Date(b.createdAt);
            // Compare the 2 dates
            if(keyA < keyB) return 1;
            if(keyA > keyB) return -1;
            return 0;
        });

        res.send(arr);         
        arr = [];
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post("/tweet", auth, async (req, res) => {
    const tweet = new Tweet({
        ...req.body,
        user: req.user._id,
        hashtags: extract(req.body.text,{symbol: false, type: '#'})
    });

    try {
        await tweet.save();
        res.status(201).send(tweet);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete("/tweet", auth, async (req, res) => {
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
    try {
        const retweet = await Retweet.findOne({ _id: req.body.retweet, user: req.user._id });
        if (!retweet) {
            return res.status(400).send()
        }
        await retweet.remove();
        res.send(retweet);
    } catch (e) {
        res.status(500).send(e);
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

router.delete("/reply", auth, async (req, res) => {
    try {
        const reply = await Replie.findOne({ _id: req.body.reply, user: req.user._id });
        if (!reply) {
            return res.status(400).send();
        }
        await reply.remove();
        res.send(reply);
    } catch (e) {
        res.status(500).send(e);
    }
});


router.post("/reply/like", auth, async (req, res) => {
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

module.exports = router;
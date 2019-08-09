const express = require('express');
const auth = require('../middleware/auth');
const tweetController = require('../controllers/tweet.controller')

const router = new express.Router();


router.get("/search", auth, tweetController.search);

router.post("/tweet", auth, tweetController.tweet);

router.post("/tweet/like", auth, tweetController.likeTweet);

router.delete("/tweet", auth, tweetController.deleteTweet );

router.post("/retweet", auth, tweetController.retweet);

router.delete("/retweet", auth, tweetController.deleteRetweet );

router.post("/reply", auth, tweetController.reply);

router.post("/reply/like", auth, tweetController.likeReply);

router.delete("/reply", auth, tweetController.deleteReply);

router.get("/home", auth, tweetController.home );

module.exports = router;
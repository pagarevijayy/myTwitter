const Tweet = require('../models/tweet');
const Retweet = require('../models/retweet');
const Replie = require('../models/reply');

const getTweet = async (userId) => {

    const latestReplys = await Tweet.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(1)
        .populate('user', 'name')
        .lean();

    const latestReply = latestReplys[0];

    if (latestReply) {

        latestReply.type = "tweet";
        return latestReply;

    }

};

const getRetweet = async (userId) => {

    const latestRetweets = await Retweet.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(1)
        .populate('user', 'name')
        .populate({
            path: 'tweet',
            select: 'text',
            populate: {
                path: 'user',
                select: 'name'
            }
        })
        .lean();

    const latestRetweet = latestRetweets[0];

    if (latestRetweet) {

        latestRetweet.type = "retweet";
        return latestRetweet;

    }

};

const getReply = async (userId) => {

    const latestReplies = await Replie.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(1)
        .populate('user', 'name')
        .populate({
            path: 'tweet',
            select: 'text',
            populate: {
                path: 'user',
                select: 'name'
            }
        })
        .lean();

    const latestReply = latestReplies[0];

    if (latestReply) {

        latestReply.type = "reply";
        return latestReply;

    }

};

module.exports = { getTweet, getRetweet, getReply }
const User = require('../models/user');
const Tweet = require('../models/tweet');
const Retweet = require('../models/retweet');
const Replie = require('../models/reply');


const isReqBodyValid = (body, fields) => {

    const updates = Object.keys(body);

    if (!updates.length) return false;

    const isValid = updates.every((update) => fields.includes(update));

    return isValid;

};



const isFollow = async (initatorId, receiverId) => {

    const receiver = await User.findOne({ _id: receiverId });

    if (receiver) {

        if (initatorId in receiver.followers) return { receiver, follows: true };

        return { receiver, follows: false };

    }

};

const getTweet = async (userId) => {

    const latestTweets = await Tweet.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(1)
        .populate('user', 'name')
        .lean();

    const latestTweet = latestTweets[0];

    if (latestTweet) {

        latestTweet.type = "tweet";
        return latestTweet;

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

    const latestTweet = latestReplies[0];

    if (latestTweet) {

        latestTweet.type = "reply";
        return latestTweet;

    }

};

module.exports = { isReqBodyValid, isFollow, getTweet, getRetweet, getReply };
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

const getTweets = async (userId) => {

    const latestRetweets = await Tweet.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'name handle')
        .lean();

    if (latestRetweets.length) {

        latestRetweets.forEach((element) => {
            element.type = "tweet";
        });

        return latestRetweets;

    }

};

const getRetweets = async (userId) => {

    const latestRetweets = await Retweet.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'name handle')
        .populate({
            path: 'tweet',
            select: 'text',
            populate: {
                path: 'user',
                select: 'name handle'
            }
        })
        .lean();

    if (latestRetweets.length) {

        latestRetweets.forEach((element) => {
            element.type = "retweet";
        });

        return latestRetweets;

    }

};

const getReplies = async (userId) => {

    const latestReplies = await Replie.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'name handle')
        .populate({
            path: 'tweet',
            select: 'text',
            populate: {
                path: 'user',
                select: 'name handle'
            }
        })
        .lean();

    if (latestReplies.length) {

        latestReplies.forEach((element) => {
            element.type = "reply";
        });

        return latestReplies;

    }

};

module.exports = { isReqBodyValid, isFollow, getTweets, getRetweets, getReplies };
const jwt = require('jsonwebtoken');
const multer = require('multer');

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

const isFollow = async (initatorId, receiverHandle) => {

    const receiver = await User.findOne({ handle: receiverHandle });

    if (receiver) {

        if (initatorId in receiver.followers) return { receiver, follows: true };

        return { receiver, follows: false };

    }

};

const getTweets = async (userId) => {

    const latestRetweets = await Tweet.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(4)
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
        .limit(4)
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

const getAuthorizedUser = async (token) => {

    const decoded = jwt.verify(token, 'thisismytwitter');

    const user = await User.findOne({
        _id: decoded._id,
        'tokens.token': token
    });

    if (!user) {
        throw new Error();
    }

    return user;
};

// const fetchTimeline = async (user) => {

//     await user.populate([{ path: 'tweets' }, { path: 'retweets' }]).execPopulate();

//     let arr = user.tweets;
//     const totalTweets = user.tweets.length;
//     arr = arr.concat(user.retweets);

//     arr.sort(function(a, b) {
//         var keyA = new Date(a.createdAt),
//             keyB = new Date(b.createdAt);
//         // Compare the 2 dates
//         if (keyA < keyB) return 1;
//         if (keyA > keyB) return -1;
//         return 0;
//     });

//     return arr

// };

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an image file."));
        }

        cb(undefined, true);
    }
});



module.exports = {
    isReqBodyValid,
    isFollow,
    getTweets,
    getRetweets,
    getReplies,
    getAuthorizedUser,
    upload
};
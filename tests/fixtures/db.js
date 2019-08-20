const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const extract = require('mention-hashtag');

const User = require('../../src/models/user');
const Tweet = require('../../src/models/tweet');
const Retweet = require('../../src/models/retweet');
const Replie = require('../../src/models/reply');



const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

const tweetOneId = new mongoose.Types.ObjectId();   // to create retweet while testing
const tweetTwoId = new mongoose.Types.ObjectId();   //to create existing retweet
const retweetOneId = new mongoose.Types.ObjectId();
const replyOneId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: 'abhishek',
    handle: 'abh-1',
    email: 'abh@gmail.com',
    password: 'password123',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

const userTwo = {
    _id: userTwoId,
    name: 'ajay',
    handle: 'aja-1',
    email: 'ajay@gmail.com',
    password: 'password123',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};

const tweetOne = {
    _id: tweetOneId,
    text: "Sample tweet! #firstTweet",
    user: userOne._id,
    name: userOne.name,
    handle: userOne.handle,
    hashtags: extract("Sample tweet! #firstTweet", { symbol: false, type: '#' })
}

const retweetOne = {
    _id: retweetOneId,
    tweet: tweetTwoId,
    user: userOne._id
}

const replyOne = {
    _id: replyOneId,
    tweet: tweetOne._id,
    user: userOne._id,
    text: "Sample reply text"
}

const setupDatabase = async () => {

    await User.deleteMany();
    await Tweet.deleteMany();
    await Retweet.deleteMany();
    await Replie.deleteMany();

    await new User(userOne).save();
    await new Tweet(tweetOne).save();
    await new Retweet(retweetOne).save();
    await new Replie(replyOne).save();
};


module.exports = { userOneId, userTwoId, userOne, userTwo, setupDatabase };

module.exports = { userOneId, userTwoId, tweetOneId, tweetTwoId, retweetOneId, replyOneId, userOne, userTwo, tweetOne, retweetOne, replyOne, setupDatabase };
// Not a good case to destructure :p
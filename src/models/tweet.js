const mongoose = require('mongoose');
const Retweet = require('./retweet');
const Replie = require('./reply');
const Like = require('./like');


const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;


const tweetSchema = new Schema({

    user: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 50
    },
    handle: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true,
        maxlength: 30
    },
    text: {
        type: String,
        required: true,
        maxlength: 280
    },
    hashtags: [{
        type: String
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    retweetCount: {
        type: Number,
        default: 0
    },
    replyCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

//Cascade delete
tweetSchema.pre('remove', async function(next) {

    const tweet = this;

    await Retweet.deleteMany({ tweet: tweet._id });
    await Replie.deleteMany({ tweet: tweet._id });
    await Like.deleteMany({ tweet: tweet._id });
    next();

});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
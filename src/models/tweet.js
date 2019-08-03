const mongoose = require('mongoose');
const Retweet = require('./retweet');
const Replie = require('./reply');

const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;


const tweetSchema = new Schema({

    user: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    text: {
        type: String,
        required: true,
        maxlength: 280
    },
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
    await Like.deleteMany({ tweet: tweet_.id });
    next();
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
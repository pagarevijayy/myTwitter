const mongoose = require('mongoose');
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
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
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
        required: true
    },
    retweetCount: {
        type: Number,
        required: true
    },
    replyCount: {
        type: Number,
        required: true
    },
    reply: {
        type: ObjectId,
        ref: 'Replie'
    }

});



const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
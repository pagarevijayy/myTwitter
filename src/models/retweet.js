const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

const retweetSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    tweet: {
        type: ObjectId,
        ref: 'Tweet',
        required: true
    },
    timePosted: {
        type: Date,
        required: true
    }
});

const Retweet = mongoose.model('Retweet', retweetSchema);

module.exports = Retweet;
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ObjectId = mongoose.Schema.Types.ObjectId;

const replySchema = new Schema({
    tweet: {
        type: ObjectId,
        ref: 'Tweet',
        required: true
    },
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        trim: true,
        required: true
    },
    likeCount: {
        type: Number,
        min: 0
    },
    timePosted: {
        type: Date,
        required: true
    }
});

const Replie = mongoose.model('Replie', replySchema);

module.exports = Replie;
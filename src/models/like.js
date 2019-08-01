const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

const likeSchema = new Schema({
    user: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    tweet: {
        type: ObjectId,
        ref: 'Tweet'
    },
    reply: {
        type: ObjectId,
        ref: 'Replie'
    }
});

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
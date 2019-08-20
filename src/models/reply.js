const mongoose = require('mongoose');
const Schema = mongoose.Schema
const Like = require('../models/like');

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
    }
}, {
    timestamps: true
});

replySchema.pre('remove', async function(next) {
    const reply = this;
    await Like.deleteMany({ reply: reply._id });
    next();
});

const Replie = mongoose.model('Replie', replySchema);

module.exports = Replie;
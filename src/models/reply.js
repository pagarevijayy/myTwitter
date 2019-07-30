//implement referential integrity

const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ObjectId = mongoose.Schema.Types.ObjectId;

const replySchema = new Schema({
    tweetId: {
        type: ObjectId,
        // ref: 'Tweet',
        required: true
    },
    userId: {
        type: ObjectId,
        // ref: 'User',
        required: true
    },
    userName: {
        type: String,
        lowercase: true,
        // ref: 'User',
        trim: true,
        required: true
    },
    replyText: {
        type: String,
        trim: true,
        required: true
    },
    likeCount: {
        type: Number,
        min: 0
    },
    TimePosted: {
        type: Date,
        required: true
    }
});

const Replie = mongoose.model('Replie', replySchema);

// creating document
const reply = new Replie( {
    tweetId : mongoose.Types.ObjectId(),
    userId: mongoose.Types.ObjectId(),
    userName: "abhi",
    replyText: "awesome",
    likeCount: 11,
    TimePosted: Date.now()
});


reply.save().then((result) => {
     console.log(result);
}).catch((e) => {
    console.log(e);
})

module.exports = Replie;
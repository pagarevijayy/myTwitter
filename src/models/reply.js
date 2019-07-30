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
        // ref: 'User',
        trim: true,
        required: true
    },
    replyText: {
        type: String,
        required: true
    },
    likeCount: {
        type: Number
    },
    TimePosted: {
        type: Date
    }
});

// idSample = 5d3ae5eddf36dd148e68b2bb, 5d3ae5eddf36dd148e68b2boz

const Replie = mongoose.model('Replie', replySchema);

creating document
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
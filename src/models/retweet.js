const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

const retweetSchema = new Schema({
    userId: {
        type: ObjectId,
        // ref: 'User',
        required: true
    },
    tweetId: {
        type: ObjectId,
        // ref: 'Tweet',
        required: true
    },
    TimePosted: {
        type: Date
    }
});

const Retweet = mongoose.model('Retweet', retweetSchema);

const retweet = new Retweet( {
    tweetId : mongoose.Types.ObjectId(),
    userId: mongoose.Types.ObjectId(),
    TimePosted: Date.now()
});


retweet.save().then((result) => {
     console.log(result);
}).catch((e) => {
    console.log(e);
})

module.exports = Retweet;
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tweet = require('./tweet');
const Retweet = require('./retweet');
const Replie = require('./reply');
const Like = require('./like');

const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 50
    },
    avatar: {
        type: Buffer
    },
    handle: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true,
        maxlength: 30
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid.");
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 7
    },
    DOB: {
        type: Date
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 160
    },
    followers: { type: Mixed, default: {} },
    following: { type: Mixed, default: {} },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true,
    minimize: false
});

//virtual properties
userSchema.virtual('followerList').get(function() {
    return Object.keys(this.followers);
});

userSchema.virtual('followingList').get(function() {
    return Object.keys(this.following);
});

userSchema.virtual('tweets', {
    ref: 'Tweet',
    localField: '_id',
    foreignField: 'user'
});

userSchema.virtual('retweets', {
    ref: 'Retweet',
    localField: '_id',
    foreignField: 'user'
});

//hide details
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;


    return userObject;
};

// authorization
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = await jwt.sign({
        _id: user._id.toString()
    }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });

    await user.save();

    return token;
};

//authentication
userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to login.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to login.");
    }

    return user;
};

//Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

//Cascade delete
userSchema.pre('remove', async function(next) {
    const user = this;
    await Tweet.deleteMany({ user: user._id });
    await Retweet.deleteMany({ user: user._id });
    await Replie.deleteMany({ user: user._id });
    await Like.deleteMany({ user: user._id });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
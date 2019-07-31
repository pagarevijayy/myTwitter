const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;


const followSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    }
});

const userSchema = new Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
        maxlength: 50
    },
    userHandle: {
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
                throw new Error("Email is invalid.")
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 7
    },
    userDOB: {
        type: Date
    },
    userBio: {
        type: String,
        trim: true,
        maxlength: 160
    },
    followers: [followSchema],
    following: [followSchema],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

// userSchema.virtual('followers', {
//     ref: 'User',
//     localField: '',
//     foreignField: ''
// });

//hide details
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

// authorization
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id.toString() }, 'thisismytwitter');

    user.tokens = user.tokens.concat({ token });

    await user.save();

    return token;
}

//authentication
userSchema.statics.findbyCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Unable to login.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to login.");
    }

    return user;
}

//Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
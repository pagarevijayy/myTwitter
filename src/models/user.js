//implement referential integrity

const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;


const followSchema = new Schema({
    userId: {
        type: ObjectId,
        // ref: 'User',
        required: true
    },
    userName: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    }
});

const userSchema = new Schema({
    userName: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    userHandle: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        lowercase: true,
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
        validate(value) {
            //can also set "min.length: 7" as a key-value pair above 
            if (value.length < 6) {
                throw new Error("Password should have minimum 7 characters")
            }

        }
    },
    userDOB: {
        type: Date
    },
    userBio: {
        type: String,
        trim: true
    },
    followers: [followSchema],
    following: [followSchema]
})

const User = mongoose.model('User', userSchema);

//creating document
const user = new User( {
    userName: "mihir",
    userHandle: "mihirrocks",
    email: "pqr@example.com",
    password: "bye345vye",
    userDOB: Date.now(),
    userBio: "I love to play volleyball",
    followers: [
        {userId: mongoose.Types.ObjectId(),userName: "dhruv"},
        {userId: mongoose.Types.ObjectId(),userName: "vijay"}],
    following: [
        {userId: mongoose.Types.ObjectId(),userName: "abhishek"},
        {userId: mongoose.Types.ObjectId(),userName: "ceara"}]
});


user.save().then((result) => {
     console.log(result);
}).catch((e) => {
    console.log(e);
});

module.exports = User;
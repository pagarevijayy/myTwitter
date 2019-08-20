const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');


const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

const userOne = {
    _id: userOneId,
    name: 'abhishek',
    handle: 'abh-1',
    email: 'abh@gmail.com',
    password: 'password123',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
};

const userTwo = {
    _id: userTwoId,
    name: 'ajay',
    handle: 'aja-1',
    email: 'ajay@gmail.com',
    password: 'password123',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};

const setupDatabase = async () => {

    await User.deleteMany();
    await new User(userOne).save();

};

module.exports = { userOneId, userTwoId, userOne, userTwo, setupDatabase };
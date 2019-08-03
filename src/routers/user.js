const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/signup', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save();

        res.send()
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/profile', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'handle', 'email', 'password', 'DOB', 'bio'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        });
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/profile', auth, async (req, res) => {

    try {

        //updating follower and following info of other users before deletion
        const currentUserID = req.user._id.toString();

        await User.updateMany({ _id: { $in: req.user.followingList } }, {
            $unset: {
                [`followers.${currentUserID}`]: ""
            }
        });

        await User.updateMany({ _id: { $in: req.user.followerList } }, {
            $unset: {
                [`following.${currentUserID}`]: ""
            }
        });

        //deletion
        await req.user.remove();
        res.send();

    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.post('/friendships', auth, async (req, res) => {

    try {

        const initiatorID = req.user._id.toString();
        const receiverID = req.body.user;

        const followedUser = await User.findOne({ _id: receiverID });

        if (initiatorID in followedUser.followers) {

            delete followedUser.followers[initiatorID];
            delete req.user.following[receiverID];

            followedUser.markModified('followers');
            req.user.markModified('following');

            await followedUser.save();
            await req.user.save();

            return res.send('Unfollowed!');
        }

        followedUser.followers[initiatorID] = initiatorID;
        req.user.following[receiverID] = receiverID;

        followedUser.markModified('followers');
        req.user.markModified('following');

        await followedUser.save();
        await req.user.save();

        res.send('followed!');

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }

});

router.get('/followers', auth, async (req, res) => {

    try {

        const followers = await User.find({ _id: { $in: req.user.followerList } }, 'name bio');
        res.send(followers);

    } catch (e) {
        res.status(500).send();
    }

});

router.get('/following', auth, async (req, res) => {

    try {

        const following = await User.find({ _id: { $in: req.user.followingList } }, 'name bio');
        res.send(following);

    } catch (e) {
        res.status(500).send();
    }

});

module.exports = router;
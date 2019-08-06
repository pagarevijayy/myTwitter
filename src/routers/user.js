const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user');
const auth = require('../middleware/auth');
const utils = require('../utils/utils');


const router = new express.Router();

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an image file."));
        }

        cb(undefined, true);
    }
});

//upload avatar
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

//delete avatar
router.delete('/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

//get avatar
router.get('/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

router.post('/signup', async (req, res) => {

    const allowedFields = ['name', 'avatar', 'handle', 'email', 'password', 'DOB', 'bio'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const user = new User(req.body);

        await user.save();

        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });

    } catch (e) {
        res.status(400).send(e);
    }

});

router.post('/login', async (req, res) => {

    const allowedFields = ['email', 'password'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.cookie('authToken', token);

        res.send({
            redirect: '/profile'
        });

    } catch (e) {
        res.status(400).send();
    }
});

router.post('/logout', auth, async (req, res) => {

    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.clearCookie('authToken');

        res.send({
            redirect: "/"
        });

    } catch (e) {
        res.status(500).send();
    }
});

router.get('/profile', auth, async (req, res) => {
    const user = req.user
    // for tweets and retweets
    try {
        await user.populate([{ path: 'tweets' }, { path: 'retweets' }]).execPopulate();

        let arr = user.tweets;
        arr = arr.concat(user.retweets);

        arr.sort(function(a, b) {
            var keyA = new Date(a.createdAt),
                keyB = new Date(b.createdAt);
            // Compare the 2 dates
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
        });

        //tweets and retweets are stored in arr
        // res.send(arr);
        res.render('myProfile',{
            name: user.name,
            handle: user.handle,
            totalTweets: user.tweets,
            totalFollowing: user.followingList.length,
            totalFollowers: user.followerList.length
        });
        arr = [];
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/profile', auth, async (req, res) => {

    const allowedFields = ['name', 'handle', 'email', 'password', 'DOB', 'bio'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
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
        res.status(500).send();
    }
});

router.post('/friendships', auth, async (req, res) => {

    const allowedFields = ['user', 'follow'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const initiatorId = req.user._id.toString();
        const receiverId = req.body.user;

        const follow = req.body.follow;

        const isFollow = await utils.isFollow(initiatorId, receiverId);

        if (!isFollow) return res.status(400).send('Invalid! User does not exist!');

        if (follow && isFollow.follows) return res.status(400).send('Invalid! Already follows!');

        if (!follow && !isFollow.follows) return res.status(400).send('Invalid! Already unfollows!');

        const initiator = req.user;
        const receiver = isFollow.receiver;

        if (follow) {

            initiator.following[receiverId] = receiverId;
            receiver.followers[initiatorId] = initiatorId;

            initiator.markModified('following');
            receiver.markModified('followers');

            await initiator.save();
            await receiver.save();

            return res.send('followed!');
        }

        delete initiator.following[receiverId];
        delete receiver.followers[initiatorId];

        initiator.markModified('following');
        receiver.markModified('followers');

        await initiator.save();
        await receiver.save();

        res.send('unfollowed!');

    } catch (e) {
        res.status(500).send(e);
    }

});

router.get('/follows/:user', auth, async (req, res) => {

    try {

        const isFollow = await utils.isFollow(req.user._id.toString(), req.params.user);

        if (isFollow) {
            return res.send({ follows: isFollow.follows });
        }

        res.status(400).send('Invalid! User does not exist!');

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
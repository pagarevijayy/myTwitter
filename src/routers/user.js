const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user');
const Tweet = require('../models/tweet');
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

        res.cookie('authToken', token);

        res.status(201).send({ redirect: '/home' });

    } catch (e) {
        res.status(400).send();
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
            redirect: '/home'
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

router.get('/profileDetails', auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/profile', auth, async (req, res) => {
    const user = req.user
    try {
        await user.populate([{
            path: 'tweets',
        }, { path: 'retweets' }]).execPopulate();

        let arr = user.tweets;
        const totalTweets = user.tweets.length;
        arr = arr.concat(user.retweets);

        arr.sort(function(a, b) {
            var keyA = new Date(a.createdAt),
                keyB = new Date(b.createdAt);
            // Compare the 2 dates
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
        });

        res.render('myProfile', {
            arr,
            name: user.name,
            handle: user.handle,
            totalTweets,
            bio: user.bio,
            totalFollowing: user.followingList.length,
            totalFollowers: user.followerList.length
        });

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
        const updates = Object.keys(req.body);
        updates.forEach((update) => req.user[update] = req.body[update]);
        await Tweet.updateMany({ user: req.user._id }, { $set: { handle: req.user.handle, name: req.user.name } });
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        console.log(e);
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

// view profile of any user
router.get("/user/:handle", async (req, res) => {
    // for tweets and retweets
    try {

        // let profileToRender = undefined;

        // if (req.cookies.authToken) {
        //     profileToRender = req.user.handle === req.params.handle ?
        // }

        const currentUserId = req.user._id.toString();

        const isFollow = await utils.isFollow(currentUserId, req.params.handle);

        if (!isFollow) {
            return res.status(404).send('This account doesn\'t exist');
        }

        const user = isFollow.receiver;

        await user.populate([{ path: 'tweets' }, { path: 'retweets' }]).execPopulate();

        let arr = user.tweets;
        const totalTweets = user.tweets.length;
        arr = arr.concat(user.retweets);

        arr.sort(function(a, b) {
            var keyA = new Date(a.createdAt),
                keyB = new Date(b.createdAt);
            // Compare the 2 dates
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
        });

        res.render('userProfile', {
            arr,
            name: user.name,
            handle: user.handle,
            follows: isFollow.follows,
            totalTweets,
            bio: user.bio,
            totalFollowing: user.followingList.length,
            totalFollowers: user.followerList.length
        });

    } catch (e) {
        res.status(500).send(e);
    }
});


router.post('/friendships', auth, async (req, res) => {

    const allowedFields = ['handle'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const initiatorId = req.user._id.toString();
        const receiverHandle = req.body.handle;

        const isFollow = await utils.isFollow(initiatorId, receiverHandle);

        if (!isFollow) return res.status(400).send('Invalid! User does not exist!');

        const initiator = req.user;
        const receiver = isFollow.receiver;
        const receiverId = receiver._id.toString();

        if (isFollow.follows) {

            delete initiator.following[receiverId];
            delete receiver.followers[initiatorId];

            initiator.markModified('following');
            receiver.markModified('followers');

            await initiator.save();
            await receiver.save();

            return res.send('unfollowed!');

        }

        initiator.following[receiverId] = receiverId;
        receiver.followers[initiatorId] = initiatorId;

        initiator.markModified('following');
        receiver.markModified('followers');

        await initiator.save();
        await receiver.save();

        res.send('followed!');

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }

});

router.get('/user/:handle/followers', auth, async (req, res) => {

    try {

        let user = undefined;

        if (req.user.handle !== req.params.handle) {
            user = await User.findOne({ handle: req.params.handle });
        } else {
            user = req.user;
        }

        const followers = await User.find({ _id: { $in: user.followerList } }, 'name handle bio').lean();

        res.render('follow', {
            arr: followers,
            type: 'followers'
        });

    } catch (e) {
        res.status(500).send();
    }

});

router.get('/user/:handle/following', auth, async (req, res) => {

    try {

        let user = undefined;

        if (req.user.handle !== req.params.handle) {
            user = await User.findOne({ handle: req.params.handle });
        } else {
            user = req.user;
        }

        const following = await User.find({ _id: { $in: user.followingList } }, 'name handle bio');


        res.render('follow', {
            arr: following,
            type: 'following'
        });

    } catch (e) {
        res.status(500).send();
    }

});

module.exports = router;
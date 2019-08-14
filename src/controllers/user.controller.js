const sharp = require('sharp');

const User = require('../models/user');
const Tweet = require('../models/tweet');
const utils = require('../utils/utils');

// avatar
const uploadAvatar = async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
};

const errOnUpload = (error, req, res, next) => {
    res.status(400).send({ error: error.message });
};

const getAvatar = async (req, res) => {

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

};

const deleteAvatar = async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
};

// signup
const signUp = async (req, res) => {

    const allowedFields = ['name', 'handle', 'email', 'password'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const user = new User(req.body);

        await user.save();

        const token = await user.generateAuthToken();


        res.cookie('authToken', token);
        res.cookie('user_id', user._id.toString());



        res.status(201).send({ redirect: '/home' });

    } catch (e) {
        res.status(400).send();
    }

};

//login
const login = async (req, res) => {

    const allowedFields = ['email', 'password'];

    if (!utils.isReqBodyValid(req.body, allowedFields)) {
        return res.status(400).send('Invalid request body!');
    }

    try {

        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.cookie('authToken', token);
        res.cookie('user_id', user._id.toString());

        res.send({
            redirect: '/home'
        });

    } catch (e) {
        res.status(400).send();
    }
};

//logout
const logout = async (req, res) => {

    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.clearCookie('authToken');
        res.clearCookie('user_id');

        res.send({
            redirect: "/"
        });

    } catch (e) {
        res.status(500).send();
    }
}

// profile details
const getProfileDetails = async (req, res) => {

    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e);
    }
}

// profile
const getProfile = async (req, res) => {

    const user = req.user;

    try {

        await user.populate([{ path: 'tweets' }, {
            path: 'retweets',
            populate: {
                path: 'tweet',
                select: 'text name handle likeCount replyCount retweetCount'
            }
        }]).execPopulate();

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

        if (arr.length === 0) {
            return res.render('myProfile', {
                message: 'Waiting for your first tweet :)',
                hasTweeted: false,
                name: user.name,
                handle: user.handle,
                totalTweets,
                bio: user.bio,
                totalFollowing: user.followingList.length,
                totalFollowers: user.followerList.length
            });
        }

        res.render('myProfile', {
            arr,
            hasTweeted: true,
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
};

// update profile
const updateProfile = async (req, res) => {
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
}

// delete profile
const deleteProfile = async (req, res) => {

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

}

// get user profile
const getUserProfile = async (req, res) => {
    // for tweets and retweets
    try {

        if (req.user.handle === req.params.handle) {
            return res.redirect('/profile');
        }

        const currentUserId = req.user._id.toString();

        const isFollow = await utils.isFollow(currentUserId, req.params.handle);

        if (!isFollow) {
            return res.status(404).send('This account doesn\'t exist');
        }

        const user = isFollow.receiver;

        await user.populate([{ path: 'tweets' }, {
            path: 'retweets',
            populate: {
                path: 'tweet',
                select: 'text name handle likeCount replyCount retweetCount'
            }
        }]).execPopulate();

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

        if (arr.length === 0) {
            return res.render('userProfile', {
                message: 'There are no tweets to show from this account :)',
                hasTweeted: false,
                name: user.name,
                handle: user.handle,
                follows: isFollow.follows,
                totalTweets,
                bio: user.bio,
                totalFollowing: user.followingList.length,
                totalFollowers: user.followerList.length
            });
        }

        res.render('userProfile', {
            arr,
            hasTweeted: true,
            name: user.name,
            handle: user.handle,
            follows: isFollow.follows,
            totalTweets,
            bio: user.bio,
            totalFollowing: user.followingList.length,
            totalFollowers: user.followerList.length
        });

        // res.send(arr);

    } catch (e) {
        res.status(500).send(e);
    }
}

// friendships
const friendships = async (req, res) => {

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

}

// get followers of a user
const getUserFollowers = async (req, res) => {

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

}

// get following of a user
const getUserFollowing = async (req, res) => {

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

        // res.send(following);

    } catch (e) {
        res.status(500).send();
    }

}


module.exports = {
    uploadAvatar,
    errOnUpload,
    getAvatar,
    deleteAvatar,
    signUp,
    login,
    logout,
    getProfileDetails,
    getProfile,
    updateProfile,
    deleteProfile,
    getUserProfile,
    friendships,
    getUserFollowers,
    getUserFollowing
};
const express = require('express');

const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const utils = require('../utils/utils');

const router = new express.Router();

//upload avatar
router.post('/me/avatar', auth, utils.upload.single('avatar'), userController.uploadAvatar, userController.errOnUpload);

//delete avatar
router.delete('/me/avatar', auth, userController.deleteAvatar);

//get avatar
router.get('/:id/avatar', userController.getAvatar);

// signup
router.post('/signup', userController.signUp);

// login
router.post('/login', userController.login);

// logout
router.post('/logout', auth, userController.logout);

// current user 
router.get('/profileDetails', auth, userController.getProfileDetails);

router.get('/profile', auth, userController.getProfile);

router.patch('/profile', auth, userController.updateProfile);

router.delete('/profile', auth, userController.deleteProfile);

// view profile of any user
router.get("/user/:handle", auth, userController.getUserProfile);

// friendships
router.post('/friendships', auth, userController.friendships);

// get user followers
router.get('/user/:handle/followers', auth, userController.getUserFollowers);

// get user following
router.get('/user/:handle/following', auth, userController.getUserFollowing);

// get all user handles
router.get('/handles', auth, userController.getAllUserHandles);


module.exports = router;
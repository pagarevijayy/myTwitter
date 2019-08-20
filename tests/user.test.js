const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const { userOneId, userTwoId, userOne, userTwo, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

describe('Auth not required', () => {

    test('Should signup a new user', async () => {

        const response = await request(app).post('/signup').send({
            name: 'Vijay',
            handle: 'vij-1',
            email: 'vij@gmail.com',
            password: 'password123'
        }).expect(201);

        // assert that the database was changed correctly
        const user = await User.findOne({ handle: 'vij-1' });
        expect(user).not.toBeNull();

        // assert that cookie was set correctly
        const authToken = response.header['set-cookie'][0].split(';')[0].split('=')[1];
        expect(authToken).toEqual(user.tokens[0].token);

        // assert that the password is not stored as plaintext
        expect(user.password).not.toEqual('password123');

    });

    test('Should not signup user with non-unique handle', async () => {

        const response = await request(app).post('/signup').send({
            name: 'Vijay',
            handle: userOne.handle,
            email: 'vij@gmail.com',
            password: 'password123'
        }).expect(400);

    });


    test('Should not signup user with non-unique email', async () => {

        const response = await request(app).post('/signup').send({
            name: 'Vijay',
            handle: 'vij-1',
            email: userOne.email,
            password: 'password123'
        }).expect(400);

    });

    test('Should not signup user with invalid email', async () => {

        const response = await request(app).post('/signup').send({
            name: 'Vijay',
            handle: 'vij-1',
            email: 'vij@',
            password: 'password123'
        }).expect(400);

    });

    test('Should login existing user', async () => {

        const response = await request(app).post('/login').send({
            email: userOne.email,
            password: userOne.password
        }).expect(200);

        const user = await User.findById(userOneId);

        // assert that cookie was set correctly
        const authToken = response.header['set-cookie'][0].split(';')[0].split('=')[1];
        expect(authToken).toEqual(user.tokens[1].token);

    });

    test('Should not login nonexistent user', async () => {

        const response = await request(app).post('/login').send({
            email: userOne.email,
            password: 'password12'
        }).expect(400);

    });

});

describe('Auth required', () => {

    test('Should logout existing user', async () => {

        await request(app).post('/logout')
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(200);

    });

    test('Should not logout nonexistent user', async () => {

        await request(app).post('/logout')
            .send()
            .expect(401);

    });

    test('Should get profile page of an existing user who is not current user', async () => {

        await new User(userTwo).save();

        await request(app).get(`/user/${userTwo.handle}`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(200);

    });

    test('Should get profile page of an existing user who is current user', async () => {

        await request(app).get(`/user/${userOne.handle}`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(302);

    });

    test('Should not get profile page of a nonexistent user', async () => {

        await request(app).get(`/user/not-exists`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(404);

    });

    test('Should follow an existing user', async () => {

        await new User(userTwo).save();

        await request(app).post(`/friendships`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send({
                handle: userTwo.handle
            })
            .expect(200);

        const followee = await User.findById(userOneId);
        const followed = await User.findById(userTwoId);

        expect(followee.following).toMatchObject({
            [userTwoId.toHexString()]: userTwoId.toHexString()
        });

        expect(followed.followers).toMatchObject({
            [userOneId.toHexString()]: userOneId.toHexString()
        });

    });

    test('Should unfollow a followed user', async () => {

        await User.deleteMany();

        const userOneClone = Object.assign(userOne);
        const userTwoClone = Object.assign(userTwo);

        const userOneIdString = userOneId.toHexString();
        const userTwoIdString = userTwoId.toHexString();

        userOneClone.following = {};
        userOneClone.following[userTwoIdString] = userTwoIdString;

        userTwoClone.followers = {};
        userTwoClone.followers[userOneIdString] = userOneIdString;

        await new User(userOneClone).save();
        await new User(userTwoClone).save();

        await request(app).post(`/friendships`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send({
                handle: userTwo.handle
            })
            .expect(200);

        const followee = await User.findById(userOneId);
        const followed = await User.findById(userTwoId);

        expect(followee.following).toMatchObject({});
        expect(followed.followers).toMatchObject({});

    });

    test('Should not follow or unfollow a nonexistent user', async () => {

        await request(app).post(`/friendships`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send({
                handle: 'not-exists'
            })
            .expect(400);

    });

    test('Should get followers of an existing user', async () => {

        await request(app).get(`/user/${userOne.handle}/followers`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(200);


    });

    test('Should not get followers of a nonexistent user', async () => {

        await request(app).get(`/user/not-exists/followers`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(400);

    });

    test('Should get following of an existing user', async () => {

        await request(app).get(`/user/${userOne.handle}/following`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(200);

    });

    test('Should not get following of a nonexistent user', async () => {

        await request(app).get(`/user/not-exists/following`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(400);

    });

    test('Should get all user handles', async () => {

        await request(app).get(`/handles`)
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .send()
            .expect(200);

    });

    describe('Current user', () => {

        test('Should get profile details', async () => {

            const response = await request(app).get('/profileDetails')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send()
                .expect(200);

            const user = await User.findById(userOneId);

            expect(JSON.stringify(response.body)).toEqual(JSON.stringify(user.toJSON()));

        });

        test('Should get profile page', async () => {

            await request(app).get('/profile')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send()
                .expect(200);

        });

        test('Should update profile details', async () => {

            const response = await request(app).patch('/profile')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    name: 'akai',
                    email: 'akai@gmail.com',
                    handle: 'akai-1'
                })
                .expect(200);

            const user = await User.findById(userOneId);

            // assert that the fields were updated
            expect(response.body.name).toEqual(user.name);
            expect(response.body.email).toEqual(user.email);
            expect(response.body.handle).toEqual(user.handle);

        });

        test('Should delete profile', async () => {

            await request(app).delete('/profile')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send()
                .expect(200);

            const user = await User.findById(userOneId);
            expect(user).toBeNull();

        });

    });



});
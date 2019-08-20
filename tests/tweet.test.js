const request = require('supertest');
const app = require('../src/app');
const Tweet = require('../src/models/tweet');

const { userOneId, tweetOneId, tweetTwoId, retweetOneId, replyOneId, userOne, setupDatabase } = require('./fixtures/db');


describe('Testing tweet.controller', () => {
    beforeEach(setupDatabase);

    describe('Should test timeline(home) feature', () => {
        test('Should display timeline', async () => {
            await request(app)
            .get("/home")
            .set('Cookie', `authToken=${userOne.tokens[0].token}`)
            .expect(200)            
        });

        test('Should not display timeline for unauthorised user', async () => {
            await request(app)
            .get("/home")
            .expect(401)            
        });
    });

    describe('Should test search feature', () => {
        test('Should find existing user handle', async () => {
            await request(app)
                .get('/search')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .query({
                    handle : "abh-1"
                })
                .expect(200)
        });

        test('Should not find non-existing user handle', async () => {
            await request(app)
                .get('/search')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .query({
                    handle : "abhi-1"
                })
                .expect(404)
        });

        test('Should not search for unauthorised user', async () => {
            await request(app)
                .get('/search')
                .query({
                    handle : "abh-1"
                })
                .expect(401)
        });

    });
    
    describe('Should test tweets feature', () => {
        //tweets
        test('Should tweet', async () => {
            await request(app)
                .post('/tweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    text: "tweet test!"
                })
                .expect(201)
        });

        test('Should not accept badly requested tweet', async () => {
            await request(app)
                .post('/tweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    msg: "tweet test!"
                })
                .expect(400)
        });

        test('Should not tweet for unauthorised user', async () => {
            await request(app)
                .post('/tweet')
                .send({
                    text: "tweet test!"
                })
                .expect(401)
        });

        //like tweet
        test('Should like tweet', async () => {
            await request(app)
                .post('/tweet/like')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: tweetOneId
                })
                .expect(200)
        });

        test('Should not like badly requested tweet', async () => {
            await request(app)
                .post('/tweet/like')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    id: tweetOneId
                })
                .expect(400)
        });

        test('Should not like non-existing tweet', async () => {
            await request(app)
                .post('/tweet/like')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: "5d5a3829b8acd015bad73511"
                })
                .expect(400)
        });

        test('Should not like tweet for unauthorised user', async () => {
            await request(app)
                .post('/tweet/like')
                .send({
                    tweet: tweetOneId
                })
                .expect(401)
        });

        //delete tweet
        test('Should delete tweet', async () => {
            await request(app)
                .delete('/tweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: tweetOneId
                })
                .expect(200)
        });

        test('Should not delete badly requested tweet', async () => {
            await request(app)
                .delete('/tweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    id: tweetOneId
                })
                .expect(400)
        });

        test('Should not delete non-existing tweet', async () => {
            await request(app)
                .delete('/tweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: "5d5a3829b8acd015bad73511"
                })
                .expect(400)
        });

        test('Should not delete tweet for unauthorised user', async () => {
            await request(app)
                .delete('/tweet')
                .send({
                    tweet: tweetOneId
                })
                .expect(401)
        });
    });

    describe('Should test retweets feature', () => {
        //retweet
        test('Should retweet ', async () => {
            await request(app)
                .post('/retweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: tweetOneId
                })
                .expect(201)
        });

        test('Should undo existing retweet ', async () => {
            await new Tweet({
                _id: tweetTwoId,
                text: "Created tweet two before (with no hashtag feature)",
                user: userOne._id,
                name: userOne.name,
                handle: userOne.handle,
            }).save();

            await request(app)
                .post('/retweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: tweetTwoId
                })
                .expect(200)
        });

        test('Should not accept badly requested retweet ', async () => {
            await request(app)
                .post('/retweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    id: tweetOneId
                })
                .expect(400)
        });

        test('Should not retweet a non-existing tweet ', async () => {
            await request(app)
                .post('/retweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: "5d5a3829b8acd015bad73511"
                })
                .expect(400)
        });

        test('Should not retweet for unauthorized user', async () => {
            await request(app)
                .post('/retweet')
                .send({
                    tweet: tweetOneId
                })
                .expect(401)
        });

        // delete retweet
        test('Should delete retweet', async () => {
            await request(app)
                .delete('/retweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    retweet: retweetOneId
                })
                .expect(200)
        });

        test('Should not delete badly requested retweet', async () => {
            await request(app)
                .delete('/retweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    retweetId: retweetOneId
                })
                .expect(400)
        });

        test('Should not delete non-existing retweet', async () => {
            await request(app)
                .delete('/retweet')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    retweet: tweetOneId
                })
                .expect(400)
        });

        test('Should not delete retweet for unauthorised user', async () => {
            await request(app)
                .delete('/retweet')
                .send({
                    retweet: retweetOneId
                })
                .expect(401)
        });

    });

    describe('Should test replies feature', () => {
        test('Should reply', async () => {
            await request(app)
                .post('/reply')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: tweetOneId,
                    text: "Reply demo"
                })
                .expect(201)
        });

        test('Should not accept badly requested reply', async () => {
            await request(app)
                .post('/reply')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: "5d5a3829b8acd015bad73511",
                    msg: "Reply demo"
                })
                .expect(400)
        });

        test('Should not reply on non-existing tweet', async () => {
            await request(app)
                .post('/reply')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    tweet: "5d5a3829b8acd015bad73511",
                    text: "Reply demo"
                })
                .expect(400)
        });

        test('Should not reply for unauthorised user', async () => {
            await request(app)
                .post('/reply')
                .send({
                    tweet: tweetOneId,
                    text: "Reply demo"
                })
                .expect(401)
        });

        //like reply
        test('Should like reply', async () => {
            await request(app)
                .post('/reply/like')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    reply: replyOneId
                })
                .expect(200)
        });

        test('Should not like badly requested reply', async () => {
            await request(app)
                .post('/reply/like')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    id: replyOneId
                })
                .expect(400)
        });

        test('Should not like reply non-existing reply', async () => {
            await request(app)
                .post('/reply/like')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    reply: "5d5a3829b8acd015bad73511"
                })
                .expect(400)
        });

        test('Should not like reply for unauthorised user', async () => {
            await request(app)
                .post('/reply/like')
                .send({
                    reply: replyOneId
                })
                .expect(401)
        });

        //delete reply
        test('Should delete reply', async () => {
            const response = await request(app)
                .delete('/reply')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    reply: replyOneId
                })
                .expect(200)
        });

        test('Should not delete badly requested reply', async () => {
            await request(app)
                .delete('/reply')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    msg: replyOneId
                })
                .expect(400)
        });

        test('Should not delete non-existing reply', async () => {
            await request(app)
                .delete('/reply')
                .set('Cookie', `authToken=${userOne.tokens[0].token}`)
                .send({
                    reply: "5d5a3829b8acd015bad73511"
                })
                .expect(400)
        });

        test('Should not delete reply for unauthorised user', async () => {
            const response = await request(app)
                .delete('/reply')
                .send({
                    reply: replyOneId
                })
                .expect(401)
        });

    });
})

//Note: Tests pending for unlike tweet and unlike reply;
//Can also validate responses

// Take away : Don't overkill test suites
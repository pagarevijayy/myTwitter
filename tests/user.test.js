const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test.skip('Should signup a new user', async () => {

});
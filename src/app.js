const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');

const tweetRouter = require('./routers/tweet');

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use(userRouter);
app.use(tweetRouter);


//Server connection
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}..`);
});
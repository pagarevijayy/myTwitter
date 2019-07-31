const express = require('express');
require('./db/mongoose');
require('./models/reply');
require('./models/user');
require('./models/retweet');

const tweetRouter = require('./routers/tweet');

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(tweetRouter);

//Server connection
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}..`);
});



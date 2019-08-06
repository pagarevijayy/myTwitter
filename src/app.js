const express = require('express');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
require('./db/mongoose');

const userRouter = require('./routers/user');
const tweetRouter = require('./routers/tweet');

const app = express();
const port = process.env.PORT || 3000;

//Setup handlebars engine and view location
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views/public'));
hbs.registerPartials(path.join(__dirname, '../views/partials'));

//Setup static directory to serve
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../views/public')));

app.use(express.json());
app.use(userRouter);
app.use(tweetRouter);

//Root route
app.get("", (req, res) => {
    res.render('index');
});

//Server connection
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}..`);
});
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketio = require('socket.io');
require('./db/mongoose');

const userRouter = require('./routers/user');
const tweetRouter = require('./routers/tweet');

const app = express();
const port = process.env.PORT || 3000;

// socket instance
const server = http.createServer(app);
const io = socketio(server);

//Setup handlebars engine and view location
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views/public'));
hbs.registerPartials(path.join(__dirname, '../views/partials'));

//hbs helper
hbs.registerHelper('if_eq', function(a, b, opts) {
    if(a == b) 
        return opts.fn(this);
    else
        return opts.inverse(this);
});


app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});
app.use(express.json());

//Setup static directory to serve
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../views/public')));

app.use(userRouter);
app.use(tweetRouter);


//Root route
app.get("", (req, res) => {
    res.render('index');
});

//Server connection
server.listen(port, () => {
    console.log(`Server is up and running on port ${port}..`);
});

io.on('connection', (socket) => {
    // console.log("new websocket connection!");
    socket.on('tweet', (data) => {
        socket.broadcast.emit('newTweet', data);
    });

    socket.on('retweet', (data) => {
        socket.broadcast.emit('newTweet', data);
    });
});
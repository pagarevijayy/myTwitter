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
    console.log("new websocket connection!");
    socket.on('tweet', (data) => {
        io.emit('newTweet',data);
    });
});
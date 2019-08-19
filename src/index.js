const http = require('http');
const socketio = require('socket.io');

const app = require('./app');

const port = process.env.PORT || 3000;

// socket instance
const server = http.createServer(app);
const io = socketio(server);

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
        socket.broadcast.emit('newRetweet', data);
    });
});
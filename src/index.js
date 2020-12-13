const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, getRoomUsers, getUser, removeUser } = require('./utils/users')

const app = express();

const server = http.createServer(app); // Creating and configuring server outside of the express library.
const io = socketio(server);

const port = process.env.PORT || 3000;
const indexPath = path.join(__dirname, '../public');

// let count = 0;

io.on('connection', (socket) => {                 // When a client connects, this fn. is exceuted.
    console.log('New Websocket Connection...')

    // socket.emit('countUpdated', count);     // General Rule: socket is used for particular connection, io for all.
    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('countUpdated', count);
    //     io.emit('countUpdated', count);
    // })

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room }); // For every connection, socket by default provides us with an id

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('messageUpdate', generateMessage('Admin', 'Welcome to HeyWire...'))
        socket.broadcast.to(user.room).emit('messageUpdate', generateMessage('Admin', `${user.username} has joined the chat`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })

    socket.on('message-sent', (message, callback) => {

        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback(`We don't do that here...`);
        }

        const user = getUser(socket.id);

        io.to(user.room).emit('messageUpdate', generateMessage(user.username, message));
        callback();
    })

    socket.on('location', (location, callback) => { // callback is for acknowledgement

        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${location[0]},${location[1]}`))
        callback();
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('messageUpdate', generateMessage(`${user.username} left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    })
})

app.use(express.static(indexPath));
// app.use('/static', express.static('public'))

server.listen(port, () => {
    console.log("Server Running on port 3000");
})

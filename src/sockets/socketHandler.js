const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
    // Middleware to authenticate socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.username} (${socket.id})`);

        // Join a room based on userId for personal notifications
        socket.join(socket.user._id.toString());
        console.log(`User ${socket.user.username} joined room: ${socket.user._id}`);

        // Example incoming event
        socket.on('chat:send', (data) => {
            console.log(`Message from ${socket.user.username}:`, data);

            // Broadcast to everyone (broadcast event)
            io.emit('chat:message', {
                user: socket.user.username,
                message: data.message,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.username}`);
        });
    });
};

module.exports = socketHandler;

const express = require('express');
const cors = require('cors');
require('dotenv').config();  // Ensure that .env file is loaded
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth').router;  // Import authentication routes
const projectRoutes = require('./routes/projects');  // Import project routes

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',  // Frontend origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],  // Add headers as needed
}));
app.use(express.json());  // Parse JSON request bodies

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);  // Authentication routes
app.use('/api/projects', projectRoutes);  // Project-related routes

// Set up HTTP server and WebSocket
const server = http.createServer(app);

// Socket.IO Configuration
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',  // Ensure this matches the frontend origin
        methods: ['GET', 'POST'],
    },
});

// WebSocket Connection for real-time collaboration (Code editor, Chat)
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // Real-time code collaboration: Broadcast code changes to other clients
    socket.on('codeChange', (codeData) => {
        socket.broadcast.emit('receiveCode', codeData);
    });

    // Real-time chat: Broadcast chat messages to all clients
    socket.on('sendMessage', (messageData) => {
        io.emit('receiveMessage', messageData);
    });

    // Notify when a user joins the project or chat
    socket.on('joinProject', (userData) => {
        console.log(`${userData.username} has joined the project`);
        socket.join(userData.pjname);  // Join the specific room for the project
        io.to(userData.pjname).emit('userJoined', { username: userData.username });  // Notify others in the same room
    });

    // Notify when a user leaves the project
    socket.on('leaveProject', (userData) => {
        console.log(`${userData.username} has left the project`);
        socket.leave(userData.pjname);  // Leave the specific project room
        io.to(userData.pjname).emit('userLeft', { username: userData.username });  // Notify others in the same room
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

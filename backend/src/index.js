const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Real-time communication
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('join', (patientId) => {
        socket.join(patientId);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Attach io to global for services to use
global.io = io;
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./api/authRoutes'));

// Serve Clinical Companion Module
app.use('/clinical_companion', express.static(path.join(__dirname, '../public/clinical_companion')));

// Error Handling Middleware
app.use(require('./middleware/errorMiddleware'));


// Database Connection
const PORT = 5005;
process.env.DEMO_MODE = 'true';

mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recoverai', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 2000
}).then(() => {
    console.log('MongoDB Connected');
    process.env.DEMO_MODE = 'false';
}).catch(err => {
    console.log('Using Demo Mode Storage');
    process.env.DEMO_MODE = 'true';
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`RecoverAI Engine Active on Port ${PORT}`);
}).on('error', (err) => {
    console.error('Server Listen Error:', err.message);
});

module.exports = app;

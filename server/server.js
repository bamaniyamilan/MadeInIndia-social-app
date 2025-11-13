const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// example route
app.get('/ping', (req, res) => res.json({ msg: 'pong' }));
app.use('/api/auth', require('./routes/auth'))
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' }
});

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const PORT = process.env.PORT || 4000;
        server.listen(PORT, () => console.log(`Server running on ${PORT}`));
    } catch (err) { console.error(err); }
};
start();
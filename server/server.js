require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/db');
const { startTracker } = require('./services/tracker');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api', apiRoutes);

const startServer = async () => {
    try {
        await initDb();
        console.log('Database initialized successfully');
        startTracker();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
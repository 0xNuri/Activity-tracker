const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./databaseConfig');

require('dotenv').config();

const middlewares = require('./middlewares');
const logs = require('./routes/logRoutes');

const app = express();

connectDB();

app.use(morgan('common'));
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json("Nice to see you here...");
});

app.use('/api/logs', logs);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on port: ' + port);
});
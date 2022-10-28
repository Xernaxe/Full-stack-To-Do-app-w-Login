const express = require('express');
const app = express();
const cors = require('cors');
const env = require('dotenv').config();
const config = require('config');
const setResHeaderJSON = require('./middleware/setResHeaderJSON');

//requiring route handlers
const login = require('./routes/login');
const register = require('./routes/register');
const tasks = require('./routes/tasks');
const profiles = require('./routes/profiles');


app.use(express.json());

const corsOptions = {
    exposedHeaders: ['x-authentication-token']
}
app.use(cors(corsOptions));
app.use(setResHeaderJSON)

//Endpoints
app.use('/api/login', login);
app.use('/api/accounts', register);
app.use('/api/tasks', tasks);
app.use('/api/accounts', profiles);

// Start listening for reqests on port
app.listen(config.get('port'), console.log(`Listening on port: ${config.get('port')}...`));

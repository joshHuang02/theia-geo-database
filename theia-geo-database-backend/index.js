const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');

const app = express();
const port = 3000;

app.use('/api', routes)

// Replace <YOUR_CONNECTION_STRING> with your actual connection string
const connectionString = 'mongodb://127.0.0.1:27017/theia-geo-database';

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Your routes and other backend logic go here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
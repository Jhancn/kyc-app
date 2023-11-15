const express = require('express');
const dbConnect = require('./dbConnect');
require('dotenv').config();
require('./helpers/errorHandler');

// app
const app = express()

// middlewares
require('./helpers/middlewares')(app, express)
// routes
require('./helpers/routes')(app)

// db & server
const PORT = process.env.PORT || 5000
dbConnect().then(() => {
    app.listen(PORT, () => {
        console.log('Server started:', PORT)
    })
})
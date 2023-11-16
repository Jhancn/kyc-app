const express = require('express');
const dbConnect = require('./dbConnect');
const awsKyc = require('./helpers/awsKyc');
require('dotenv').config();
require('./helpers/errorHandler');

// app
const app = express()

let main = async () => {
    const kycResponse = await awsKyc.compare_faces_and_text('kyc/134/selfie.png', 'kyc/134/document.png')
    console.log(kycResponse);
}
// main()

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
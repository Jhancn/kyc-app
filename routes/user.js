const express = require('express');
const asyncFun = require('../middlewares/asyncFun');
const validations = require('../helpers/validations');
const cryptojs = require('../helpers/cryptojs');

const user = express.Router()

// @METHOD: POST
// @ROUTE: /api/user/get_api
// @DESC: to get api key & secret key
user.post('/get_api', asyncFun (async (req, res) => {
    // get payload
    const payload = req.body

    // joi validations
    const { error } = validations.sendApiToken(payload)
    if(error) return res.status(400).send(error.details[0].message)
    
    // get api key & secret key
    const apiKey = cryptojs.apiEncryption({ userId: payload.userId, email: payload.email })
    const secretKey = cryptojs.apiEncryption({ userId: payload.userId })

    // send response
    return res.status(200).json({ apiKey, secretKey })
}))

module.exports = user
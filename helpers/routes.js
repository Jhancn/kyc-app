const queue = require('express-queue')
const kyc = require("../routes/kyc")
const user = require('../routes/user')

module.exports = (app) => {
    app.get('/', (req, res) => res.send('Welcome to kyc!'))
    app.get('/check', (req, res) => res.send('check done!'))
    app.use('/api/kyc', kyc, queue({ activelimit: 1, queuedlimit: -1 }))
    app.use('/api/user', user, queue({ activelimit: 1, queuedlimit: -1 }))
}
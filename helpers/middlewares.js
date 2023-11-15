const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const limitter = require('express-rate-limit')
const morgan = require('morgan')

const rateLimit = limitter({
    windowMs: 1000,
    max: 1,
    message: 'You can only send 1 request per 1 second'
})

module.exports = (app, express) => {
    app.use(cors())
    app.use(helmet())
    app.use(compression())
    app.use(rateLimit)
    app.use(express.json())
    app.use(morgan('tiny'))
}
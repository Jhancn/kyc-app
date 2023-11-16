const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const limitter = require('express-rate-limit')
const morgan = require('morgan')

const rateLimit = limitter({
    windowMs: 1000,
    max: 3,
    message: 'You can only send 3 requests per 1 second'
})

module.exports = (app, express) => {
    app.use(cors())
    app.use(helmet())
    app.use(compression())
    app.use(rateLimit)
    app.use(express.json({ limit: '10mb' }))
    app.use(morgan('tiny'))
}
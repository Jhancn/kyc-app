const alertDev = require("./alertDev")

process.on('uncaughtException', (err) => {
    alertDev(err.stack)
    console.log('Uncaught exception error:', err)
})

process.on('unhandledRejection', (err) => {
    alertDev(err.stack)
    console.log('Unhandled rejection error:', err)
})
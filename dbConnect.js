const mongoose = require('mongoose')
const alertDev = require('./helpers/alertDev')

module.exports = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.DB_CONNECTION_STRING)
        console.log(`Database connected: ${connection.name}`)
    }catch(err) {
        console.log('error while connecting')
        alertDev(`Error connecting db: ${err.message}`)
    }
}
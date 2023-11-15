const multer = require('multer')
const alertDev = require('../helpers/alertDev')

module.exports = async (err, req, res, next) => {
    console.log('###', err.code)
    if(err instanceof multer.MulterError) {
        return res.status(400).send(err.message)
    }else if(err.statusCode) {
        return res.status(err.statusCode).send(err.message)
    }else {
        // console.log(err)
        res.status(500).json({ title: 'Something went wrong!', message: err.message, stackTrace: err.stack })
        alertDev(err.stack)
    }
}
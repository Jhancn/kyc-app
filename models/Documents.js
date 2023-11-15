const mongoose = require('mongoose')

// schema
const documentsSchema = mongoose.Schema({
    documents: [
        {
            documentName: { type: String, required: true },
            documentCode: { type: String, required: true },
            country: { type: String, required: true }
        }
    ]
}, {
    _id: false
})

// model
const Documents = mongoose.model('Documents', documentsSchema)

module.exports = Documents
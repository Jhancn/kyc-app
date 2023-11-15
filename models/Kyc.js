const mongoose = require('mongoose')

// schema
const kycSchema = mongoose.Schema({
    kycId: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    documentCode: { type: String, required: true },
    selfie: { type: String, required: true },
    document: { type: String, required: true, default: "" },
    documentBack: { type: String, default: "" }
}, {
    timestamps: true
})

// model
const Kyc = mongoose.model('Kyc', kycSchema)

module.exports = Kyc
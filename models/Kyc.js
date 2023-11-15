const mongoose = require('mongoose')

// schema
const kycSchema = mongoose.Schema({
    kycId: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    documentCode: { type: String, required: true },
    selfie: { type: String, required: true },
    document1: { type: String, required: true, default: "" },
    document2: { type: String, default: "" }
}, {
    timestamps: true
})

// model
const Kyc = mongoose.model('Kyc', kycSchema)

module.exports = Kyc
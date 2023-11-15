const Joi = require('joi')

module.exports = {
    // to get sessionResults from sessionId
    validateSessionId: (data) => {
        const schema = Joi.object({
            sessionId: Joi.string().pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/).required().messages({
                'string.pattern.base': 'Invalid sessionId format!',
                'any.required': 'sessionId is required.',
            }),
        })

        return schema.validate(data)
    },

    // to get documents using country
    getDocumets: (data) => {
        const schema = Joi.object({
            country: Joi.string().valid('IND', 'PHL').required()
        })

        return schema.validate(data)
    },

    // to process kyc
    processKyc: (data) => {
        const schema = Joi.object({
            country: Joi.string().valid('IND', 'PHL').required(),
            documentCode: Joi.alternatives().when('country', {
                is: 'IND',
                then: Joi.valid('aadhaar', 'pan', 'dl').required(),
                otherwise: Joi.valid('dl', 'ump').required()
            }),
            selfie: Joi.string().required(),
            document: Joi.string().required(),
            documentBack: Joi.string().optional().allow(''),
        })

        return schema.validate(data)
    },

    // to send api token
    sendApiToken: (data) => {
        const schema = Joi.object({
            userId: Joi.string().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required()
        })

        return schema.validate(data)
    }
}
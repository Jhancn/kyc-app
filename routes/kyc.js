const express = require('express')
const fs = require('fs')
const path = require('path')
const asyncFun = require('../middlewares/asyncFun')
const validations = require('../helpers/validations')
const mongoFunctions = require('../helpers/mongoFunctions')
const upload = require('../middlewares/upload')
const generateKeys = require('../helpers/generateKeys')
const faceLiveness = require('../helpers/faceLiveness')

const kyc = express.Router()

// @METHOD: POST
// @ROUTE: /kyc/get_sessionId
// @DESC: To Get Session Id for face liveness
kyc.post('/get_sessionId', asyncFun (async (req, res) => {
    // get sessionId from faceLineness
    const sessionId = await faceLiveness.get_sessionId()
    if(!sessionId) return res.status(400).send('No sessionId created')
    console.log(sessionId);
    return res.status(200).json({ sessionId })
}))

// @METHOD: POST
// @ROUTE: /kyc/get_sessionResults
// @DESC: to get session results from the session(sessionId)
kyc.post('/get_sessionResults', asyncFun (async (req, res) => {
    // get payload
    const payload = req.body

    // joi validations
    const { error } = validations.validateSessionId(payload)
    if(error) return res.status(400).send(error.details[0].message)

    // get sessionResults
    const sessionResults = await faceLiveness.get_sessionResults(payload.sessionId)
    if(!sessionResults) return res.status( 400).send('No sessionResults found')
    if(sessionResults.Status === 'EXPIRED') return res.status(400).send('Your Session Id Is Expired')
    if(sessionResults.Status === 'CREATED') return res.status(400).send('No Face Liveness Session Created With Your Session Id')

    // convert image in buffer array to base64 string in sessionResults
    const bytesArray = sessionResults.ReferenceImage.Bytes
    const buffer = Buffer.from(bytesArray)
    const base64Img = buffer.toString('base64')

    // create referenceImage and assign base64 image to data
    const referenceImage = {
        BoundingBox: sessionResults.ReferenceImage.BoundingBox,
        data: base64Img
    }

    return res.status(200).json({ ...sessionResults, ReferenceImage: referenceImage })
}))

// @METHOD: POST
// @ROUTE: /kyc/get_documents
// @DESC: To Get Documents Using 'country'
kyc.post('/get_documents', asyncFun (async (req, res) => {
    // get payload
    const payload = req.body
    if(!(Object.keys(payload)).length) return res.status(400).send("Empty request")

    // joi validations
    const { error } = validations.getDocumets(payload)
    if(error) return res.status(400).send(error.details[0].message)

    // get documents
    const allDocuments = await mongoFunctions.find('Documents')
    if(!allDocuments || !allDocuments.length) return res.status(400).send("No documents found")

    // filter country
    const documents = allDocuments[0].documents
    const requiredDocuments = documents.filter(doc => doc.country === payload.country)

    return res.status(200).send(requiredDocuments)
}));

// @METHOD: POST
// @ROUTE: /kyc/
// @DESC: To Process KYC For User
kyc.post('/', upload.fields([
    { name: 'selfie', maxCount: 1 },
    { name: 'document', maxCount: 2 }
]), asyncFun (async (req, res) => {
    // get payload
    const payload = req.body
    if(!(Object.keys(payload)).length) return res.status(400).send("Empty request")

    // joi validations
    const { error } = validations.processKyc(payload)
    if(error) return res.status(400).send(error.details[0].message)

    // files validations
    if(!req.files || !(Object.keys(req.files)).length) return res.status(400).send("Documents required")
    if(!(req.files['selfie'])) return res.status(400).send("'selfie' required")
    if(!(req.files['document'])) return res.status(400).send("At least 1 'document' required")
    if((payload.documentCode === "aadhaar") && (req.files['document'].length !== 2)) return res.status(400).send("Please upload 2 files for this document type")

    // get selfie
    const selfie_file = req.files['selfie'][0]
    const selfie_data = fs.readFileSync(path.join(__dirname, '..', `/upload/${selfie_file.filename}`))
    const selfie = Buffer.from(selfie_data).toString('base64')

    // get documents
    const document1_file = req.files['document'][0]
    const document1_data = fs.readFileSync(path.join(__dirname, '..', `upload/${document1_file.filename}`))
    const document1 = Buffer.from(document1_data).toString('base64') // document1
    let document2 = ''
    if(payload.documentCode === "aadhaar") {
        const document2_file = req.files['document'][1]
        const document2_data = fs.readFileSync(path.join(__dirname, '..', `upload/${document2_file.filename}`))
        document2 = Buffer.from(document2_data).toString('base64') // document2
    }

    // create kyc data
    const kycData = {
        kycId: generateKeys.kyc(),
        country: payload.country,
        selfie,
        document1,
        document2,
        documentCode: payload.documentCode,
    }

    // save kyc data to db
    const kyc = await mongoFunctions.create('Kyc', kycData)

    return res.status(200).send('success')
}));

module.exports = kyc
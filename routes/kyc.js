const express = require('express')
const asyncFun = require('../middlewares/asyncFun')
const validations = require('../helpers/validations')
const mongoFunctions = require('../helpers/mongoFunctions')
const generateKeys = require('../helpers/generateKeys')
const awsKyc = require('../helpers/awsKyc')

const kyc = express.Router()

// @METHOD: POST
// @ROUTE: /kyc/get_sessionId
// @DESC: To Get Session Id for face liveness
kyc.post('/get_sessionId', asyncFun (async (req, res) => {
    // get sessionId from faceLineness
    const sessionId = await awsKyc.get_sessionId()
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
    const sessionResults = await awsKyc.get_sessionResults(payload.sessionId)
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
kyc.post('/', asyncFun (async (req, res) => {
    const userId = '134'

    // get payload
    const payload = req.body
    if(!(Object.keys(payload)).length) return res.status(400).send("Empty request")
    // console.log('payload --->', payload);

    // joi validations
    const { error } = validations.processKyc(payload)
    if(error) return res.status(400).send(error.details[0].message)

    // created keys of images
    const selfieKey = `kyc/${userId}/selfie.png`
    const documentKey = `kyc/${userId}/document.png`
    const documentBackKey = payload.documentBack ? `kyc/${userId}/documentBack.png` : ''

    // upload images to s3
    const uploadSelfie = await awsKyc.upload_file_to_s3(payload.selfie, selfieKey)
    const uploadDocument = await awsKyc.upload_file_to_s3(payload.document, documentKey)
    const uploadDocumentBack = documentBackKey ? await awsKyc.upload_file_to_s3(payload.documentBack, documentBackKey) : ''

    // create kyc data
    const kycData = {
        kycId: generateKeys.kyc(),
        country: payload.country,
        selfie: uploadSelfie,
        documentCode: payload.documentCode,
        document: uploadDocument,
        documentBack: uploadDocumentBack,
    }

    // save kyc data to db
    const kyc = await mongoFunctions.create('Kyc', kycData)

    // get faceMatch & ocrText
    const faceMatch = await awsKyc.compare_faces(selfieKey, documentKey)
    const ocrText = await awsKyc.detect_text(documentKey)
    const ocrTextBack = documentBackKey ? await awsKyc.detect_text(documentBackKey) : ''
    
    // get info from ocrTex
    const info = awsKyc.get_info_from_ocrText(ocrText, payload.country, payload.documentCode, ocrTextBack)
    
    console.log({ faceMatch, ocrText, ocrTextBack, info });

    return res.status(200).json({ faceMatch, ocrResult: info })
}));

module.exports = kyc
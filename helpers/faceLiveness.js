const AWS = require('aws-sdk');
const Rekognition = require("aws-sdk/clients/rekognition"); 

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

// create recognition client
const rekognitionClient = new Rekognition({ region: "us-east-1" });

module.exports = {
    // to get sessionId
    get_sessionId: async () => {
        try {
            const response = await rekognitionClient.createFaceLivenessSession().promise();
            const sessionId = response.SessionId
            return sessionId;
        }catch(err) {
            console.log('error in sessionId:', err.message)
        }
    },

    // to get sessionResults from sessionId
    get_sessionResults: async (sessionId) => {
        try {
            const response = await rekognitionClient
                .getFaceLivenessSessionResults({
                    SessionId: sessionId,
                })
                .promise();

            return response;
        }catch(err) {
            console.log('error in sessionResults:', err.message);
        }
    }
}
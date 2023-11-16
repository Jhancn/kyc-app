const AWS = require('aws-sdk');
const Rekognition = require("aws-sdk/clients/rekognition");
const documentInfo = require('./documentInfo');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

// create recognition client
const rekognitionClient = new Rekognition({ region: "us-east-1" });

// create s3 client
const s3 = new AWS.S3();
const s3BucketName = 'ss-kyc'

module.exports = {
    // to get sessionId
    get_sessionId: async () => {
        try {
            const response = await rekognitionClient.createFaceLivenessSession().promise()
            const sessionId = response.SessionId
            return sessionId
        }catch(err) {
            console.log('error in sessionId:', err.message)
        }
    },

    // to get sessionResults from sessionId
    get_sessionResults: async (sessionId) => {
        try {
            const params = {
                SessionId: sessionId
            }
            const response = rekognitionClient.getFaceLivenessSessionResults(params).promise()
            return response
        }catch(err) {
            console.log('error in sessionResults:', err.message);
        }
    },

    // to upload file to s3 bucket
    upload_file_to_s3: async (img_buff, imgname) => {
        try {
            if(img_buff) {
                var buf = Buffer.from(
                    img_buff.replace(/^data:image\/\w+;base64,/, ''),
                    'base64'
                );
                const base64Image = buf.toString('base64');
                const params = {
                    Bucket: s3BucketName,
                    Key: imgname,
                    Body: Buffer.from(base64Image, 'base64'), // buf,
                    ContentType: 'image/jpeg',
                };
                const response = await s3.upload(params).promise()
                return response.Location
            }
        }catch(err) {
            console.log('error in uploading file to s3:', err.message);
        }
    },

    // to compare images & exract text from document
    compare_faces: async (selfie, document) => {
        // parameters to compare images
        const photo_source = selfie;
        const photo_target = document;
        const params = {
            SourceImage: {
                S3Object: {
                    Bucket: s3BucketName,
                    Name: photo_source,
                },
            },
            TargetImage: {
                S3Object: {
                    Bucket: s3BucketName,
                    Name: photo_target,
                },
            },
            SimilarityThreshold: 70,
        };
        // compare images using rekognition
        let result = false;
        await rekognitionClient.compareFaces(params, function (err, response) {
            if (err) {
                console.log('err compare faces ----->',err.name);
                result = false;
            } else {
                if (response && response.FaceMatches.length <= 0) {
                    // console.log('response---->',response);
                    result = false;
                } else {
                    response.FaceMatches.forEach((data) => {
                        let similarity = data.Similarity;
                        result = similarity;
                    });
                }
            }
        }).promise();

        // get results of face comparison
        const delayedResponse = new Promise((resolve) => {
            setTimeout(async () => {
                resolve(result);
            }, 3000);
        });

        // return results
        return await delayedResponse;
    },

    // get ocr text
    detect_text: async (document) => {
        // parameters to extract text from document
        const text_params_1 = {
            Image: {
              S3Object: {
                Bucket: s3BucketName,
                Name: document,
              },
            },
        };

        // extract text using rekognition
        let str = '';
        await rekognitionClient.detectText(text_params_1, (err, data) => {
            if(err) {
                console.log('err detect text --->', err)
            }else {
                if(data) {
                    data.TextDetections.map((e) => {
                        str += e.DetectedText + ' ';
                    });
                }
            }
        }).promise();

        // get results of ocr text
        const delayedResponse = new Promise((resolve) => {
            setTimeout(async () => {
                resolve(str);
            }, 3000);
        });

        // return results
        return await delayedResponse;
    },

    // get info from ocr text
    get_info_from_ocrText: (text, country, documentCode, textBack='') => {
        text = text.replace(/[^A-Za-z0-9\s.,-\/]+/g, '')
        text = text.replace(/\s{2,}/g, ' ')

        // ### INDIA ###
        if(country === 'IND') {
            // aadhaar card
            if(documentCode === 'aadhaar') {
                const info = documentInfo.aadhaarCard_ind(text, textBack)
                return { ...info, documentCode }
            }

            // pan card
            if(documentCode === 'pan') {
                const info = documentInfo.panCard_ind(text)
                return { ...info, documentCode }
            }

            // driving license
            if(documentCode === 'dl') {
                const info = documentInfo.drivingLicense_ind(text)
                return { ...info, documentCode }
            }
        }

        // ### PHILIPPINES ###
        if(country === 'PHL') {
            // driver's licence
            if(documentCode === 'dl') {
                const info = documentInfo.drivingLicense_phl(text)
                return { ...info, documentCode }
            }
            
            // unified multi-purpose id(ump)
            if(documentCode === 'ump') {
                const info = documentInfo.unifiedMultiPurposeId_phl(text)
                return { ...info, documentCode }
            }
        }
    }
}
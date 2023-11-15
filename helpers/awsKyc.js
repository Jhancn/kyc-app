const AWS = require('aws-sdk');
const Rekognition = require("aws-sdk/clients/rekognition");

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
    upload_file_to_s3: async (img_buff, userId, imgname) => {
        try {
            if(img_buff) {
                var buf = Buffer.from(
                    img_buff.replace(/^data:image\/\w+;base64,/, ''),
                    'base64'
                );
                const base64Image = buf.toString('base64');
                const params = {
                    Bucket: s3BucketName,
                    Key: `kyc/${userId}/${imgname}.png`,
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

    compare_faces_and_text: async (selfie, document, documentBack='') => {
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
        let result = false;
        rekognitionClient.compareFaces(params, function (err, response) {
            if (err) {
                console.log('err----->',err.message);
                result = false;
            } else {
                if (response && response.FaceMatches.length <= 0) {
                    console.log('response---->',response);
                    result = false;
                } else {
                    response.FaceMatches.forEach((data) => {
                        let similarity = data.Similarity;
                        result = similarity;
                    });
                }
            }
            return result;
        });

        const text_params_1 = {
            Image: {
              S3Object: {
                Bucket: s3BucketName,
                Name: document,
              },
            },
        };
        let str = '';
        rekognitionClient.detectText(text_params_1, (err, data) => {
            if (data) {
                data.TextDetections.map((e) => {
                    str += e.DetectedText + ' ';
                });
            }
            return str;
        });
        if(documentBack) {
            const text_params_2 = {
              Image: {
                S3Object: {
                  Bucket: s3BucketName,
                  Name: documentBack,
                },
              },
            };
            rekognitionClient.detectText(text_params_2, (err, data) => {
              if (data) {
                data.TextDetections.map((e) => {
                  str += e.DetectedText + ' ';
                });
              }
              return str;
            });
        }
      
        const delayedResponse = new Promise((resolve) => {
            setTimeout(async () => {
                resolve({ result, str });
            }, 3000);
        });

        return await delayedResponse;
    }
}
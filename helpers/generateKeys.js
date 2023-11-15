const CryptoJS = require('crypto-js')
const tigerbalm = require('./tigerbalm')

const timeStamp = Date.now()

module.exports = {
    // to get random unique kycId
    kyc: () => {
        const randomNum = Math.floor(Math.random() * 900) + 100 // random number b/w 100-900
        const randomKycId = `${timeStamp}${randomNum}@KYC` // random unique key
        return randomKycId
    },
}
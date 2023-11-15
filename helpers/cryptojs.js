const CryptoJS = require('crypto-js')

const [password, salt] = [process.env.CRYPTOJS_PASS, process.env.CRYPTOJS_SALT]

const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 100
})

module.exports = {
    encryptText: (text) => {
        try {
            return CryptoJS.AES.encrypt(text, key.toString()).toString()
        }catch(err) {
            throw new Error(err)
        }
    },
    decryptText: (cipherText) => {
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, key.toString())
            return bytes.toString(CryptoJS.enc.Utf8)
        }catch(err) {
            throw new Error('Invalid encrypted string!')
        }
    },
    encryptObj: (obj) => {
        try {
            return CryptoJS.AES.encrypt(JSON.stringify(obj), key.toString()).toString()
        }catch(err) {
            throw new Error(err)
        }
    },
    decryptObj: (cipherText) => {
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, key.toString())
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
        }catch(err) {
            throw new Error('Invalid encrypted string!')
        }
    },
    apiEncryption: (obj) => {
        try {
            let encryptedString = encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify(obj), key.toString()).toString()).toString()
            encryptedString = encryptedString.replace(/%/g, 'ssPERss')
            return encryptedString
        }catch(err) {
            throw new Error(err)
        }
    },
    apiDecrpytion: (cipherText) => {
        const finalCipher = cipherText.replace(/ssPERss/g, '%')
        try {
            const unEncodedURIComponent = decodeURIComponent(finalCipher)
            const bytes = CryptoJS.AES.decrypt(unEncodedURIComponent, key.toString())
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
        } catch (err) {
            throw new Error('Decryption failed: ' + err.message);
        }
    }
}
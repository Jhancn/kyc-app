const tigerBalm = require('tiger-balm');
require('dotenv').config()

// get salt & pass
const [salt, pass] = [process.env.TB_SALT, process.env.TB_PASS]

module.exports = {
    encryptObj: (obj) => tigerBalm.encrypt(salt, pass, JSON.stringify(obj)),
    decryptObj: (encObj) => JSON.parse(tigerBalm.decrypt(salt, pass, encObj)),
    encrypt: (text) => tigerBalm.encrypt(salt, pass, text),
    decrypt: (encText) => tigerBalm.decrypt(salt, pass, encText)
}
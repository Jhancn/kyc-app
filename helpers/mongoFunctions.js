const Documents = require("../models/Documents")
const Kyc = require("../models/Kyc")

module.exports = {
    create: async (collection, document) => await eval(collection).create(document),
    find: async (collection, filter, projection, options) => await eval(collection).find(filter, projection).sort(options && options.sort ? options.sort : null).skip(options && options.skip ? options.skip : null).limit(options && options.limit ? options.limit : null).allowDiskUse(options && options.allowDiskUse ? options.allowDiskUse : false),
    findOne: async (collection, conditions, projection, options) => await eval(collection).findOne(conditions, projection).sort(options && options.sort ? options.sort : null),
    updateOne: async (collection, filter, update, options) => await eval(collection).updateOne(filter, update, options),
    updateMany: async (collection, filter, update, options) => await eval(collection).updateMany(filter, update, options),
    findOneAndUpdate: async (collection, conditions, update, options) => await eval(collection).findOneAndUpdate(conditions, update, options),
    findOneAndDelete: async (collection, conditions, options) => await eval(collection).findOneAndDelete(conditions, options),
    createDocument: (collection, body) => {
        collection = eval(collection)
        const document = new collection(body)
        return document
    }
}
const response = require('./response/response');
const request = require('./request/request');
const config = require('../config');
const dbFactory = require('./../db/dbFactory').factory;

let collectionName = config.dbConfigs.sysconfigCollection.name;

exports.save = (req, res, next) => {
  let data = req.body;
  dbFactory.getCollection(collectionName).update({}), { $set: {
    'dbaddress': data.dbAddress,
    'centeraddress': data.centerAddress
  } }, (err, result) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, postJob);
    res.json(resultData);
  }
}

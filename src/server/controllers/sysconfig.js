const response = require('./response/response');
const request = require('./request/request');
const config = require('../config');
const dbFactory = require('./../db/dbFactory').factory;

// let collectionName = config.dbConfigs.sysconfigCollection.name;

exports.get = (req, res, next) => {
  config.getZkConfig()
    .then(config => {
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, config);
      res.json(resultData);
    })
}

exports.save = (req, res, next) => {
  let data = req.body;
  config.setZkConfig(data)
    .then(config => {
      if (config) {
        let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
        res.json(resultData);
      } else {
        return next(new Error('Set config failed.'))
      }
    })
  // dbFactory.getCollection(collectionName).update({}), { $set: {
  //   'dbaddress': data.dbAddress,
  //   'centeraddress': data.centerAddress
  // } }, (err, result) => {
  //   if (err) {
  //     console.log('Error:' + err);
  //     return;
  //   }
  //   let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, postJob);
  //   res.json(resultData);
  // }
}

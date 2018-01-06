const response = require('./response/response');
const request = require('./request/request');
const negCloudData = require('neg-cloud-data');
const config = require('../common/config');

let CloudDataStore = negCloudData.CloudDataStore;
var db = new CloudDataStore(`${config.configUrl.prd}/datastore/v1`, 'cloudtask_v2', '');

exports.get = (req, res, next) => {
  db.get("sys_config")
    .then(result => {
      resdata = result.rows[0].admin;
      if (!resdata) {
        return Promise.reject({ message: 'Get config info failed' });
      }
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, resdata);
      res.json(resultData);
    })
    .catch(err => next(err))
};

exports.getUserValidate = (req, res, next) => {
  db.get("sys_config")
    .then(result => {
      resdata = result.rows[0].admin;
      req.config = resdata;
      if (!resdata) {
        return Promise.reject({ message: 'Get config info failed' });
      }
      next();
    })
    .catch(err => next(err));
};

exports.put = (req, res, next) => {
  let postAdmin = req.body;
  postAdmin.key = Math.random().toString(16);
  db.deleteWhen('sys_config', 1)
    .then((data) => {
      return db.insert("sys_config", postAdmin)
    })
    .then(result => {
      if (result !== 'Accepted') {
        return Promise.reject({ message: 'Update config info failed' });
      }
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
      res.json(resultData);
    })
    .catch(err => next(err));
};

const response = require('./response/response');
const request = require('./request/request');
const util = require('./../common/util');

exports.post = (req, res, next) => {
  let db = req.db;
  let activityInfo = req.body;
  activityInfo.logid = util.getRandomId();
  let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, activityInfo);
  res.json(resultData);
};

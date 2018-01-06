const result = require('./response/response');
const request = require('./request/request');

exports.get = (req, res, next) => {
  let envConfig = req.session.envConfig;
  if (envConfig) {
    res.json(req.session.envConfig);
  } else {
    res.json({});
  }
}

exports.transfer = (req, res, next) => {
  req.session.envConfig = req.body;
  let resultData = result.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
  res.json(resultData);
  next();
}

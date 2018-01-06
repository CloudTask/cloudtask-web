const response = require('./response/response');
const request = require('./request/request');

exports.modifyLocation = (req, res, next) => {
  let db = req.db;
  let postLocation = req.body;
  db.update("sys_locations", postLocation)
    .then(result => {
      if (!result) {
        return Promise.reject({ message: 'Get jobs failed' });
      }
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
      res.json(resultData);
    })
    .catch(err => next(err));
}


exports.add = (req, res, next) => {
  let db = req.db;
  let postLocation = req.body;
  let collectionLocation = db.collection('sys_locations');
  collectionLocation.insert(postLocation, (err, result) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
    res.json(result);
    db.close();
  })
    // .then(result => {
    //   if (!result) {
    //     return Promise.reject({ message: 'Get jobs failed' });
    //   }
    //   let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
    //   res.json(resultData);
    // })
    // .catch(err => next(err));
}

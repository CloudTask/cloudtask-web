const response = require('./response/response');
const request = require('./request/request');

exports.modifyLocation = (req, res, next) => {
  let db = req.db;
  let postLocation = req.body;
  let oldLocation = req.params.oldLocation;
  let newLocation = postLocation.location;

  if (oldLocation == newLocation) {
    let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
    return res.json(resultData);
  }
  let collectionLocation = db.collection('sys_locations');
  isExists(collectionLocation, newLocation)
    .then(data => {
      if (data) {
        return next(new Error('Location is exists.'))
      } else {
        collectionLocation.update({ location: oldLocation }, { $set: { location: newLocation } }, (err, resultLocation) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
          res.json(resultData);
          db.close();
        })
      }
    })
    .catch(err => next(err));
}

exports.add = (req, res, next) => {
  let db = req.db;
  let postLocation = req.body;
  let collectionLocation = db.collection('sys_locations');
  isExists(collectionLocation, postLocation.location)
    .then(data => {
      if (data) {
        return next(new Error('Location is exists.'))
      } else {
        collectionLocation.insert(postLocation, (err, result) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
          res.json(result);
          db.close();
        })
      }
    })
    .catch(err => next(err));
  // .then(result => {
  //   if (!result) {
  //     return Promise.reject({ message: 'Get jobs failed' });
  //   }
  //   let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
  //   res.json(resultData);
  // })
  // .catch(err => next(err));
}

exports.remove = (req, res, next) => {
  let db = req.db;
  let location = req.params.location;
  let collectionLocation = db.collection('sys_locations');
  isExists(collectionLocation, location)
    .then(data => {
      if (!data) {
        return next(new Error('Location is not exists.'));
      } else {
        collectionLocation.remove({location: location}, (err, result) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
          res.json(resultData);
          db.close();
        })
      }
    })
}

let isExists = (collectionLocation, location) => {
  return new Promise((resolve, reject) => {
    let regStr = `^${location}$`;
    collectionLocation.findOne({ location: { $regex: new RegExp(regStr, 'i') } }, (err, resultLocation) => {
      if (err) return reject(err);
      resolve(resultLocation);
    });
  })
}

const response = require('./response/response');
const request = require('./request/request');
const moment = require('moment');
const requestHelper = require('./request/requestHelper');
const config = require('../config').getConfig();
const dbFactory = require('./../db/dbFactory').factory;

let collectionLocation = config.dbConfigs.locationCollection.name;

exports.add = (req, res, next) => {
  let db = req.db;
  let postLocation = req.body;
  isExists(postLocation.location)
    .then(data => {
      if (data) {
        return next(new Error('Location is exists.'))
      } else {
        let createat = moment().format();
        postLocation.createat = createat;                //创建时间
        postLocation.editat = createat;                  //修改时间
        dbFactory.getCollection(collectionLocation).insert(postLocation, (err, result) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
          res.json(result);
          let time =  Date.now();
          let dataObj = {
            runtime: postLocation.location,
            event: "create_location",
            timestamp: time
          }
          requestHelper.requestMQ(dataObj, { method: 'post' });
        })
      }
    })
    .catch(err => next(err));
}

exports.update = (req, res, next) => {
  let db = req.db;
  let postLocation = req.body;
  isExists(postLocation.location)
    .then(data => {
      if (!data) {
        return next(new Error('Location is not exists.'))
      } else {
        postLocation.editat = moment().format();
        dbFactory.getCollection(collectionLocation).update({ 'location': postLocation.location }, { $set: {
          'description': postLocation.description,
          'owners': postLocation.owners,
          'server': postLocation.server,
          'editat': postLocation.editat,
          'edituser': postLocation.edituser
        } }, (err, result) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
          res.json(result);
          let time =  Date.now();
          if(data.server !== postLocation.server || data.owners !== postLocation.owners){
            let dataObj = {
              runtime: postLocation.location,
              event: "change_location",
              timestamp: time
            }
            requestHelper.requestMQ(dataObj, { method: 'post' });
          }
        })
      }
    })
    .catch(err => next(err));
}

exports.remove = (req, res, next) => {
  let db = req.db;
  let location = req.params.location;
  isExists(location)
    .then(data => {
      if (!data) {
        return next(new Error('Location is not exists.'));
      } else {
        dbFactory.getCollection(collectionLocation).remove({location: location}, (err, result) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
          res.json(resultData);
          let time =  Date.now();
          let dataObj = {
            runtime: location,
            event: "remove_location",
            timestamp: time
          }
          requestHelper.requestMQ(dataObj, { method: 'post' });
        })
      }
    })
}

let isExists = (location) => {
  return new Promise((resolve, reject) => {
    let regStr = `^${location}$`;
    dbFactory.getCollection(collectionLocation).findOne({ location: { $regex: new RegExp(regStr, 'i') } }, (err, resultLocation) => {
      if (err) return reject(err);
      resolve(resultLocation);
    });
  })
}

const response = require('./response/response');
const request = require('./request/request');
const moment = require('moment');
const util = require('./../common/util');
const requestHelper = require('./request/requestHelper');
const config = require('../config');
const dbFactory = require('./../db/dbFactory').factory;

let collectionLocation = config.dbConfigs.locationCollection.name;
let collectionJob = config.dbConfigs.jobCollection.name;

exports.getLocation = (req, res, next) => {
  dbFactory.getCollection(collectionLocation).find({}).toArray((err, resultLocation) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    res.json(resultLocation);
  })
}

exports.getById = (req, res, next) => {
  let groupId = req.params.groupId;
  dbFactory.getCollection(collectionLocation).find({}).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let groups = resultJob.map(item => item.group);
    let allGroups = [];
    groups.forEach(item => {
      if (item) {
        if (item.length > 0) {
          item.map(group => {
            allGroups.push(group);
          })
        }
      }
    })
    let filtegroup = allGroups.filter(item => item.id == groupId)[0];
    res.json(filtegroup);
  })
}

exports.getJobsById = (req, res, next) => {
  let groupId = req.params.groupId;
  dbFactory.getCollection(collectionJob).find({}).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let resdata = resultJob.filter(item => groupId == item.groupid);
    res.json(resdata);
  })
}

exports.getLocationServer = (req, res, next) => {
  dbFactory.getCollection(collectionLocation).find({ }).toArray((err, resultLocation) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let locationName = req.params.name;
    let filteLocation = resultLocation.filter(item => item.location == locationName)[0];
    let serverInfo = filteLocation.server;
    res.json(serverInfo);
  })
}

exports.getLocationGroup = (req, res, next) => {
  let locationName = req.params.name;
  dbFactory.getCollection(collectionLocation).findOne({ location: locationName }, (err, resultLocation) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let locationGroup = resultLocation.group;
    res.json(locationGroup);
  })
}

exports.createGroup = (req, res, next) => {
  let envConfig = req.envConfig;
  let envValue = req.envValue;
  let postGroup = req.body;
  // let cluster = '';
  dbFactory.getCollection(collectionLocation).find({ 'location': postGroup.location }).toArray((err, resultLocation) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    if (!resultLocation[0].group) resultLocation[0].group = [];
    let isExit = resultLocation[0].group.some(item => item.name == postGroup.name); //判断已有group是否与新建group重名
    if (isExit) {
      let resultData = response.setResult(request.requestResultCode.RequestConflict, request.requestResultErr.ErrRequestConflict, {});
      res.status(409);
      res.json(resultData);
    } else {
      let newGroup = {};
      newGroup.id = util.getRandomId();
      newGroup.name = postGroup.name;
      newGroup.owners = postGroup.owners;
      newGroup.createuser = postGroup.createuser;
      let createat = moment().format();
      newGroup.createat = createat;                //创建时间
      newGroup.edituser = postGroup.createuser;    //修改人
      newGroup.editat = createat;                  //修改时间

      dbFactory.getCollection(collectionLocation).update({ 'location': resultLocation[0].location }, { $push: { 'group': newGroup } }, (err, result) => {
        if (err) {
          console.log('Error:' + err);
          return;
        }
        let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, postGroup);
        res.json(resultData);
      })
    }
  })
}

exports.updateGroup = (req, res, next) => {
  let envConfig = req.envConfig;
  let envValue = req.envValue;
  let postGroup = req.body;
  let newGroup = {};
  let cluster = '';
  dbFactory.getCollection(collectionLocation).find({ 'location': postGroup.location }).toArray((err, resultLocation) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let locations = resultLocation[0].location;
    let locationGroups = resultLocation[0].group;
    let isExit = locationGroups.some(item => item.name == postGroup.name && item.id !== postGroup.groupid); //判断已有group是否与新建group重名
    if (isExit) {
      let resultData = response.setResult(request.requestResultCode.RequestConflict, request.requestResultErr.ErrRequestConflict, {});
      res.status(409);
      return res.json(resultData);
    } else {
      let data = locationGroups.find((item) => {
        if (item.id == postGroup.groupid) {
          return true;
        };
      })
      let groupIndex = locationGroups.findIndex((item) => {
        if (item.id == postGroup.groupid) {
          return true;
        };
      });
      newGroup = data;
      newGroup.editat = moment().format();
      newGroup.edituser = postGroup.edituser;
      newGroup.owners = postGroup.owners;
      newGroup.name = postGroup.name;
      locationGroups[groupIndex] = newGroup;

      dbFactory.getCollection(collectionLocation).update({ 'location': locations, 'group.id': postGroup.groupid }, { $set: { 'group.$':  newGroup} }, (err, result) => {
        if (err) {
          console.log('Error:' + err);
          return;
        }
        let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, newGroup);
        res.json(resultData);
      })
    }
  })
}

exports.removeGroup = (req, res, next) => {
  let envConfig = req.envConfig;
  let groupId = req.params.groupId;
  let location = req.params.location;
  let currentLocation = {};
  let targetIndex = 0;
  let jobids = [];
  let promiseAll = [];
  dbFactory.getCollection(collectionJob).find({ 'groupid': groupId }).toArray((err, resultJobs) => {
      if (err) {
        console.log('Error:' + err);
        return;
      }
      removeGroupJobs(resultJobs)
      .then((resdata) => {
        if (!resdata.isDone) {
          return next(new Error('Remove jobs failed.'));
        } else {
          dbFactory.getCollection(collectionLocation).update({'location': location, 'group.id': groupId}, {$pull: {'group': {'id': groupId}}}, (err, result) => {
            if (err) {
              console.log('Error:' + err);
              return;
            }
            let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
            res.json(resultData);
          })
        }
      })
    })
}

let removeGroupJobs = (resultJobs) => {
  return new Promise((resolve, reject) => {
    resultJobs.forEach((job) => {
      // return db.delete("sys_jobs", job);
      dbFactory.getCollection(collectionJob).remove({ 'jobid': job.jobid  }, (err, result) => {
        if (err) return reject(err);
        resolve({isDone: true})
      })
    })
  })
}

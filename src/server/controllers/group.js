const response = require('./response/response');
const request = require('./request/request');
const moment = require('../../client/static/vendor/js/moment.min.js');
const util = require('./../common/util');
const requestHelper = require('./request/requestHelper');
const config = require('../common/config');

exports.getLocation = (req, res, next) => {
  let db = req.db;
  let collectionLocation = db.collection('sys_locations');
  collectionLocation.find({}).toArray((err, resultLocation) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    res.json(resultLocation);
    db.close();
  })
}

exports.getById = (req, res, next) => {
  let db = req.db;
  let groupId = req.params.groupId;
  let collectionLocation = db.collection('sys_locations');
  collectionLocation.find({}).toArray((err, resultJob) => {
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
    db.close();
  })
}

exports.getJobsById = (req, res, next) => {
  let db = req.db;
  let groupId = req.params.groupId;
  let collectionLocation = db.collection('sys_jobs');
  collectionLocation.find({}).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let resdata = resultJob.filter(item => groupId == item.groupid);
    res.json(resdata);
    db.close();
  })
}

exports.getLocationServer = (req, res, next) => {
  let db = req.db;
  let collectionLocation = db.collection('sys_locations');
  collectionLocation.find({ }).toArray((err, resultLocation) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let locationName = req.params.name;
    let filteLocation = resultLocation.filter(item => item.location == locationName)[0];
    let serverInfo = filteLocation.server;
    res.json(serverInfo);
    db.close();
  })
}

exports.createGroup = (req, res, next) => {
  let db = req.db;
  let envConfig = req.envConfig;
  let envValue = req.envValue;
  let postGroup = req.body;
  // let cluster = '';
  let collectionLocation = db.collection('sys_locations');
  collectionLocation.find({ 'location': postGroup.location }).toArray((err, resultLocation) => {
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

      collectionLocation.update({ 'location': resultLocation[0].location }, { $push: { 'group': newGroup } }, (err, result) => {
        if (err) {
          console.log('Error:' + err);
          return;
        }
        let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, postGroup);
        res.json(resultData);
        db.close();
      })
    }
  })
}

exports.updateGroup = (req, res, next) => {
  let db = req.db;
  let envConfig = req.envConfig;
  let envValue = req.envValue;
  let postGroup = req.body;
  let newGroup = {};
  let cluster = '';
  let collectionLocation = db.collection('sys_locations');
  collectionLocation.find({ 'location': postGroup.location }).toArray((err, resultLocation) => {
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

      collectionLocation.update({ 'location': locations, 'group.id': postGroup.groupid }, { $set: { 'group.$':  newGroup} }, (err, result) => {
        if (err) {
          console.log('Error:' + err);
          return;
        }
        let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, newGroup);
        res.json(resultData);
        db.close();
      })
    }
  })
  // db.getById("sys_locations", postGroup.location)
  //   .then((result, resolve, reject) => {
  //     if (!result) {
  //       return Promise.reject({ message: 'Get location info failed' });
  //     }
  //     let locations = result.location;
  //     cluster = result.cluster || '';
  //     let locationGroups = result.group;
  //     let isExit = locationGroups.some(item => item.name == postGroup.name && item.id !== postGroup.groupid); //判断当前group是否有job与新建job重名
  //     if (isExit) {
  //       let resultData = response.setResult(request.requestResultCode.RequestConflict, request.requestResultErr.ErrRequestConflict, {});
  //       res.status(409);
  //       return res.json(resultData);
  //     } else {
  //       let data = locationGroups.find((item) => {
  //         if (item.id == postGroup.groupid) {
  //           return true;
  //         };
  //       })
  //       let groupIndex = locationGroups.findIndex((item) => {
  //         if (item.id == postGroup.groupid) {
  //           return true;
  //         };
  //       });
  //       newGroup = data;
  //       newGroup.editat = moment().format();
  //       newGroup.edituser = postGroup.edituser;
  //       newGroup.owners = postGroup.owners;
  //       newGroup.name = postGroup.name;
  //       locationGroups[groupIndex] = newGroup;

  //       //cluster
  //       switch (envValue) {
  //         case 'GDEV':
  //           if (cluster == '') {
  //             cluster = 'gdev'
  //           }
  //           break;
  //         case 'GQC':
  //           if (cluster == '') {
  //             cluster = 'gqc'
  //           }
  //           break;
  //         case 'PRD':
  //           if (cluster == '') {
  //             cluster = 'wh7'
  //           }
  //           break;
  //       }
  //       //更新数据库group
  //       return db.update("sys_locations", { "location": locations, "cluster": cluster, "group": locationGroups, "server": result.server })
  //     }
  //   })
  //   .then((data) => {
  //     if (data !== 'Accepted') {
  //       return Promise.reject({ message: 'Update group failed' });
  //     }
  //     let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, newGroup);
  //     res.json(resultData);
  //     let time = Date.now();
  //     let dataObj = {
  //       msgname: 'SystemEvent',
  //       msgid: '',
  //       runtime: postGroup.location,
  //       jobids: [],
  //       groupids: [postGroup.groupid],
  //       event: "change_group",
  //       timestamp: time
  //     }
  //     return requestHelper.requestMQ(envConfig, dataObj, { method: 'post' });
  //   })
  //   .then(data => {
  //     if (!data) {
  //       return Promise.reject({ message: 'Failed' });
  //     }
  //   })
  //   .catch(err => next(err));
}

exports.removeGroup = (req, res, next) => {
  let db = req.db;
  let envConfig = req.envConfig;
  let groupId = req.params.groupId;
  let location = req.params.location;
  let currentLocation = {};
  let targetIndex = 0;
  let jobids = [];
  let promiseAll = [];
  db.get("sys_jobs", { pageSize: 10000 })
    .then(result => {
      if (!result) {
        return Promise.reject({ message: 'Get jobs failed' });
      }
      let jobs = result.rows.filter(item => groupId == item.groupid);
      jobids = jobs.map((job) => job.jobid);
      jobids.forEach((job) => {
        // return db.delete("sys_jobs", job);
        promiseAll.push(db.delete("sys_jobs", job))
      })
      Promise.all(promiseAll)
        .then((data) => {
          data.forEach(item => {
            if (data !== 'Accepted') {
              return Promise.reject({ message: 'Delete group failed' });
            }
          })
          return db.getById("sys_locations", location);
        })
        .then((data) => {
          // currentLocation = data.rows.find(item => {
          //   return item.group && item.group.find((group, index) => {
          //     if (groupId == group.id) {
          //       targetIndex = index;
          //       return true;
          //     }
          //   })
          // })
          // console.log(currentLocation);
          // currentLocation.group.splice(targetIndex, 1);
          // console.log('11111');
          if (!data) {
            return Promise.reject({ message: 'Get location info failed' });
          }
          currentLocation = data;
          if (currentLocation.group) {
            currentLocation.group.find((group, index) => {
              if (groupId == group.id) {
                targetIndex = index;
                return true;
              }
            })
            currentLocation.group.splice(targetIndex, 1);
          }
          return db.update("sys_locations", currentLocation)
        })
        .then((data) => {
          if (data !== 'Accepted') {
            return Promise.reject({ message: 'Delete group failed' });
          }
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
          res.json(resultData);
          let time = Date.now();
          let dataObj = {
            msgname: 'SystemEvent',
            msgid: '',
            runtime: currentLocation.location,
            jobids: jobids,
            groupids: [groupId],
            event: "remove_group",
            timestamp: time
          }
          return requestHelper.requestMQ(envConfig, dataObj, { method: 'post' });
        })
        .then(data => {
          if (!data) {
            return Promise.reject({ message: 'Failed' });
          }
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

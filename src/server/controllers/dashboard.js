const negCloudData = require('neg-cloud-data');
const result = require('./response/response');
const request = require('./request/request');
const transferEnv = require('./transferEnv');
const config = require('../config').getConfig();
const dbFactory = require('./../db/dbFactory').factory;


exports.get = (req, res, next) => {
  let collectionLocation = config.dbConfigs.locationCollection.name;
  let collectionJob = config.dbConfigs.jobCollection.name;
  // Promise.all([
  //   db.get("sys_locations", { pageSize: 10000 }),
  //   db.get("sys_jobs", { pageSize: 10000 })
  // ])
  //   .then(results => {
  //     let resData = {};
  //     let data = {};
  //     let data2 = {};

  //     data = results[0];
  //     let dataArr = data.rows;
  //     resData.groupcount = 0;
  //     resData.totalserver = 0;
  //     dataArr.forEach(item => {
  //       if (item.group && item.server) {
  //         if (item.group.length) {
  //           resData.groupcount += item.group.length;
  //         }
  //         if (item.server.length) {
  //           resData.totalserver += item.server.length;
  //         }
  //       }
  //     });

  //     data2 = results[1];
  //     let dataArr2 = data2.rows;
  //     resData.totaljob = 0;
  //     if (dataArr2.length) {
  //       resData.totaljob = dataArr2.length;
  //     }
  //     resData.alivejob = 0;
  //     let filterJob = dataArr2.filter(item => item.enabled);
  //     resData.alivejob = filterJob.length;

  //     // return resData;
  //     let resultData = result.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, resData);
  //     res.json(resultData);
  //   })
  //   .catch(err => next(err));
  dbFactory.getCollection(collectionLocation).find({}).toArray((err, resultLocation) => {
    let resData = {};
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let dataArr = resultLocation;
    resData.groupcount = 0;
    resData.totalserver = 0;
    dataArr.forEach(item => {
      if (item.group && item.server) {
        if (item.group.length) {
          resData.groupcount += item.group.length;
        }
        if (item.server.length) {
          resData.totalserver += item.server.length;
        }
      }
    });
    dbFactory.getCollection(collectionJob).find({}).toArray((err, resultJob) => {
      if (err) {
        console.log('Error:' + err);
        return;
      }
      let dataArr2 = resultJob;
      resData.totaljob = 0;
      if (dataArr2.length) {
        resData.totaljob = dataArr2.length;
      }
      resData.alivejob = 0;
      let filterJob = dataArr2.filter(item => item.enabled);
      resData.alivejob = filterJob.length;
      //  return resData;
      let resultData = result.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, resData);
      res.json(resultData);
    })
  })
};

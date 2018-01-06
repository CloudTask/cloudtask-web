const negCloudData = require('neg-cloud-data');
const result = require('./response/response');
const request = require('./request/request');
const transferEnv = require('./transferEnv');

exports.get = (req, res, next) => {
  let db = req.db;
  let collectionLocation = db.collection('sys_locations');
  let collectionJob = db.collection('sys_jobs');
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
  collectionLocation.find({}).toArray((err, resultLocation) => {
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
    collectionJob.find({}).toArray((err, resultJob) => {
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

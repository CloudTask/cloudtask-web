const response = require('./response/response');
const request = require('./request/request');
const jobstat = require('./models/jobstatus');
const moment = require('../../client/static/vendor/js/moment.min.js');
const util = require('./../common/util');
const requestHelper = require('./request/requestHelper');
const config = require('../common/config');

/*
JobInfo {
  jobid: 'xxxxxx',
  name: 'xxxxxx',
  location: 'xxxxxx',
  servers: ['xxxx', 'xxxx'],
  groupid: 'xxxxxx',
  filename: 'xxxxxx'
  files: [{name: 'xxxx', createat: 'xxxxxxx'}],
  cmd: 'xxxxx',
  env: ['aaa=bbbb'],
  description: '',
  timeout: 60,
  enabled: 0,
  schedule: [],
  notifysetting: {failed: {}, secceed: {}},
  createuser: 'sw6l',
  createat: '',
  edituser: 'sw6l',
  editat: '',
  stat: 0,
  execerr: '',
  execat: '',
  nextat: ''
}
*/

exports.get = (req, res, next) => {
  let db = req.db;
  db.get("sys_jobs", { pageSize: 10000})
    .then(result => {
      if (!result) {
        return Promise.reject({ message: 'Get jobs failed' });
      }
    let jobs = result.rows;
    res.json(jobs);
    })
    .catch(err => next(err));
}

exports.createJob = (req, res, next) => {
  let db = req.db;
  let envConfig = req.envConfig;
  let postJob = req.body;
  let groupId = postJob.groupid;

  let collectionLocation = db.collection('sys_jobs');
  collectionLocation.find({ 'groupid': groupId }).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let job = resultJob;
    let isExist = job.some(item => item.name == postJob.name);   //判断当前group是否有job与新建job重名
      if (isExist) {
        let resultData = response.setResult(request.requestResultCode.RequestConflict, request.requestResultErr.ErrRequestConflict, {});
        res.status(409);
        return res.json(resultData);
      } else {
        if (postJob.schedule.length > 0) {
          postJob.schedule.forEach(item => item.id = Date.now().toString(16));
        }
        let createat = moment().format();
        postJob.createat = createat;
        postJob.editat = createat;
        postJob.edituser = postJob.createuser;
        postJob.jobid = util.getRandomId();
        postJob.files = [];                                            //files为[]
        postJob.stat = jobstat.jobstatus.STATE_REALLOC;                //等待分配状态
        collectionLocation.insert(postJob, (err, result) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          console.log('insert succeed.');
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, postJob);
          res.json(resultData);
          db.close();
          // let time =  Date.now();
          //   let dataObj = {
          //     msgname: 'SystemEvent',
          //     msgid: '',
          //     event: "create_job",
          //     jobids: [postJob.jobid],
          //     groupids: [],
          //     runtime: postJob.location,
          //     timestamp: time
          //   }
          //   return requestHelper.requestMQ(envConfig, dataObj, { method: 'post' });
        })
      }
  })
}

exports.changeInfo = (res, postJob, db, envConfig) => {
  db.getById("sys_jobs", postJob.jobid)
    .then((data) => {
      if (!data) {
        return Promise.reject({ message: 'Get job failed' });
      }
      jobLocation = data.location;
      postJob.createat = data.createat;
      postJob.createuser = data.createuser;
      postJob.stat = data.stat;
      let editat = moment().format();;
      postJob.editat = editat;
      postJob.files = data.files;
      postJob.execat = data.execat;
      postJob.nextat = data.nextat;
      postJob.execerr = data.execerr;
      if(postJob.nextat == ""){
        postJob.nextat = '0001-01-01T00:00:00.000Z';
      }
      if(postJob.execat == ""){
        postJob.execat = '0001-01-01T00:00:00.000Z';
      }
      if (data.filename !== postJob.filename) {         //修改了filename
        if (data.filename) {
          let fileIsExist = data.files.some(item => item.name == data.filename);
          if (!fileIsExist) {
            let fileObj = {
              name: data.filename,
              createat: Date.now(),
            }
            postJob.files.push(fileObj);
          }
        }
        let currentFileExist = data.files.some(item => item.name == postJob.filename);
        if(currentFileExist) {
          let fileIndex = data.files.findIndex(item => item.name == postJob.filename);
          postJob.files.splice(fileIndex, 1)
        }
        if (postJob.files.length > 0) {                 //排序
          postJob.files.sort((a, b) => {
            return a.createat < b.createat ? 1 : -1;
          });
          postJob.files = postJob.files.slice(0, 60);   //截取前60条
        }
      }
      if (postJob.schedule.length == 0) {                 //schedule为空
        postJob.nextat = '0001-01-01T00:00:00.000Z';
      } else {
        postJob.schedule.forEach(item => {                //判断id为空的schedule添加id值
          if (!item.id) {
            item.id = util.getRandomId();
          }
        })
      }
      if (!postJob.enabled) {                             //enabled为0
        postJob.nextat = '0001-01-01T00:00:00.000Z';
        postJob.stat = jobstat.jobstatus.STATE_STOPED     //停止状态
      }
      return postJob;
    })
    .then(postJob => {
      return db.update("sys_jobs", postJob)               //更改数据库中对应job信息
    })
    .then((data) => {
      if (data !== 'Accepted') {
        return Promise.reject({ message: 'Update job failed' })
      }
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, postJob);
      return resultData;
    })
    .then(resultData => {
      let time =  Date.now();
      let dataObj = {
        msgname: 'SystemEvent',
        msgid: '',
        jobids: [postJob.jobid],
        groupids: [],
        event: "change_job",
        runtime: jobLocation,
        timestamp: time
      }
      res.json(resultData);
      return requestHelper.requestMQ(envConfig, dataObj, { method: 'post' })
    })
    .then((data) => {
      if (!data) {
        return Promise.reject({ message: 'Job alloc failed' });
      }
      return data;
    });
}

exports.updateJob = (req, res, next) => {
  let db = req.db;
  let envConfig = req.envConfig;
  let postJob = req.body;
  let groupId = postJob.groupid;
  let jobId = postJob.jobid;
  let job = {};
  let jobLocation = '';
  db.get("sys_jobs", { pageSize: 10000, andQuery: { groupid: groupId } })
    .then(result => {
      if (!result) {
        return Promise.reject({ message: 'Get jobs failed' });
      }
      return result;
    })
    .then(result => {
      job = result.rows;
      let groupJobs = job.filter(item => item.jobid !== jobId);
      let isExist = groupJobs.some(item => item.name == postJob.name); //判断当前group是否有job与新建job重名
      if (isExist) {
        let resultData = response.setResult(request.requestResultCode.RequestConflict, request.requestResultErr.ErrRequestConflict, {});
        res.status(409);
        res.json(resultData);
        return { done: true }
      }
      return { done: false }
    })
    .then(result => {
      if (!result.done) {
        this.changeInfo(res, postJob, db, envConfig);
      }
    })
    .catch(err => next(err));
}

exports.getGroupJobs = (req, res, next) => {
  let db = req.db;
  let groupId = req.params.groupId;
  let collectionLocation = db.collection('sys_jobs');
  collectionLocation.find({'groupid': groupId}).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    res.json(resultJob);
    db.close();
  })
  // db.get("sys_jobs", { pageSize: 10000, andQuery: { groupid: groupId } })
  //   .then(result => {
  //     if (!result) {
  //       return Promise.reject({ message: 'Get jobs info failed' });
  //     }
  //     let job = result.rows;
  //     res.json(job);
  //   })
  //   .catch(err => next(err));
}

exports.getById = (req, res, next) => {
  let db = req.db;
  let jobId = req.params.jobId;
  db.getById("sys_jobs", jobId)
    .then((data) => {
      if (!data) {
        return Promise.reject({ message: 'Get job info failed' });
      }
      res.json(data);
    })
    .catch(err => next(err));
}

exports.updatefiles = (req, res, next) => {
  let newJob = {};
  let db = req.db;
  let envConfig = req.envConfig;
  let postJobs = req.body;
  let jobLocation = postJobs.location;
  let newFileName = postJobs.jobs[0].filename;
  let jobids = postJobs.jobs.map(item => item.jobid);
  postJobs.jobs.forEach(item => {
    db.getById("sys_jobs", item.jobid)
      .then((data) => {
        if (!data) {
          return Promise.reject({ message: 'Get jobs failed' });
        }
        newJob = data;
        let postJob = req.body;
        let files = data.files;
        if (data.filename !== newFileName) {                      //修改了filename
          if (data.filename) {
            let fileIsExist = data.files.some(item => item.name == data.filename);
            if (!fileIsExist) {
              let fileObj = {
                name: data.filename,
                createat: Date.now(),
              }
              files.push(fileObj);
            }
            if (files.length > 0) {                                       //排序
              files.sort((a, b) => a.createat < b.createat ? 1 : -1);
              files = files.slice(0, 60);                         //截取前60条
            }
          }
        }
        newJob.jobid = item.jobid;
        newJob.filename = newFileName;
        newJob.files = files;
        this.changeFiles(res, next, db, envConfig, newJob, jobids, jobLocation);
      })
      .catch(err => next(err))
  })
}

exports.changeFiles = (res, next, db, envConfig, newJob, jobids, jobLocation) => {
  db.update('sys_jobs', newJob)
    .then((data) => {
      if (data) {
        let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
        res.json(resultData);
        return { done: false }
      } else {
        let resultData = response.setResult(request.requestResultCode.RequestNotFound, request.requestResultErr.ErrRequestNotFound, {});
        res.json(resultData);
        return { done: true }
      }
    })
    .then(data => {
      if (!data.done) {
        let time =  Date.now();
        let dataObj = {
          msgname: 'SystemEvent',
          msgid: '',
          event: "change_jobsfile",
          jobids: jobids,
          groupids: [],
          runtime: jobLocation,
          timestamp: time
        }
        requestHelper.requestMQ(envConfig, dataObj, { method: 'post' })
        .then(data => {
          if (!data) {
            return Promise.reject({ message: 'Failed' });
          }
        })
          .catch(err => next(err))
      }
    })
    .catch(err => next(err))
}

exports.removeJob = (req, res, next) => {
  let db = req.db;
  let envConfig = req.envConfig;
  let jobId = req.params.jobId;
  let jobLocation = '';
  db.getById("sys_jobs", jobId)
    .then((data) => {
      if (!data) {
        return Promise.reject({ message: 'Get jobs failed' });
      } else {
        jobLocation = data.location;
        return db.delete("sys_jobs", jobId);                                    //从数据库中删除job
      }
    })
    .then((data) => {
      if (data !== 'Accepted') {
        return Promise.reject({ message: 'Delete jobs info failed' });
      }
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
      res.json(resultData);
      let time =  Date.now();
      let dataObj = {
        msgname: 'SystemEvent',
        msgid: '',
        runtime: jobLocation,
        jobids: [jobId],
        groupids: [],
        event: "remove_job",
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
}

// exports.actionJob = (req, res, next) => {
//   let data = req.body;
//   // postData.enabled = !postData.enabled;
//   // updateJob(postData);
//   let url = `${config.eventUrl}/jobs/action`;
//   let dataObj = {
//     runtime: data.runtime,
//     jobid: data.jobid,
//     action: data.operate,
//   }
//   requestHelper.requestMQ(url, dataObj, { method: 'put' })
//     .then((data) => {
//       if (!data) {
//         return Promise.reject({ message: 'Job alloc failed' });
//       }
//       res.json(data);
//     })
//     .catch(err => next(err))
// }

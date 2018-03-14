const response = require('./response/response');
const request = require('./request/request');
const jobstat = require('./models/jobstatus');
const moment = require('moment');
const util = require('./../common/util');
const requestHelper = require('./request/requestHelper');
const config = require('../config').getConfig();
const dbFactory = require('./../db/dbFactory').factory;

let collectionName = config.dbConfigs.jobCollection.name;

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
  dbFactory.getCollection(collectionName).find({ }).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    res.json(resultJob);
  })
}

exports.createJob = (req, res, next) => {
  let postJob = req.body;
  let groupId = postJob.groupid;

  dbFactory.getCollection(collectionName).find({ 'groupid': groupId }).toArray((err, resultJob) => {
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
        dbFactory.getCollection(collectionName).insert(postJob, (err, result) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          console.log('insert succeed.');
          let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, postJob);
          res.json(resultData);
          let time =  Date.now();
            let dataObj = {
              msgname: 'SystemEvent',
              msgid: '',
              event: "create_job",
              jobids: [postJob.jobid],
              groupids: [],
              runtime: postJob.location,
              timestamp: time
            }
          requestHelper.requestMQ(dataObj, { method: 'post' });
        })
      }
  })
}

exports.changeInfo = (res, postJob) => {
  dbFactory.getCollection(collectionName).find({ 'jobid': postJob.jobid }).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let data = resultJob[0];
    jobLocation = data.location;
    postJob.createat = data.createat;
    postJob.createuser = data.createuser;
    postJob.stat = data.stat;
    let editat = moment().format();;
    postJob.editat = editat;
    postJob.files = data.files || [];
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
      if(!data.files) data.files = [];
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
    dbFactory.getCollection(collectionName).update({ 'jobid': postJob.jobid }, { $set: {
      'name': postJob.name,
      'editat': postJob.editat,
      'edituser': postJob.edituser,
      'nextat': postJob.nextat,
      'files': postJob.files,
      'filename': postJob.filename,
      'schedule':  postJob.schedule,
      'enabled': postJob.enabled,
      'nextat': postJob.nextat,
      'stat': postJob.stat,
      'groupid': postJob.groupid,
      'env': postJob.env,
      'description': postJob.description,
      'cmd': postJob.cmd,
      'timeout': postJob.timeout,
      'servers': postJob.servers,
      'notifysetting': postJob.notifysetting
    } }, (err, result) => {
      if (err) {
        console.log('Error:' + err);
        return;
      }
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, postJob);
      res.json(resultData);
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
      requestHelper.requestMQ(dataObj, { method: 'post' })
    })
  })
}

exports.updateJob = (req, res, next) => {
  let postJob = req.body;
  let groupId = postJob.groupid;
  let jobId = postJob.jobid;
  let job = {};
  let jobLocation = '';

  dbFactory.getCollection(collectionName).find({ 'groupid': groupId }).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    job = resultJob;
    let groupJobs = job.filter(item => item.jobid !== jobId);
    let isExist = groupJobs.some(item => item.name == postJob.name); //判断当前group是否有job与新建job重名
    if (isExist) {
      let resultData = response.setResult(request.requestResultCode.RequestConflict, request.requestResultErr.ErrRequestConflict, {});
      res.status(409);
      res.json(resultData);
    }
    this.changeInfo(res, postJob);
  })
}

exports.getGroupJobs = (req, res, next) => {
  let groupId = req.params.groupId;
  dbFactory.getCollection(collectionName).find({'groupid': groupId}).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    res.json(resultJob);
  })
}

exports.getById = (req, res, next) => {
  let jobId = req.params.jobId;

  dbFactory.getCollection(collectionName).find({'jobid': jobId}).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    res.json(resultJob[0]);
  })
}

exports.updatefiles = (req, res, next) => {
  let newJob = {};
  let postJobs = req.body;
  let jobLocation = postJobs.location;
  let newFileName = postJobs.jobs[0].filename;
  let jobids = postJobs.jobs.map(item => item.jobid);
  postJobs.jobs.forEach(item => {
    dbFactory.getCollection(collectionName).findOne({ 'jobid': item.jobid }, (err, resultJob) => {
      if (err) {
        console.log('Error:' + err);
        return;
      }
      newJob = resultJob;
      let postJob = req.body;
      let files = resultJob.files;
      if (resultJob.filename !== newFileName) {                      //修改了filename
        if (resultJob.filename) {
          let fileIsExist = resultJob.files.some(item => item.name == resultJob.filename);
          if (!fileIsExist) {
            let fileObj = {
              name: resultJob.filename,
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
      this.changeFiles(res, next, newJob, jobids, jobLocation);
    })
  })
}

exports.changeFiles = (res, next, newJob, jobids, jobLocation) => {
  dbFactory.getCollection(collectionName).update({'jobid': newJob.jobid}, {$set: {'filename': newJob.filename, 'files': newJob.files}}, (err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, {});
    res.json(resultData);
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
  requestHelper.requestMQ(dataObj, { method: 'post' })
  })
}

exports.removeJob = (req, res, next) => {
  let jobId = req.params.jobId;
  let jobLocation = '';

  dbFactory.getCollection(collectionName).find({ 'jobid': jobId }).toArray((err, resultJob) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    jobLocation = resultJob.location;
    dbFactory.getCollection(collectionName).remove({ 'jobid': jobId  }, (err, result) => {
      if (err) {
        console.log('Error:' + err);
        return;
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
      requestHelper.requestMQ(dataObj, { method: 'post' });
    })
  })
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

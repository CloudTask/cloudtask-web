const response = require('./response/response');
const request = require('./request/request');
const util = require('./../common/util');
const config = require('../config');
const dbFactory = require('./../db/dbFactory').factory;

let collectionName = config.dbConfigs.activityCollection.name;

exports.getActivity = (req, res, next) => {
  let pageSize = +(req.query.pageSize || 10);
  let pageIndex = +(req.query.pageIndex || 1);
  let queryOption = {};
  let sort = req.query.sort === 'desc' ? -1 : 1;
  if (req.query.location) {
    queryOption.location = req.query.location;
  }
  if (req.query.group) {
    queryOption.group = req.query.group;
  }
  if (req.query.type) {
    queryOption.type = req.query.type;
  }

  let skiped = pageSize * (pageIndex - 1);
  dbFactory.getCollection(collectionName).find(queryOption).sort({ indate: sort }).skip(skiped).limit(pageSize).toArray((err, docs) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    dbFactory.getCollection(collectionName).count(queryOption, (err, count) => {
      if (err) return next(err);
      let data = {
        pageIndex: pageIndex,
        pageSize: pageSize,
        rows: docs,
        total_rows: count
      };
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, data);
      res.json(resultData);
    });
  })
};

exports.getLog = (req, res, next) => {
  let pageSize = +(req.query.pageSize || 10);
  let pageIndex = +(req.query.pageIndex || 1);
  let queryOption = {};
  let sort = req.query.sort === 'desc' ? -1 : 1;
  if (req.query.jobid) {
    queryOption.jobid = req.query.jobid;
  }
  if (req.query.createat) {
    queryOption.createat = req.query.createat;
  }
  if (req.query.stat) {
    queryOption.stat = req.query.stat;
  }

  let skiped = pageSize * (pageIndex - 1);
  dbFactory.getCollection(collectionName).find(queryOption).sort({ createat: sort }).skip(skiped).limit(pageSize).toArray((err, docs) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    dbFactory.getCollection(collectionName).count(queryOption, (err, count) => {
      if (err) return next(err);
      let data = {
        pageIndex: pageIndex,
        pageSize: pageSize,
        rows: docs,
        total_rows: count
      };
      let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, data);
      res.json(resultData);
    });
  })
}

exports.postActivity = (req, res, next) => {
  let activityInfo = req.body;
  activityInfo.logid = util.getRandomId();
  dbFactory.getCollection(collectionName).insert(activityInfo, (err, data) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    let resultData = response.setResult(request.requestResultCode.RequestSuccessed, request.requestResultErr.ErrRequestSuccessed, activityInfo);
    res.json(resultData);
  })
};

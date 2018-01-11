const fs = require('fs');
const path = require('path');
const request = require('request');
const response = require('./response/response');
const result = require('./request/request');
const moment = require('../../client/static/vendor/js/moment.min.js');
const util = require('./../common/util');
// const dbFactory = require('./../validators/env');
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://10.16.75.22:29017,10.16.75.23:29017,10.16.75.25:29017/cloudtask_data?replicaSet=NeweggCloud';

/*
UserInfo {
  UserID: 'admin',
  Password: 'xxxxxx',
  IsAdmin: true,
  FullName: 'xxx.xxx',
  Avatar: 'http:xxxx/dddd.png',
  Department: 'xxx',
  Email: 'xxx@xxx.com',
  InDate: 123313378,
  InUser: 'admin',
  EditDate: 123313378,
  EditUser: 'admin'
}
*/
exports.getAll = (req, res, next) => {
  let db = req.db;
  let collectionLocation = db.collection('sys_users');
  collectionLocation.find({}).toArray((err, resultUsers) => {
    res.json(resultUsers);
    db.close();
  })
}

exports.createUser = (req, res, next) => {
  let db = req.db;
  let envConfig = req.envConfig;
  let postUser = JSON.parse(JSON.stringify(req.body));
  let password = util.md5Crypto(postUser.password);

  let collectionLocation = db.collection('sys_users');
  isExists(collectionLocation, postUser.userid)
    .then(resdata => {
      if (resdata) {
        return next(new Error('UserID is exists.'))
      } else {
        let createat = moment().format();
        postUser.createat = postUser.editat = createat;
        postUser.edituser = postUser.createuser = req.session.currentUser.userid;
        postUser.password = password;
        postUser.isadmin = !!req.body.isadmin;
        // postUser.userid = util.getRandomId();
        collectionLocation.insert(postUser, (err, data) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          console.log('insert succeed.');
          let resultData = response.setResult(result.requestResultCode.RequestSuccessed, result.requestResultErr.ErrRequestSuccessed, postUser);
          res.json(resultData);
          db.close();
        })
      }
    })
}

exports.updateUser = (req, res, next) => {
  let db = req.db;
  let envConfig = req.envConfig;
  let postUser = req.body;
  let reqUser = req.session.currentUser;

  let collectionLocation = db.collection('sys_users');
  let updateOpt = {
    $set: {
      fullname: req.body.fullname,
      edituser: reqUser.userid,
      editat: new Date().valueOf(),
    }
  }
  if (req.body.department) {
    updateOpt['$set'].department = req.body.department;
  }
  if (req.body.email) {
    updateOpt['$set'].email = req.body.email;
  }
  if (reqUser.isadmin && (typeof req.body.isadmin === 'boolean')) {
    updateOpt['$set'].isadmin = req.body.isadmin;
  }
  let userId = postUser.userid.toLowerCase();
  isExists(collectionLocation, userId)
    .then(resdata => {
      if (!resdata) {
        return next(new Error('UserID is not exists.'));
      } else {
        collectionLocation.update({ 'userid': userId }, updateOpt, (err, data) => {
          if (err) {
            console.log('Error:' + err);
            return;
          }
          console.log('update succeed.');
          let resultData = response.setResult(result.requestResultCode.RequestSuccessed, result.requestResultErr.ErrRequestSuccessed, postUser);
          res.json(resultData);
          db.close();
        })
      }
    })
    .catch(err => next(err));
}

exports.removeUser = (req, res, next) => {
  let db = req.db;
  let userId = req.params.userId;

  let collectionLocation = db.collection('sys_users');
  collectionLocation.find({ 'userid': userId }).toArray((err, resultUser) => {
    if (err) {
      console.log('Error:' + err);
      return;
    }
    collectionLocation.remove({ 'userid': userId }, (err, data) => {
      if (err) {
        console.log('Error:' + err);
        return;
      }
      let resultData = response.setResult(result.requestResultCode.RequestSuccessed, result.requestResultErr.ErrRequestSuccessed, {});
      res.json(resultData);
      db.close();
    })
  })
}

exports.setToken = (req, res, next) => {
  req.session.token = req.body.token;
  let resultData = response.setResult(result.requestResultCode.RequestSuccessed, result.requestResultErr.ErrRequestSuccessed, {});
  res.json(resultData);
}

exports.getToken = (req, res, next) => {
  res.json(req.session.token);
}

exports.login = (req, res, next) => {
  let db = req.db;
  let password = util.md5Crypto(req.body.password);
  login(db, req.body.userid, password, false)
    .then(userInfo => {
      req.session.currentUser = userInfo;
      if (!!req.body.rememberMe) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
      }
      res.json(userInfo);
    })
    .catch(err => next(err));

  // let adminUser = req.config;
  // let ssoToken = req.body.Token;
  // let oAuthReqOption = {
  //   method: "POST",
  //   url: "http://apis.newegg.org/framework/v1/keystone/sso-auth-data",
  //   headers: {
  //     Accept: "application/json",
  //     Authorization: "Bearer JbqOb1s8q60lQOQ5r45bMvxYTclUlJx3gvzQvv3w"
  //   }
  // };
  // let option = JSON.parse(JSON.stringify(oAuthReqOption));
  // option.body = JSON.stringify({ Token: ssoToken });
  // request(option, (error, response, resbody) => {
  //   if ((error != null) || response.statusCode >= 400) {
  //     error = error || JSON.parse(resbody);
  //     return next(error)
  //   }
  //   let authInfo = JSON.parse(resbody);
  //   let userInfo = authInfo.UserInfo;
  //   getRole(adminUser, userInfo.UserID)
  //     .then(roleName => {
  //       userInfo.IsAdmin = (roleName !== 'User');
  //       userInfo.Role = roleName;
  //       req.session.currentUser = userInfo;
  //       res.json(userInfo);
  //     })
  //     .catch(err => next(err));
  // });
}

exports.isLogin = (req, res, next) => {
  let db = req.db;
  let result = {
    IsLogin: false
  };
  if (req.session.currentUser && req.session.currentUser.userid) {
    result.IsLogin = true;
    getUserById(db, req.session.currentUser.userid)
      .then(userInfo => {
        result.userInfo = userInfo;
        res.json(result);
        db.close();
      })
      .catch(err => next(err));
  } else {
    res.json(result);
    db.close();
  }
}

exports.initAdmin = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(DB_CONN_STR, (err, database) => {
      let collectionLocation = database.collection('sys_users');
      collectionLocation.findOne({ user: 'admin' }, (err, doc) => {
        if (err) return reject(err);
        if (doc) {
          return resolve(true);
        } else {
          let password = util.md5Crypto('123456');
          let user = {
            _id: 'admin111',
            userid: 'admin111',
            password: password,
            isadmin: true,
            fullname: 'Admin',
            avatar: '/public/avatar/default.png',
            department: '',
            email: '',
            indate: new Date().valueOf(),
            inuser: 'system',
            editat: new Date().valueOf(),
            edituser: 'system'
          }
          collectionLocation.insert(user, (err, newDoc) => {
            if (err) {
              return reject(err);
            }
            resolve(true);
          });
        }
      });
    });
  });
}

exports.logout = (req, res, next) => {
  let cookies = req.cookies;
  console.log(cookies);
  for (let prop in cookies) {
    if (!cookies.hasOwnProperty(prop)) {
      continue;
    }
    res.cookie(prop, '', { maxAge: -1 });
  }
  req.session.currentUser = null;
  res.json({ result: true });
  next();
}

exports.getCurrentUser = (req, res, next) => {
  let db = req.db;
  let userId = req.session.currentUser.userid;
  getUserById(db, userId)
    .then(userInfo => {
      res.json(userInfo);
      db.close();
    })
    .catch(err => next(err));
}

exports.getAvatar = (req, res, next) => {
  let userid = req.params.userid.toLowerCase();
  let avatarDir = path.join(__dirname, `./../public/avatar`);
  let avatarPath = `${avatarDir}/${userid}.png`;
  fs.exists(avatarPath, (exists) => {
    if (!exists) {
      avatarPath = `${avatarDir}/default.png`;
    }
    fs.readFile(avatarPath, (err, data) => {
      if (err) return next(err);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': data.length
      });
      res.end(data);
    });
  });
}

exports.changePassword = (req, res, next) => {
  let db = req.db;
  let collectionLocation = db.collection('sys_users');
  let oldPassword = util.md5Crypto(req.body.oldPassword);
  let query = {
    'userid': req.body.userId,
    'password': oldPassword
  };
  collectionLocation.findOne(query, (err, userInfo) => {
    if (err) return next(err);
    if (!userInfo) {
      let err = new Error('OldPassword is not correct.');
      return next(err);
    }
    let newPassword = util.md5Crypto(req.body.newPassword);
    collectionLocation.update({ 'userid': req.body.userId }, { $set: { 'password': newPassword } }, {}, (err, numReplaced) => {
      if (err) return next(err);
      req.session.password = newPassword;
      res.json({
        result: true
      });
      db.close();
    });
  });
}

exports.search = (req, res, next) => {
  let db = req.db;
  let collectionLocation = db.collection('sys_users');
  let q = req.query.q;
  if (!q) {
    return res.json([]);
  }
  let regStr = `.*${q}.*`;
  let queryOption = {
    $or: [
      { 'userid': { $regex: new RegExp(regStr) } },
      { 'fullname': { $regex: new RegExp(regStr) } }
    ]
  };
  collectionLocation.find(queryOption, { 'userid': 1, 'fullname': 1 }).sort({ 'userid': 1 }).toArray((err, docs) => {
    if (err) return next(err);
    console.log(docs);
    res.json(docs);
  });
}

let getRole = (adminUser, userId) => {
  return new Promise((resolve, reject) => {
    userId = userId.toLowerCase();
    if (adminUser.indexOf(userId) !== -1) {
      return resolve('Admin');
    } else {
      return resolve('User')
    }
  });
}

let login = (db, useid, password, needCrypto) => {
  if (needCrypto) {
    password = util.md5Crypto(password);
  }
  let regStr = `^${useid}$`;
  let query = {
    userid: { $regex: new RegExp(regStr, 'i') },
    password: password
  };
  return new Promise((resolve, reject) => {
    let collectionLocation = db.collection('sys_users');
    collectionLocation.findOne(query, (err, userInfo) => {
      if (err) return next(err);
      if (!userInfo) {
        let err = new Error('UserID or Password is not correct.');
        err.statusCode = 401;
        return reject(err);
      }
      return resolve(userInfo);
    });
  });
}

let isExists = (collectionLocation, userId) => {
  return new Promise((resolve, reject) => {
    let regStr = `^${userId}$`;
    collectionLocation.findOne({ userid: { $regex: new RegExp(regStr, 'i') } }, (err, userInfo) => {
      if (err) return reject(err);
      resolve(!!userInfo);
    });
  })
}

let getUserById = (db, userId) => {
  return new Promise((resolve, reject) => {
    let collectionLocation = db.collection('sys_users');
    collectionLocation.findOne({ userid: userId }, (err, userInfo) => {
      if (err) return next(err);
      if (!userInfo) {
        let err = new Error('User is not exists.');
        return reject(err);
      }
      return resolve(userInfo);
    });
  });
}

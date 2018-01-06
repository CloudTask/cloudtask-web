const request = require('request');
const response = require('./response/response');
const result = require('./request/request');

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

exports.setToken = (req, res, next) => {
  req.session.token = req.body.token;
  let resultData = response.setResult(result.requestResultCode.RequestSuccessed, result.requestResultErr.ErrRequestSuccessed, {});
  res.json(resultData);
}

exports.getToken = (req, res, next) => {
  res.json(req.session.token);
}

exports.login = (req, res, next) => {
  let adminUser = req.config;
  let ssoToken = req.body.Token;
  let oAuthReqOption = {
    method: "POST",
    url: "http://apis.newegg.org/framework/v1/keystone/sso-auth-data",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer JbqOb1s8q60lQOQ5r45bMvxYTclUlJx3gvzQvv3w"
    }
  };
  let option = JSON.parse(JSON.stringify(oAuthReqOption));
  option.body = JSON.stringify({ Token: ssoToken });
  request(option, (error, response, resbody) => {
    if ((error != null) || response.statusCode >= 400) {
      error = error || JSON.parse(resbody);
      return next(error)
    }
    let authInfo = JSON.parse(resbody);
    let userInfo = authInfo.UserInfo;
    getRole(adminUser, userInfo.UserID)
      .then(roleName => {
        userInfo.IsAdmin = (roleName !== 'User');
        userInfo.Role = roleName;
        req.session.currentUser = userInfo;
        res.json(userInfo);
      })
      .catch(err => next(err));
  });
}

exports.isLogin = (req, res, next) => {
  let adminUser = req.config;
  let loginResult = {
    IsLogin: false
  };
  if (req.session.currentUser && req.session.currentUser.UserID) {
    loginResult.IsLogin = true;
    getRole(adminUser, req.session.currentUser.UserID)
      .then(roleName => {
        req.session.currentUser.Role = roleName;
        req.session.currentUser.IsAdmin = (roleName !== 'User');
        loginResult.UserInfo = req.session.currentUser;
        res.json(loginResult);
      })
      .catch(err => next(err));
  } else {
    res.json(loginResult);
  }
}

exports.logout = (req, res, next) => {
  let cookies = req.cookies;
  for (let prop in cookies) {
    if (!cookies.hasOwnProperty(prop)) {
      continue;
    }
    res.cookie(prop, '', { maxAge: -1 });
  }
  req.session.currentUser = null;
  req.session.envConfig = null;
  res.json({ result: true });
  next();
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


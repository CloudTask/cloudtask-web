const express = require('express');
const userCtrl = require('./../controllers/user');
const userValidator = require('./../validators/user');
const sysCtrl = require('./../controllers/sysconfig');
const envValidator = require('./../validators/env');

let router = express.Router();

router.get('/',
  envValidator.getCurrentEnv,
  userCtrl.getAll
);

router.post('/createUser',
  envValidator.getCurrentEnv,
  userCtrl.createUser
);

router.get('/isLogin',
  sysCtrl.getUserValidate,
  userCtrl.isLogin
);

router.post('/login',
  userValidator.validateLogin,
  sysCtrl.getUserValidate,
  userCtrl.login
);

router.get('/logout',
  userCtrl.logout,
  envValidator.setCunrretEnv
);

router.post('/setToken',
  userCtrl.setToken
);

router.get('/getToken',
  userCtrl.getToken
);

router.delete('/removeUser/:userId',
  envValidator.getCurrentEnv,
  userCtrl.removeUser
);

module.exports = router;

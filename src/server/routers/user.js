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

router.put('/updateUser',
  envValidator.getCurrentEnv,
  userCtrl.updateUser
);

router.put('/changePassword',
  envValidator.getCurrentEnv,
  userCtrl.changePassword
);

router.get('/isLogin',
  envValidator.getCurrentEnv,
  userCtrl.isLogin
);

router.post('/login',
  envValidator.getCurrentEnv,
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

router.get('/search',
  envValidator.getCurrentEnv,
  userCtrl.search
);

router.get('/currentUser',
  envValidator.getCurrentEnv,
  userCtrl.getCurrentUser
);

router.get('/avatar/:userid',
  userCtrl.getAvatar
);

router.delete('/removeUser/:userId',
  envValidator.getCurrentEnv,
  userCtrl.removeUser
);

module.exports = router;

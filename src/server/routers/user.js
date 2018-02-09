const express = require('express');
const userCtrl = require('./../controllers/user');
const userValidator = require('./../validators/user');
// const sysCtrl = require('./../controllers/sysconfig');
const envValidator = require('./../db/dbFactory').factory;

let router = express.Router();

router.get('/',
  userCtrl.getAll
);

router.post('/createUser',
  userCtrl.createUser
);

router.put('/updateUser',
  userCtrl.updateUser
);

router.put('/changePassword',
  userCtrl.changePassword
);

router.get('/isLogin',
  userCtrl.isLogin
);

router.post('/login',
  userCtrl.login
);

router.get('/logout',
  userCtrl.logout
);

router.post('/setToken',
  userCtrl.setToken
);

router.get('/getToken',
  userCtrl.getToken
);

router.get('/search',
  userCtrl.search
);

router.get('/currentUser',
  userCtrl.getCurrentUser
);

router.get('/avatar/:userid',
  userCtrl.getAvatar
);

router.delete('/removeUser/:userId',
  userCtrl.removeUser
);

module.exports = router;

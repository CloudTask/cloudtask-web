const express = require('express');
const dashboardCtrl = require('./../controllers/dashboard');
const envValidator = require('./../validators/env');
const transferEnvCtrl = require('./../controllers/transferEnv');


let router = express.Router();

router.get('/',
  // transferEnvCtrl.transfer,
  dashboardCtrl.get
);

module.exports = router;

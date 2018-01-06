const express = require('express');
const transferEnvCtrl = require('./../controllers/transferEnv');
const envValidator = require('./../validators/env');

let router = express.Router();

router.get('/',
  transferEnvCtrl.get
);

router.post('/',
  transferEnvCtrl.transfer,
  envValidator.setCunrretEnv
);

module.exports = router;

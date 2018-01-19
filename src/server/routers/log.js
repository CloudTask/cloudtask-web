const express = require('express');
const logCtrl = require('./../controllers/log');
const envValidator = require('./../validators/env');

let router = express.Router();

router.get('/activity',
  envValidator.getCurrentEnv,
  logCtrl.getActivity
);

router.post('/activity',
  envValidator.getCurrentEnv,
  logCtrl.postActivity
);

module.exports = router;

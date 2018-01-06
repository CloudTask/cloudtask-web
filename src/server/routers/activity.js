const express = require('express');
const activityCtrl = require('./../controllers/activity');
const envValidator = require('./../validators/env');

let router = express.Router();

router.post('/',
  envValidator.getCurrentEnv,
  activityCtrl.post
);

module.exports = router;

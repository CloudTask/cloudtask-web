const express = require('express');
const locationCtrl = require('./../controllers/location');
const envValidator = require('./../validators/env');

let router = express.Router();

router.post('/modifyCluster',
  envValidator.getCurrentEnv,
  locationCtrl.modifyLocation
);

router.post('/add',
  envValidator.getCurrentEnv,
  locationCtrl.add
);

module.exports = router;

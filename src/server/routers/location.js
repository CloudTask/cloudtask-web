const express = require('express');
const locationCtrl = require('./../controllers/location');
const envValidator = require('./../validators/env');

let router = express.Router();

router.post('/add',
  envValidator.getCurrentEnv,
  locationCtrl.add
);

router.delete('/remove/:location',
  envValidator.getCurrentEnv,
  locationCtrl.remove
);

module.exports = router;

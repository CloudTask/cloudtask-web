const express = require('express');
const locationCtrl = require('./../controllers/location');

let router = express.Router();

router.post('/add',
  locationCtrl.add
);

router.delete('/remove/:location',
  locationCtrl.remove
);

module.exports = router;

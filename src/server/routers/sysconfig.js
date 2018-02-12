const express = require('express');
const sysconfigCtrl = require('./../controllers/sysconfig');

let router = express.Router();

router.get('/',
sysconfigCtrl.get
);

router.post('/',
  sysconfigCtrl.save
);

module.exports = router;

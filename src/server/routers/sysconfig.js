const express = require('express');
const sysCtrl = require('./../controllers/sysconfig');

let router = express.Router();

router.get('/',
  sysCtrl.get
);

router.put('/',
  sysCtrl.put
);

module.exports = router;

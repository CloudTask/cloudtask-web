const express = require('express');
const fileCtrl = require('./../controllers/file');

let router = express.Router();
router.post('/upload/:store/:filename',
  fileCtrl.preUpload,
  fileCtrl.upload,
  fileCtrl.postUpload
);

router.get('/:store/:aliasName',
  fileCtrl.getFileName,
  fileCtrl.ensureFileExists,
  // fileCtrl.processFile,
  fileCtrl.sendFile
);

router.get('/default/:aliasName',
  fileCtrl.getFileName,
  fileCtrl.ensureFileExists,
  // fileCtrl.processFile,
  fileCtrl.sendFile
);

module.exports = router;

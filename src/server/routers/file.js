const express = require('express');
const fileCtrl = require('./../controllers/file');

let router = express.Router();
router.post('/upload/:filename',
  fileCtrl.preUpload,
  fileCtrl.upload,
  fileCtrl.postUpload
);

router.get('/:store/:aliasName',
  fileCtrl.getFileName,
  fileCtrl.ensureFileExists,
  fileCtrl.processImage,
  fileCtrl.sendFile
);

router.get('/default/:aliasName',
  fileCtrl.getFileName,
  fileCtrl.ensureFileExists,
  fileCtrl.processImage,
  fileCtrl.sendFile
);

module.exports = router;

const express = require('express');

router.post('/upload/:filename?',
  routeBiz.preUpload,
  routeBiz.upload,
  routeBiz.postUpload
);

router.get('/:store/:filepath',
  routeBiz.getFileName,
  routeBiz.ensureFileExists,
  routeBiz.processImage,
  routeBiz.sendFile
);

router.get('/:aliasName',
  routeBiz.getFileName,
  routeBiz.ensureFileExists,
  routeBiz.processImage,
  routeBiz.sendFile
);

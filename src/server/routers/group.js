const express = require('express');
const groupCtrl = require('./../controllers/group');
const envValidator = require('./../validators/env');

let router = express.Router();

router.get('/',
  envValidator.getCurrentEnv,
  groupCtrl.getLocation
);

router.get('/getById/:groupId',
  envValidator.getCurrentEnv,
  groupCtrl.getById
);

router.get('/:name/getLocationServer',
  envValidator.getCurrentEnv,
  groupCtrl.getLocationServer
);

router.get('/:groupId/jobs',
  envValidator.getCurrentEnv,
  groupCtrl.getJobsById
);

router.post('/createGroup',
  envValidator.getCurrentEnv,
  groupCtrl.createGroup
);

router.put('/updateGroup',
  envValidator.getCurrentEnv,
  groupCtrl.updateGroup
);

router.delete('/deleteGroup/:location/:groupId',
  envValidator.getCurrentEnv,
  groupCtrl.removeGroup
);

module.exports = router;

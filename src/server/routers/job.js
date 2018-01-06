const express = require('express');
const jobCtrl = require('./../controllers/job');
const envValidator = require('./../validators/env');

let router = express.Router();

router.get('/',
  envValidator.getCurrentEnv,
  jobCtrl.get
);

router.get('/getGroupJobs/:groupId',
  envValidator.getCurrentEnv,
  jobCtrl.getGroupJobs
);

router.get('/getById/:jobId',
  envValidator.getCurrentEnv,
  jobCtrl.getById
);

router.post('/createJob',
  envValidator.getCurrentEnv,
  jobCtrl.createJob
);

// router.post('/action',
//   envValidator.getCurrentEnv,
//   jobCtrl.actionJob
// );

router.put('/updateJob',
  envValidator.getCurrentEnv,
  jobCtrl.updateJob
);

router.delete('/deleteJob/:jobId',
  envValidator.getCurrentEnv,
  jobCtrl.removeJob
);

router.put('/updatefiles',
  envValidator.getCurrentEnv,
  jobCtrl.updatefiles
);

// router.put('/active',
//   envValidator.getCurrentEnv,
//   jobCtrl.actionJob
// );

module.exports = router;

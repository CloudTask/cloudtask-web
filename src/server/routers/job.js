const express = require('express');
const jobCtrl = require('./../controllers/job');
const envValidator = require('./../validators/env');

let router = express.Router();

router.get('/',
  jobCtrl.get
);

router.get('/getGroupJobs/:groupId',
  jobCtrl.getGroupJobs
);

router.get('/getById/:jobId',
  jobCtrl.getById
);

router.post('/createJob',
  jobCtrl.createJob
);

// router.post('/action',
//   envValidator.getCurrentEnv,
//   jobCtrl.actionJob
// );

router.put('/updateJob',
  jobCtrl.updateJob
);

router.delete('/deleteJob/:jobId',
  jobCtrl.removeJob
);

router.put('/updatefiles',
  jobCtrl.updatefiles
);

// router.put('/active',
//   envValidator.getCurrentEnv,
//   jobCtrl.actionJob
// );

module.exports = router;

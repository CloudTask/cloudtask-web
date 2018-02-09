const express = require('express');
const groupCtrl = require('./../controllers/group');

let router = express.Router();

router.get('/',
  groupCtrl.getLocation
);

router.get('/getById/:groupId',
  groupCtrl.getById
);

router.get('/:name/getLocationServer',
  groupCtrl.getLocationServer
);

router.get('/:name/getLocationGroup',
  groupCtrl.getLocationGroup
);

router.get('/:groupId/jobs',
  groupCtrl.getJobsById
);

router.post('/createGroup',
  groupCtrl.createGroup
);

router.put('/updateGroup',
  groupCtrl.updateGroup
);

router.delete('/deleteGroup/:location/:groupId',
  groupCtrl.removeGroup
);

module.exports = router;

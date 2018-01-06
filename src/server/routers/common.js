const express = require('express');

let router = express.Router();

router.get('/logout', (req, res, next) => {
  req.url = '/logout.html';
  next();
})

router.get('/no-ie', (req, res, next) => {
  req.url = '/no-ie.html';
  next();
});

module.exports = router;

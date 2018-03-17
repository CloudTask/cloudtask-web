// require("console-stamp")(console, 'yyyy/mm/dd HH:MM:ss.l');
const path = require('path');
// const negExpressServer = require('neg-express-server');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const session = require('express-session');
const http = require("http");
const util = require('./common/util');
const config = require('./common/config');
const errorHandler = require('errorhandler');

const user = require('./controllers/user');
const dbFactory = require('./db/dbFactory').factory;



let app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  cookieName: 'session',
  secret: 'sw6l',
  duration: 30 * 60 * 1000,
  sctiveDuration: 50 * 60 * 1000,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use('/', require('./routers/common'));

const exts = ['.html', '.js', '.map', '.css', '.ico', '.png', '.otf', '.eot', '.svg', '.ttf', '.woff', '.woff2'];
app.use((req, res, next) => {
  let ext = path.extname(req.path);
  let hasExt = false;
  if (exts.indexOf(ext) !== -1) {
    hasExt = true;
  }
  if (req.method === 'GET' && !req.url.startsWith('/api') && !hasExt) {
    req.url = '/index.html';
  }
  next();
});

// let ignoreAuthPaths = [
//   '/api/users/islogin',
//   '/api/users/login',
//   '/api/users/logout',
//   '/api/users/avatar',
//   '/api/system-config',
//   '/api/dashboard'
// ];

// app.all('/api/*', (req, res, next) => {
//   let ignored = false;
//   for (let i = 0; i < ignoreAuthPaths.length; i++) {
//     if (req.path.startsWith(ignoreAuthPaths[i])) {
//       ignored = true;
//     }
//   }
//   if (ignored) {
//     return next();
//   }
//   if (req.session.currentUser && req.session.currentUser.UserID) {
//     if (req.session.cookie.originalMaxAge && req.session.cookie.originalMaxAge < (20 * 60 * 1000)) {
//       req.session.cookie.maxAge = 20 * 60 * 1000;
//     }
//     return next();
//   } else {
//     error = new Error('UnAuthorization. Not login.');
//     error.statusCode = 401;
//     return next(error);
//   }
// });

app.use('/', express.static(path.join(__dirname, 'client')));
app.use('/api/users', require('./routers/user'));
app.use('/api/dashboard', require('./routers/dashboard'));
app.use('/api/group', require('./routers/group'));
app.use('/api/location', require('./routers/location'));
app.use('/api/job', require('./routers/job'));
app.use('/api/file', require('./routers/file'));
app.use('/api/log', require('./routers/log'));
app.use('/api/sysconfig', require('./routers/sysconfig'));

errorHandler.title = `Cloudtask WebSite`;
app.use(errorHandler({ log: false }));

user.initAdmin()
  .then(() => {
    app.listen(config.listenPort, () => {
      console.log(`Cloudtask Website is started on port ${config.listenPort}`);
    });
  })
  .catch(err => {
    console.log(`System init failed. Error: ${err}`);
    process.exit(-101);
  });


  // app.listen(config.listenPort, () => {
  //   console.log(`Website is started on port ${config.listenPort}`);
  // });

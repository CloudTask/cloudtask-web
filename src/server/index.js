// require("console-stamp")(console, 'yyyy/mm/dd HH:MM:ss.l');
const path = require('path');
const negExpressServer = require('neg-express-server');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const session = require('express-session');
const http = require("http");
const util = require('./common/util');
const config = require('./common/config');


let app = express();

let startServer = () => {
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
  app.get('/appconfig.js', (req, res, next) => {
    let jsContent = `
      const AppConfig = {
        SSOAddress: "https://account.newegg.org",
        cloudtaskCenterAPI: {
          gdev: 'http://10.16.75.24:3000',
          gqc: 'http://10.1.24.130:3000',
          prd: 'http://apis.newegg.org',
        },
        DockerRegistryPrefix: {
          gdev: 'docker.neg',
          prd: 'humpback-hub.newegg.org'
        },
        oAuthReqOption: {
          method: "POST",
          url: "http://apis.newegg.org/framework/v1/keystone/sso-auth-data",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer ciDSo4PJW63TUbxwMjKFCEhmXLwUMDmGWQLH4l6s"
          }
        }
      };
      Object.freeze(AppConfig);
      Object.freeze(AppConfig.cloudtaskCenterAPI);
    `;
    res.type('application/javascript').send(jsContent);
    next();
  });

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

  app.use('/', express.static('dist/client'));
  app.use('/api/sysconfig', require('./routers/sysconfig'));
  app.use('/api/users', require('./routers/user'));
  app.use('/api/transferEnv', require('./routers/transferEnv'))
  app.use('/api/dashboard', require('./routers/dashboard'));
  app.use('/api/group', require('./routers/group'));
  app.use('/api/location', require('./routers/location'));
  app.use('/api/job', require('./routers/job'));
  app.use('/api/activitys', require('./routers/activity'));

  app.listen(config.listenPort, () => {
    console.log(`Website is started on port ${config.listenPort}`);
  });
}

startServer();

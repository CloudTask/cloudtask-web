var zookeeper = require('node-zookeeper-client');
exports.getZkConfig = (req) => {
  return new Promise((resolve, reject) => {
    var client = zookeeper.createClient('10.16.75.23:8481,10.16.75.25:8481,10.16.75.26:8481');
    client.once('connected', function (err) {
      if (err) {
        console.log(err);
        return;
      }
      client.getData(
        '/cloudtask_config_test/ServerConfig',
        function (error, data, stat) {
          if (error) {
            console.log(
              'Failed to list of %s due to: %s.',
              error
            );
            return;
          }
          let mongoData = JSON.parse(data.toString('utf8'));
          // let DBAddress = mongoData.storagedriver.mongo;
          // let DB_CONN_STR = `mongodb://${DBAddress.hosts}`;
          // if (DBAddress.auth.user && DBAddress.auth.password) {
          //   DB_CONN_STR = `mongodb://${DBAddress.auth.user}:${DBAddress.auth.password}@${DBAddress.hosts}`;
          // }
          // if (DBAddress.database) {
          //   DB_CONN_STR = `${DB_CONN_STR}/${DBAddress.database}`;
          // }
          // if (DBAddress.options) {
          //   let options = DBAddress.options.join('&');
          //   if (options) {
          //     DB_CONN_STR = `${DB_CONN_STR}?${options}`;
          //   }
          // }
          resolve(mongoData);
        }
      )
    });
    client.connect();
  })
}

exports.setZkConfig = (postData) => {
  return new Promise((resolve, reject) => {
    var client = zookeeper.createClient('10.16.75.23:8481,10.16.75.25:8481,10.16.75.26:8481');
    // let data = new Buffer(`{
    //   "websitehost": "10.16.78.88:8901",
    //   "centerhost": "10.18.22.45:8985",
    //   "storagedriver": {
    //     "mongo": {
    //       "hosts": "192.168.2.80:27017,192.168.2.81:27017,192.168.2.82:27017",
    //       "database": "cloudtask",
    //       "auth": {
    //         "user": "datastoreAdmin",
    //         "password": "ds4dev"
    //       },
    //       "options": [
    //         "maxPoolSize=20",
    //         "replicaSet=mgoCluster",
    //         "authSource=admin"
    //       ]
    //     }
    //   }
    // }`);
    let data = new Buffer(JSON.stringify(postData));
    client.once('connected', function (err) {
      if (err) {
        console.log(err);
        return;
      }
      client.setData(
        '/cloudtask_config_test/ServerConfig',
        data,
        function (error, stat) {
          if (error) {
            console.log(error.stack);
            return;
        }
        console.log('Data is set.');
        resolve(true);
        }
      )
    });
    client.connect();
  })
}

exports.getConfig = () => {
  let env = process.env.HUMPBACK_ENV || 'gdev';
  let configInfo = {
    version: '1.0.0',
    isDebugMode: true,
    listenPort: process.env.HUMPBACK_LISTEN_PORT || 8100,
    dbConfigs: {
      locationCollection: { name: 'sys_locations' },
      jobCollection: { name: 'sys_jobs' },
      userCollection: { name: 'sys_users' },
      // logCollection: { name: 'LogInfo', ttl: 30 * 24 * 60 * 60 },
      sessionCollection: { name: 'SessionInfo', ignoreLoad: true },
      activityCollection: { name: 'sys_activitys' },
      logCollection: { name: 'logs' },
      sysconfigCollection: {name: 'sys_config'},
      fileCollection: { name: 'sys_files' }
    },
    encryptKey: 'cloudtask@123',
  };
  return configInfo;
}

// module.exports = getConfig();

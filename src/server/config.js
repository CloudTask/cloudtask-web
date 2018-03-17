var zookeeper = require('node-zookeeper-client');
var zookeeperConfig = require('./common/config').zookeeperConfig;
exports.getZkConfig = (req) => {
  return new Promise((resolve, reject) => {
    var client = zookeeper.createClient(zookeeperConfig);
    client.once('connected', function (err) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      client.getData(
        '/cloudtask/ServerConfig',
        function (error, data, stat) {
          if (error) {
            console.log(
              'Failed to list of %s due to: %s.',
              error
            );
            return;
          }
          let mongoData = JSON.parse(data.toString('utf8'));
          resolve(mongoData);
        }
      )
    });
    client.connect();
  })
}

exports.setZkConfig = (postData) => {
  return new Promise((resolve, reject) => {
    var client = zookeeper.createClient(zookeeperConfig);
    let data = new Buffer(JSON.stringify(postData));
    client.once('connected', function (err) {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      client.setData(
        '/cloudtask/ServerConfig',
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
  let configInfo = {
    version: '1.0.0',
    isDebugMode: true,
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

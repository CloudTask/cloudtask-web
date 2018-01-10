// const negCloudData = require('neg-cloud-data');
// const config = require('../common/config');

// let CloudDataStore = negCloudData.CloudDataStore;


exports.getCurrentEnv = (req, res, next) => {
  MongoClient.connect(DB_CONN_STR, (err, database) => {
    req.db = database;
    next();
  });
}

exports.setCunrretEnv = () => {
  // let envConfig = req.session.envConfig;
  // if(envConfig){
  //   let envAddress = envConfig.CurrentAddress;
  //   let envValue = envConfig.CurrentEnvValue;
  //   // let db = new CloudDataStore(`${config.configUrl.gdev}/datastore/v1`, 'cloudtask_dev', '');
  //   let db = new CloudDataStore(`${envAddress}/datastore/v1`, 'cloudtask_v2', '');
  //   req.db = db;
  //   req.envConfig = envAddress;
  //   req.envValue = envValue;
  // }else{
  //   let db = new CloudDataStore(`${config.configUrl.gdev}/datastore/v1`, 'cloudtask_v2', '');
  //   req.db = db;
  //   req.envConfig = config.configUrl.gdev;
  //   req.envValue = 'GDEV';
  // }
  let db;
  return MongoClient.connect(DB_CONN_STR, (err, database) => {
    db = database;
    return db;
  });
}
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://10.16.75.22:29017,10.16.75.23:29017,10.16.75.25:29017/cloudtask_data?replicaSet=NeweggCloud';

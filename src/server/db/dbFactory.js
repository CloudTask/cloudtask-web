var MongoClient = require('mongodb').MongoClient;
var zookeeper = require('node-zookeeper-client');
var zookeeperConfig = require('../common/config').zookeeperConfig;


class DBFactory {
  constructor() {
    this.database = {};
    this.getDBAddress();
    this.connectDB();
  }

  getDBAddress() {
    return new Promise((resolve, reject) => {
      var client = zookeeper.createClient(zookeeperConfig);
      client.once('connected', function (err) {
        if (err) {
          console.log(err);
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
            let DBAddress = mongoData.storagedriver.mongo;
            let DB_CONN_STR = `mongodb://${DBAddress.hosts}`;
            if (DBAddress.auth) {
              if (DBAddress.auth.user && DBAddress.auth.password) {
                DB_CONN_STR = `mongodb://${DBAddress.auth.user}:${DBAddress.auth.password}@${DBAddress.hosts}`;
              }
            }
            if (DBAddress.database) {
              DB_CONN_STR = `${DB_CONN_STR}/${DBAddress.database}`;
            }
            if (DBAddress.options) {
              let options = DBAddress.options.join('&');
              if (options) {
                DB_CONN_STR = `${DB_CONN_STR}?${options}`;
              }
            }
            resolve(DB_CONN_STR);
          }
        )
      });
      client.connect();
    })
  }

  getCollection(collectionName) {
    if (!this.database) {
      this.connectDB()
        .then((db) => {
          let col = db.collection('collectionName');
          return col;
        })
        .catch(err => {
          if (err) {
            console.log(err);
            return;
          }
        })
    } else {
      let col = this.database.collection(collectionName);
      return col;
    }
  }

  connectDB() {
    return new Promise((resolve, reject) => {
      this.getDBAddress()
        .then(address => {
          MongoClient.connect(address, (err, database) => {
            if (err) reject(err);
            this.database = database;
            resolve(this.database);
          });
        })
        .catch(err => reject(err));
    })
  }

  getCurrentEnv(req, res, next) {
    MongoClient.connect(DB_CONN_STR, (err, database) => {
      req.db = database;
      next();
    });
  }
}

exports.factory = new DBFactory();



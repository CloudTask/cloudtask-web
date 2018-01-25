var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://10.16.75.22:29017,10.16.75.23:29017,10.16.75.25:29017/cloudtask_data?replicaSet=NeweggCloud';


class DBFactory {
  constructor() {
    this.connectDB();
  }

  getCollection(collectionName) {
    if (!this.database) {
      this.connectDB()
        .then((db) => {
          let col = db.collection('sys_jobs');
          return col;
        });
    } else {
      let col = this.database.collection(collectionName);
      return col;
    }
  }

  connectDB() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(DB_CONN_STR, (err, database) => {
        if (err) reject(err);
        this.database = database;
        resolve(this.database);
      });
    })
  }
}

exports.factory = new DBFactory();



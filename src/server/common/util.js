const crypto = require('crypto');
const fs = require('fs');
const uuid = require('uuid');
const LRU = require('lru-cache');
const mkdirp = require('mkdirp');

sha1 = (message) => {
  let sha1 = crypto.createHash('sha1');
  sha1.update(message);
  return sha1.digest('hex');
}

getRandomId = () => {
  var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  var res = "";
  for (var i = 0; i < 24; i++) {
    var id = Math.ceil(Math.random() * 15);
    res += chars[id];
  }
  return res;
}

md5Crypto = (text, salt) => {
  salt = salt || 'hb@123';
  let str = `${text}-${salt}`;
  let encrypted = crypto.createHash('md5').update(str).digest("hex");
  return encrypted;
}

const cacheOpt = {
  max: 500,
  length: function (n, key) { return n * 2 + key.length },
  dispose: function (key, n) { n.close() },
  maxAge: 1000 * 60 * 60
};

const cache = LRU(cacheOpt);

const util = {
  cache,
  uuidV4() {
    return uuid.v4();
  },
  ensureDirExists(dir) {
    if (!fs.existsSync(dir)) {
      mkdirp(dir);
    }
  },
  getImageSize(imgPath) {
    return new Promise((resolve, reject) => {
      // gm(imgPath)
      //   .size(imgPath, (err, size) => {
      //     if (err) {
      //       return reject(err);
      //     }
      //     resolve(size);
      //   });
    });
  },
  resizeImage(imgPath, targetFilePath, width, height) {
    return new Promise((resolve, reject) => {
      // gm(imgPath)
      //   .resizeExact(width, height)
      //   .noProfile()
      //   .write(targetFilePath, err => {
      //     if (err) {
      //       return reject(err);
      //     }
      //     resolve(targetFilePath);
      //   });
    });
  }
};

module.exports = {
  sha1,
  getRandomId,
  md5Crypto,
  util
};

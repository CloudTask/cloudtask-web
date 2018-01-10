const crypto = require('crypto');

exports.sha1 = (message) => {
  let sha1 = crypto.createHash('sha1');
  sha1.update(message);
  return sha1.digest('hex');
}

exports.getRandomId = () => {
  var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  var res = "";
  for (var i = 0; i < 24; i++) {
    var id = Math.ceil(Math.random() * 15);
    res += chars[id];
  }
  return res;
}

exports.md5Crypto = (text, salt) => {
  salt = salt || 'hb@123';
  let str = `${text}-${salt}`;
  let encrypted = crypto.createHash('md5').update(str).digest("hex");
  return encrypted;
}

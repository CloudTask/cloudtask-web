const path = require('path');

var listenPort = 8911;
var uploadFolder = path.join(__dirname, '../uploads');
module.exports = {
  listenPort,
  uploadFolder
}

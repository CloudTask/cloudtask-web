const path = require('path');

var listenPort = 8911;
var uploadFolder = path.join(__dirname, '../uploads');
var zookeeperConfig = '104.225.159.143:2181,104.225.159.143:2182,104.225.159.143:2183';
module.exports = {
  listenPort,
  uploadFolder,
  zookeeperConfig
}

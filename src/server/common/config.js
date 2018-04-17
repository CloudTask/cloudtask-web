const path = require('path');

var listenPort = 8091;
var uploadFolder = path.join(__dirname, '../uploads');
var zookeeperConfig = '192.168.2.80:2181,192.168.2.81:2181,192.168.2.82:2181';
module.exports = {
    listenPort,
    uploadFolder,
    zookeeperConfig
}

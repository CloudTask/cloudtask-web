var listenPort = 8091;
var configUrl = {
  gdev: 'http://10.16.75.24:3000',
  gqc: 'http://10.1.24.130:3000',
  prd: 'http://apis.newegg.org'
}
var eventUrl = {
  gdev: 'http://10.16.75.24:3000/framework/v1/enterprise-messaging/message',
  gqc: '',
  prd: '',
}
module.exports = {
  listenPort,
  eventUrl,
  configUrl
}

const request = require('request');
const config = require('../../common/config');


const requestMQ = (data, config) => {
  let options = {
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
    },
    uri: `http://10.16.85.173:8985/cloudtask/v2/messages`,
    method: config.method,
    forever: true
  };
  let messageBody = '';
  if (data) {
    messageBody = typeof data === 'string' ? data : JSON.stringify(data);
  }
  options.body = messageBody;
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject({
          statusCode: res.statusCode,
          message: JSON.stringify(body)
        });
      }
      var data = body;
      try {
        data = JSON.parse(data);
      } catch (ex) { }
      resolve(data);
    });
  });
};

module.exports = {
  requestMQ
};

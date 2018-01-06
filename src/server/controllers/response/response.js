const request = require('request');
/*
消息返回响应结构体
Code: 响应码, 0为成功
Message: 响应描述
Data: 响应数据
*/
exports.setResult = (code, message, data) => {
  let resMessage = {};
  resMessage.code = code;
  resMessage.message = message;
  resMessage.data = data;
  return resMessage;
}

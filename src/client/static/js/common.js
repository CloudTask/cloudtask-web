var messager = {
  _parseContent: function (content) {
    if (typeof content !== 'string') {
      if (content.message) {
        return content.message;
      }
      if (content.error && content.error.message) {
        return content.error.message;
      }
      if (content.Detail) {
        return content.Detail;
      }
      return JSON.stringify(content);
    }
    return content;
  },

  error: function (content) {
    content = this._parseContent(content);
    spop({
      template: content,
      position: "top-right",
      style: "error",
      autoclose: 10000,
      group: "same"
    });
  },

  success: function (content) {
    content = this._parseContent(content);
    spop({
      template: content,
      position: "top-right",
      style: "success",
      autoclose: 10000,
      group: "same"
    });
  }
}

window.messager = messager;


var config = {
  debug: true,
  Dev: 'http://10.16.75.22:8989',
  Gdev: 'http://10.16.75.24:3000',
  Gqc: 'http://10.1.24.130:3000',
  Prd: 'http://apis.newegg.org',
  DfisAddress: 'http://10.1.24.133',
  DfisAddressPrd: 'http://neg-app-dfis-c4',
};
window.Config = config;
window.ConfAddress = config.Gdev;
window.DfisAddr = config.DfisAddress;

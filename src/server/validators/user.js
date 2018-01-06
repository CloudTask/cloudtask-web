// const config = require('neg-config').getConfig();

exports.validateLogin = (req, res, next) => {
  if (!req.body.Token) {
    return next(new Error("'Token' cannot be empty."));
  }
  next();
}

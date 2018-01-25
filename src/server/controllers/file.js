const fs = require('fs');
const path = require('path');
const multer = require('multer');
const config = require('./../config');
const util = require('./../common/util');
const db = require('./../common/db');

const imageExts = ['.jpg', '.png', '.jpeg', '.bmp'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let store = req.body.store || 'default';
    let folderPath = path.join(config.uploadFolder, store);
    file.store = store;
    util.ensureDirExists(folderPath);
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    let fileName = `${util.uuidV4()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage });

// 确保文件目录存在
util.ensureDirExists(config.uploadFolder);

module.exports = {
  preUpload(req, res, next) {
    let aliasName = req.params.filename || '';
    let p = Promise.resolve();
    if (aliasName) {
      p = db.findFile(aliasName);
    }
    p.then(data => {
      if (data) {
        return res.status(409).send('alias name exits.');
      }
      next();
    }).catch(next);
  },
  upload: upload.single('file'),
  postUpload(req, res, next) {
    let file = req.file;
    if (!file) {
      return res.send('No file upload.');
    }
    db.writeFileInfo({
      store: file.store,
      originalname: file.originalname,
      mimeType: file.mimetype,
      createDate: Date.now(),
      filename: file.filename,
      size: file.size,
      aliasName: req.params.filename || ''
    }).then(doc => {
      res.send(`/${file.store}/${file.filename}`);
    }).catch(next);
  },
  getFileName(req, res, next) {
    let aliasName = req.params.aliasName;
    if (aliasName) {
      db.findFile(aliasName)
        .then(file => {
          if (!file) {
            return res.status(404).end();
          }
          res.locals.filepath = path.join(config.uploadFolder, file.store, file.filename);
          next();
        })
        .catch(next);
    } else {
      res.locals.filepath = path.join(config.uploadFolder, req.params.store, req.params.filepath);
      next();
    }
  },
  ensureFileExists(req, res, next) {
    let filepath = res.locals.filepath;
    if (!fs.existsSync(filepath)) {
      return res.status(404).end();
    }
    next();
  },
  processImage(req, res, next) {
    let filepath = res.locals.filepath;
    let extName = path.extname(filepath);
    // 不是图片格式，直接跳过
    if (!imageExts.includes(extName)) {
      return next();
    }
    let w = +req.query.w;
    let h = +req.query.h;
    let p = Promise.resolve();
    if (w || h) {
      p = util.getImageSize(filepath)
        .then(size => {
          if (!w) {
            w = size.width;
          } else if (!h) {
            h = size.height;
          }
        })
        .then(() => {
          let targetFilepath = filepath.replace(new RegExp(extName + '$'), `_${w}_${h}${extName}`);
          return util.resizeImage(filepath, targetFilepath, w, h);
        })
    }
    p.then(targetFilepath => {
      targetFilepath && (res.locals.filepath = targetFilepath);
      next();
    })
      .catch(next);
  },
  sendFile(req, res, next) {
    let filepath = res.locals.filepath;
    res.sendFile(filepath);
  }
}

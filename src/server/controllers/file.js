const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mkdirp = require('mkdirp');
const config = require('./../config').getConfig();
const commonConfig = require('./../common/config');
const util = require('./../common/util').util;
const dbFactory = require('./../db/dbFactory').factory;

let collectionName = config.dbConfigs.fileCollection.name;

// const imageExts = ['.tar.gz'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let store = req.params.store || 'default';
    let folderPath = path.join(commonConfig.uploadFolder, store);
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
util.ensureDirExists(commonConfig.uploadFolder);

module.exports = {
  preUpload(req, res, next) {
    let aliasName = req.params.filename || '';
    if (aliasName) {
      dbFactory.getCollection(collectionName).findOne({ filename: aliasName }, (err, resultFile) => {
        if (err) {
          console.log('Error:' + err);
          return;
        }
        if (resultFile) {
          return res.status(409).send('alias name exits.');
        }
        next();
      })
    }
  },
  upload: upload.single('jobFile'),
  postUpload(req, res, next) {
    let file = req.file;
    if (!file) {
      return res.status(409).send('No file upload.');
    }
    dbFactory.getCollection(collectionName).insert({
      store: file.store,
      originalname: file.originalname,
      mimeType: file.mimetype,
      createDate: Date.now(),
      filename: file.filename,
      size: file.size,
      aliasName: req.params.filename || ''
    }, (err, result) => {
      if (err) {
        console.log('Error:' + err);
        return;
      }
      res.send(`/${file.store}/${file.filename}`);
    })
  },
  getFileName(req, res, next) {
    let aliasName = req.params.aliasName;
    if (aliasName) {
      dbFactory.getCollection(collectionName).findOne({aliasName: aliasName})
        .then(file => {
          if (!file) {
            return res.status(404).end();
          }
          res.locals.filepath = path.join(commonConfig.uploadFolder, file.store, file.filename);
          next();
        })
        .catch(next);
    } else {
      res.locals.filepath = path.join(commonConfig.uploadFolder, req.params.store, req.params.filepath);
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
  // processFile(req, res, next) {
  //   let filepath = res.locals.filepath;
  //   let extName = path.extname(filepath);
  //   // 不是.tar.gz格式，直接跳过
  //   if (!imageExts.includes(extName)) {
  //     return next();
  //   }
  //   let w = +req.query.w;
  //   let h = +req.query.h;
  //   let p = Promise.resolve();
  //   if (w || h) {
  //     p = util.getFileSize(filepath)
  //       .then(size => {
  //         if (!w) {
  //           w = size.width;
  //         } else if (!h) {
  //           h = size.height;
  //         }
  //       })
  //       .then(() => {
  //         let targetFilepath = filepath.replace(new RegExp(extName + '$'), `_${w}_${h}${extName}`);
  //         return util.resizeImage(filepath, targetFilepath, w, h);
  //       })
  //   }
  //   p.then(targetFilepath => {
  //     targetFilepath && (res.locals.filepath = targetFilepath);
  //     next();
  //   })
  //     .catch(next);
  // },
  sendFile(req, res, next) {
    let filepath = res.locals.filepath;
    res.sendFile(filepath);
  }
}

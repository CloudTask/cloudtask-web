import { Injectable } from '@angular/core';

@Injectable()
export class DfisUploader {

  constructor() { }

  /**
   * 上传文件到dfis
   * @param  {string} dfisUrl - 要上传的地址（Dfis完整上传地址）
   * @param  {Blob|File} file - 要上传的内容
   */
  upload(dfisUrl: string, file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', dfisUrl);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.addEventListener('readystatechange', (evt) => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status !== 200) {
            return reject(xhr.statusText);
          }
          resolve(dfisUrl);
        }
      });
      xhr.addEventListener('error', (err) => {
        reject(err);
      });
      xhr.send(file);
    });
  }
}


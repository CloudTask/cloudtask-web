import { Injectable } from '@angular/core';
import { CusHttpService } from './custom-http.service';

@Injectable()
export class DfisUploader {

  constructor(
    private _http: CusHttpService,
  ) { }

  /**
   * 上传文件到dfis
   * @param  {string} dfisUrl - 要上传的地址（Dfis完整上传地址）
   * @param  {Blob|File} file - 要上传的内容
   */
  upload(dfisUrl: string, file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', dfisUrl);
      // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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
      var formData = new FormData();
      formData.append("jobFile", file);
      xhr.send(formData);
      // let postJob = {
      //   name: '111'
      // };
      // console.log(postJob);
      // let a = 'joballocator-2016-12-07_16-48-43-2018-01-26_11-39-50.tar.gz';
      // this._http.post(`api/file/upload/${a}`, postJob)
      //   .then(res => {
      //     let data = res.json ? res.json() : res;
      //     resolve(data);
      //   })
      //   .catch(err => {
      //     reject(err.json ? err.json() : err);
      //   });
    });
  }
}


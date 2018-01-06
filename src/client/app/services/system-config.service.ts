import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { CusHttpService } from './custom-http.service';

declare let _: any;
declare let ConfAddress: any;
declare let Config: any;

@Injectable()
export class SystemConfigService {

  ConfigSubject = new ReplaySubject<any>(1);

  get Config(): any {
    return this._config;
  }
  set Config(value: any) {
    this._config = value;
    this.ConfigSubject.next(this._config);
  }
  private _config: any;

  constructor(
    private _http: CusHttpService) {
  }

  get(nocache: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.Config && !nocache) {
        return resolve(this.Config);
      }
      // this._http.get(`${Config.Prd}/cloudtask/v2/sysconfig`)
      this._http.get('api/sysconfig')
        .then(res => {
          let config = res.json().data;
          this.Config = config;
          resolve(config);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    });
  }

  save(config: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // this._http.put(`${Config.Prd}/cloudtask/v2/sysconfig`, config)
      this._http.put(`api/sysconfig`, config)
        .then(res => {
          this.Config = _.cloneDeep(config);
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    });
  }
}

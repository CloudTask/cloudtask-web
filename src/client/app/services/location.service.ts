import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';
import { resolve } from 'url';
import { SystemConfigService } from './system-config.service';

declare let _: any;
declare let Config: any;

@Injectable()
export class LocationService {

  private groups: any = {};

  constructor(
    private _http: CusHttpService,
    private _systemConfig: SystemConfigService,
    private _authService: AuthService) {
  }

  getDashboard(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.get(`/api/dashboard`)
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getStatusInfo(value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._systemConfig.get(true)
        .then(config => {
          let ConfAddress = config.centerhost;
          let url = `${ConfAddress}/cloudtask/v2/runtimes/${value}/servers`;
          this._http.get(url)
            .then(res => {
              let data = res.json().data.servers;
              resolve(data);
            })
            .catch(err => {
              reject(err.json ? err.json() : err);
            });
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    })
  }

  getServers(value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.get(`api/group/${value}/getLocationServer`)

        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getLocationGroup(value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.get(`api/group/${value}/getLocationGroup`)
        .then(res => {
          let data = res.json ? res.json() : res;
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  add(value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.post(`api/location/add`, value)
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  update(value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.post(`api/location/update`, value)
        .then(res => {
          let data = res.json();
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  remove(location: any) {
    return new Promise((resolve, reject) => {
      this._http.delete(`api/location/remove/${location}`)
        .then(res => {
          let data = res.json ? res.json() : res;
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err)
        })
    })
  }
}

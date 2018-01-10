import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';
import { SystemConfigService } from './system-config.service';

declare let _: any;
declare let ConfAddress: any;
declare let Config: any;

@Injectable()
export class UserService {

  private systemConfig: any;
  private groups: any = {};
  private baseUrl: string;
  private activityUrl: string;

  constructor(
    private _http: CusHttpService,
    private _authService: AuthService,
    private _systemConfigService: SystemConfigService) {

    this._systemConfigService.ConfigSubject.forEach(data => {
      this.systemConfig = data;
    })
  }

  get(nocache: boolean = false, type: string = 'normal'): Promise<any> {
    let url = `/api/users`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let groups = res.json() || [];
          resolve(groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  add(userInfo: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // let ConfAddress = 'http://10.16.75.22:8989';
      // this._http.post(`${ConfAddress}/cloudtask/v2/jobs`, job)
      let postUser = JSON.stringify(userInfo);
      this._http.post('api/users/createUser', postUser)
        .then(res => {
          let data = res.json ? res.json() : res;
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  update(user: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // this._http.put(`${ConfAddress}/cloudtask/v2/groups`, group)
      this._http.put(`api/users/updateUser`, user)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  remove(userid: string): Promise<any> {
    // let url = `${ConfAddress}/cloudtask/v2/groups/${id}`;
    let url = `api/users/removeUser/${userid}`
    return new Promise((resolve, reject) => {
      this._http.delete(url)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }
}

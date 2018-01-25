import { Injectable, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { EventNotifyService, EventType } from './event-notify.service';
import { CusHttpService } from './custom-http.service';
import { IUserLogin } from './../interfaces';

declare let Config: any;
declare let messager: any;

@Injectable()
export class AuthService {

  private userInfo: any = null;
  private userName: any;

  constructor(
    private _router: Router,
    private http: CusHttpService,
    private eventNotify: EventNotifyService) {

  }

  login(userInfo: IUserLogin): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/users/login`;
      this.http.post(url, userInfo)
        .then(res => {
          this.userInfo = res.json();
          resolve(this.userInfo);

        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  isLogin(hideLoading: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = '/api/users/islogin';
      if (this.userInfo) {
        return resolve(this.userInfo);
      }
      this.http.get(url, { disableLoading: hideLoading })
        .then(res => {
          let result = res.json();
          if (!result.IsLogin) {
            return resolve(this.userInfo);
          }
          this.userInfo = result.userInfo;
          resolve(this.userInfo);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/users/logout`;
      this.http.get(url)
        .then(res => {
          this.clearUserInfo();
          resolve(true);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    });
  }

  getUserInfoFromCache(): any {
    if (this.userInfo) {
      return this.userInfo;
    } else {
      return {};
    }
  }

  clearUserInfo() {
    this.userInfo = null;
  }
}

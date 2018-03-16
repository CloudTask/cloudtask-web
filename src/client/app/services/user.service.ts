import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

declare let _: any;
declare let Config: any;

@Injectable()
export class UserService {

  private systemConfig: any;
  private groups: any = {};
  private baseUrl: string;
  private activityUrl: string;

  constructor(
    private _http: CusHttpService,
    private _authService: AuthService) {
  }

  getCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `/api/users/currentUser`;
      this._http.get(url)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
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

  updateProfile(profile: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `api/users/updateUser`;
      this._http.put(url, profile)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = {
        userId: userId,
        oldPassword: oldPassword,
        newPassword: newPassword
      }
      let url = `api/users/changePassword`;
      this._http.put(url, body)
        .then(res => {
          resolve(res.json());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}

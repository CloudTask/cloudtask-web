import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

declare let _: any;
declare let ConfAddress: any;
declare let Config: any;

@Injectable()
export class GroupService {

  private systemConfig: any;
  private groups: any = {};
  private baseUrl: string;
  private activityUrl: string;

  constructor(
    private _http: CusHttpService,
    private _authService: AuthService) {
    this.baseUrl = `${ConfAddress}/cloudtask/v2/groups`;
    this.activityUrl = `${ConfAddress}/cloudtask/v2/activitys`;
  }

  get(nocache: boolean = false, type: string = 'normal'): Promise<any> {
    // if (this.groups[type] && this.groups[type].length > 0 && !nocache) {
    //   return Promise.resolve(_.cloneDeep(this.groups[type]));
    // }
    // let url = `${ConfAddress}/cloudtask/v2/locations`;
    let url = `/api/group`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let groups = res.json() || [];
          groups = groups.filter((group: any) => !!group.location);
          // this.groups[type] = groups;
          resolve(groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getForManage(): Promise<any> {
    let url = `${ConfAddress}/cloudtask/v2/groups?formanage=1`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          this.groups = res.json();
          resolve(this.groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getBasicGroupsInfo(): Promise<any> {
    let url = `${ConfAddress}/cloudtask/v2/groups/getbasicgroupsinfo`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let groups = res.json();
          resolve(groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getById(id: string): Promise<any> {
    // let url = `${ConfAddress}/cloudtask/v2/groups/${id}`;
    let url = `api/group/getById/${id}`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let group = res.json();
          resolve(group);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    })
  }

  getJobsById(id: string): Promise<any> {
    // let url = `${ConfAddress}/cloudtask/v2/groups/${id}/jobs`;
    let url = `api/group/${id}/jobs`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let jobs = res.json();
          resolve(jobs);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    })
  }

  add(group: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // this._http.post(`${ConfAddress}/cloudtask/v2/groups`, group)
      this._http.post(`api/group/createGroup`, group)
        .then(res => {
          let data = res.json();
          this.notifyCenter(data.ID, 'create');
          resolve(data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  update(group: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // this._http.put(`${ConfAddress}/cloudtask/v2/groups`, group)
      this._http.put(`api/group/updateGroup`, group)
        .then(res => {
          this.notifyCenter(group.ID, 'change');
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  remove(location: string, id: string): Promise<any> {
    // let url = `${ConfAddress}/cloudtask/v2/groups/${id}`;
    let url = `api/group/deleteGroup/${location}/${id}`
    return new Promise((resolve, reject) => {
      this._http.delete(url)
        .then(res => {
          this.notifyCenter(id, 'remove');
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  isIPEnableProxy(ip: string): boolean {
    return false;
  }

  clear(): void {
    this.groups = {};
  }

  private notifyCenter(groupId: string, event: string) {

  }
}

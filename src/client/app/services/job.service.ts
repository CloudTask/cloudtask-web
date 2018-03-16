import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';
import { SystemConfigService } from './system-config.service';

declare let _: any;
declare let Config: any;

@Injectable()
export class JobService {

  private systemConfig: any;
  private groups: any = {};
  private activityUrl: string;
  private baseUrl: string;

  constructor(
    private _http: CusHttpService,
    private _authService: AuthService,
    private _systemConfig: SystemConfigService) {
  }

  get(nocache: boolean = false, type: string = 'normal'): Promise<any> {
    if (this.groups[type] && this.groups[type].length > 0 && !nocache) {
      return Promise.resolve(_.cloneDeep(this.groups[type]));
    }
    let url = `api/job`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let groups = res.json() || [];
          this.groups[type] = groups;
          resolve(groups);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getJobsOnGroup(groupId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.get(`api/job/getGroupJobs/${groupId}`)
        .then(res => {
          let jobs = res.json() ? res.json() : res;
          resolve(jobs);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  getById(id: string): Promise<any> {
    let url = `api/job/getById/${id}`;
    return new Promise((resolve, reject) => {
      this._http.get(url)
        .then(res => {
          let job = res.json() ? res.json() : res;
          resolve(job);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        })
    })
  }

  getJobsalloc(locationName: any): Promise<any> {
    // let url = `/api/job/${locationName}/jobsalloc`;
    return new Promise((resolve, reject) => {
      this._systemConfig.get(true)
      .then(config => {
        let ConfAddress= config.centerhost;
        let url = `${ConfAddress}/cloudtask/v2/runtimes/${locationName}/jobsalloc`;
        this._http.get(url)
          .then(res => {
            resolve(res.json ? res.json() : res.text());
          })
          .catch(err => {
            reject(err.json ? err.json() : err);
          })
      })
      .catch(err => {
        reject(err.json ? err.json() : err);
      })
    })
  }

  add(job: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let postJob = JSON.stringify(job);
      this._http.post('api/job/createJob', postJob)
        .then(res => {
          let data = res.json ? res.json() : res;
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
      this._http.put(`api/job/updateJob`, group)
        .then(res => {
          this.notifyCenter(group.ID, 'change');
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  updateFiles(job: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._http.put(`api/job/updatefiles`, job)
        .then(res => {
          resolve(res.json ? res.json() : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  activeJob(runtime: any, jobId: any, stat: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._systemConfig.get(true)
      .then(config => {
        let ConfAddress= config.centerhost;
        let operate: any;
        operate = stat == 200 ? 'stop' : 'start'
        let url = `${ConfAddress}/cloudtask/v2/jobs/action`
        let putData = {
          runtime: runtime,
          jobid: jobId,
          action: operate
        }
        // let url = `api/job/active`;
        this._http.put(url, putData)
          .then((res: any) => {
            if (res) {
              setTimeout(() => {
                resolve(200);
              }, 100)
            }

          })
          .catch(err => {
            reject(err.json ? err.json() : err);
          });
      })
      .catch(err => {
        reject(err.json ? err.json() : err);
      });
    })
  }

  remove(id: string): Promise<any> {
    let url = `api/job/deleteJob/${id}`;
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

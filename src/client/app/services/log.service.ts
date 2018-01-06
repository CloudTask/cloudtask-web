import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

declare let ConfAddress: any;
declare let Config: any;

@Injectable()
export class LogService {

  private baseUrl: string;

  constructor(
    private http: CusHttpService,
    private authService: AuthService) {
    this.baseUrl = `${ConfAddress}/datastore/v1/cloudtask_v2/logs`;
  }

  public addLog(content: string, type: string, group: string = "", server: string = ""): void {
    let log = {
      Group: group,
      Server: server,
      Type: type,
      Content: content
    };
    this.http.post(this.baseUrl, log, { disableLoading: true })
      .then(res => {

      })
      .catch(err => {

      });
  }

  public getLog(selectedType: any, jobId: string, fromDate: string, toDate: string, currentPage: any, pageSize: any): Promise<any> {
    let query: any;
    if (selectedType) {
      query = `f_jobid=${jobId}&f_createat={"$gte": ${fromDate}, "$lte": ${toDate}}&f_stat=${selectedType}&sortField=createat&sort=desc&pageIndex=${currentPage}&pageSize=${pageSize}`;
    } else {
      query = `f_jobid=${jobId}&f_createat={"$gte": ${fromDate}, "$lte": ${toDate}}&sortField=createat&sort=desc&pageIndex=${currentPage}&pageSize=${pageSize}`;
    }
    let url = `${ConfAddress}/datastore/v1/cloudtask_v2/logs?${query}`;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .then(res => {
          var logs = res.json();
          resolve(logs);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  public getActiveLog(location: any, group: string, type: string, pageSize: any, pageIndex: any): Promise<any> {
    let query: any;
    query = `pageSize=${pageSize}&pageIndex=${pageIndex}&sortField=indate&sort=desc`;
    if(location){
      query = `f_location=${location}&${query}`;
    }
    if(group){
      query = `f_group=${group}&${query}`;
    }
    if(type){
      query = `f_type=${type}&${query}`;
    }
    let url = `${ConfAddress}/datastore/v1/cloudtask_v2/sys_activitys?${query}`;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .then(res => {
          var logs = res.json();
          resolve(logs);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }
}

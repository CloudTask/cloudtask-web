import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CusHttpService } from './custom-http.service';

declare let Config: any;

@Injectable()
export class LogService {

  constructor(
    private http: CusHttpService,
    private authService: AuthService) {
  }

  public getLog(selectedType: any, jobId: string, fromDate: string, toDate: string, currentPage: any, pageSize: any): Promise<any> {
    let query: any;
    if (selectedType) {
      query = `jobid=${jobId}&createat={"$gte": ${fromDate}, "$lte": ${toDate}}&stat=${selectedType}&sortField=createat&sort=desc&pageIndex=${currentPage}&pageSize=${pageSize}`;
    } else {
      query = `jobid=${jobId}&createat={"$gte": ${fromDate}, "$lte": ${toDate}}&sortField=createat&sort=desc&pageIndex=${currentPage}&pageSize=${pageSize}`;
    }
    let url = `api/log/logs?${query}`;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .then(res => {
          var logs = res.json ? res.json() : res;
          resolve(logs.data);
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    });
  }

  public postActivity(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(`api/log/activity`, data)
        .then(res => {
          let result = res.json ? res.json() : res;
          let resData = result.data;
          resolve(res.json ? JSON.parse(JSON.stringify(resData)) : res.text());
        })
        .catch(err => {
          reject(err.json ? err.json() : err);
        });
    })
  }

  public getActiveLog(location: any, group: string, type: string, pageSize: any, pageIndex: any): Promise<any> {
    let query: any;
    query = `pageSize=${pageSize}&pageIndex=${pageIndex}&sortField=indate&sort=desc`;
    if(location){
      query = `location=${location}&${query}`;
    }
    if(group){
      query = `group=${group}&${query}`;
    }
    if(type){
      query = `type=${type}&${query}`;
    }
    let url = `api/log/activity?${query}`;
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

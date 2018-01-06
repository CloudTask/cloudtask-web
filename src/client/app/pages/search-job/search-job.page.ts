import { Component, ViewChild, ElementRef } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { LogService } from './../../services';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { JobService, GroupService, AuthService } from './../../services';

declare let messager: any;

@Component({
  selector: 'search-job',
  styleUrls: ['./search-job.css'],
  templateUrl: './search-job.html',
})

export class SearchJobPage {

  private userInfo: any;
  private userName: any;

  private currentJobs: Array<any> = [];
  private filterJobs: Array<any> = [];
  private inputValue: any;
  private jobs: Array<any> = [];
  private searchTimeout: any;
  private jobPageOption: any;
  private jobPageIndex: number = 1;
  private pageSize: number = 15;
  private groupsInfo: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _authService: AuthService,
    private _groupService: GroupService,
    private _jobService: JobService) {
  }

  ngOnInit() {

    this.userInfo = this._authService.getUserInfoFromCache();
    this.userName = this.userInfo.UserName;

    this.jobPageOption = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };
    setTimeout(() => {
      this.fresh();
    }, 100)
  }

  private fresh() {
    let pageIndex = sessionStorage.getItem('jobPage');
    this.jobPageIndex = Number(pageIndex) ? Number(pageIndex) : 1;
    let searchJob = sessionStorage.getItem('searchJobName') || '';
    this.search(searchJob);
    this.setJobPage(this.jobPageIndex);
  }

  private validateDocSearch(value: any) {
    this.search(value);
  }

  private setJobPage(pageIndex: number) {
    sessionStorage.setItem('jobPage', pageIndex.toString());
    this.jobPageIndex = pageIndex;
    if (!this.filterJobs) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentJobs = this.filterJobs.slice(start, end);
  }

  private search(value?: any) {
    if (!value) {
      this.filterJobs = [];
    } else {
      this.jobs = [];
      if (this.userInfo.IsAdmin) {
        this._jobService.get(true)
          .then(data => {
            this.jobs = data;
            this.filterInput(value);
          })
      } else {
        this._groupService.get(true)
          .then((res) => {
            let groups: any = [];
            res.forEach((dataItem: any) => {
              dataItem.group.forEach((group: any) => {
                groups.push(group);
              })
            });
            this.groupsInfo = groups.filter((group: any) => group.owners && group.owners.length > 0 && group.owners.indexOf(this.userName) > -1)
            // console.log(data);
            // this.jobs = data.filter((job: any) => {
            //   this.groupsInfo.map((item) => {
            //     job.groupid == item.id;
            //   })
            // })
            this.groupsInfo.forEach((group: any) => {
              this._groupService.getJobsById(group.id)
              .then((result) => {
                result.forEach((item: any) => {
                  this.jobs.push(item);
                })
                this.filterInput(value);
              })
              .catch(err => messager.error(err))
            })
          })
          .catch(err => messager.error(err.message || 'Get Groups faild'))
      }
      // })
    }
  }

  private filterInput(value?: any) {
    this.filterJobs = this.jobs;
    this.inputValue = value || '';
    sessionStorage.setItem('searchJobName', this.inputValue);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      let keyWord = this.inputValue;
      if (keyWord) {
        let regex = new RegExp(keyWord, 'i');
        this.filterJobs = this.jobs.filter((item: any) => {
          return regex.test(item.name);
        });
      } else {
        this.filterJobs = [];
      }
      if (this.filterJobs.length > 0) {
        this.filterJobs.forEach((job: any) => {
          this._groupService.getById(job.groupid)
            .then(data => {
              job.groupName = data.name;
            })
        })
        this.filterJobs.sort((a: any, b: any) => {
          return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        });
      }
      this.setJobPage(this.jobPageIndex);
    }, 500);
  }

  private removeTaskpageSession() {
    sessionStorage.removeItem('pageIndex');
    sessionStorage.removeItem('searchWords');
    sessionStorage.removeItem('filterJobStat');
  }
}

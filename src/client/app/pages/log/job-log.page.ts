import { Component, forwardRef, OnInit, Input, Output, OnChanges, ElementRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, JobService, LogService } from './../../services';

declare let messager: any;
declare let moment: any;
declare let ConfAddress: any;

@Component({
  selector: 'hb-job-log',
  templateUrl: './job-log.html',
  styleUrls: ['./job-log.css'],
})

export class JobLogPage implements OnInit, OnChanges {

  private groups: Array<any> = [];
  private location: any;

  private servers: Array<any> = [];
  private jobs: Array<any>;
  private groupId: any;
  private jobId: any;
  private logs: Array<any> = [];
  private logJobName: any;
  private command: any;
  private currentPage: any;
  private logPageIndex: number = 1;
  private detailId: any;

  private selectedRuntime: string = '';
  private selectedGroup: string = '';
  private selectedServer: string = '';
  private selectedJob: string = '';
  private selectedType: string = '';

  private pageOptions: any;
  private pageSize: number = 20;
  private totalCount: number;

  private fromDate: any;
  private toDate: any;
  private startDateValue: any;
  private endDateValue: any;

  private subscriber: any;

  constructor(
    private _route: ActivatedRoute,
    private _groupService: GroupService,
    private _jobService: JobService,
    private _logService: LogService) {

  }

  ngOnInit() {
    this.subscriber = this._route.params.subscribe(params => {
      this.location = params['location'];
      this.groupId = params['groupId'];
      this.jobId = params['jobId'];
    })
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };

    this.endDateValue = moment(Date.now()).format('MM/DD/YYYY');
    let defaultStartDate = new Date().getDate() - 2;
    let startDate = new Date().setDate(defaultStartDate);
    this.startDateValue = moment(startDate).format('MM/DD/YYYY');
    this.search();
    this._jobService.getById(this.jobId)
      .then(res => {
        this.logJobName = res.name;
      })
  }

  ngOnChanges(changeObj: any) {

  }

  private toggleDetailBox(logIndex: any) {
    if (this.detailId === logIndex) {
      this.detailId = null;
    } else {
      this.detailId = logIndex;
    }
  }

  private getLogs(pageIndex: number) {
    this.currentPage = pageIndex;
    this._logService.getLog(this.selectedType, this.jobId, this.fromDate, this.toDate, this.currentPage, this.pageSize)
      .then(data => {
        this.totalCount = data.total_rows;
        this.logs = data.rows;
      })
      .catch(err => messager.err(err.message || 'Get logs failed'));
  }

  private dateValueChange(value: any) {
    this.currentPage = 1;
    this.logPageIndex = 1;
  }

  private selectedTypeChange(value: any) {
    this.selectedType = value || '';
    setTimeout(() => {
      this.logPageIndex = 1;
      this.search();
    }, 100);
  }

  private search() {
    this.fromDate = Date.parse(this.startDateValue);
    this.toDate = Date.parse(this.endDateValue + " 23:59:00");
    if (this.fromDate >= this.toDate) {
      messager.error("The value of toDate must not be smaller than fromDate's");
      return;
    }
    this.setPage(this.logPageIndex);
  }

  private setPage(pageIndex: number) {
    this.logPageIndex = pageIndex;
    this.getLogs(pageIndex);
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}

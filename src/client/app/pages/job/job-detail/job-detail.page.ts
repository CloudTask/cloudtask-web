import { Component, ViewChild, Output, ElementRef, EventEmitter, Input, forwardRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventNotifyService, EventType, AuthService, JobService, LogService, GroupService } from './../../../services';

declare let messager: any;
declare let moment: any;
declare let Config: any;
declare let ConfAddress: any;
declare let DfisAddr: any;

@Component({
  selector: 'ct-job-detail',
  templateUrl: './job-detail.html',
  styleUrls: ['/job-detail.css'],
})

export class JobDetailPage {

  private userInfo: any;
  private userName: any;
  private userFullName: any;

  private location: any;
  private groupId: any;
  private jobId: any;
  private jobInfor: any = {};
  private jobBasicInfo: Array<any>;
  private basicInfoDes: Array<any> = [];
  private scheduleRuntimeInfo: Array<any> = [];
  private commandInfo: Array<any> = [];
  private logs: Array<any> = [];
  private fromdate: any;
  private todate: any;
  private scheduleInforArr: any = [];
  private env: any = [];
  private serverInfo: any = [];
  private startDateValue: any;
  private endDateValue: any;
  private stateText: any;
  private activityData: any;
  private groupName: any;
  private detailId: any;

  private subscriber: any;
  private pageIndex: number = 1;
  private pageSize: number = 5;

  constructor(
    private _route: ActivatedRoute,
    private _jobService: JobService,
    private _router: Router,
    private _authService: AuthService,
    private _groupService: GroupService,
    private _logService: LogService) {

  }

  ngOnInit() {

    this.userInfo = this._authService.getUserInfoFromCache();
    this.userName = this.userInfo.UserName;
    this.userFullName = this.userInfo.FullName;

    this.subscriber = this._route.params.subscribe(params => {
      this.location = params['location'];
      this.groupId = params['groupId'];
      this.jobId = params['jobId'];
      this.getJob();
    });
    this.getGroupName();
    this.activityData = {
      server: '',
      location: this.location,
      group: this.groupId,
      type: 'job',
      content: '',
      userid: this.userName,
      fullname: this.userFullName,
      indate: 0
    }
    this.endDateValue = moment(Date.now()).format('YYYY/MM/DD');
    let defaultStartDate = new Date().getDate() - 2;
    let startDate = new Date().setDate(defaultStartDate);
    this.startDateValue = moment(startDate).format('YYYY/MM/DD');
    this.fromdate = Date.parse(this.startDateValue);
    this.todate = Date.parse(this.endDateValue + " 23:59:00");
    this._logService.getLog(false, this.jobId, this.fromdate, this.todate, this.pageIndex, this.pageSize)
      .then(res => {
        this.logs = res.rows;
        this.logs.forEach((log: any) => {
          let regexp = new RegExp("0001");
          if (regexp.test(log.execat)) {
            log.execat = '';
          }
        })
      })
      .catch(err => {
        messager.error(err.message || "Get log failed.");
      });
  }

  private getJob() {
    this._jobService.getById(this.jobId)
      .then(data => {
        this.jobInfor = data;
        if(this.jobInfor.enabled){
          if (this.jobInfor.stat == 200) {
            this.stateText = 'Running';
          }
          if (this.jobInfor.stat == 0) {
            this.stateText = 'Idle';
          }
          if (this.jobInfor.stat == -1) {
            this.stateText = 'Failed';
          }
          if (this.jobInfor.stat == 202) {
            this.stateText = 'Reallocating';
          }
        }else{
          this.stateText = 'Disabled';
        }
        this.scheduleInforArr = [];
        for (let i = 0; i < data.schedule.length; i++) {
          this.scheduleInforArr.push(data.schedule[i]);
        }
        let envArr = data.env;
        if (envArr && envArr.length > 0) {
          this.env = data.env;
        }
        let server = data.servers;
        if (server && server.length > 0) {
          this.serverInfo = server;
        }
        let formatExecat = '';
        let formatNextat = '';
        if(data.execat){
          formatExecat = moment(data.execat).format('YYYY-MM-DD HH:mm:ss');
        }
        if(data.nextat){
          formatNextat = moment(data.nextat).format('YYYY-MM-DD HH:mm:ss');
        }
        let basicInfo = {
          'JobName': data.name,
          'Create Date': moment(data.createat).format('YYYY-MM-DD HH:mm:ss'),
          'Edit User': data.edituser || '',
          'Edit Date': moment(data.editat).format('YYYY-MM-DD HH:mm:ss'),
          // 'Description': data.description,
        };
        this.jobBasicInfo = [];
        for (let key in basicInfo) {
          this.jobBasicInfo.push({
            title: key,
            content: basicInfo[key]
          });
        }
        this.basicInfoDes = [{
          title: 'Description',
          content: data.description
        }]

        let commandInfo = {
          'Command': data.cmd,
          'Filename': data.filename || '',
        };
        this.commandInfo = [];
        for (let commandKey in commandInfo) {
          this.commandInfo.push({
            title: commandKey,
            content: commandInfo[commandKey]
          });
        }
        this.scheduleRuntimeInfo = [];
        let scheduleRuntime = {
          'Last Runtime': new RegExp("0001").test(formatExecat) ? '' : formatExecat,
          'Next Runtime': new RegExp("0001").test(formatNextat) ? '' : formatNextat,
        };
        for (let scheduleKey in scheduleRuntime) {
          this.scheduleRuntimeInfo.push({
            title: scheduleKey,
            content: scheduleRuntime[scheduleKey]
          });
        }
      })
      .catch(err => {
        messager.error(err.message || "Get job failed.");
        this._router.navigate(['/task', this.location, this.groupId, 'overview']);
      });
  }

  private downloadFile() {
    if (`${ConfAddress}` == `${Config.Prd}`) {
      DfisAddr = `${Config.DfisAddressPrd}`;
    } else {
      DfisAddr = `${Config.DfisAddress}`;
    }
    let url = `${DfisAddr}/cloudtask/jobs/${this.jobInfor.filename}`;
    window.open(url, "_blank");
  }


  private getGroupName() {
    this._groupService.getById(this.groupId)
      .then((res: any) => this.groupName = res.name)
      .catch(err => messager.error(err.message) || 'Get group name failed');
  }

  private activeJob(runtime: any, id: any, stat: any, name: any) {
    this._jobService.activeJob(runtime, id, stat)
      .then(data => {
        if (data == 200) {
          setTimeout(() => {
            this.getJob();
            let currentDate = Date.now();
            this.activityData.indate = currentDate;
            if (stat == 200) {
              this.activityData.content = `Stop job ${name} on ${this.groupName} on ${this.location}`;
            } else {
              this.activityData.content = `Start job ${name} on ${this.groupName} on ${this.location}`;
            }
            this._logService.postActivity(this.activityData);
            this.getJob();
            this._logService.getLog(false, this.jobId, this.fromdate, this.todate, this.pageIndex, this.pageSize)
            .then(res => {
              this.logs = res.rows;
              this.logs.forEach((log: any) => {
                let regexp = new RegExp("0001");
                if (regexp.test(log.execat)) {
                  log.execat = '';
                }
              })
            })
            .catch(err => {
              messager.error(err.message || "Get log failed.");
            });
          }, 100)
        }
      })
      .catch(err => messager.error(err.message));
  }

  private changeEnabled() {
    let postDate = this.jobInfor;
    postDate.enabled = postDate.enabled === 1 ? 0 : 1;
    this._jobService.update(postDate)
      .then(data => {
        messager.success('Succeed.');
        let currentDate = Date.now();
        this.activityData.indate = currentDate;
        if (postDate.enabled == 0) {
          this.activityData.content = `disabled job ${this.jobInfor.name} on ${this.groupName} on ${this.location}`;
        } else {
          this.activityData.content = `enabled job ${this.jobInfor.name} on ${this.groupName} on ${this.location}`;
        }
        this._logService.postActivity(this.activityData);
        this.getJob();
      })
      .catch((err: any) => {
        messager.error(err);
      });
  }

  private toggleDetailBox(logIndex: any) {
    if (this.detailId === logIndex) {
      this.detailId = null;
    } else {
      this.detailId = logIndex;
    }
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}

import { Component, ViewChild, ElementRef } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { LogService } from './../../services';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { JobService, DfisUploader, GroupService, AuthService } from './../../services';

declare let moment: any;
declare let messager: any;
declare let Config: any;
declare let ConfAddress: any;
declare let DfisAddr: any;

@Component({
  selector: 'task',
  styleUrls: ['./task-monitor.css'],
  templateUrl: './task-monitor.html',
})

export class TaskMonitorPage {

  private userInfo: any;
  private userName: any;
  private userFullName: any;

  private jobFilter: any;
  private searchTimeout: any;
  private tempJobs: Array<any> = [];
  private filterJobs: Array<any> = [];
  private currentStat: any;
  private pageSize: number = 15;
  private jobPageOption: any;
  private jobPageIndex: number = 1;
  private currentJobs: any;
  private selectedGroupId: any;
  private selectedGroup: any;
  private groupId: any;
  private groupName: any;
  private logs: Array<any> = [];
  private systemConfig: any;
  private locations: Array<any> = [];
  private location: any;
  private groups: Array<any> = [];
  private jobs: Array<any> = [];
  private detailId: any;
  private batchUpdateModalOptions: any;
  private jobNames: any = [];
  private fileName: any;
  private activityData: any;
  private inputValue: any;
  private batchSelectJobs: Array<any> = [];
  private allJobNames: Array<any> = [];
  private selectArr: Array<any> = [];
  private isAllJob: boolean = false;

  private subscriber: any;
  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _logService: LogService,
    private _jobService: JobService,
    private _dfisUploader: DfisUploader,
    private _authService: AuthService,
    private _groupService: GroupService) {
  }

  ngOnInit() {

    this.userInfo = this._authService.getUserInfoFromCache();
    this.userName = this.userInfo.UserName;
    this.userFullName = this.userInfo.FullName;

    this.selectedGroupId = 0;
    this.jobPageOption = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };
    this.batchUpdateModalOptions = {
      show: false,
      title: "Batch Update",
      hideCloseBtn: true,
      hideFooter: true
    };
    this.subscriber = this._route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.location = params['location'];
      this.getGroupName();
      setTimeout(() => {
        this.fresh();
      }, 100);
    });
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
  }

  private fresh() {
    this._jobService.getJobsOnGroup(this.groupId)
      .then(res => {
        this.jobs = res;
        this.allJobNames = this.jobs.map((job: any) => job.name);
        let regexp = new RegExp("0001");
        this.jobs.forEach((job: any) => {
          if (regexp.test(job.nextat)) {
            job.nextat = '';
          }
          if (regexp.test(job.execat)) {
            job.execat = '';
          }
        })
        let pageIndex = sessionStorage.getItem('pageIndex');
        this.jobPageIndex = Number(pageIndex) ? Number(pageIndex) : 1;
        let searchWords = sessionStorage.getItem('searchWords') || '';
        // this.allJob = true;
        let currentStat = (!sessionStorage.getItem('filterJobStat') || sessionStorage.getItem('filterJobStat') == 'null') ? 'all' : sessionStorage.getItem('filterJobStat');
        this.filterJobStat(currentStat);
        this.search(searchWords);
        this.setJobPage(this.jobPageIndex);
      })
      .catch(err => messager.error(err.message || 'Get job failed'))
  }

  ngAfterViewInit() {

  }

  private getGroupName() {
    this._groupService.getById(this.groupId)
      .then((res: any) => this.groupName = res.name)
      .catch(err => messager.error(err.message) || 'Get group name failed');
  }

  private changeEnabled(index: any, name: any) {
    let postDate = this.currentJobs[index];
    postDate.enabled = postDate.enabled === 1 ? 0 : 1;
    this._jobService.update(postDate)
      .then(data => {
        messager.success('Succeed.');
        this.fresh();
        let currentDate = Date.now();
        this.activityData.indate = currentDate;
        if (postDate.enabled == 0) {
          this.activityData.content = `disabled job ${name} on ${this.groupName} on ${this.location}`;
        } else {
          this.activityData.content = `enabled job ${name} on ${this.groupName} on ${this.location}`;
        }
        this._logService.postActivity(this.activityData);
        this._router.navigate(['/task', this.location, this.groupId, 'overview']);
      })
      .catch((err: any) => {
        messager.error(err);
      });
  }

  private activeJob(runtime: any, id: any, stat: any, name: any) {
    this._jobService.activeJob(runtime, id, stat)
      .then(data => {
        if (data == 200) {
          setTimeout(() => {
            this.fresh();
            let currentDate = Date.now();
            this.activityData.indate = currentDate;
            if (stat == 200) {
              this.activityData.content = `Stop job ${name} on ${this.groupName} on ${this.location}`;
            } else {
              this.activityData.content = `Start job ${name} on ${this.groupName} on ${this.location}`;
            }
            this._logService.postActivity(this.activityData);
          }, 100)
        }
      })
      .catch(err => messager.error(err.message));
  }

  private changeValue(e: any) {
    // console.log(e);
  }

  private getSelectedJobName() {
    let self = this;
    self.changeValue = function (value: any) {
      let tempt = [];
      if (value) {
        if(this.jobs.length > 1){
          tempt = value[0].split(',');
          if (tempt.length == this.jobs.length) {
            value = tempt;
            this.isAllJob = true;
          } else {
            this.isAllJob = false;
          }
        }
      }
      setTimeout(() => {
        $("#selectJobs").select2('destroy');
        $("#selectJobs").css('width', "100%");
        $("#selectJobs").select2({
          multiple: true,
          closeOnSelect: true,
          placeholder: 'Select Jobs',
          dropdownAutoWidth: true,
          tags: true,
        });
      }, 100);
      let index = self.jobNames.indexOf(value);
      self.jobNames = value;
      if (self.jobNames == null) {
        self.jobNames = [];
      }
      self.batchSelectJobs = [];
      self.selectArr = [];
      self.jobNames.forEach((job: any) => {
        self.selectArr.push(this.jobs.filter((item: any) => item.name == job)[0]);
      })
      if(self.selectArr.length){
        self.selectArr.forEach((item: any) => self.batchSelectJobs.push({ jobid: item.jobid }))
      }
      this.batchSelectJobs.forEach((job: any) => job.filename = this.fileName);
    }
    self.triggerChange();
  }

  private triggerChange() {
    $('#selectJobs').on('change', (e: any) => {
      this.changeValue($(e.target).val());
    })
  }

  private showUpdateModal() {
    this.batchUpdateModalOptions.show = true;
    setTimeout(() => {
      $("#selectJobs").css('width', "100%");
      $("#selectJobs").select2({
        multiple: true,
        closeOnSelect: true,
        placeholder: 'Select Jobs',
        dropdownAutoWidth: true,
        tags: true,
      });
      this.getSelectedJobName();
    }, 100);
  }

  private fileNameChange(value: any) {
    if (value) {
      if (value.target && value.target.files.length > 0) {
        this.inputValue = value.target.files[0];
      }
      if (value.target && value.target.value) {
        let arr = value.target.value.split('\\');
        this.fileName = arr[arr.length - 1];
        this.fileName = this.fileName.replace(/.tar/, '');
        this.fileName = this.fileName.replace(/.gz/, '');
        let date = moment(Date.now()).format('YYYY-MM-DD_HH-mm-ss');
        this.fileName = `${this.fileName}-${date}.tar.gz`;
      } else {
        this.fileName = '';
      }
      this.batchSelectJobs.forEach((job: any) => job.filename = this.fileName);
    }
  }

  private confirmBatchUpdate() {
    if (!this.fileName) {
      messager.error('Please select one file at least');
      return;
    }
    if (this.fileName && this.inputValue) {
      if (`${ConfAddress}` == `${Config.Prd}`) {
        DfisAddr = `${Config.DfisAddressPrd}`;
      } else {
        DfisAddr = `${Config.DfisAddress}`;
      }
      this._dfisUploader.upload(`${DfisAddr}/cloudtask/jobs/${this.fileName}`, this.inputValue, { disableLoading: false })
        .then((data: any) => {
          let putData = {
            location: this.location,
            edituser: this.userName,
            jobs: this.batchSelectJobs,
          }
          this._jobService.updateFiles(putData)
            .then(res => {

            })
            .catch(err => messager.error(err.message) || 'Update job file failed');
          this.jobNames = [];
          this.batchSelectJobs = [];
          $("#selectJobs").select2().val(null).trigger("change");
          this.inputValue = undefined;
          this.batchUpdateModalOptions.show = false;
        })
        .catch(err => messager.error(err.message) || 'Upload file failed');
    }
  }

  private cacelBatchUpdate() {
    this.jobNames = [];
    this.batchSelectJobs = [];
    $("#selectJobs").select2().val(null).trigger("change");
    this.inputValue = undefined;
    this.batchUpdateModalOptions.show = false;
  }

  private setJobPage(pageIndex: number) {
    sessionStorage.setItem('pageIndex', pageIndex.toString());
    this.jobPageIndex = pageIndex;
    if (!this.filterJobs) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentJobs = this.filterJobs.slice(start, end);
  }

  private jobFilterChange(value: any) {
    this.search(value);
    this.jobPageIndex = 1;
  }

  private search(value?: any) {
    this.jobFilter = value || '';
    sessionStorage.setItem('searchWords', this.jobFilter);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      let keyWord = this.jobFilter;
      if (!keyWord) {
        this.filterJobs = this.tempJobs;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterJobs = this.tempJobs.filter((item: any) => {
          return regex.test(item.name);
        });
      }
      this.setJobPage(this.jobPageIndex);
    }, 100);
  }

  private filterJobStat(value: any, isClick?: boolean) {
    sessionStorage.setItem('filterJobStat', value);
    this.tempJobs = this.jobs;
    this.currentStat = value;
    switch (value) {
      case 'running':
        this.tempJobs = this.jobs.filter((job: any) => job.enabled && job.stat == 200);
        break;

      case 'idle':
        this.tempJobs = this.jobs.filter((job: any) => job.enabled && job.stat == 0);
        break;

      case 'disabled':
        this.tempJobs = this.jobs.filter((job: any) => !job.enabled);
        break;

      case 'reallocating':
        this.tempJobs = this.jobs.filter((job: any) => job.enabled && job.stat == 202);
        break;

      case 'failed':
        this.tempJobs = this.jobs.filter((job: any) => job.enabled && job.stat == -1);
        break;
    }
    this.search();
    if (isClick) {
      this.setJobPage(1);
    }
  }

  private downloadFile(jobid:any, value: any) {
    if (`${ConfAddress}` == `${Config.Prd}`) {
      DfisAddr = `${Config.DfisAddressPrd}`;
    } else {
      DfisAddr = `${Config.DfisAddress}`;
    }
    let url = `api/file/${jobid}/${value}`;
    window.open(url, "_blank");
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}

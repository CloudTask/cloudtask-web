import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { AuthService, JobService, LocationService, GroupService, LogService, DfisUploader } from './../../../services';

declare let moment: any;
declare let messager: any;
declare let Config: any;
declare let ConfAddress: any;
declare let DfisAddr: any;

@Component({
  selector: 'job-info',
  templateUrl: './job-info.html',
  styleUrls: ['./job-info.css']
})

export class JobInfoPage {

  @ViewChild('secondSidebar')
  private secondSidebar: ElementRef;
  private sideBar: HTMLElement;

  private userInfo: any;
  private userName: any;
  private userFullName: any;
  private userEmail: any;

  private isNew: boolean;
  private isClone: boolean;
  private isEdit: boolean;
  private location: any;
  private groupId: any;
  private jobId: any;
  private groupName: any;
  private groupNewName: any;
  private uploader: any;
  private inputFile: any;
  private inputValue: any;

  private locations: Array<any> = [];
  private groupLocations: Array<any> = [];
  private submitted: boolean;
  private envSubmitted: boolean;
  private serverForm: FormGroup;
  private envForm: FormGroup;
  private groups: Array<any> = [];
  private addScheduleModalOptions: any = {};
  private runtimeError: boolean;
  private runtimeHasUpdate: boolean = false;
  private groupHasUpdate: boolean = false;
  private runtime: any;
  private scheduleArr: any = [];
  private fileArr: any = [];
  private customSelectFile: boolean = true;
  private newSchedule: any;
  // private currentFile: any;
  private groupInfo: any = {
    name: '',
    description: '',
    Runtime: '',
    targetServer: '',
    cmd: '',
    location: '',
    // currentFile:'',
    filename: '',
    enableJobFile: 0,
    inputFile: '',
    timeout: 0,
    files: [],
    selectFile: '',
    notifysetting: {
      succeed: {
        enabled: false,
        subject: 'Job Succeed',
        to: '',
        content: 'Job Succeed',
      },
      failed: {
        enabled: true,
        subject: 'Job Failed',
        to: '',
        content: 'Cloudtask Job failed, please check',
      },
    },
    owners: [],
    enabled: 1
  };
  private ipaddrs: Array<any> = [];

  private subscriber: any;
  private envModalOptions: any = {};
  private deleteJobModalOptions: any = {};
  private note: any = {
    selectTypeName: '',
    weekdayNote: '',
    monthNote: ''
  };
  private envInfo = {
    key: '',
    value: ''
  };
  private envIsNew: boolean = true;
  private envIndex: any;
  private envArr: Array<any> = [];
  private editScheInfo: any;
  private scheIndex: any;
  private scheIsNew: boolean = true;
  private activityData: any;
  private ownerGroups: Array<any> = [];
  private jobNames: Array<any> = [];
  private selectTargetSer: Array<any> = [];
  private targetServer: Array<any> = [];
  private serverArr: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService,
    private _jobService: JobService,
    private _logService: LogService,
    private _groupService: GroupService,
    private _locationServie: LocationService,
    private _dfisUploader: DfisUploader,
    private _fb: FormBuilder) {
  }

  ngOnInit() {
    this.userInfo = this._authService.getUserInfoFromCache();
    this.userName = this.userInfo.userid;
    this.userFullName = this.userInfo.fullname;
    this.userEmail = this.userInfo.email;

    this.groupInfo.notifysetting.succeed.to = this.userEmail;
    this.groupInfo.notifysetting.failed.to = this.userEmail;

    this._groupService.get()
      .then(res => {
        this.locations = res;
        this.groupLocations = this.locations.map((item: any) => item.location);
        this.isNew = !!this._route.snapshot.data['IsNew'];
        this.isClone = !!this._route.snapshot.data['IsClone'];
        this.isEdit = !!this._route.snapshot.data['IsEdit'];
        this.subscriber = this._route.params.subscribe(params => {
          this.location = params['location'];
          this.groupId = params['groupId'];
          this.jobId = params['jobId'];
          if (this.isNew) {
            this.groupInfo.location = this.location;
            this.groupInfo.groupid = this.groupId;
          }
          if (this.jobId) {
            this._jobService.getById(this.jobId)
              .then(data => {
                this.groupInfo = data;
                if (this.groupInfo.env) {
                  this.envArr = this.groupInfo.env.map((env: any) => {
                    return {
                      key: `${env.split('=')[0]}`,
                      value: `${env.split('=')[1]}`
                    }
                  })
                }
                this.scheduleArr = this.groupInfo.schedule;
                this.fileArr = this.groupInfo.files;
                this.targetServer = this.groupInfo.servers;
                this.buildForm();
              })
              .catch((err: any) => {
                messager.error(err.message || "Get job info failed.");
                this._router.navigate(['task', this.location, this.groupId, 'detail', this.jobId]);
              })
          } else {
            this.buildForm();
          }
          // this.currentFile = this.groupInfo.filename;
          this._groupService.getById(this.groupId)
            .then(res => {
              this.groupName = res.name;
              this.groupNewName = this.groupName;
            })
            .catch(err => this.groupName = '')
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

        this.envModalOptions = {
          show: false,
          title: 'Enviroment Variables',
          hideFooter: true,
          hideCloseBtn: true,
        }

        this.addScheduleModalOptions = {
          show: false,
          title: 'Schedule',
          hideFooter: true,
          hideCloseBtn: true,
        }

        this.deleteJobModalOptions = {
          show: false,
          title: "Warn",
          hideCloseBtn: true,
          hideFooter: true
        }
      })
      .catch(err => err.message || 'Get locations failed')
    // this.buildEnvForm();
  }

  selectedFileOnChanged(value: any) {
    if (value) {
      if (value.target && value.target.files.length > 0) {
        this.inputValue = value.target.files[0];
      }
      if (value.target && value.target.value) {
        let arr = value.target.value.split('\\');
        this.inputFile = arr[arr.length - 1];
        this.inputFile = this.inputFile.replace(/.tar/, '');
        this.inputFile = this.inputFile.replace(/.gz/, '');
        let date = moment(Date.now()).format('YYYY-MM-DD_HH-mm-ss');
        this.inputFile = `${this.inputFile}-${date}.tar.gz`;
      }
    }
  }

  private downloadFile() {
    if (`${ConfAddress}` == `${Config.Prd}`) {
      DfisAddr = `${Config.DfisAddressPrd}`;
    } else {
      DfisAddr = `${Config.DfisAddress}`;
    }
    let url = `${DfisAddr}/cloudtask/jobs/${this.serverForm.value.SelectFile}`;
    window.open(url, "_blank");
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $("#selectServers").select2({
        multiple: true,
        closeOnSelect: true,
        placeholder: 'Select Server',
        dropdownAutoWidth: true,
        tags: true,
        // createTag: function (params: any) {
        //   if (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/.test(params.term)) {
        //     return {
        //       id: params.term,
        //       text: params.term,
        //       newOption: true
        //     }
        //   } else {
        //     return;
        //   }
        // },
      });
      this.getSelectedJobName();
      if (this.targetServer) {                              //不等于null
        if (this.targetServer.length > 0 && this.jobId) {
          setTimeout(() => {
            this.serverArr.push(this.targetServer.map((server: any) => {
              let index = this.ipaddrs.indexOf(server);
              if (index > -1) {
                return `${index}: '${server}'`
              }
            }));
            $("#selectServers").val(this.serverArr[0]).trigger('change');
          }, 1000)
        }
      }
    }, 1000);
  }

  private changeValue(e: any) {

  }

  private getSelectedJobName() {
    let self = this;
    self.changeValue = function (value: any) {
      let index = self.jobNames.indexOf(value);
      self.jobNames = value;
      if (self.jobNames == null) {
        self.jobNames = [];
      }
    }
    $('#selectServers').on('change', (e: any) => {
      self.changeValue($(e.target).val());
    })
  }

  ngOnChanges(changeObj: any) {

  }

  private buildForm() {
    this.submitted = false;
    let data = this.groupInfo || {};
    if (data.notifysetting == null) {
      data.notifysetting = {
        succeed: {
          enabled: false,
          subject: 'Job Succeed',
          to: this.userEmail,
          content: 'Job Succeed',
        },
        failed: {
          enabled: false,
          subject: 'Job Failed',
          to: this.userEmail,
          content: 'Cloudtask Job failed, please check',
        },
      }
    }
    if (!data.notifysetting.succeed) {
      data.notifysetting.succeed = {
        enabled: false,
        subject: 'Job Succeed',
        to: this.userEmail,
        content: 'Job Succeed'
      }
    }
    if (!data.notifysetting.failed) {
      data.notifysetting.failed = {
        enabled: false,
        subject: 'Job Failed',
        to: this.userEmail,
        content: 'Cloudtask Job failed, please check',
      }
    }
    this.serverForm = this._fb.group({
      JobName: data.name || '',
      Description: data.description || '',
      TargetServer: data.targetServer || '',
      Command: data.cmd || '',
      Runtime: [{ value: (data.location ? data.location : ''), disabled: (this.isEdit) }],
      GroupId: data.groupid || '',
      CurrentFile: data.filename || '',
      InputFile: data.inputFile || '',
      // EnableJobFile: data.files ? (data.files.length ? true : false) : false,
      EnableJobFile: data.EnableJobFile || 0,
      SucceedSubject: data.notifysetting.succeed ? data.notifysetting.succeed.subject : 'Job Succeed',
      FailedSubject: data.notifysetting.failed ? data.notifysetting.failed.subject : 'Job Failed',
      SucceedTo: data.notifysetting.succeed ? data.notifysetting.succeed.to : this.userEmail,
      FailedTo: data.notifysetting.failed ? data.notifysetting.failed.to : this.userEmail,
      SucceedContent: data.notifysetting.succeed ? data.notifysetting.succeed.content : 'Job Succeed',
      FailedContent: data.notifysetting.failed ? data.notifysetting.failed.content : 'Cloudtask Job failed, please check',
      EnabledTimeout: data.timeout || 0,
      Timeout: data.timeout || 1,
      // Timeout: [{ value: (data.timeout ? data.timeout : 1),Validators(min(0)) }],
      NotifySuccessChecked: data.notifysetting.succeed ? (data.notifysetting.succeed.enabled === true ? true : false) : false,
      NotifyFailChecked: data.notifysetting.failed ? (data.notifysetting.failed.enabled === true ? true : false) : false,
      EnableJobRun: data.enabled === 1 ? 1 : 0,
      SelectFile: data.selectFile || '',
    });
    // if (!this.isImport) {
    setTimeout(() => {
      this.updateGroup(this.serverForm.controls.Runtime.value);
    });
    // }
    if (this.isClone) {
      this.serverForm.controls['JobName'].setValue('');
    }
  }

  private selectBatchFile(value: any) {
    if (value) {
      this.customSelectFile = false;
    } else {
      this.customSelectFile = true;
    }
  }

  private editEnv(index: any) {
    this.envModalOptions.show = true;
    setTimeout(() => {
      this.envIsNew = false;
      this.envIndex = index;
      let editEnvKey = this.envArr[index].key;
      let editEnvValue = this.envArr[index].value;
      this.envInfo = {
        key: editEnvKey,
        value: editEnvValue
      };
      this.buildEnvForm();
    });
  }

  private editSchedule(index: any) {
    this.addScheduleModalOptions.show = true;
    setTimeout(() => {
      this.scheIndex = index;
      this.scheIsNew = false;
      this.editScheInfo = this.scheduleArr[index];
    });
  }

  private updateGroup(value: any) {
    let groupIndex = 0;
    if (value && this.locations.length > 0) {
      this.locations.forEach((item: any, index: any) => {
        if (item.location == value) {
          groupIndex = index;
        }
      });
      this.groups = this.locations[groupIndex].group;
      if (this.groups.length) {
        this.ownerGroups = this.groups.filter((group: any) => group.owners && group.owners.indexOf(this.userName) > -1)
      }
      if (this.userInfo && this.userInfo.isadmin) {
        this.ownerGroups = this.groups;
      }
    }
    if (value) {
      this._locationServie.getServers(value)
        .then(res => {
          let servers = res;
          this.ipaddrs = servers.map((server: any) => server.name);
          this.ipaddrs = this.ipaddrs.concat(this.targetServer);
          this.ipaddrs.sort((a: any, b: any) => {
            return a > b ? 1 : -1;
          });
        })
        .catch(err => messager.error(err.message || "Get servers failed."))
    }
    setTimeout(() => {
      $("#selectServers").val([]).trigger('change');
    });
  }

  private refreshSelectedUser(data: any) {
    this.groupInfo.targetServer = data.value || [];
  }

  private onChangeGroup(value: any) {
    if (value) {
      this._groupService.getById(value)
        .then(res => {
          this.groupNewName = res.name;
          if (this.groupNewName != this.groupName) {
            this.groupHasUpdate = true;
          } else {
            this.groupHasUpdate = false;
          }
        })
        .catch(err => this.groupName = '')
    }
  }

  private buildEnvForm() {
    this.envSubmitted = false;
    let data: any = this.envInfo || {};
    this.envForm = this._fb.group({
      Key: data.key || '',
      Value: data.value || ''
    });
  }

  private showAddEnv() {
    this.envModalOptions.show = true;
    setTimeout(() => {
      this.envInfo = {
        key: '',
        value: ''
      };
      this.buildEnvForm();
    });
  }

  private confirmAdd() {
    this.envSubmitted = true;
    if (this.envForm && this.envForm.invalid) return;
    let envDetail = {
      key: this.envForm.value.Key,
      value: this.envForm.value.Value
    }
    if (this.envIsNew) {
      this.envArr.push(envDetail);
    } else {
      this.envArr[this.envIndex] = envDetail;
      this.envIsNew = true;
    }
    this.envModalOptions.show = false;
  }

  private removeFile() {
    this.serverForm.controls['CurrentFile'].setValue('');
    // this.currentFile = '';
  }

  private showAddSchedule() {
    this.addScheduleModalOptions.show = true;
    setTimeout(() => {
      this.scheIsNew = true;
    });
  }

  private showSchedule(e: any) {
    if (e) {
      this.newSchedule = e;
      if (this.scheIsNew) {
        this.scheduleArr.push(this.newSchedule);
      } else {
        this.scheduleArr[this.scheIndex] = this.newSchedule;
      }
    }
  }

  private deleteJob() {
    this.deleteJobModalOptions.show = true;
    setTimeout(() => {

    });
  }

  private confirmDelete() {
    this._jobService.remove(this.jobId)
      .then(data => {
        messager.success('Delete Succeed.');
        let currentDate = Date.now();
        this.activityData.content = `Delete job ${this.serverForm.value.JobName} on ${this.groupName} on ${this.location}`;
        this.activityData.indate = currentDate;
        this._logService.postActivity(this.activityData);
        this._jobService.clear();
        this._router.navigate(['/task', this.location, this.groupId, 'overview']);
      })
      .catch((err: any) => {
        messager.error(err.message || "Delete job failed.");
      });
  }

  private deleteEnv(index: any) {
    this.envArr.splice(index, 1);
  }

  private deleteSchedule(index: any) {
    this.scheduleArr.splice(index, 1);
  }

  private saveJobInfo() {
    let form = this.serverForm;
    this.selectTargetSer = this.jobNames.map((job: any) => {
      let newjob = job.replace(/\s+/g, "");
      return newjob.split(":")[1].replace(/\'/g, "");
    });
    let postEnv = this.envArr.map((obj: any) => `${obj.key}=${obj.value}`);
    let postFileName: any;
    let currentTimeOut: any;
    // if (this.inputFile) {
    //   postFileName = this.inputFile;
    // } else if (!this.inputFile && this.groupInfo) {
    //   postFileName = this.groupInfo.filename;
    // } else {
    //   postFileName = '';
    // }

    if (form.controls.EnableJobFile.value) {
      if (!this.customSelectFile) {
        postFileName = form.controls.SelectFile.value;
      } else if (this.customSelectFile && this.inputFile) {
        postFileName = this.inputFile;
      } else {
        postFileName = form.controls.CurrentFile.value;
      }
    } else if (!form.controls.EnableJobFile.value) {
      postFileName = form.controls.CurrentFile.value;
    } else {
      postFileName = '';
    }
    //timeout
    if (!form.controls.EnabledTimeout.value) {
      currentTimeOut = 0;
    } else {
      currentTimeOut = form.value.Timeout;
    }
    //notice secceed
    let currentSucceedSub: any;
    let currentSucceedTo: any;
    let currentSucceedContent: any;
    if (form.value.NotifySuccessChecked) {
      currentSucceedSub = form.value.SucceedSubject;
      currentSucceedTo = form.value.SucceedTo;
      currentSucceedContent = form.value.SucceedContent;
    } else {
      currentSucceedSub = this.groupInfo.notifysetting.succeed.subject;
      currentSucceedTo = this.groupInfo.notifysetting.succeed.to;
      currentSucceedContent = this.groupInfo.notifysetting.succeed.content;
    }
    //notice failed
    let currentFailedSub: any;
    let currentFailedTo: any;
    let currentFailedContent: any;
    if (form.value.NotifyFailChecked) {
      currentFailedSub = form.value.FailedSubject;
      currentFailedTo = form.value.FailedTo;
      currentFailedContent = form.value.FailedContent;
    } else {
      currentFailedSub = this.groupInfo.notifysetting.failed.subject;
      currentFailedTo = this.groupInfo.notifysetting.failed.to;
      currentFailedContent = this.groupInfo.notifysetting.failed.content;
    }
    let postData: any = {
      name: form.value.JobName,
      location: this.serverForm.controls.Runtime.value,
      groupid: form.value.GroupId,
      filename: postFileName,
      servers: this.selectTargetSer,
      cmd: form.value.Command,
      description: form.value.Description,
      timeout: currentTimeOut,
      enabled: form.value.EnableJobRun ? 1 : 0,
      env: postEnv,
      schedule: this.scheduleArr || [],
      notifysetting: {
        "succeed": {
          "enabled": form.value.NotifySuccessChecked,
          "subject": currentSucceedSub,
          "to": currentSucceedTo,
          "content": currentSucceedContent
        },
        "failed": {
          "enabled": form.value.NotifyFailChecked,
          "subject": currentFailedSub,
          "to": currentFailedTo,
          "content": currentFailedContent
        }
      }
    };

    if (this.isNew || this.isClone) {
      postData.createuser = this.userName;
      this._jobService.add(postData)
        .then(data => {
          messager.success('Add Succeed.');
          let currentDate = Date.now();
          this.activityData.content = `Add job ${this.serverForm.value.JobName} on ${this.groupNewName} on ${this.location}`;
          this.activityData.indate = currentDate;
          this._logService.postActivity(this.activityData);
          this._jobService.clear();
          this._router.navigate(['/task', this.location, this.groupId, 'overview']);
        })
        .catch((err: any) => {
          messager.error(err.message || "Add job failed.");
        });
    } else {
      postData.edituser = this.userName;
      postData.jobid = this.jobId;
      this._jobService.update(postData)
        .then(data => {
          messager.success('Update Succeed.');
          let currentDate = Date.now();
          if (this.groupHasUpdate) {
            this.activityData.content = `Update job ${this.serverForm.value.JobName} from ${this.groupName} to ${this.groupNewName} on ${this.location}`;
          } else {
            this.activityData.content = `Update job ${this.serverForm.value.JobName} on ${this.groupName} on ${this.location}`;
          }
          this.activityData.indate = currentDate;
          this._logService.postActivity(this.activityData);
          this._jobService.clear();
          this._router.navigate(['/task', this.location, this.groupId, 'detail', this.jobId]);
        })
        .catch((err: any) => {
          messager.error(err.message || "Update job failed.");
        });
    }
  }

  private save() {
    this.submitted = true;
    if (!this.runtimeHasUpdate) {
      this.runtimeError = true;
    }
    let form = this.serverForm;
    if (form.controls.JobName.invalid) return;
    if (form.controls.Description.invalid) return;
    if (form.controls.Runtime.invalid) return;
    if (form.controls.GroupId.invalid) return;
    if (form.controls.Command.invalid) return;
    if (form.controls.EnabledTimeout.value && form.controls.Timeout.invalid) return;
    if (form.controls.NotifySuccessChecked.value && (form.controls.SucceedSubject.invalid || form.controls.SucceedTo.invalid)) return;
    if (form.controls.NotifyFailChecked.value && (form.controls.FailedSubject.invalid || form.controls.FailedTo.invalid)) return;
    // if (form.invalid) return;
    if (this.inputFile && this.inputValue && form.controls.EnableJobFile.value && this.customSelectFile) {
      if (`${ConfAddress}` == `${Config.Prd}`) {
        DfisAddr = `${Config.DfisAddressPrd}`;
      } else {
        DfisAddr = `${Config.DfisAddress}`;
      }
      this._dfisUploader.upload(`${DfisAddr}/cloudtask/jobs/${this.inputFile}`, this.inputValue)
        .then((res: any) => {
          this.saveJobInfo();
        })
        .catch(err => {
          messager.error(err.message || 'Upload file failed');
        })
    } else {
      this.saveJobInfo();
    }
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
    // $("#selectServers").select2('destroy');
    $("#selectServers").val(['']).trigger('change');
  }
}

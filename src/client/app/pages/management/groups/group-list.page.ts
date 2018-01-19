import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, AuthService, LogService } from './../../../services';

declare let messager: any;
declare let Config: any;
declare let ConfAddress: any;

@Component({
  selector: 'ct-group-list',
  templateUrl: './group-list.html',
})

export class GroupListPage {

  private userInfo: any;
  private userName: any;
  private userFullName: any;

  private groupForm: FormGroup;
  private locations: Array<any> = [];
  private groups: Array<any> = [];
  private groupsInfo: Array<any> = [];
  private groupsInfoNew: Array<any> = [];
  private currentGroups: Array<any> = [];
  private filterGroups: Array<any> = [];
  private filterCondition: string;
  private pageSize: number = 14;
  private pageOptions: any;
  private owners: any = [];
  private groupSelected: any = {
    location: '',
    name: '',
    createuser: '',
    owners: [],
  };
  private submitted: boolean = false;
  private currentGroupLocation: any;
  private currentGroupId: any;
  private currentGroupName: any;
  private runtimeDisabled: boolean = false;
  private isSaveClicked: boolean = false;
  private groupInfoModal: any = {};
  private deleteGroupModalOptions: any = {};
  private isNewGroup: boolean = true;
  private jobNum: any = 0;
  private pageIndex: any;
  private runtimeValue: any = 'All';
  private currentIndex: any = 1;
  private activityData: any;

  private ownerSelect2Options: any;

  private showOperate: boolean = true;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _groupService: GroupService,
    private _logService: LogService,
    private _authService: AuthService,
    private _fb: FormBuilder) {
  }

  private getGroups(groups: any) {
    groups.sort((a: any, b: any) => {
      return a.location.toLowerCase() > b.location.toLowerCase() ? 1 : -1;
    });
    let data = groups.map((item: any) => {
      let groupArr = item.group;
      return groupArr.sort((a: any, b: any) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
      });
    });
    this.groupsInfo = [];
    data.forEach((dataItem: any, index: any) => {
      this.groupsInfo = this.groupsInfo.concat(dataItem.map((item: any) => {
        item.location = groups[index].location;
        return item;
      }));
    })
    this.groupsInfo.forEach((group: any) => {
      if (group && group.owners) {
        if (group.owners.length > 0) {
          if (group.owners.indexOf(this.userName) > -1) {
            group.isOwner = true;
          } else {
            group.isOwner = false;
          }
        }
      }
    });
    this.groupsInfoNew = this.groupsInfo;
    this.search();
  }

  ngOnInit() {

    this.userInfo = this._authService.getUserInfoFromCache();
    this.userName = this.userInfo.userid;
    this.userFullName = this.userInfo.fullname;

    this.ownerSelect2Options = {
      multiple: true,
      closeOnSelect: true,
      minimumInputLength: 2,
      placeholder: 'Select User',
      dropdownAutoWidth: true,
      ajax: {
        url: "/api/users/search",
        dataType: 'json',
        delay: 250,
        data: function (params: any) {
          return {
            q: params.term
          };
        },
        processResults: function (data: any, params: any) {
          return {
            results: data.map((item: any) => {
              return { "text": item.fullname, "id": item.userid };
            })
          };
        },
        cache: true
      },
      formatSelection: function (item: any) {
        if (!item) return;
        return `${item.useid} - ${item.fullname}`;
      }
    };

    this.groups = this._route.snapshot.data['groups'];
    this.locations = this.groups.map(group => group.location);
    this.getGroups(this.groups);
    this.groupsInfoNew = this.groupsInfo;
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true,
    };
    this.buildForm();
    this.groupInfoModal = {
      show: false,
      title: "Group",
      hideCloseBtn: true,
      hideFooter: true
    };
    this.deleteGroupModalOptions = {
      show: false,
      title: "Warn",
      hideCloseBtn: true,
      hideFooter: true
    };

    this.activityData = {
      server: '',
      location: this.currentGroupLocation || '',
      group: this.currentGroupId || '',
      type: 'group',
      content: '',
      userid: this.userName,
      fullname: this.userFullName,
      indate: 0
    }
  }

  private buildForm() {
    this.submitted = false;
    let data = this.groupSelected || {};
    this.groupForm = this._fb.group({
      groupLocation: data.location || '',
      // groupLocation: [{ value: (data.location ? data.location : ''), disabled: (!this.isNewGroup) }],
      groupName: data.name || '',
      groupOwners: data.owners || '',
    });
  }

  private selectRuntime(value: any) {
    this.runtimeValue = value;
    if (value == 'All') {
      this.groupsInfoNew = this.groupsInfo;
    } else {
      this.groupsInfoNew = this.groupsInfo.filter(group => group.location == value)
    }
    this.currentIndex = 1;
    this.search();
  }

  // private onKeyUp(value: any) {
  //   let start: any = 0, end: any = 4;
  //   if (!this.groupForm.controls.groupOwners.invalid) {
  //     if (!(value.length % 4) && value.length) {
  //       this.owner.push(value.slice(start, end));
  //       this.groupSelected.location = this.groupForm.controls.groupLocation.value;
  //       this.groupSelected.name = this.groupForm.controls.groupName.value;
  //       this.groupSelected.owners = '';
  //       this.buildForm();
  //       if (this.isSaveClicked) {
  //         this.submitted = !this.submitted;
  //       }
  //     } else {
  //       this.groupSelected.owners = value;
  //     }
  //   }
  // }


  private setPage(pageIndex: number) {
    this.pageIndex = pageIndex;
    if (!this.filterGroups) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentGroups = this.filterGroups.slice(start, end);
    this.currentGroups.some((group: any) => {
      if (group.isOwner || this.userInfo.IsAdmin) {
        return this.showOperate = true;
      } else {
        this.showOperate = false;
      }
    })
  }

  private searchTimeout: any;

  private search(value?: any) {
    this.filterCondition = value || '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      let keyWord = this.filterCondition;
      if (!keyWord) {
        this.filterGroups = this.groupsInfoNew;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterGroups = this.groupsInfoNew.filter(item => {
          return regex.test(item.name);
        });
      }
      this.setPage(this.currentIndex);
    }, 100);
  }

  private addNewGroup(e: any) {
    e.stopPropagation();
    e.preventDefault();
    this.groupInfoModal.show = true;
    this.isNewGroup = true;
    setTimeout(() => {
      this.groupSelected = {
        location: this.runtimeValue !== 'All' ? this.runtimeValue : '',
        name: '',
        createuser: '',
        owners: [],
      }
      this.owners = [];
      this.owners.push(this.userName);
      this.groupForm.controls['groupLocation'].enable();
      this.buildForm();
    });
  }

  private selectGroup(index: any) {
    this.groupInfoModal.show = true;
    setTimeout(() => {
      this.runtimeDisabled = true;
      this.groupSelected = {
        location: this.currentGroups[index].location || '',
        name: this.currentGroups[index].name || '',
        createuser: this.currentGroups[index].createuser || '',
      }
      this.isNewGroup = false;
      this.buildForm();

      this.currentGroupLocation = this.currentGroups[index].location;
      this.currentGroupId = this.currentGroups[index].id;
      let groupOwners = this.currentGroups[index].owners;
      if (groupOwners) {
        this.owners = groupOwners;
      } else {
        this.owners = [];
      }
    });
  }

  private refreshSelectedUser(data: any) {
    this.owners = data.value || [];
  }

  // private removeOwner(index: any) {
  //   this.owner.splice(index, 1);
  // }

  private newGroup() {
    this.groupSelected = {
      location: '',
      name: '',
      owners: '',
    };
    this.isNewGroup = true;
    this.buildForm();
  }

  private save() {
    this.isSaveClicked = true;
    this.submitted = true;
    this.groupSelected = {
      location: this.groupForm.controls.groupLocation.value,
      name: this.groupForm.controls.groupName.value,
      owners: this.owners,
      createuser: this.userName,
    }
    let form = this.groupForm;
    if (form.invalid) return;
    if (!this.owners.length) return;
    let postGroup = this.groupSelected;
    this.activityData.location = this.currentGroupLocation;
    this.activityData.group = this.currentGroupId;
    if (this.isNewGroup) {
      this._groupService.add(postGroup)
        .then(data => {
          messager.success('Add Succeed.');
          this.groupInfoModal.show = false;
          let currentDate = Date.now();
          this.activityData.content = `Add group ${this.groupForm.value.groupName} on ${this.groupForm.value.groupLocation}`;
          this.activityData.indate = currentDate;
          this._logService.postActivity(this.activityData);
          return this._groupService.get(true);
        })
        .then(data => {
          let groups = data;
          this.getGroups(groups);
          this.selectRuntime('All');
          this.currentIndex = 1;
          this.newGroup();
        })
        .catch((err: any) => {
          messager.error(err.message || 'Faild');
        })
    } else {
      postGroup.groupid = this.currentGroupId;
      postGroup.edituser = this.userName;
      this._groupService.update(postGroup)
        .then(data => {
          messager.success('Update Succeed.');
          this.groupInfoModal.show = false;
          let currentDate = Date.now();
          this.activityData.content = `Update group ${this.groupForm.value.groupName} on ${this.currentGroupLocation}`;
          this.activityData.indate = currentDate;
          this._logService.postActivity(this.activityData);
          return this._groupService.get(true);
        })
        .then(data => {
          let groups = data;
          this.getGroups(groups);
          this.selectRuntime(this.runtimeValue);
          this.currentIndex = this.pageIndex;
          this.newGroup();
        })
        .catch((err: any) => {
          messager.error(err.message || 'Faild');
        })
    }
  }

  private deleteGroup(index: any) {
    this.deleteGroupModalOptions.show = true;
    this.currentGroupLocation = this.currentGroups[index].location;
    this.currentGroupId = this.currentGroups[index].id;
    this.currentGroupName = this.currentGroups[index].name;
    this._groupService.getJobsById(this.currentGroupId)
      .then(data => {
        this.jobNum = data.length;
      })
      .catch(err => {
        messager.error(err);
      });
  }

  private confirmDelete(location: any, id: any) {
    this._groupService.remove(location, id)
      .then(data => {
        messager.success('Delete Succeed.');
        this.deleteGroupModalOptions.show = false;
        this.activityData.location = this.currentGroupLocation;
        this.activityData.group = this.currentGroupId;
        let currentDate = Date.now();
        this.activityData.content = `Delete group ${this.currentGroupName} on ${this.currentGroupLocation}`;
        this.activityData.indate = currentDate;
        this._logService.postActivity(this.activityData);
        return this._groupService.get(true);
      })
      .then(data => {
        let groups = data;
        this.getGroups(groups);
        this.currentIndex = 1;
        this.selectRuntime('All');
        this.newGroup();
      })
      .catch(err => {
        messager.error(err);
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, AuthService, UserService } from './../../../services';

declare let messager: any;
declare let Config: any;

@Component({
  selector: 'ct-user-list',
  templateUrl: './user-list.html',
})

export class UserListPage {

  private userInfo: any;
  private userName: any;
  private userFullName: any;

  private userForm: FormGroup;
  private groups: Array<any> = [];
  private groupsInfoNew: Array<any> = [];
  private currentGroups: Array<any> = [];
  private filterGroups: Array<any> = [];
  private filterCondition: string;
  private pageSize: number = 14;
  private pageOptions: any;
  private owner: any = [];
  private userSelected: any = {
    userid: '',
    fullname: '',
    password: '',
    department: '',
    email: '',
    isadmin: false
  };
  private submitted: boolean = false;
  private currentGroupLocation: any;
  private currentUserId: any;
  private isSaveClicked: boolean = false;
  private groupInfoModal: any = {};
  private deleteGroupModalOptions: any = {};
  private isNewGroup: boolean = true;
  private pageIndex: any;
  private runtimeValue: any = 'All';
  private currentIndex: any = 1;
  private activityData: any;


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _groupService: GroupService,
    private _userService: UserService,
    private _authService: AuthService,
    private _fb: FormBuilder) {
  }

  private getUsers(users: any) {
    users.sort((a: any, b: any) => {
      return a.userid.toLowerCase() > b.userid.toLowerCase() ? 1 : -1;
    });
    this.groupsInfoNew = users;
    this.search();
  }

  ngOnInit() {

    this.userInfo = this._authService.getUserInfoFromCache();
    this.userName = this.userInfo.userid;
    this.userFullName = this.userInfo.fullname;

    this.groups = this._route.snapshot.data['users'];
    this.getUsers(this.groups);
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true,
    };
    this.buildForm();
    this.groupInfoModal = {
      show: false,
      title: "User",
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
      group: this.currentUserId || '',
      type: 'group',
      content: '',
      userid: this.userName,
      fullname: this.userFullName,
      indate: 0
    }
  }

  private buildForm() {
    this.submitted = false;
    let data = this.userSelected || {};
    this.userForm = this._fb.group({
      UserId: data.userid || '',
      FullName: data.fullname || '',
      Password: data.password || '',
      Department: data.department || '',
      Email: data.email || '',
      IsAdmin: data.isadmin || false
    });
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
      this.userSelected = {
        userid: '',
        fullname: '',
        password: '',
        department: '',
        email: '',
        isadmin: false
      }
      this.userForm.controls['UserId'].enable();
      this.buildForm();
    });
  }

  private selectGroup(index: any) {
    this.groupInfoModal.show = true;
    setTimeout(() => {
      this.userSelected = {
        userid: this.currentGroups[index].userid || '',
        fullname: this.currentGroups[index].fullname || '',
        password: this.currentGroups[index].password || '',
        department: this.currentGroups[index].department || '',
        email: this.currentGroups[index].email || '',
        isadmin: this.currentGroups[index].isadmin || false,
      }
      this.isNewGroup = false;
      this.userForm.controls['UserId'].disable();
      this.buildForm();

      this.currentUserId = this.currentGroups[index].userid;
    });
  }

  private refreshSelectedUser(data: any) {
    this.userSelected.Owners = data.value || [];
  }

  private removeOwner(index: any) {
    this.owner.splice(index, 1);
  }

  private newGroup() {
    this.userSelected = {
      userid: '',
      fullname: '',
      password: '',
      department: '',
      email: '',
      isadmin: false
    };
    this.isNewGroup = true;
    this.buildForm();
  }

  private save() {
    this.isSaveClicked = true;
    this.submitted = true;
    this.userSelected = {
      userid: this.userForm.controls.UserId.value,
      fullname: this.userForm.controls.FullName.value,
      password: this.userForm.controls.Password.value,
      department: this.userForm.controls.Department.value,
      email: this.userForm.controls.Email.value,
      isadmin: this.userForm.controls.IsAdmin.value,
    }
    let form = this.userForm;
    if (form.invalid) return;
    let postUser = this.userSelected;
    if (this.isNewGroup) {
      if(!postUser.password){
        postUser.password = '123456';
      }
      this._userService.add(postUser)
        .then(data => {
          messager.success('Add Succeed.');
          this.groupInfoModal.show = false;
          let currentDate = Date.now();
          this.activityData.content = `Add user ${this.userForm.value.UserName}`;
          this.activityData.indate = currentDate;
          // this._groupService.postActivity(this.activityData);
          return this._userService.get(true);
        })
        .then(data => {
          let groups = data;
          this.getUsers(groups);
          this.currentIndex = 1;
          this.newGroup();
        })
        .catch((err: any) => {
          messager.error(err || 'Faild');
        })
    } else {
      postUser.userid = this.currentUserId;
      postUser.edituser = this.userName;
      this._userService.update(postUser)
        .then(data => {
          messager.success('Update Succeed.');
          this.groupInfoModal.show = false;
          let currentDate = Date.now();
          this.activityData.content = `Update user ${this.userForm.value.UserId}`;
          this.activityData.indate = currentDate;
          // this._groupService.postActivity(this.activityData);
          return this._userService.get(true);
        })
        .then(data => {
          let groups = data;
          this.getUsers(groups);
          this.currentIndex = this.pageIndex;
          this.newGroup();
        })
        .catch((err: any) => {
          messager.error(err || 'Faild');
        })
    }
  }

  private deleteGroup(index: any) {
    this.deleteGroupModalOptions.show = true;
    this.currentUserId = this.currentGroups[index].userid;
  }

  private confirmDelete(userid: any) {
    this._userService.remove(userid)
      .then(data => {
        messager.success('Delete Succeed.');
        this.deleteGroupModalOptions.show = false;
        let currentDate = Date.now();
        this.activityData.content = `Delete user ${this.userForm.value.UserId}}`;
        this.activityData.indate = currentDate;
        // this._groupService.postActivity(this.activityData);
        return this._userService.get(true);
      })
      .then(data => {
        let groups = data;
        this.getUsers(groups);
        this.currentIndex = 1;
        this.newGroup();
      })
      .catch(err => {
        messager.error(err);
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, LocationService, AuthService } from './../../../services';
import { userInfo } from 'os';


declare let messager: any;
declare let Config: any;

@Component({
  selector: 'hb-runtime-list',
  templateUrl: './runtime-list.html',
})

export class RuntimeListPage {

  private userInfo: any;
  private userName: any;

  private locationNames: Array<any> = [];
  private runtimeForm: FormGroup;
  private runtimeValue: any = 'All';
  private currentRuntimes: Array<any> = [];
  private filterRuntimes: Array<any> = [];
  private filterCondition: string;
  private groups: Array<any> = [];
  private runtimes: Array<any> = [];
  private locationGroup: Array<any> = [];
  private locationServer: Array<any> = [];
  private runtimeInfoModal: any = {};
  private deleteLocationModalOptions: any = {};
  private owners: any = [];
  private runtimeSelected: any = {
    location: '',
    description: '',
    owners: [],
    server: []
  };
  private pageOptions: any;
  private pageSize: number = 14;
  private pageIndex: any;
  private currentIndex: any = 1;
  private ownerSelect2Options: any;
  private isNewRuntime: boolean = true;
  private submitted: boolean = false;
  private invalidServerName: boolean = false;
  private invalidServerIP: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _locationService: LocationService,
    private _groupService: GroupService,
    private _authService: AuthService,
    private _fb: FormBuilder) {
  }

  ngOnInit() {
    this.userInfo = this._authService.getUserInfoFromCache();
    this.userName = this.userInfo.userid;

    this.groups = this._route.snapshot.data['groups'];
    this.getLocations()
    this.runtimeInfoModal = {
      show: false,
      title: "Runtime",
      hideCloseBtn: true,
      hideFooter: true
    };
    this.deleteLocationModalOptions = {
      show: false,
      title: "Warn",
      hideCloseBtn: true,
      hideFooter: true
    };
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true,
    };

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

    this.buildForm();

  }

  private getLocations() {
    this.runtimes = this.groups;
    this.runtimes.map((runtime: any) => {
      if (runtime && runtime.owners && !this.userInfo.isadmin) {
        if (runtime.owners.length > 0) {
          if (runtime.owners.indexOf(this.userName) > -1) {
            runtime.isRuntimeOwner = true;
          } else {
            runtime.isRuntimeOwner = false;
          }
        }
      }
    });
    this.search();
  }

  private buildForm() {
    this.submitted = false;
    let data = this.runtimeSelected || {};
    this.runtimeForm = this._fb.group({
      runtimeLocation: data.location || '',
      groupOwners: data.owners || '',
      runtimeDescription: data.description || '',
      servers: this._fb.array([])
    });
    if (data.server && data.server.length > 0) {
      for (let server of data.server) {
        this.addServer(server.name, server.ipaddr);
      }
    }
  }

  private chooseRuntime(value: any) {
    // this.pageIndex = 1;
    this.groups = this.runtimes;
    this.runtimeValue = value;
    if (value == 'All') {
      // this.groups = this.runtimes;
    } else {
      this.groups = this.groups.filter(group => group.location == value)
    }
    this.currentIndex = 1;
    this.search();
  }

  private setPage(pageIndex: number) {
    this.pageIndex = pageIndex;
    if (!this.filterRuntimes) return;
    let start = (pageIndex - 1) * this.pageSize;
    let end = start + this.pageSize;
    this.currentRuntimes = this.filterRuntimes.slice(start, end);
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
        this.filterRuntimes = this.groups;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterRuntimes = this.groups.filter(item => {
          return regex.test(item.location);
        });
      }
      this.setPage(this.currentIndex);
    }, 100);
  }

  private addNewRuntime(e: any) {
    e.stopPropagation();
    e.preventDefault();
    this.runtimeInfoModal.show = true;
    this.isNewRuntime = true;
    setTimeout(() => {
      this.runtimeSelected = {
        location: '',
        description: '',
        owners: []
      }
      this.owners = [];
      this.owners.push(this.userName);
      this.runtimeForm.controls['runtimeLocation'].enable();
      this.buildForm();
    });
  }

  private selectRuntime(index: any) {
    this.runtimeInfoModal.show = true;
    setTimeout(() => {
      this.runtimeSelected = {
        location: this.currentRuntimes[index].location || '',
        description: this.currentRuntimes[index].description || '',
        server: this.currentRuntimes[index].server || []
      };
      this.isNewRuntime = false;
      this.runtimeForm.controls['runtimeLocation'].disable();
      this.buildForm();

      let groupOwners = this.currentRuntimes[index].owners;
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

  private deleteRuntime(index: any) {
    this.deleteLocationModalOptions.show = true;
    this._locationService.getLocationGroup(this.groups[index].location)
      .then(data => {
        this.runtimeSelected = {
          location: this.groups[index].location || '',
          groups: data || [],
        }
      })
  }

  private confirmDelete(location: any) {
    this._locationService.remove(location)
      .then(data => {
        messager.success('Delete Succeed.');
        this.deleteLocationModalOptions.show = false;
        return this._groupService.get(true);
      })
      .then(data => {
        this.groups = data;
        this.getLocations();
      })
      .catch((err) => {
        messager.error(err || 'Delete failed');
      })
  }

  private serverNameValid() {
    let nameArr = this.runtimeForm.value.servers.map((item: any) => item.name);
    let isNameRepeated = nameArr.some((item: any, index: any) => item && nameArr.indexOf(item, index + 1) !== -1)
    if (isNameRepeated) {
      this.invalidServerName = true;
    } else {
      this.invalidServerName = false;
    }
}

  private serverIPValid(){
    let nameArr = this.runtimeForm.value.servers.map((item: any) => item.ipaddr);
    let isNameRepeated = nameArr.some((item: any, index: any) => item && nameArr.indexOf(item, index + 1) !== -1)
    if (isNameRepeated) {
      this.invalidServerIP = true;
    } else {
      this.invalidServerIP = false;
    }
  }

  private removeServer(index: number) {
    let control = <FormArray>this.runtimeForm.controls['servers'];
    control.removeAt(index);
    this.serverNameValid();
    this.serverIPValid();
  }

  private addServer(name?: string, ip?: string) {
    let control = <FormArray>this.runtimeForm.controls['servers'];
    let serverCtrl = this._fb.group({
      "name": name || '',
      "ipaddr": ip || ''
    });
    control.push(serverCtrl);
  }

  private newRuntime() {
    this.runtimeSelected = {
      location: '',
      owners: [],
      description: '',
      server: [],
    };
    this.isNewRuntime = true;
    this.buildForm();
  }

  private save() {
    let form = this.runtimeForm;
    let serverData = [];
    this.submitted = true;
    if (form.invalid) return;
    if (!this.owners.length) return;
    let runtimeInfo = form.value;
    let invalidServers = runtimeInfo.servers.filter((item: any) => {
      return !item.name && !item.ipaddr;
    });
    if (invalidServers.length > 0) return;
    if (this.invalidServerName || this.invalidServerIP) return;
    if(form.value.servers.length > 0) {
      serverData = form.value.servers.map((item: any) => {
        return {
          key: "",
          name: item.name,
          ipaddr: item.ipaddr,
          apiaddr: "",
          os: "",
          platform: "",
          status: 0
        }
      })
    }
    let postData = {
      location: form.controls.runtimeLocation.value,
      description: form.controls.runtimeDescription.value,
      group: this.locationGroup,
      owners: this.owners,
      server: serverData,
      createuser: '',
      edituser: '',
    }
    if (this.isNewRuntime) {
      postData.createuser = this.userName;
      postData.edituser = this.userName;
      this._locationService.add(postData)
        .then((data) => {
          messager.success('Add Succeed.');
          this.runtimeInfoModal.show = false;
          return this._groupService.get(true);
        })
        .then(data => {
          this.groups = data;
          this.getLocations();
          this.chooseRuntime('All');
          this.currentIndex = 1;
          this.newRuntime();
        })
        .catch((err) => {
          messager.error(err || 'Add failed');
        })
    } else {
      postData.edituser = this.userName;
      this._locationService.update(postData)
      .then((data) => {
        messager.success('Update Succeed.');
        this.runtimeInfoModal.show = false;
        return this._groupService.get(true);
      })
      .then(data => {
        this.groups = data;
        this.getLocations();
        this.chooseRuntime(this.runtimeValue);
        this.currentIndex = this.pageIndex;
        this.newRuntime();
      })
      .catch((err) => {
        messager.error(err || 'Update failed');
      })
    }
  }
}

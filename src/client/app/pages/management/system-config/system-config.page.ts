import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SystemConfigService } from './../../../services';
import { FormBuilder, FormGroup } from '@angular/forms';

declare let _: any;
declare let messager: any;
declare let ConfAddress: any;

@Component({
  selector: 'hb-system-config',
  templateUrl: './system-config.html',
  styleUrls: ['./system-config.css']
})

export class SystemConfigPage {

  private config: any = {};
  private owner: Array<any> = [];
  private ownersUser: any;
  private submitted: boolean = false;
  private systemForm: FormGroup;
  private adminUser: Array<any> = [];
  private selectedArr: Array<any> = [];
  private systemData: any = {
    userAdmin: ''
  };

  constructor(
    private _router: Router,
    private _systemConfig: SystemConfigService,
    private _fb: FormBuilder) {

  }

  ngOnInit() {
    this._systemConfig.get(true)
      .then(res => {
        this.owner = res;
      })
      .catch(err => messager.error(err.message || 'Get admin user failed'))
    this.buildForm();
  }

  private buildForm() {
    this.submitted = false;
    let data = this.systemData || {};
    this.systemForm = this._fb.group({
      UserAdmin: data.userAdmin || '',
    });
  }

  private removeOwner(index: any) {
    this.owner.splice(index, 1);
  }

  private keyupInput(value: any) {
    let start: any = 0, end: any = 4;
    if (!this.systemForm.controls.UserAdmin.invalid) {
      if (!(value.length % 4) && value.length) {
        this.owner.push(value.slice(start, end));
        this.systemData.userAdmin = '';
        this.buildForm();
      } else {
        this.systemData.userAdmin = value;
      }
    }
  }

  private save(form: any) {
    this.submitted = true;
    if (!this.owner.length) return;
    this._systemConfig.save({ admin: this.owner })
      .then((res: any) => {
        messager.success('Succeed');
      })
      .catch(err => messager.error(err.message || 'Update admin user failed'))
  }
}

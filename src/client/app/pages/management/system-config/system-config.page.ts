import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SystemConfigService } from './../../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'ct-system-config',
  templateUrl: './system-config.html',
  styleUrls: ['./system-config.css']
})
export class SystemConfigPage {

  private config: any = {};
  private submitted: boolean;
  private configForm: FormGroup;
  // private prdProxyName: any = '';
  // private prdProxyAddress: any = '';
  private configInfo: any = {
    dbAddress: {
      database: '',
      hostport: '',
      isAuthExist: false,
      auth: {
        username: '',
        password: ''
      },
      options: [],
    },
    centerAddress: ''
  };

  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _systemConfig: SystemConfigService) {

  }

  ngOnInit() {
    // this._systemConfig.get(true)
    // .then(config => this.config = config)
    this.buildForm();

  }

  private buildForm() {
    this.submitted = false;
    let data = this.configInfo || {};
    this.configForm = this._fb.group({
      Database: data.dbAddress.database,
      HostPort: data.dbAddress.hostPort,
      IsAuthExist: data.dbAddress.isAuthExist ? true : false,
      Username: data.dbAddress.auth.username || '',
      Password: data.dbAddress.auth.password || '',
      Options: this._fb.array([]),
    });
    if(data.dbAddress.options){
      let optionsCtrl = <FormArray>this.configForm.controls['Options'];
      data.dbAddress.options.forEach((item: any) => {
        optionsCtrl.push(this._fb.group({
          "Value": [item]
        }))
      });
    }
  }

  private addOption() {
    let control = <FormArray>this.configForm.controls['Options'];
    control.push(this._fb.group({
      "Value": ['']
    }));
  }

  private removeOption(index: any) {
    let control = <FormArray>this.configForm.controls['Options'];
    control.removeAt(index);
  }

  private save(form: any) {
    if (this.config.EnablePrivateRegistry && form.controls.privateRegistry.invalid) return;
    if (this.config.EnableOnlineImageBuild && form.controls.imageBuildApi.invalid) return;

    this._systemConfig.save(this.config)
      .then(res => {
        messager.success('Updated.');
      })
      .catch(err => {
        messager.error(err);
      });
  }
}

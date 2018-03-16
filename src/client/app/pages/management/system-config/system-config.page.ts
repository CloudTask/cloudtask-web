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
    this._systemConfig.get(true)
      .then(config => {
        this.configInfo = config;
        this.buildForm();
      })

  }

  private buildForm() {
    this.submitted = false;
    let data = this.configInfo || {};
    this.configForm = this._fb.group({
      Database: data.storagedriver.mongo.database,
      HostPort: data.storagedriver.mongo.hosts,
      Username: data.storagedriver.mongo.auth ? (data.storagedriver.mongo.auth.user || '') : '',
      Password: data.storagedriver.mongo.auth ? (data.storagedriver.mongo.auth.password || '') : '',
      IsAuthExist: data.storagedriver.mongo.auth ? (data.storagedriver.mongo.auth.user || data.storagedriver.mongo.auth.password ? true : false) : false,
      Options: this._fb.array([]),
      CenterAddress: data.centerhost || '',
      WebsiteHost: data.websitehost || '',
    });
    if (data.storagedriver.mongo.options) {
      let optionsCtrl = <FormArray>this.configForm.controls['Options'];
      data.storagedriver.mongo.options.forEach((item: any) => {
        optionsCtrl.push(this._fb.group({
          "Value": [item]
        }))
      });
    }
  }

  private authOption() {
    if (!this.configForm.controls.IsAuthExist.value) {
      this.configForm.controls['Username'].disable();
      this.configForm.controls['Password'].disable();
      this.configForm.controls['Username'].setValue('');
      this.configForm.controls['Password'].setValue('');
    } else {
      this.configForm.controls['Username'].enable();
      this.configForm.controls['Password'].enable();
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

  private save() {
    this.submitted = true;
    let form = this.configForm;
    if (form.controls.IsAuthExist.value) {
      console.log(form.controls.Username);
      if (form.invalid) return;
    } else {
      if (form.controls.Database.invalid || form.controls.HostPort.invalid || form.controls.Options.invalid
        || form.controls.CenterAddress.invalid || form.controls.WebsiteHost.invalid) return;
    }
    // if (this.config.EnablePrivateRegistry && form.controls.privateRegistry.invalid) return;
    // if (this.config.EnableOnlineImageBuild && form.controls.imageBuildApi.invalid) return;
    let data: any = {
      "websitehost": form.controls.WebsiteHost.value,
      "centerhost": form.controls.CenterAddress.value,
      "storagedriver": {
        "mongo": {
          "hosts": form.controls.HostPort.value,
          "database": form.controls.Database.value,
        }
      }
    };
    let options = form.controls.Options.value.map((item: any) => item.Value)
    data.storagedriver.mongo.options = options;
    if (form.controls.Username.value || form.controls.Password.value) {
      let auth = {
        "user": form.controls.Username.value,
        "password": form.controls.Password.value
      }
      data.storagedriver.mongo.auth = auth;
    }

    this._systemConfig.save(data)
      .then(res => {
        messager.success('Updated.');
      })
      .catch(err => {
        messager.error(err);
      });
  }
}

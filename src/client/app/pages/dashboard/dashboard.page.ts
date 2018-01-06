import { Component } from '@angular/core';
import { LogService, LocationService, SystemConfigService } from './../../services';

declare let messager: any;
declare let ConfAddress: any;

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.css'],
  templateUrl: './dashboard.html'
})

export class DashboardPage {

  private dashboardInfo: any = {};
  private logs: Array<any>;
  private mostUsedServers: Array<any>;
  private systemConfig: any;
  private countInfo: any = {};
  private pageSize: any = 10;
  private pageIndex: any = 1;

  constructor(
    private _logService: LogService,
    private _locationService: LocationService,
    private _systemConfigService: SystemConfigService) {

  }

  ngOnInit() {
    this._locationService.getDashboard()
      .then(res => {
        let data = res.data;
        this.countInfo = data;
      })
      .catch(err => {
        messager.error(err.message || 'Get dashboard info failed.');
      })
    this._logService.getActiveLog('', '', '', this.pageSize, this.pageIndex)
      .then(res => {
        this.logs = res.rows;
      })
      .catch(err => {
        messager.error(err.message || 'Get logs info failed.');
      });
  }

  ngOnDestroy() {

  }
}

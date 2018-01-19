import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, LogService } from './../../services';

declare let _: any;
declare let messager: any;

@Component({
  selector: 'ct-activity',
  templateUrl: './activity.html',
  styleUrls: ['./activity.css']
})

export class ActivityPage {

  private transfer: any;

  private locationGroups: Array<any> = [];
  private groups: Array<any> = [];
  private servers: Array<any> = [];
  private logs: Array<any> = [];

  private selectedLocation: string = '';
  private selectedGroupId: string = '';
  private selectedServer: string = '';
  private selectedType: string = '';

  private pageOptions: any;
  private pageSize: number = 20;
  private totalCount: number;

  private subscriber: any;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _groupService: GroupService,
    private _logService: LogService) {

  }

  ngOnInit() {
    this.subscriber = this._route.params.subscribe(params => {
      this.transfer = params['transfer'];
      if (this.transfer == 'transfer') {
        this._router.navigateByUrl('/');
      }
    });
    this.pageOptions = {
      "boundaryLinks": false,
      "directionLinks": true,
      "hidenLabel": true
    };
    this._groupService.get(true)
      .then(res => {
        this.locationGroups = res;
      })
      .catch(err => {
        messager.error(err.message || 'Get group info failed.');
      });

    this.setPage(1);
  }

  private getLogs(pageIndex: number) {
    let location = this.selectedLocation ? (this.selectedLocation === 'All' ? '' : this.selectedLocation) : '';
    let group = this.selectedGroupId ? (this.selectedGroupId === 'All' ? '' : this.selectedGroupId) : '';
    let type = this.selectedType ? (this.selectedType === 'All' ? '' : this.selectedType) : '';
    this._logService.getActiveLog(location, group, type, this.pageSize, pageIndex)
      .then(res => {
        let resData = res.data.rows;
        // this.logs = resData.sort((a: any, b: any) => {
        //   a.indate > b.indate ? -1 : 1;
        // })
        this.logs = resData;
        this.totalCount = res.total_rows;
      })
      .catch(err => {
        messager.error(err.message || 'Get logs info failed.');
      });
  }

  private selectedLocationChange(value: any) {
    this.selectedLocation = value || '';
    this.selectedGroupId = '';  //location改变时，group重置为空
    let groupIndex = 0;
    if (value) {
      this.locationGroups.forEach((item: any, index: any) => {
        if (item.location == value) {
          groupIndex = index;
        }
      });
      this.groups = this.locationGroups[groupIndex].group;
    }

    this.setPage(1);
  }

  private selectedGroupChange(value: any) {
    this.selectedGroupId = value || '';
    this.setPage(1);
  }

  private selectedTypeChange(value: any) {
    this.selectedType = value || '';
    this.setPage(1);
  }

  private search() {
    this.setPage(1);
  }

  private setPage(pageIndex: number) {
    this.getLogs(pageIndex);
  }

  ngOnDestroy() {
    this.subscriber.unsubscribe();
  }
}

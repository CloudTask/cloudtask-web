import { Component, ViewChild, ElementRef } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { JobService } from './../../../services';

declare let $: any;
declare let _: any;
declare let messager: any;

@Component({
  selector: 'hb-servers-info',
  templateUrl: './servers-info.html',
  styleUrls: ['./servers-info.css'],
  animations: [
    trigger('groupMenuState', [
      state('inactive', style({
        height: 0,
        display: 'block'
      })),
      state('active', style({
        height: '*',
        display: 'block'
      })),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out'))
    ])
  ]
})

export class ServersInfoPage {

  @ViewChild('groupTreePanel')
  private groupTreePanel: ElementRef;

  private selectedGroupId: any;
  private groups: Array<any>;
  private filterGroups: Array<any> = [];
  private currentGroups: Array<any> = [];
  private currentJobs: Array<any> = [];
  private filterJobs: Array<any> = [];
  private assignTableModalOptions: any = {};
  private locationName: any;
  private serverInfo: any;
  private searchTimeout: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _jobService: JobService) {

  }

  ngOnInit() {
    this.groups = this._route.snapshot.data['groups'];
    this.groups.sort((a: any, b: any) => {
      return a.location.toLowerCase() > b.location.toLowerCase() ? 1 : -1
    });

    this.assignTableModalOptions = {
      show: false,
      title: 'Assign Table',
      hideCloseBtn: false,
      hideFooter: true
    };
  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {
    if (!this.groups || this.groups.length === 0) return;
    $(window, ".wrapper").resize(() => {
      this.fixGroupTreePanel();
    });
    this.fixGroupTreePanel();
  }

  private serverInfoChange(value: any) {
    this.search(value);
  }

  private search(value?: any) {
    this.serverInfo = value || '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      let keyWord = this.serverInfo;
      if (!keyWord) {
        this.filterJobs = this.currentJobs;
      } else {
        let regex = new RegExp(keyWord, 'i');
        this.filterJobs = this.currentJobs.filter((item: any) => {
          return regex.test(item.jobname);
        });
      }
    }, 100);
  }

  private fixGroupTreePanel() {
    let panel = this.groupTreePanel.nativeElement;
    $(panel).slimScroll({ destroy: true }).height("auto");
    $(panel).slimscroll({
      height: ($(window).height() - $(".main-header").height()) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }

  private showAssignTable() {
    this.assignTableModalOptions.show = true;
    this._jobService.getJobsalloc(this.locationName)
      .then((res: any) => {
        this.currentJobs = res.data.alloc.data;
        if (this.currentGroups.length > 0 && this.currentJobs.length > 0) {
          let currentServerName = this.currentGroups[0].name;
          this.currentJobs.forEach(job => {
            job.name = this.currentGroups.filter(group => job.ipaddr == group.ipaddr)[0].name;
          });
        }
        this.currentJobs.sort((a: any, b: any) => {
          return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        });
        this.search();
      })
      .catch(err => messager.error(err))
  }

  private selectNode(groupId: any) {
    this.selectedGroupId = groupId;
    this.currentGroups = this.groups[groupId].server;
    this.currentGroups.sort((a: any, b: any) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
    this.locationName = this.groups[groupId].location;
    if (this.currentGroups.length > 0) {
      this.currentGroups.forEach(group => group.location = this.groups[groupId].location);
    }
  }
}

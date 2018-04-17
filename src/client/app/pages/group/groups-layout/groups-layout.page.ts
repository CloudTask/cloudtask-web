import { Component, ViewChild, ElementRef } from '@angular/core';
import { animate, trigger, state, style, transition } from '@angular/animations';
import { ActivatedRoute, Router, NavigationEnd, RoutesRecognized } from '@angular/router';
import { GroupService, AuthService, EventNotifyService, EventType } from './../../../services';

declare let $: any;
declare let _: any;
declare let messager: any;

@Component({
  selector: 'ct-groups-layout',
  styleUrls: ['./groups-layout.css'],
  templateUrl: './groups-layout.html',
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

export class GroupsLayoutPage {

  @ViewChild('groupTreePanel')
  private groupTreePanel: ElementRef;

  @ViewChild('secondSidebar')
  private secondSidebar: ElementRef;

  private sideBar: HTMLElement;

  private userName: any;
  private userInfo: any;

  private selectedGroupId: any;
  private locations: Array<any> = [];
  private groupArr: any;
  private groups: Array<any> = [];
  private selectedGroup: any;
  private ownerGroups: Array<any> = [];
  private currentGroups: Array<any> = [];
  private hasOwnerGroup: boolean = true;

  constructor(
    private _router: Router,
    private _eventNotifyService: EventNotifyService,
    private _authService: AuthService,
    private _groupService: GroupService) {

  }

  ngOnInit() {

    this.userInfo = this._authService.getUserInfoFromCache();
    this.userName = this.userInfo.userid;
    this._groupService.get(true)
      .then((res: any) => {
        this.locations = res;
        this.locations.sort((a: any, b: any) => {
          return a.location.toLowerCase() > b.location.toLowerCase() ? 1 : -1;
        });
        this.groupArr = this.locations[this.selectedGroupId];
        this.locations.forEach((item: any, index: any) => {
          let ownerGroup = {
            group: [''],
            isRuntimeOwner: false
          };
          ownerGroup.group = [];
          ownerGroup.group = item.group;
          if (this.locations[index].owners) {
            if (this.locations[index].owners.length > 0) {
              if (this.locations[index].owners.indexOf(this.userName) > -1) {
                ownerGroup.isRuntimeOwner = true;
              } else {
                ownerGroup.isRuntimeOwner = false;
              }
            }
          }
          this.groups.push(ownerGroup);
        });
        this.ownerGroups = this.groups;
        this.ownerGroups.forEach((item: any) => {
          item.group.sort((a: any, b: any): any => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          });
        })
        if (this.userInfo && !this.userInfo.isadmin && this.userName != 'guest') {
          this.ownerGroups.map((item: any) => {
            if (!item.isRuntimeOwner) {
              if (item.group.length > 0) {
                item.group = item.group.filter((group: any) => {
                  return group.owners && group.owners.length > 0 && group.owners.indexOf(this.userName) > -1;
                })
              } else {
                item.group = [];
              }
            }
          })
        }
        this.locations = this.locations.filter((location: any, index: any) => this.ownerGroups[index] && this.ownerGroups[index].group.length > 0);
        this.ownerGroups = this.ownerGroups.filter((item: any) => item.group && item.group.length > 0);
        this.ownerGroups = this.ownerGroups.map((item: any) => item = item.group);
        if (this.locations.length > 0) {
          this.hasOwnerGroup = true;
        } else {
          this.hasOwnerGroup = false;
        }
        $('body').scrollTop(0);
        let currentUrl = this._router.url;
        let paths = currentUrl.split('/');
        if (this.locations.length > 0) {
          this.locations.forEach((item: any, index: any) => {
            if (item) {
              if (item.location == paths[2]) {
                this.toggleMenus(index);
                return;
              }
            }
          });
        }

      })
      .catch(err => {
        messager.error(err.message || "Get locations failed");
      });
    this._eventNotifyService.subscribe(EventType.SidebarMini, (state: any) => {
      if (window.innerWidth < 767) {
        state = !state;
      }
      if (state) {
        $(this.sideBar).slimScroll({ destroy: true }).height("auto");
        this.sideBar.style.overflow = null;
      } else {
        this.fixSidebar();
      }
    });
  }

  private toggleMenus(groupIndex: any) {
    if (this.selectedGroupId === groupIndex) {
      this.selectedGroupId = null;
    } else {
      this.selectedGroupId = groupIndex;
    }
    // this.currentGroups = this.ownerGroups.filter((group: any) => group.location == value)
    this.groupArr = this.locations[this.selectedGroupId];
  }

  private showGroupSelect(index: any) {
    this.selectedGroup = index;
    sessionStorage.removeItem('pageIndex');
    sessionStorage.removeItem('searchWords');
    sessionStorage.removeItem('filterJobStat');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.secondSidebar) {
        this.sideBar = this.secondSidebar.nativeElement.querySelector('.sidebar');
        $(window, ".wrapper").resize(() => {
          this.fixSidebar();
        });
        this.fixSidebar();
      }
    }, 2500);
  }

  private fixSidebar() {
    $(this.sideBar).slimScroll({ destroy: true }).height("auto");
    $(this.sideBar).slimscroll({
      height: ($(window).height() - $(".main-header").height()) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }
}

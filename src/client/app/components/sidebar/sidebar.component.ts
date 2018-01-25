import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Router } from '@angular/router';
import { CusHttpService } from '../../services/custom-http.service';
import { AuthService, EventNotifyService, EventType } from './../../services';

declare let $: any;
declare let messager: any;
declare let ConfAddress: any;
declare let Config: any;
declare let DfisAddr: any;
declare let AppConfig: any;

@Component({
  selector: 'hb-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})

export class SideBarComponent {

  @ViewChild('mainSidebar')
  private mainSidebar: ElementRef;
  private sideBar: HTMLElement;

  @ViewChild('selectdrop') el:ElementRef;

  private groups: Array<Object>;
  private userInfo: any;
  private userName: any;
  private config: any;
  private envValue: any;

  private activeSubMenu: string = '';

  private subscribers: Array<any> = [];

  constructor(
    private http: CusHttpService,
    private _router: Router,
    private _renderer: Renderer,
    private _authService: AuthService,
    private _eventNotifyService: EventNotifyService) {

  }

  ngOnInit() {
    this.config = {};

    this.userInfo = this._authService.getUserInfoFromCache();
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
    let currentUrl = this._router.url;
    if (currentUrl.startsWith('/account')) {
      this.activeSubMenu = 'account';
    } else if (currentUrl.startsWith('/manage')) {
      this.activeSubMenu = 'manage';
    }
  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {
    this.sideBar = this.mainSidebar.nativeElement.querySelector('.sidebar');
    $(window, ".wrapper").resize(() => {
      this.fixSidebar();
    });
    this.fixSidebar();
  }

  private fixSidebar() {
    $(this.sideBar).slimScroll({ destroy: true }).height("auto");
    $(this.sideBar).slimscroll({
      height: ($(window).height() - $(".main-header").height()) + "px",
      color: "rgba(255,255,255,0.7)",
      size: "3px"
    });
  }

  private toggleSubMenu(element: HTMLElement, subMenuName: string) {
    if (this.activeSubMenu === subMenuName) {
      this.activeSubMenu = '';
    } else {
      this.activeSubMenu = subMenuName;
    }
    let isActive = element.classList.contains('active');
    this._renderer.setElementClass(element, 'active', !isActive);
  }

  private removeTaskpageSession(){
    sessionStorage.removeItem('jobPage');
    sessionStorage.removeItem('searchJobName');
  }
}

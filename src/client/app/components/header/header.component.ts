import { Component, Renderer } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, EventNotifyService, EventType } from './../../services';

declare let messager: any;

@Component({
  selector: 'hb-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {

  private userInfo: any;
  private userFullName: any;
  private userAvatar: any;

  private logoutModalOptions: any = {};

  constructor(
    private _renderer: Renderer,
    private _router: Router,
    private _authService: AuthService,
    private _eventNotifyService: EventNotifyService) {

  }

  ngOnInit() {
    this.userInfo = this._authService.getUserInfoFromCache();
    if (!this.userInfo) {
      this.userInfo.isadmin = false;
    }
    this.logoutModalOptions = {
      show: false,
      title: 'INFO',
      hideCloseBtn: true,
      hideFooter: true
    };
  }

  private toggleSidebar() {
    let bodyEle = document.body;
    let isMini = bodyEle.classList.contains('sidebar-collapse');
    this._renderer.setElementClass(bodyEle, 'sidebar-collapse', !isMini);
    this._renderer.setElementClass(bodyEle, 'sidebar-open', !isMini);
    this._eventNotifyService.notifyDataChanged(EventType.SidebarMini, !isMini);
  }

  private showLogoutModal() {
    this.logoutModalOptions.show = true;
    setTimeout(() =>{

    });
  }

  private logout() {
    this._authService.logout()
      .then(res => {
        this._router.navigate(['/login']);
      })
      .catch(err => {
        messager.error(err);
      });
  }
}

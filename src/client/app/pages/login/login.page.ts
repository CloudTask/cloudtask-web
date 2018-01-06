import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, CusHttpService } from './../../services';
import { IUserLogin } from './../../interfaces';

declare let messager: any;
declare let ConfAddress: any;

@Component({
  selector: 'login',
  styleUrls: ['./login.css'],
  templateUrl: './login.html'
})

export class LoginPage {

  private user: IUserLogin;
  private isLogin: boolean;
  private returnUrl: string;
  private redirectUrl: string;
  private userInfo: any;

  private subscribers: Array<any> = [];

  constructor(
    private _http: CusHttpService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService) {

  }

  ngOnInit() {
    let paramSub = this._route.queryParams.subscribe(params => {
      let token = params['t'];
      this.returnUrl = params['returnUrl'] || '/';
      if (!token) {
        this.signInAgain();
        return;
      }
      // localStorage.setItem('token', token);
      let postToken = JSON.stringify({ token: token })
      this._http.post('api/users/setToken', postToken)
        .then(res => {

        })
      this._authService.login(token, true)
        .then(data => {
          this.isLogin = true;
          setTimeout(() => {
            this._router.navigateByUrl(this.returnUrl);
            // if (localStorage.getItem('ConfAddress')) {
            //   ConfAddress = localStorage.getItem('ConfAddress');
            // }
            this._http.get('/api/transferEnv')
              .then(res => {
                let envConfig = res.json() ? res.json() : res;
                ConfAddress = envConfig.CurrentAddress;
              })
          }, 1000);
        })
        .catch(err => {
          messager.error(err || "Login failed");
        });
    });
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }

  private signInAgain() {
    let redirectUrl = `http://${location.host}/login?returnUrl=${this.returnUrl}`;
    location.href = `https://account.newegg.org/login?redirect_url=${encodeURIComponent(redirectUrl)}`;
  }
}

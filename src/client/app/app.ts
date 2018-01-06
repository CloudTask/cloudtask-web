import { Component } from "@angular/core";
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { AuthService } from './services';

@Component({
  selector: 'cloudtask-app',
  template: `
    <router-outlet></router-outlet>
  `
})

export class CloudtaskApp {
  constructor(
    private authService: AuthService,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics) {

  }

  ngOnInit() {

  }
}

import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from './../services';

@Injectable()
export class UserResolve implements Resolve<any> {

  constructor(private userService: UserService) { }

  resolve(route: ActivatedRouteSnapshot) {
    return this.userService.get(true);
  }
}

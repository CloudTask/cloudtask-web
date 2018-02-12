import { IsLogin, IsGroupOwner } from './auth-guard.service';
import { AuthService } from './auth.service';
import { GroupService } from './group.service';
import { UserService } from './user.service';
import { JobService } from './job.service';
import { DfisUploader } from './dfisUploader';
import { CusHttpService } from './custom-http.service';
import { GlobalLoadingService } from './global-loading.service';
import { LogService } from './log.service';
import { LocationService } from './location.service';
import { EventNotifyService } from './event-notify.service';
import { SystemConfigService } from './system-config.service';

export * from './auth-guard.service';
export * from './auth.service';
export * from './group.service';
export * from './user.service';
export * from './job.service';
export * from './dfisUploader';
export * from './custom-http.service';
export * from './global-loading.service';
export * from './log.service';
export * from './location.service';
export * from './event-notify.service';
export * from './system-config.service';

let Services: Array<any> = [
  IsLogin,
  IsGroupOwner,
  AuthService,
  GroupService,
  UserService,
  JobService,
  DfisUploader,
  CusHttpService,
  GlobalLoadingService,
  LogService,
  LocationService,
  EventNotifyService,
  SystemConfigService
]

export const SERVICES = Services;

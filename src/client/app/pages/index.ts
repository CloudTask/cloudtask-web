import { NgModule } from '@angular/core';
import { RootLayoutPage } from './root-layout/root-layout.page';
import { TaskMonitorPage } from './task/task-monitor.page';
import { DashboardPage } from './dashboard/dashboard.page';
import { ActivityPage } from './activity/activity.page';
import { JobInfoPage } from './job/job-edit/job-info.page';
import { JobDetailPage } from './job/job-detail/job-detail.page';
import { LoginPage } from './login/login.page';
import { GROUPPAGES } from './group'
import { JobLogPage } from './log/job-log.page';
import { SearchJobPage } from './search-job/search-job.page';
import { MANAGEPAGES } from './management';
import { ACCOUNTPAGES } from './account';
import { COMMONPAGES } from './common';

export * from './root-layout/root-layout.page';
export * from './dashboard/dashboard.page';
export * from './activity/activity.page';
export * from './task/task-monitor.page';
export * from './job/job-edit/job-info.page';
export * from './job/job-detail/job-detail.page';
export * from './login/login.page';
export * from './group';
export * from './log/job-log.page';
export * from './search-job/search-job.page';
export * from './management';
export * from './account';
export * from './common';

let Pages: Array<any> = [
  RootLayoutPage,
  DashboardPage,
  ActivityPage,
  TaskMonitorPage,
  JobInfoPage,
  JobDetailPage,
  LoginPage,
  SearchJobPage,
  ...GROUPPAGES,
  JobLogPage,
  ...MANAGEPAGES,
  ...ACCOUNTPAGES,
  ...COMMONPAGES
]

export const PAGES = Pages;

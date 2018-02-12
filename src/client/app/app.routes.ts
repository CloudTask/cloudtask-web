import { Routes, RouterModule } from '@angular/router';

import { IsLogin, IsGroupOwner } from './services';
import { GroupResolve, UserResolve } from './resolves';
import {
  RootLayoutPage,
  DashboardPage,
  ActivityPage,
  TaskMonitorPage,
  JobInfoPage,
  JobDetailPage,
  GroupListPage,
  SearchJobPage,
  RuntimeListPage,
  UserListPage,
  LoginPage,
  ServersInfoPage, GroupsLayoutPage,
  JobLogPage,
  SystemConfigPage,
  UserProfilePage, ChangePasswordPage,
  NotFoundPage, UnAuthorizedPage
} from './pages';

let routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: '', component: RootLayoutPage, canActivate: [IsLogin], canActivateChild: [IsLogin],
    children: [
      { path: '', component: DashboardPage },
      { path: 'dashboard', redirectTo: '/' },
      { path: 'activity', component: ActivityPage },
      {
        path: 'task', component: GroupsLayoutPage,
        resolve: { groups: GroupResolve },
        children: [
          { path: ':location/:groupId/detail/:jobId/job-log', component: JobLogPage },
          { path: ':location/:groupId/overview', component: TaskMonitorPage },
          { path: ':location/:groupId/new-job', component: JobInfoPage, data: { IsNew: true } },
          { path: ':location/:groupId/detail/:jobId/edit', component: JobInfoPage, data: { IsEdit: true } },
          { path: ':location/:groupId/detail/:jobId/clone', component: JobInfoPage, data: { IsClone: true } },
          { path: ':location/:groupId/import', component: JobInfoPage, data: { IsImport: true } },
          { path: ':location/:groupId/detail/:jobId', component: JobDetailPage, resolve: { groups: GroupResolve } },
        ]
      },
      {
        path: 'group', component: ServersInfoPage, canActivateChild: [IsGroupOwner],
        resolve: { groups: GroupResolve },
      },
      { path: 'search-job', component: SearchJobPage },
      { path: 'manage/runtimes', component: RuntimeListPage, resolve: { groups: GroupResolve }, data: { Admin: true } },
      { path: 'manage/groups', component: GroupListPage, resolve: { groups: GroupResolve } },
      { path: 'manage/users', component: UserListPage,  resolve: { users: UserResolve }, data: { Admin: true } },
      { path: 'manage/system-config', component: SystemConfigPage, data: { Admin: true } },

      { path: 'account/profile', component: UserProfilePage },
      { path: 'account/change-password', component: ChangePasswordPage },

      { path: '401', component: UnAuthorizedPage },
      { path: '404', component: NotFoundPage },
      { path: '**', component: NotFoundPage }
    ]
  }
];

export const AppRouting = RouterModule.forRoot(routes, { useHash: false });

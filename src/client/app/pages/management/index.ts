import { GroupListPage } from './groups/group-list.page';
import { RuntimeListPage } from './runtimes/runtime-list.page';
import { SystemConfigPage } from './system-config/system-config.page';

export * from './runtimes/runtime-list.page';
export * from './groups/group-list.page';
export * from './system-config/system-config.page';

export const MANAGEPAGES: Array<any> = [
  GroupListPage,
  RuntimeListPage,
  SystemConfigPage
]

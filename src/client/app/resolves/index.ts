import { GroupResolve } from './group.resolve';
import { UserResolve } from './user.resolve';
import { SystemConfigResolve } from './system-config.resolve';

export * from './group.resolve';
export * from './user.resolve';
export * from './system-config.resolve';

let Resolves: Array<any> = [
  GroupResolve,
  UserResolve,
  SystemConfigResolve
]

export const RESOLVES = Resolves;

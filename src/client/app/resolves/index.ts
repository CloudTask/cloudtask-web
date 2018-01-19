import { GroupResolve } from './group.resolve';
import { UserResolve } from './user.resolve';

export * from './group.resolve';
export * from './user.resolve';

let Resolves: Array<any> = [
  GroupResolve,
  UserResolve,
]

export const RESOLVES = Resolves;

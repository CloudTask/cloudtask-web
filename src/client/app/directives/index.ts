import { AutoScrollDirective } from './auto-scroll/auto-scroll.directive';
import { RouterActiveDirective } from './router-active/router-active.directive';
import { TimePickerDirective } from './time-picker/time-picker.directive';
import { DatePickerDirective } from './date-picker/date-picker.directive';

export * from './auto-scroll/auto-scroll.directive';
export * from './router-active/router-active.directive';

let Directives: Array<any> = [
  AutoScrollDirective,
  RouterActiveDirective,
  TimePickerDirective,
  DatePickerDirective
]

export const DIRECTIVES = Directives;

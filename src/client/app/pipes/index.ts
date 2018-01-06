import { OrderByPipe } from './order-by.pipe';
import { ObjLoopPipe } from './obj-loop.pipe';
import { IsEmptyObjPipe } from './is-empty-obj.pipe';
import { ImageNameFormatPipe } from './image-name-format.pipe';
import { FilterPipe } from './filter.pipe';
import { RelativeTimePipe } from './relative-time.pipe';
import { UpperFirstWordPipe } from './upper-first-word.pipe';
import { ScheduleInfoPipe } from './schedule-info.pipe';
import { LineFeedPipe } from './line-feed.pipe';

export * from './order-by.pipe';
export * from './obj-loop.pipe';
export * from './is-empty-obj.pipe';
export * from './image-name-format.pipe';
export * from './filter.pipe';
export * from './relative-time.pipe';
export * from './upper-first-word.pipe';
export * from './schedule-info.pipe';
export * from './line-feed.pipe';

let Pipes: Array<any> = [
  OrderByPipe,
  ObjLoopPipe,
  IsEmptyObjPipe,
  ImageNameFormatPipe,
  FilterPipe,
  RelativeTimePipe,
  UpperFirstWordPipe,
  ScheduleInfoPipe,
  LineFeedPipe
]

export const PIPES = Pipes;

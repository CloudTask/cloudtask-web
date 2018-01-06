import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './sidebar/sidebar.component';
import { ModalComponent, ModalHeaderComponent, ModalFooterComponent } from './modal/modal.cpmponent';
import { PaginationComponent } from './pagination/pagination.component';
import { TagsInputComponent } from './tags-input/tags-input.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ImportJobComponent } from './import-job/import-job.component';

let Components: Array<any> = [
  HeaderComponent,
  SideBarComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalFooterComponent,
  PaginationComponent,
  TagsInputComponent,
  ScheduleComponent,
  ImportJobComponent
]

export {
  HeaderComponent,
  SideBarComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalFooterComponent,
  PaginationComponent,
  TagsInputComponent,
  ScheduleComponent,
  ImportJobComponent
}

export const COMPONENTS = Components;

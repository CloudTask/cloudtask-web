import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scheduleInfo'
})

export class ScheduleInfoPipe implements PipeTransform {
  private groups: any = {};
  private baseUrl: string;
  private types: any = ['minutes', 'hours', 'days', 'weeks', 'months'];
  private weekdays: any = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  private count: any = ['last', 'first', 'second', 'third', 'fourth'];
  private months: any = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private selectedWeekdays: any;
  private selectedDays: any;

  transform(value: any): any {
    if (!value) {
      return value;
    }
    let scheduleInfor: any;
    let endDateValue = value.enddate || '';
    let selectTypeName = this.types[value.turnmode - 2];
    if (value.turnmode <= 3) {
      if (endDateValue) {
        scheduleInfor = `Occurs every ${value.interval} ${selectTypeName} between
          ${value.starttime} and ${value.endtime} every day. Starting ${value.startdate}, ending ${endDateValue}.`
      } else {
        scheduleInfor = `Occurs every ${value.interval} ${selectTypeName} between
          ${value.starttime} and ${value.endtime} every day. Starting ${value.startdate}.`
      }
    } else if (value.turnmode != 6) {
      if (value.selectat.length > 0 && value.turnmode == 5) {
        let selectedWeekdays: any = [];
        this.selectedDays = value.selectat.split(',');
        this.selectedDays = this.selectedDays.sort((a: any, b: any) => a > b ? 1 : -1)
        this.selectedDays.map((day: any) => {
          selectedWeekdays.push(this.weekdays[day]);
        });
        this.selectedWeekdays = selectedWeekdays.join(', ');
        if (value.enddate) {
          scheduleInfor = `At ${value.starttime} every ${this.selectedWeekdays} of every ${value.interval} ${selectTypeName}.
            Starting ${value.startdate}, ending ${value.enddate}.`;
        } else {
          scheduleInfor = `At ${value.starttime} every ${this.selectedWeekdays} of every ${value.interval} ${selectTypeName}.
            Starting ${value.startdate}.`
        }
      } else {
        if (value.enddate) {
          scheduleInfor = `At ${value.starttime} every ${value.interval} ${selectTypeName}. Starting ${value.startdate}, ending ${value.enddate}.`;
        } else {
          scheduleInfor = `At ${value.starttime} every ${value.interval} ${selectTypeName}. Starting ${value.startdate}.`;
        }
      }
    } else {
      let monthNote: any;
      if (value.monthlyof.day > 0) {
        monthNote = `first but ${Math.abs(value.monthlyof.day)}`;
      } else if (value.monthlyof.day < 0) {
        monthNote = `last but ${Math.abs(value.monthlyof.day)}`;
      } else {
        let monthlySeq = value.monthlyof.week.split(':');
        monthNote = `${this.count[monthlySeq[0]]} ${this.weekdays[monthlySeq[1]]}`
      }
      if (value.enddate) {
        scheduleInfor = `At ${value.starttime} on the ${monthNote} of every month. Starting ${value.startdate}, ending ${value.enddate}.`
      }else{
        scheduleInfor = `At ${value.starttime} on the ${monthNote} of every month. Starting ${value.startdate}.`
      }
    }
    return scheduleInfor;
  }
}

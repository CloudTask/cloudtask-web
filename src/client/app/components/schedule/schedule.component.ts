import { Component, ViewChild, Output, ElementRef, EventEmitter, Input, forwardRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

declare let $: any;
declare let messager: any;
declare let moment: any;

@Component({
  selector: 'ct-schedule',
  templateUrl: './schedule.html',
  styleUrls: ['/schedule.css']
})

export class ScheduleComponent {

  @Input()
  private options: any = {};

  private _editScheInfo: any;
  @Input()
  set editScheInfo(value: any) {
    this._editScheInfo = value;
    this.initScheInfo(this._editScheInfo);
  }
  get editScheInfo(): any {
    return this._editScheInfo;
  }

  private _scheIsNew: boolean;
  @Input()
  set scheIsNew(value: any) {
    this._scheIsNew = value;
    this.newSche(this._scheIsNew);
    this.close
  }
  get scheIsNew(): any {
    return this._scheIsNew;
  }

  private editInfo: any;
  private $el: any;
  private id: any;
  private showModal: any;
  private scheduleForm: FormGroup;
  private disabled: any;
  private weekdays: Array<any>;
  private weekdaysCheck: Array<any> = [];
  private startTimeValue: any = '0:00';
  private endTimeValue: any = '23:59';
  private selectedDays: Array<any> = [2, 3, 4, 5, 6];
  private selectedMonths: Array<any> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  private months: Array<any>;
  private monthlyof: any = 'day';
  private monthlyofDay: any;
  private monthlyofWeek: any;
  private startDateValue: any = '';
  private endDateValue: any = '';
  private scheduleInfo: any = {
    turnMode: 3,
    every: 1,
    selectTypes: ['minutes', 'hours', 'days', 'weeks', 'months'],
    startTime: '',
    endTime: '',
    date: '',
    monthType: 'day',
    monthlyDaySeq: 'first',
    monthlyDays: 1,
    monthlyWeekSeq: '1',
    monthlyWeekdays: '1',
    startDate: '',
    endDate: '',
  }
  private selectTypes: Array<any>;
  private selectTypeName: any;
  private selectedWeekdays: any;
  private count: Array<any>;
  private searchTimeout: any;
  private scheduleIsNew: boolean = true;

  @Output()
  private addSchedule: EventEmitter<any> = new EventEmitter();

  constructor(private elementRef: ElementRef,
    private _fb: FormBuilder) {
  }

  ngOnInit() {
    let today = new Date()
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    this.startDateValue = mm + '/' + dd + '/' + yyyy;
    this.scheduleInfo.startDate = this.startDateValue;
    this.scheduleInfo.startTime = '0:00';
    this.scheduleInfo.endTime = '23:59'
    this.selectTypes = ['minutes', 'hours', 'days', 'weeks', 'months'];
    this.count = ['last', 'first', 'second', 'third', 'fourth']
    this.weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.$el = $('#timepicker2');
    this.weekdaysCheck.push();
    this.buildForm();
  }

  private initScheInfo(value: any) {
    if (value) {
      this.id = value.id;
      let monthlyDaySeq: any, monthlyDays: any, monthlyWeekSeq: any, monthlyWeekdays: any;
      if (value.monthlyof.day > 0) {
        monthlyDaySeq = 'first';
      } else if (value.monthlyof.day < 0) {
        monthlyDaySeq = 'last';
      } else {
        monthlyWeekSeq = value.monthlyof.week.split(':')[0];
        monthlyWeekdays = value.monthlyof.week.split(':')[1];
      }
      monthlyDays = Math.abs(value.monthlyof.day);
      this.scheduleInfo = {
        turnMode: value.turnmode,
        every: value.interval,
        selectTypes: ['minutes', 'hours', 'days', 'weeks', 'months'],
        startTime: value.starttime,
        endTime: value.endtime,
        date: '',
        monthType: value.monthlyof.day == 0 ? 'week' : 'day',
        monthlyDaySeq: monthlyDaySeq || 'first',
        monthlyDays: monthlyDays || 1,
        monthlyWeekSeq: monthlyWeekSeq || '1',
        monthlyWeekdays: monthlyWeekdays || '1',
        startDate: value.startdate,
        endDate: value.enddate
      };
      this.buildForm();
      setTimeout(() => {
        this.scheduleForm.controls['MonthType'].setValue(this.scheduleInfo.monthType);
        this.choseMonthly(this.scheduleInfo.monthType);
        this.scheduleForm.controls['MonthlyWeekSeq'].setValue(this.scheduleInfo.monthlyWeekSeq);
        this.scheduleForm.controls['MonthlyWeekdays'].setValue(this.scheduleInfo.monthlyWeekdays);
        if(value.selectat && value.turnmode === 5){
          this.selectedDays = value.selectat.split(",").map((item: any) => Number(item));
        }else{
          this.selectedDays = [2, 3, 4, 5, 6];
        }
        if(value.selectat && value.turnmode === 6){
          this.selectedMonths = value.selectat.split(",").map((item: any) => Number(item));
        }else{
          this.selectedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }
      }, 50);

    }
  }

  private newSche(value: any) {
    if (value) {
      this.id = '';
      this.scheduleInfo = {
        turnMode: 3,
        every: 1,
        selectTypes: ['minutes', 'hours', 'days', 'weeks', 'months'],
        startTime: '0:00',
        endTime: '23:59',
        monthType: 'day',
        monthlyDaySeq: 'first',
        monthlyDays: 1,
        monthlyWeekSeq: '1',
        monthlyWeekdays: '1',
        startDate: this.startDateValue,
        endDate: ''
      };
      this.selectedDays = [2, 3, 4, 5, 6];
      this.selectedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      setTimeout(() => {
        this.buildForm();
      }, 50);

    } else {
      this.initScheInfo(this._editScheInfo);
    }
  }

  ngOnChange(obj: any) {

  }

  private showTimePicker() {

  }

  private buildForm() {
    let data = this.scheduleInfo || {};
    this.scheduleForm = this._fb.group({
      Type: data.turnMode || 3,
      Every: data.every || 1,
      SelectTypeName: data.selectTypes[data.turnMode - 2] || '',
      StartTime: data.startTime || '0:00',
      EndTime: data.endTime || '23:59',
      Date: data.date || '',
      MonthType: data.monthType || '',
      MonthlyDaySeq: data.monthlyDaySeq || '',
      MonthlyDays: data.monthlyDays || 1,
      MonthlyWeekSeq: data.monthlyWeekSeq || '',
      MonthlyWeekdays: data.monthlyWeekdays || '',
      StartDate: data.startDate || '',
      EndDate: data.endDate || '',
    });
    this.choseMonthly(data.monthType);
  }

  private changeType(value: any) {
    let index = this.scheduleForm.value.Type - 2;
    let selectedType = this.scheduleInfo.selectTypes[index];
    this.scheduleForm.controls['SelectTypeName'].setValue(selectedType);
  }

  private toggleSelection(value: any) {
    let index = this.selectedDays.indexOf(value);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    }
    else {
      this.selectedDays.push(value);
    }
  }

  private toggleSelectionMonth(value: any) {
    let index = this.selectedMonths.indexOf(value);
    if (index > -1) {
      this.selectedMonths.splice(index, 1);
    }
    else {
      this.selectedMonths.push(value);
    }
  }

  private selectedDay() {

  }

  private choseMonthly(value: any) {
    if (value == 'day') {
      this.scheduleForm.controls['MonthlyDaySeq'].enable();
      this.scheduleForm.controls['MonthlyDays'].enable();
      this.scheduleForm.controls['MonthlyWeekSeq'].disable();
      this.scheduleForm.controls['MonthlyWeekdays'].disable();
    } else {
      this.scheduleForm.controls['MonthlyDaySeq'].disable();
      this.scheduleForm.controls['MonthlyDays'].disable();
      this.scheduleForm.controls['MonthlyWeekSeq'].enable();
      this.scheduleForm.controls['MonthlyWeekdays'].enable();
    }
    this.monthlyof = value;
  }

  private emptyEndDate() {
    this.scheduleForm.controls['EndDate'].setValue('');
  }

  private close() {
    this.options.show = false;
    if (this._scheIsNew) {
      this.newSche(true);
    }
  }

  private save() {
    let form = this.scheduleForm;
    let startValue: any, endValue: any;
    startValue = form.value.StartTime.split(":");
    endValue = form.value.EndTime.split(":");
    if (form.value.Type <= 3 && Number(endValue[0]) < Number(startValue[0])) {
      messager.error('End time must be greater than start time');
      return;
    } else if (form.value.Type <= 3 && Number(endValue[0]) == Number(startValue[0])) {
      if (Number(endValue[1]) <= Number(startValue[1])) {
        messager.error('End time must be greater than start time');
        return;
      }
    }

    let startString: any, endString: any;
    if (startValue[0].length == 1) {
      startValue[0] = '0' + startValue[0];
    }
    if (endValue[0].length == 1) {
      endValue[0] = '0' + endValue[0];
    }
    startString = startValue.join(':');
    endString = endValue.join(':');
    if (form.value.EndDate && moment(new Date(form.value.EndDate)) <= moment(new Date(form.value.StartDate))) {
      messager.error('End date must be greater than start date');
      return;
    }
    let selectAt: any = '';
    if (form.value.Type == '5') {
      selectAt = this.selectedDays.join(',');
    }
    if (form.value.Type == '6') {
      selectAt = this.selectedMonths.join(',');
    }
    this.showModal = false;
    if (this.monthlyof == 'day') {
      if (form.value.MonthlyDaySeq == 'first') {
        this.monthlyofDay = form.value.MonthlyDays;
      } else {
        this.monthlyofDay = -form.value.MonthlyDays;
      }
    } else {
      this.monthlyofDay = 0;
    }
    if (this.monthlyof == 'week' && form.value.Type == '6') {
      this.monthlyofWeek = `${form.value.MonthlyWeekSeq}:${form.value.MonthlyWeekdays}`;
    } else {
      this.monthlyofWeek = '';
    }
    let newScheduleDate = {
      id: '',
      enabled: 1,
      turnmode: Number(form.value.Type) || 3,
      interval: form.value.Every || 1,
      starttime: startString || '',
      endtime: endString || '',
      startdate: form.value.StartDate || '',
      enddate: form.value.EndDate || '',
      selectat: selectAt || '',
      monthlyof: {
        day: this.monthlyofDay,
        week: this.monthlyofWeek
      }
    }
    newScheduleDate.id = this.id || '';
    this.addSchedule.emit(newScheduleDate);
    this.options.show = false;
    if (this._scheIsNew) {
      this.newSche(true);
    }
  }
}

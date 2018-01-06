import { Directive, ElementRef, OnInit, Input, forwardRef, OnChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export const TIME_PICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TimePickerDirective),
  multi: true
};

@Directive({
  selector: '[ct-time-picker]',
  providers: [TIME_PICKER_VALUE_ACCESSOR]
})

export class TimePickerDirective implements OnInit, OnChanges, ControlValueAccessor {

  private $el: any;
  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;

  @Input()
  private timeValue: any;

  constructor(private elementRef: ElementRef) {
  }

  private emitValue() {
    this.onChange(this.timeValue);
  }

  ngOnInit() {
    let self = this;
    let $ = window['jQuery'];
    this.$el = $(this.elementRef.nativeElement);
    this._initDatepicker();
  }
  ngOnChanges(changesObj: any) {

  }
  private _buildOptions() {
    let options: any = {
      template: 'dropdown',
      appendWidgetTo: 'body',
      showMeridian: false,
    }
    return options;
  }

  private changeValue(e: any) {
  }
  private _initDatepicker() {
    let opt = this._buildOptions();
    let self = this;
    self.changeValue = function (value: any) {
      self.onChange(value.currentTarget.value);
    }
    this.$el.timepicker(opt).on('changeTime.timepicker', function (e: any) {
      self.changeValue(e);
    });
  }
  public writeValue(value: any): void {
    let $ = window['jQuery'];
    let val: any;
    if (value) {
      val = value;
    } else {
      val = '';
    }
    this.$el.val(val);
  }
  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }
  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }
}

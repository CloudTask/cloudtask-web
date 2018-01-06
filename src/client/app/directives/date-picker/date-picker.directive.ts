import { Directive, ElementRef, OnInit, Input, forwardRef, OnChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
export const DATE_PICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerDirective),
  multi: true
};
@Directive({
  selector: '[ct-date-picker]',
  providers: [DATE_PICKER_VALUE_ACCESSOR]
})
export class DatePickerDirective implements OnInit, OnChanges, ControlValueAccessor {

  private $el: any;
  private format: string = 'mm/dd/yy';
  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;

  @Input()
  private value: any;

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit() {
    let self = this;
    let $ = window['jQuery'];
    this.$el = $(this.elementRef.nativeElement);
    this._initDatepicker();
  }

  ngOnChanges(changesObj: any) { }
  private _buildOptions() {
    let options: any = {
      format: 'mm/dd/yyyy'
    }
    return options;
  }

  private changeValue(e: any) {
    // console.log(e);
  }

  private _initDatepicker() {
    let $ = window['jQuery'];
    let opt = this._buildOptions();
    let self = this;
    self.changeValue = function (value: any) {
      self.onChange(value);
    }
    this.$el.datepicker({
      format: 'mm/dd/yyyy'
    });
    this.$el.datepicker('setDate', this.value);
    this.$el.datepicker(opt).on('changeDate', function (e: any) {
      let date = $(this).datepicker('getFormattedDate');
      $(this).datepicker('hide');
      self.changeValue(date);
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

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lineFeed'
})

export class LineFeedPipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
        return;
      }
      let newValue = value;
      // newValue = newValue.replace(/↵\s+/g, '<br>');
      // newValue = newValue.replace(/\n\s+/g, '');
      newValue = newValue.replace(/↵/g, '<br>');
      // newValue = newValue.replace(/\s{2,}/g, '<br>');
      newValue = newValue.replace(/\r\n/g, '<br>');
      newValue = newValue.replace(/\n/g, '<br>');
      // newValue = newValue.replace(/\r/g, '<br>');
      newValue = newValue.replace(/<</g, '&lt;&lt;');
      let regexp = /^<br>/g;
      if (regexp.test(newValue)) {
        newValue = newValue.replace(/<br>/, '');
      }
      return `${newValue}`;
  }
}

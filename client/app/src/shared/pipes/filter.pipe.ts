import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], field: any, value: any): any[] {
    if (!items) return [];
    if (value === undefined || value === null || value === '') return items;

    return items.filter(item => {
      for (const key in item) {
        if (key === field) {
          const fieldValue = item[key];

          // If value is a boolean, compare directly without using .includes
          if (typeof value === 'boolean') {
            if (fieldValue === value) {
              return true;
            }
          } else if (typeof fieldValue === 'string' || Array.isArray(fieldValue)) {
            // For strings or arrays, use .includes
            if (fieldValue.includes(value)) {
              return true;
            }
          }
        }
      }
      return false;
    });
  }
}

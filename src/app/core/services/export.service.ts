import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private exportTrigger = new Subject<void>();

  exportTrigger$ = this.exportTrigger.asObservable();

  triggerExport() {
    this.exportTrigger.next();
  }
}

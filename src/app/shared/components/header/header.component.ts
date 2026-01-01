import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  userEmail = 'ahmedmonem98@gmail.com';

  constructor(
    public themeService: ThemeService,
    public router: Router,
    private exportService: ExportService
  ) {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onExportReport() {
    this.exportService.triggerExport();
  }

  shouldShowExportButton(): boolean {
    const url = this.router.url;
    return url.includes('/dashboard') ||
           url.includes('/tunnel-list') ||
           url.includes('/heatmap') ||
           url.includes('/tunnel-detail');
  }
}

import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { UtilityInfo, TotalStats } from '../../core/models/tunnel.model';
import {
  TunnelStatistics,
  TunnelCategory,
} from '../../core/models/tunnel.model';
import { DashboardService } from '../services/dashboard.service';
import { ReportService, ReportData } from '../../core/services/report.service';
import { ExportService } from '../../core/services/export.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  statistics?: TunnelStatistics = {
    totalTunnels: 0,
    totalLength: '',
    totalSize: '',
    totalAssets: 0,
    networkBreakdown: {
      local: 0,
      property: 0,
      trusteeship: 0,
      other: 0,
    },
  };
  categories: TunnelCategory[] = [];
  utilityCard?: UtilityInfo[];
  totalStats: TotalStats = { totalAssets: 0, totalNotes: 0 };
  inspectionTypeStats: { name: string; count: number }[] = [];
  dangerLevelStats: { name: string; count: number }[] = [];

  private exportSubscription?: Subscription;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private reportService: ReportService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    // Show heatmap layers in dashboard view
    this.dashboardService.showHeatmapLayers();

    this.loadData();
    this.loadInspectionStats();

    // Subscribe to export trigger
    this.exportSubscription = this.exportService.exportTrigger$.subscribe(() => {
      this.exportReport();
    });
  }

  ngOnDestroy(): void {
    this.exportSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Wait a bit for data to load
    setTimeout(() => {
      this.createCharts();
    }, 1500);
  }

  async loadInspectionStats(): Promise<void> {
    try {
      this.inspectionTypeStats = await this.dashboardService.getInspectionTypeStats();
      this.dangerLevelStats = await this.dashboardService.getDangerLevelStats();
      console.log('Inspection Type Stats:', this.inspectionTypeStats);
      console.log('Danger Level Stats:', this.dangerLevelStats);
    } catch (error) {
      console.error('Error loading inspection stats:', error);
    }
  }

  loadData(): void {
    this.dashboardService.tunnlesData.subscribe((v) => {
      console.log('vvv', v);
      const totalLength = v.reduce((sum, tunnel) => {
        return sum + (tunnel.الطول_كم || 0);
      }, 0);
      this.statistics.totalTunnels = v.length;
      this.statistics.totalLength = String(Math.round(totalLength * 10) / 10);
    });

    this.dashboardService.onwers.subscribe((v) => {
      console.log('owners', v);
      this.categories = v;
    });
    this.dashboardService.totalUtilityInof.subscribe((v) => {
      this.utilityCard = v;
    });

    this.dashboardService.totalStats.subscribe((v) => {
      this.totalStats = v;
    });
  }

  createCharts(): void {
    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'pie',
        height: '220px',
      },
      title: {
        text: undefined,
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          innerSize: '60%',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
            style: {
              fontSize: '17px'
            }
          },
        },
      },
    };

    // Chart 1: Tunnel Distribution by Owner
    Highcharts.chart('chart1', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'الأنفاق',
        data: this.categories.map(cat => ({
          name: cat.title,
          y: cat.count
        }))
      }]
    });

    // Chart 2: Assets Distribution
    Highcharts.chart('chart2', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'الأصول',
        data: this.categories.map(cat => ({
          name: cat.title,
          y: cat.tableRows.reduce((sum, row) => sum + (row.assetsCount || 0), 0)
        }))
      }]
    });

    // Chart 3: Notes Distribution
    Highcharts.chart('chart3', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'الملاحظات',
        data: this.categories.map(cat => ({
          name: cat.title,
          y: cat.tableRows.reduce((sum, row) => sum + (row.notesCount || 0), 0)
        }))
      }]
    });

    // Chart 4: Tunnel Length Distribution by Owner
    Highcharts.chart('chart4', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'الطول (كم)',
        data: this.categories.map(cat => {
          // Calculate total length for this owner
          const ownerTunnels = this.dashboardService.tunnlesData.value.filter(
            t => t.Owner === cat.title
          );
          const totalLength = ownerTunnels.reduce((sum, tunnel) => {
            return sum + (tunnel.الطول_كم || 0);
          }, 0);
          return {
            name: cat.title,
            y: Number(totalLength.toFixed(2))
          };
        })
      }]
    });

    // Chart 5: Inspection Type Distribution
    Highcharts.chart('chart5', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'نوع الفحص',
        data: this.inspectionTypeStats.length > 0
          ? this.inspectionTypeStats.map(stat => ({
              name: stat.name,
              y: stat.count
            }))
          : [
              { name: 'الميكانيكا', y: 0 },
              { name: 'الكهرباء', y: 0 },
              { name: 'البيئية', y: 0 },
              { name: 'السلامة', y: 0 },
              { name: 'الإنشائية', y: 0 }
            ]
      }]
    });

    // Chart 6: Danger Level Distribution
    Highcharts.chart('chart6', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'مستوى الخطورة',
        data: this.dangerLevelStats.length > 0
          ? this.dangerLevelStats.map(stat => ({
              name: stat.name,
              y: stat.count
            }))
          : [
              { name: 'لا توجد بيانات', y: 1 }
            ]
      }]
    });
  }

  navigateToCategory(categoryId: string): void {
    this.router.navigate(['/tunnels', categoryId]);
  }

  async exportReport(): Promise<void> {
    const reportData: ReportData = {
      title: 'تقرير لوحة المعلومات - نظام الفحص البصري',
      date: new Date().toLocaleDateString('ar-SA'),
      sections: [
        {
          title: 'الإحصائيات العامة',
          data: [
            { label: 'عدد الأنفاق', value: this.statistics?.totalTunnels || 0 },
            { label: 'إجمالي أطوال الأنفاق', value: `${this.statistics?.totalLength || 0} كم` },
            { label: 'إجمالي الملاحظات', value: this.totalStats.totalNotes },
            { label: 'إجمالي الأصول', value: this.totalStats.totalAssets },
          ]
        },
        {
          title: 'توزيع الأنفاق حسب المالك',
          data: this.categories.map(cat => ({
            label: cat.title,
            value: `${cat.count} نفق`
          }))
        },
        {
          title: 'توزيع الأصول حسب الفئة',
          data: this.categories.map(cat => {
            const assetsCount = cat.tableRows.reduce((sum, row) => sum + (row.assetsCount || 0), 0);
            return {
              label: cat.title,
              value: `${assetsCount} أصل`
            };
          })
        },
        {
          title: 'توزيع الملاحظات حسب الفئة',
          data: this.categories.map(cat => {
            const notesCount = cat.tableRows.reduce((sum, row) => sum + (row.notesCount || 0), 0);
            return {
              label: cat.title,
              value: `${notesCount} ملاحظة`
            };
          })
        },
        {
          title: 'توزيع أطوال الأنفاق حسب المالك',
          data: this.categories.map(cat => {
            const ownerTunnels = this.dashboardService.tunnlesData.value.filter(
              t => t.Owner === cat.title
            );
            const totalLength = ownerTunnels.reduce((sum, tunnel) => {
              return sum + (tunnel.الطول_كم || 0);
            }, 0);
            return {
              label: cat.title,
              value: `${totalLength.toFixed(2)} كم`
            };
          })
        },
        {
          title: 'توزيع أنواع الفحص',
          data: this.inspectionTypeStats.map(stat => ({
            label: stat.name,
            value: stat.count
          }))
        },
        {
          title: 'توزيع مستويات الخطورة',
          data: this.dangerLevelStats.map(stat => ({
            label: stat.name,
            value: stat.count
          }))
        }
      ],
      charts: [
        { elementId: 'chart1', title: 'توزيع الأنفاق حسب المالك' },
        { elementId: 'chart2', title: 'توزيع الأصول' },
        { elementId: 'chart3', title: 'توزيع الملاحظات' },
        { elementId: 'chart4', title: 'توزيع أطوال الأنفاق حسب الملاك' },
        { elementId: 'chart5', title: 'توزيع أنواع الفحص' },
        { elementId: 'chart6', title: 'مستوى الخطورة' }
      ]
    };

    await this.reportService.generateReport(reportData);
  }
}

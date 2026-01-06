import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { UtilityInfo, TotalStats, AssetStats, AssetCategory } from '../../core/models/tunnel.model';
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
  floorDistribution: { name: string; count: number }[] = [];
  categoryDistribution: { name: string; count: number }[] = [];
  typeDistribution: { name: string; count: number }[] = [];
  manufacturerDistribution: { name: string; count: number }[] = [];

  // Asset-specific properties
  assetStats: AssetStats = {
    totalAssets: 0,
    categories: new Map(),
    types: new Map(),
    subTypes: new Map(),
  };
  assetCategories: AssetCategory[] = [];

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
      this.floorDistribution = await this.dashboardService.getAssetFloorDistribution();
      this.categoryDistribution = await this.dashboardService.getAssetCategoryDistribution();
      this.typeDistribution = await this.dashboardService.getAssetTypeDistribution();
      this.manufacturerDistribution = await this.dashboardService.getAssetManufacturerDistribution();
      console.log('Inspection Type Stats:', this.inspectionTypeStats);
      console.log('Danger Level Stats:', this.dangerLevelStats);
      console.log('Floor Distribution:', this.floorDistribution);
      console.log('Category Distribution:', this.categoryDistribution);
      console.log('Type Distribution:', this.typeDistribution);
      console.log('Manufacturer Distribution:', this.manufacturerDistribution);
    } catch (error) {
      console.error('Error loading inspection stats:', error);
    }
  }

  loadData(): void {
    // Subscribe to asset data
    this.dashboardService.assetsData.subscribe(async (assets) => {
      console.log('Assets loaded:', assets.length);
      this.statistics.totalAssets = assets.length;
      // Reload distributions when assets are updated
      this.floorDistribution = await this.dashboardService.getAssetFloorDistribution();
      this.categoryDistribution = await this.dashboardService.getAssetCategoryDistribution();
      this.typeDistribution = await this.dashboardService.getAssetTypeDistribution();
      this.manufacturerDistribution = await this.dashboardService.getAssetManufacturerDistribution();
      // Recreate charts if already initialized
      if (this.floorDistribution.length > 0) {
        this.updateChart1();
      }
      if (this.categoryDistribution.length > 0) {
        this.updateChart2();
      }
      if (this.typeDistribution.length > 0) {
        this.updateChart3();
      }
      if (this.manufacturerDistribution.length > 0) {
        this.updateChart4();
      }
    });

    // Subscribe to asset statistics
    this.dashboardService.assetStats.subscribe((stats) => {
      console.log('Asset stats:', stats);
      this.assetStats = stats;
      this.statistics.totalAssets = stats.totalAssets;
    });

    // Subscribe to asset categories (Equipment_Category values)
    this.dashboardService.assetCategories.subscribe((categories) => {
      console.log('Asset categories:', categories);
      this.assetCategories = categories;
    });

    this.dashboardService.onwers.subscribe((v) => {
      console.log('categories', v);
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

    // Chart 1: Asset Distribution by Floor
    this.updateChart1();

    // Chart 2: Assets Distribution by Equipment Category
    this.updateChart2();

    // Chart 3: Asset Distribution by Type
    this.updateChart3();

    // Chart 4: Asset Distribution by Manufacturer
    this.updateChart4();

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

  updateChart1(): void {
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

    // Chart 1: Asset Distribution by Floor
    Highcharts.chart('chart1', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'الأصول',
        data: this.floorDistribution.length > 0
          ? this.floorDistribution.map(floor => ({
              name: floor.name,
              y: floor.count
            }))
          : [
              { name: 'الطابق الأرضي', y: 0 },
              { name: 'الطابق الأول', y: 0 },
              { name: 'الطابق الثاني', y: 0 }
            ]
      }]
    });
  }

  updateChart2(): void {
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

    // Chart 2: Asset Distribution by Equipment Category
    Highcharts.chart('chart2', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'الأصول',
        data: this.categoryDistribution.length > 0
          ? this.categoryDistribution.map(category => ({
              name: category.name,
              y: category.count
            }))
          : [
              { name: 'كهربائي', y: 0 },
              { name: 'محطة كهربائية', y: 0 },
              { name: 'محطة كهربائية / تكييف', y: 0 },
              { name: 'ميكانيكي', y: 0 },
              { name: 'تبريد', y: 0 },
              { name: 'لم يستدل عليها', y: 0 }
            ]
      }]
    });
  }

  updateChart3(): void {
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

    // Chart 3: Asset Distribution by Type
    Highcharts.chart('chart3', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'الأصول',
        data: this.typeDistribution.length > 0
          ? this.typeDistribution.map(type => ({
              name: type.name,
              y: type.count
            }))
          : [
              { name: 'غير محدد', y: 0 }
            ]
      }]
    });
  }

  updateChart4(): void {
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

    // Chart 4: Asset Distribution by Manufacturer
    Highcharts.chart('chart4', {
      ...chartOptions,
      series: [{
        type: 'pie',
        name: 'الأصول',
        data: this.manufacturerDistribution.length > 0
          ? this.manufacturerDistribution.map(manufacturer => ({
              name: manufacturer.name,
              y: manufacturer.count
            }))
          : [
              { name: 'غير محدد', y: 0 }
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
          title: 'توزيع الأصول حسب الطابق',
          data: this.floorDistribution.map(floor => ({
            label: floor.name,
            value: `${floor.count} أصل`
          }))
        },
        {
          title: 'توزيع الأنفاق حسب المالك',
          data: this.categories.map(cat => ({
            label: cat.title,
            value: `${cat.count} نفق`
          }))
        },
        {
          title: 'توزيع الأصول حسب فئة المعدات',
          data: this.categoryDistribution.map(category => ({
            label: category.name,
            value: `${category.count} أصل`
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
          title: 'توزيع الأصول حسب النوع',
          data: this.typeDistribution.map(type => ({
            label: type.name,
            value: `${type.count} أصل`
          }))
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
          title: 'توزيع الأصول حسب الشركة المصنعة',
          data: this.manufacturerDistribution.map(manufacturer => ({
            label: manufacturer.name,
            value: `${manufacturer.count} أصل`
          }))
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
        { elementId: 'chart1', title: 'توزيع الأصول حسب الطابق' },
        { elementId: 'chart2', title: 'توزيع الأصول حسب فئة المعدات' },
        { elementId: 'chart3', title: 'توزيع الأصول حسب النوع' },
        { elementId: 'chart4', title: 'توزيع الأصول حسب الشركة المصنعة' },
        { elementId: 'chart5', title: 'توزيع أنواع الفحص' },
        { elementId: 'chart6', title: 'مستوى الخطورة' }
      ]
    };

    await this.reportService.generateReport(reportData);
  }
}

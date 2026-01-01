import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CardComponent } from '../../shared/components/card/card.component';
import { MapViewComponent } from '../../shared/components/map-view/map-view.component';
// import { TunnelDataService } from '../../core/services/tunnel-data.service';
import {
  Tunnel,
  UtilityInfo,
  TunnelStats,
} from '../../core/models/tunnel.model';
import {
  DashboardService,
  OWNER_DOMAIN,
  TunnelInterface,
} from '../services/dashboard.service';
import { ReportService, ReportData } from '../../core/services/report.service';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, CardComponent, MapViewComponent, RouterModule],
  templateUrl: './asset-list.component.html',
  styleUrl: './asset-list.component.scss',
})
export class AssetListComponent implements OnInit, OnDestroy {
  categoryId: string = '';
  tunnels: TunnelInterface[] = [];
  ownerName: string = ' ';
  utilityCard?: UtilityInfo[];
  selectedUtilityIndices: number[] = [];
  tunnelStats: TunnelStats[] = [];
  totalTunnelDistance: number = 0;

  private exportSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private tunnelDataService: TunnelDataService,
    private dashboardService: DashboardService,
    private reportService: ReportService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    // Hide heatmap layers in tunnel-list view
    this.dashboardService.hideHeatmapLayers();

    // Subscribe to export trigger
    this.exportSubscription = this.exportService.exportTrigger$.subscribe(() => {
      this.exportReport();
    });

    this.route.params.subscribe((params) => {
      this.categoryId = params['categoryId'] || '';
      this.loadTunnels();

      // Only filter if we have a categoryId (specific owner)
      if (this.categoryId) {
        this.dashboardService.filterTunnelsOnOwner(this.categoryId);
      } else {
        // Show all tunnels on map without heatmap
        this.dashboardService.showAllTunnels();
      }

      this.loadUtilityData();
    });
  }

  loadTunnels(): void {
    console.log('onwer id', this.categoryId);

    if (this.dashboardService.tunnlesData.value.length > 0) {
      if (this.categoryId) {
        // Filter for specific owner
        this.ownerName = OWNER_DOMAIN.find(
          (o) => o.Code == this.categoryId
        )?.Description || '';

        // Special handling for '0' (undefined) owner
        if (this.categoryId === '0') {
          this.tunnels = this.dashboardService.tunnlesData.value.filter(
            (v) => !v.Owner || v.Owner === 'null' || v.Owner === 'undefined'
          );
        } else {
          this.tunnels = this.dashboardService.tunnlesData.value.filter(
            (v) => v.Owner == this.ownerName
          );
        }
      } else {
        // Show all tunnels
        this.ownerName = 'جميع الأنفاق';
        this.tunnels = this.dashboardService.tunnlesData.value;
      }

      // Calculate total tunnel distance
      this.totalTunnelDistance = this.tunnels.reduce((sum, tunnel) => {
        return sum + (tunnel.الطول_كم || 0);
      }, 0);
    }
  }

  loadUtilityData(): void {
    if (this.categoryId) {
      // Get the specific owner's utility data
      this.dashboardService.onwers.subscribe((owners) => {
        const currentOwner = owners.find(owner => owner.id === this.categoryId);
        if (currentOwner && currentOwner.tableRows) {
          // Sort utilities by percentage (notesCount / totalDistance) descending
          this.utilityCard = [...currentOwner.tableRows].sort((a, b) => {
            const percentageA = this.calculatePercentage(a.notesCount);
            const percentageB = this.calculatePercentage(b.notesCount);
            return percentageB - percentageA; // Descending order
          });
        }
      });
    } else {
      // Get global utility totals
      this.dashboardService.totalUtilityInof.subscribe((utilities) => {
        // Sort utilities by percentage (notesCount / totalDistance) descending
        this.utilityCard = [...utilities].sort((a, b) => {
          const percentageA = this.calculatePercentage(a.notesCount);
          const percentageB = this.calculatePercentage(b.notesCount);
          return percentageB - percentageA; // Descending order
        });
      });
    }

    this.dashboardService.tunnelStats.subscribe((v) => {
      this.tunnelStats = v;
    });
  }

  calculatePercentage(notesCount: number | undefined): number {
    if (!notesCount || this.totalTunnelDistance === 0) return 0;
    // Calculate notes per kilometer (not percentage)
    return notesCount / this.totalTunnelDistance;
  }

  getPercentageDisplay(notesCount: number | undefined): string {
    const ratio = this.calculatePercentage(notesCount);
    return `${ratio.toFixed(2)} ملاحظة/كم`;
  }

  getTunnelStats(tunnelName: string): TunnelStats | undefined {
    return this.tunnelStats.find((stat) => stat.tunnelName === tunnelName);
  }

  formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return '0';
    return Math.round(Number(value)).toString();
  }

  formatNumberWithKm(value: number | undefined | null): string {
    if (value === undefined || value === null) return '0.00 كم';
    return `${Number(value).toFixed(2)} كم`;
  }
  selectUtility(index: number): void {
    const indexPosition = this.selectedUtilityIndices.indexOf(index);
    if (indexPosition > -1) {
      // If already selected, remove it
      this.selectedUtilityIndices.splice(indexPosition, 1);
    } else {
      // If not selected, add it
      this.selectedUtilityIndices.push(index);
    }

    // Toggle layer visibility based on selected utilities
    this.dashboardService.toggleUtilityLayers(this.selectedUtilityIndices);

    if (this.utilityCard) {
      console.log(
        'Selected utilities:',
        this.selectedUtilityIndices.map((i) => this.utilityCard![i])
      );
    }
  }

  isUtilitySelected(index: number): boolean {
    return this.selectedUtilityIndices.includes(index);
  }

  getUtilityIcon(utilityName: string): string {
    const name = utilityName.toLowerCase();
    if (name.includes('ميكانيك') || name.includes('mechanical')) {
      return 'assets/icons/mechanical.svg';
    } else if (name.includes('كهرب') || name.includes('electric')) {
      return 'assets/icons/electricity.svg';
    } else if (name.includes('طرق') || name.includes('construction')) {
      return 'assets/icons/construction.svg';
    } else if (name.includes('بيئ') || name.includes('environment')) {
      return 'assets/icons/environment.svg';
    } else if (
      name.includes('سلام') ||
      name.includes('أمان') ||
      name.includes('safety')
    ) {
      return 'assets/icons/safety.svg';
    }
    return 'assets/icons/construction.svg'; // default icon
  }

  getTunnelColor(index: number, darker: boolean = false): string {
    // Array of distinct colors with good contrast
    const colors = [
      '#E8F5E9', // Light Green
      '#E3F2FD', // Light Blue
      '#FFF3E0', // Light Orange
      '#F3E5F5', // Light Purple
      '#FFF9C4', // Light Yellow
      '#FCE4EC', // Light Pink
      '#E0F2F1', // Light Teal
      '#F1F8E9', // Light Lime
      '#EDE7F6', // Light Indigo
      '#FBE9E7', // Light Deep Orange
    ];

    // Darker versions for the indicator bar
    const darkerColors = [
      '#4CAF50', // Green
      '#2196F3', // Blue
      '#FF9800', // Orange
      '#9C27B0', // Purple
      '#FFC107', // Yellow
      '#E91E63', // Pink
      '#009688', // Teal
      '#8BC34A', // Lime
      '#673AB7', // Indigo
      '#FF5722', // Deep Orange
    ];

    const tunnel = this.tunnels[index];
    if (!tunnel) {
      const colorIndex = index % colors.length;
      return darker ? darkerColors[colorIndex] : colors[colorIndex];
    }

    // If viewing all tunnels (no categoryId), color by owner
    if (!this.categoryId) {
      const ownerName = tunnel.Owner || 'undefined';
      const uniqueOwners = [...new Set(this.tunnels.map(t => t.Owner || 'undefined'))];
      const ownerIndex = uniqueOwners.indexOf(ownerName);
      const colorIndex = ownerIndex % colors.length;
      return darker ? darkerColors[colorIndex] : colors[colorIndex];
    }

    // If viewing specific owner's tunnels, color by individual tunnel
    const colorIndex = index % colors.length;
    return darker ? darkerColors[colorIndex] : colors[colorIndex];
  }

  navigateToTunnel(tunnelId: string | number): void {
    this.router.navigate(['/asset-detail', tunnelId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.exportSubscription?.unsubscribe();
  }

  async exportReport(): Promise<void> {
    const reportData: ReportData = {
      title: `تقرير ${this.ownerName} - نظام الفحص البصري`,
      date: new Date().toLocaleDateString('ar-SA'),
      includeMap: true,
      sections: [
        {
          title: 'معلومات عامة',
          data: [
            { label: 'المالك', value: this.ownerName },
            { label: 'عدد الأنفاق', value: this.tunnels.length },
            { label: 'إجمالي الطول', value: `${this.totalTunnelDistance.toFixed(2)} كم` },
          ]
        },
        {
          title: 'توزيع المرافق',
          data: this.utilityCard?.map(utility => ({
            label: utility.name,
            value: `${utility.notesCount || 0} ملاحظة`
          })) || []
        },
        {
          title: 'قائمة الأنفاق',
          data: this.tunnels.map(tunnel => {
            const stats = this.getTunnelStats(tunnel.ARABICNAME);
            return {
              label: tunnel.ARABICNAME,
              value: `${tunnel.الطول_كم?.toFixed(2) || 0} كم - ${stats?.notesCount || 0} ملاحظة`
            };
          })
        }
      ]
    };

    await this.reportService.generateReport(reportData);
  }
}

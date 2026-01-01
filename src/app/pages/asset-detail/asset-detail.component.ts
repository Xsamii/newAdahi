import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CardComponent } from '../../shared/components/card/card.component';
import { MapViewComponent } from '../../shared/components/map-view/map-view.component';
import {
  TunnelDetail,
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
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, CardComponent, MapViewComponent],
  templateUrl: './asset-detail.component.html',
  styleUrl: './asset-detail.component.scss',
})
export class AssetDetailComponent implements OnInit, OnDestroy {
  tunnelId: string = '';
  tunnel?: TunnelInterface;
  utilityCard: UtilityInfo[] = [];
  selectedUtilityIndices: number[] = [];
  tunnelStats: TunnelStats[] = [];

  private exportSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private reportService: ReportService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    // Show heatmap layers in tunnel-detail view
    this.dashboardService.showHeatmapLayers();

    // Subscribe to export trigger
    this.exportSubscription = this.exportService.exportTrigger$.subscribe(() => {
      this.exportReport();
    });

    this.route.params.subscribe((params) => {
      this.tunnelId = params['id'];
      if (this.tunnelId) {
        this.loadTunnelDetail();
        this.dashboardService.filterTunnelOnId(this.tunnelId);
      }
      this.loadUtilityData();
    });
  }

  loadTunnelDetail(): void {
    this.tunnel = this.dashboardService.tunnlesData.value.find(
      (t) => t.ID_Number == Number(this.tunnelId)
    );
    // Filter heatmap by this specific tunnel using tunnel name
    if (this.tunnel?.ARABICNAME) {
      this.dashboardService.filterHeatmapByTunnel(this.tunnel.ARABICNAME);
    }
  }

  loadUtilityData(): void {
    // Initialize utility card with placeholder data immediately
    this.utilityCard = [
      { name: 'الميكانيكا', assetsCount: 0, notesCount: 0 },
      { name: 'الكهرباء', assetsCount: 0, notesCount: 0 },
      { name: 'الطرق', assetsCount: 0, notesCount: 0 },
      { name: 'البيئية', assetsCount: 0, notesCount: 0 },
      { name: 'السلامة', assetsCount: 0, notesCount: 0 },
      { name: 'الإنشائية', assetsCount: 0, notesCount: 0 }
    ];

    // Load tunnel stats for asset/notes counts
    this.dashboardService.tunnelStats.subscribe((v) => {
      this.tunnelStats = v;
    });

    // Wait for tunnel data to be available, then load tunnel-specific utilities
    this.dashboardService.tunnlesData.subscribe((tunnels) => {
      if (tunnels && tunnels.length > 0) {
        // Reload tunnel detail in case it wasn't available before
        this.loadTunnelDetail();

        if (this.tunnel && this.tunnel.ARABICNAME) {
          // Load tunnel-specific utility data in the background
          this.dashboardService
            .getTunnelUtilityStats(this.tunnel.ARABICNAME)
            .then((utilities) => {
              // Update with real data when loaded
              this.utilityCard = utilities;
            })
            .catch((error) => {
              console.error('Error loading tunnel utility stats:', error);
            });
        }
      }
    });
  }

  getTunnelStats(tunnelName: string): TunnelStats | undefined {
    return this.tunnelStats.find((stat) => stat.tunnelName === tunnelName);
  }

  formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return '0';
    return Math.round(Number(value)).toString();
  }

  formatNumberWithKm(value: number | undefined | null): string {
    if (value === undefined || value === null) return 'كم 0.00';
    return `كم ${Number(value).toFixed(2)}`;
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

  goBack(): void {
    const categoryId = OWNER_DOMAIN.find(
      (o) => o.Description == this.tunnel.Owner
    )?.Code;
    this.router.navigate(['/asset-list', categoryId || '1']);
  }

  ngOnDestroy(): void {
    this.exportSubscription?.unsubscribe();
  }

  async exportReport(): Promise<void> {
    if (!this.tunnel) return;

    const stats = this.getTunnelStats(this.tunnel.ARABICNAME);

    const reportData: ReportData = {
      title: `تقرير تفصيلي - ${this.tunnel.ARABICNAME}`,
      date: new Date().toLocaleDateString('ar-SA'),
      includeMap: true,
      sections: [
        {
          title: 'معلومات النفق',
          data: [
            { label: 'اسم النفق', value: this.tunnel.ARABICNAME },
            { label: 'المالك', value: this.tunnel.Owner || 'غير محدد' },
            { label: 'الطول', value: this.formatNumberWithKm(this.tunnel.الطول_كم) },
            { label: 'العرض', value: `${this.tunnel.العرض_بالمتر || 0} م` },
            { label: 'عدد الأصول', value: this.formatNumber(stats?.assetsCount) },
            { label: 'عدد الملاحظات', value: this.formatNumber(stats?.notesCount) },
          ]
        },
        {
          title: 'توزيع المرافق',
          data: this.utilityCard?.map(utility => ({
            label: utility.name,
            value: `${utility.assetsCount || 0} أصل - ${utility.notesCount || 0} ملاحظة`
          })) || []
        }
      ]
    };

    await this.reportService.generateReport(reportData);
  }
}

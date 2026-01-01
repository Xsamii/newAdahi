import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MapViewComponent } from '../../shared/components/map-view/map-view.component';
import { UtilityInfo, TunnelStats } from '../../core/models/tunnel.model';
import { DashboardService, OWNER_DOMAIN } from '../services/dashboard.service';
import { ReportService, ReportData } from '../../core/services/report.service';
import { ExportService } from '../../core/services/export.service';

interface OwnerUtilityData {
  ownerName: string;
  assetsCount: number;
  notesCount: number;
}

interface OwnerListItem {
  id: string;
  name: string;
  tunnelCount: number;
  totalDistance: number;
  notesCount: number;
  percentage: number;
}

interface TunnelListItem {
  id: number;
  name: string;
  distance: number;
  assetsCount: number;
  notesCount: number;
  percentage: number;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, MapViewComponent],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.scss'
})
export class HeatmapComponent implements OnInit, OnDestroy {
  utilityCard?: UtilityInfo[];
  selectedUtilityIndex: number | null = null;
  ownerUtilityData: OwnerUtilityData[] = [];
  ownerId: string | null = null;
  ownerName: string = '';
  selectedUtilityName: string | null = null;
  totalTunnelDistance: number = 0;

  // Lists for display
  ownersList: OwnerListItem[] = [];
  tunnelsList: TunnelListItem[] = [];
  tunnelStats: TunnelStats[] = [];

  private exportSubscription?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    // Show heatmap layers in heatmap view
    this.dashboardService.showHeatmapLayers();

    // Subscribe to export trigger
    this.exportSubscription = this.exportService.exportTrigger$.subscribe(() => {
      this.exportReport();
    });

    // Load tunnel stats
    this.dashboardService.tunnelStats.subscribe((stats) => {
      this.tunnelStats = stats;
    });

    // Check if ownerId parameter exists in route
    this.route.params.subscribe((params) => {
      this.ownerId = params['ownerId'];

      // Check for query parameters
      this.route.queryParams.subscribe((queryParams) => {
        this.selectedUtilityName = queryParams['utility'] || null;
        const tunnelName = queryParams['tunnel'] || null;

        if (this.ownerId) {
          // Reset utility selection when navigating to owner
          this.selectedUtilityIndex = null;

          // Filter heatmap by owner
          this.filterByOwner(this.ownerId);
          // Load owner-specific utility data
          this.loadOwnerUtilityData(this.ownerId);
          // Load tunnels for this owner
          this.loadTunnelsList(this.ownerId);

          // If utility is specified, filter by it and highlight the card
          if (this.selectedUtilityName) {
            this.filterByUtility(this.selectedUtilityName);
            this.highlightUtilityCard(this.selectedUtilityName);
          }
        } else if (tunnelName && this.selectedUtilityName) {
          // Filter by both tunnel and utility
          this.dashboardService.filterHeatmapByTunnelAndUtility(tunnelName, this.selectedUtilityName);
        } else if (tunnelName) {
          // Filter by tunnel only
          this.dashboardService.filterHeatmapByTunnel(tunnelName);
        } else {
          // Reset utility selection for global view
          this.selectedUtilityIndex = null;

          // Reset filters to show all heatmap data
          this.resetHeatmapFilters();

          // Calculate total tunnel distance for all tunnels
          this.dashboardService.tunnlesData.subscribe((tunnels) => {
            this.totalTunnelDistance = tunnels.reduce((sum, tunnel) => {
              return sum + (tunnel.الطول_كم || 0);
            }, 0);

            // Load global utility data from totalUtilityInfo and sort by percentage
            this.dashboardService.totalUtilityInof.subscribe((utilities) => {
              this.utilityCard = [...utilities].sort((a, b) => {
                const percentageA = this.calculatePercentage(a.notesCount);
                const percentageB = this.calculatePercentage(b.notesCount);
                return percentageB - percentageA; // Descending order
              });
            });
          });

          // Load all tunnels list for global heatmap
          this.loadAllTunnelsList();
        }
      });
    });
  }

  resetHeatmapFilters(): void {
    // Remove filters from heatmap layer (show all data)
    this.dashboardService.resetHeatmapFilters();
  }

  filterByOwner(ownerId: string): void {
    // Get owner name from domain
    const owner = OWNER_DOMAIN.find((o) => o.Code == ownerId);
    if (owner) {
      this.ownerName = owner.Description;
      // Filter heatmap layer by owner and zoom to it
      this.dashboardService.filterHeatmapByOwner(ownerId);
    }
  }

  loadOwnerUtilityData(ownerId: string): void {
    // Calculate total tunnel distance for this owner first
    this.dashboardService.tunnlesData.subscribe((tunnels) => {
      const ownerName = OWNER_DOMAIN.find((o) => o.Code == ownerId)?.Description;
      if (ownerName) {
        let ownerTunnels;
        // Special handling for '0' (undefined) owner
        if (ownerId === '0') {
          ownerTunnels = tunnels.filter((t) => !t.Owner || t.Owner === 'null' || t.Owner === 'undefined');
        } else {
          ownerTunnels = tunnels.filter((t) => t.Owner === ownerName);
        }
        this.totalTunnelDistance = ownerTunnels.reduce((sum, tunnel) => {
          return sum + (tunnel.الطول_كم || 0);
        }, 0);

        // Now load and sort utility cards by percentage
        this.dashboardService.onwers.subscribe((owners) => {
          const currentOwner = owners.find(owner => owner.id === ownerId);
          if (currentOwner && currentOwner.tableRows) {
            // Sort utilities by percentage (notesCount / totalDistance) descending
            this.utilityCard = [...currentOwner.tableRows].sort((a, b) => {
              const percentageA = this.calculatePercentage(a.notesCount);
              const percentageB = this.calculatePercentage(b.notesCount);
              return percentageB - percentageA; // Descending order
            });
          }
        });
      }
    });
  }

  filterByUtility(utilityName: string): void {
    // Filter the heatmap layer to show only the selected utility type
    this.dashboardService.filterHeatmapByUtility(this.ownerId!, utilityName);
  }

  highlightUtilityCard(utilityName: string): void {
    // Find the index of the utility card to highlight
    if (this.utilityCard) {
      const index = this.utilityCard.findIndex(card => card.name === utilityName);
      if (index !== -1) {
        this.selectedUtilityIndex = index;
      }
    }
  }

  selectUtility(index: number): void {
    // Toggle selection - if same card clicked, deselect it
    if (this.selectedUtilityIndex === index) {
      this.selectedUtilityIndex = null;
      this.ownerUtilityData = [];
      return;
    }

    this.selectedUtilityIndex = index;

    // Get the selected utility name
    const selectedUtility = this.utilityCard?.[index];
    if (!selectedUtility) return;

    // Load owner-specific data for this utility
    this.loadOwnerDataForUtility(selectedUtility.name);
  }

  loadOwnerDataForUtility(utilityName: string): void {
    this.dashboardService.onwers.subscribe((owners) => {
      this.ownerUtilityData = owners.map(owner => {
        // Find the utility data for this owner
        const utilityData = owner.tableRows?.find(row => row.name === utilityName);

        return {
          ownerName: owner.title,
          assetsCount: utilityData?.assetsCount || 0,
          notesCount: utilityData?.notesCount || 0
        };
      });
    });
  }

  loadOwnersList(): void {
    this.dashboardService.onwers.subscribe((owners) => {
      this.dashboardService.tunnlesData.subscribe((allTunnels) => {
        this.ownersList = owners.map(owner => {
          // Get owner name from code
          const ownerName = OWNER_DOMAIN.find(o => o.Code == owner.id)?.Description;

          // Filter tunnels for this owner
          let ownerTunnels;
          // Special handling for '0' (undefined) owner
          if (owner.id === '0') {
            ownerTunnels = allTunnels.filter(t => !t.Owner || t.Owner === 'null' || t.Owner === 'undefined');
          } else {
            ownerTunnels = allTunnels.filter(t => t.Owner === ownerName);
          }

          // Calculate total distance
          const totalDistance = ownerTunnels.reduce((sum, t) => sum + (t.الطول_كم || 0), 0);

          // Get total notes count from owner's tableRows
          const notesCount = owner.tableRows?.reduce((sum, row) => sum + (row.notesCount || 0), 0) || 0;

          // Calculate percentage (notes per kilometer)
          const percentage = totalDistance > 0 ? notesCount / totalDistance : 0;

          return {
            id: owner.id,
            name: owner.title,
            tunnelCount: owner.count,
            totalDistance,
            notesCount,
            percentage
          };
        }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
      });
    });
  }

  loadTunnelsList(ownerId: string): void {
    const ownerName = OWNER_DOMAIN.find(o => o.Code == ownerId)?.Description;
    if (!ownerName) return;

    this.dashboardService.tunnlesData.subscribe((allTunnels) => {
      let ownerTunnels;
      // Special handling for '0' (undefined) owner
      if (ownerId === '0') {
        ownerTunnels = allTunnels.filter(t => !t.Owner || t.Owner === 'null' || t.Owner === 'undefined');
      } else {
        ownerTunnels = allTunnels.filter(t => t.Owner === ownerName);
      }

      this.tunnelsList = ownerTunnels.map(tunnel => {
        // Get stats for this tunnel
        const stats = this.tunnelStats.find(s => s.tunnelName === tunnel.ARABICNAME);
        const distance = tunnel.الطول_كم || 0;
        const notesCount = stats?.notesCount || 0;
        const percentage = distance > 0 ? notesCount / distance : 0;

        return {
          id: tunnel.ID_Number,
          name: tunnel.ARABICNAME,
          distance,
          assetsCount: stats?.assetsCount || 0,
          notesCount,
          percentage
        };
      }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
    });
  }

  loadAllTunnelsList(): void {
    this.dashboardService.tunnlesData.subscribe((allTunnels) => {
      this.tunnelsList = allTunnels.map(tunnel => {
        // Get stats for this tunnel
        const stats = this.tunnelStats.find(s => s.tunnelName === tunnel.ARABICNAME);
        const distance = tunnel.الطول_كم || 0;
        const notesCount = stats?.notesCount || 0;
        const percentage = distance > 0 ? notesCount / distance : 0;

        return {
          id: tunnel.ID_Number,
          name: tunnel.ARABICNAME,
          distance,
          assetsCount: stats?.assetsCount || 0,
          notesCount,
          percentage
        };
      }).sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
    });
  }

  isUtilitySelected(index: number): boolean {
    return this.selectedUtilityIndex === index;
  }

  formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return '0';
    return Math.round(Number(value)).toString();
  }

  calculatePercentage(notesCount: number | undefined): number {
    if (!notesCount || this.totalTunnelDistance === 0) return 0;
    // Calculate notes per kilometer
    return notesCount / this.totalTunnelDistance;
  }

  getPercentageDisplay(notesCount: number | undefined): string {
    const ratio = this.calculatePercentage(notesCount);
    return `${ratio.toFixed(2)} ملاحظة/كم`;
  }

  formatPercentage(percentage: number): string {
    return `${percentage.toFixed(2)} ملاحظة/كم`;
  }

  formatDistance(distance: number): string {
    return `${distance.toFixed(2)} كم`;
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

  ngOnDestroy(): void {
    this.exportSubscription?.unsubscribe();
  }

  async exportReport(): Promise<void> {
    const title = this.ownerId
      ? `تقرير الخريطة الحرارية - ${this.ownerName}`
      : 'تقرير الخريطة الحرارية الكلية';

    const reportData: ReportData = {
      title: title,
      date: new Date().toLocaleDateString('ar-SA'),
      includeMap: true,
      sections: [
        {
          title: 'معلومات عامة',
          data: [
            { label: 'نطاق التقرير', value: this.ownerId ? this.ownerName : 'جميع الأنفاق' },
            { label: 'عدد الأنفاق', value: this.tunnelsList.length },
            { label: 'إجمالي الطول', value: `${this.totalTunnelDistance.toFixed(2)} كم` },
            {
              label: 'إجمالي الملاحظات',
              value: this.tunnelsList.reduce((sum, t) => sum + t.notesCount, 0)
            },
          ]
        },
        {
          title: 'توزيع المرافق',
          data: this.utilityCard?.map(utility => ({
            label: utility.name,
            value: `${utility.notesCount || 0} ملاحظة - ${this.getPercentageDisplay(utility.notesCount)}`
          })) || []
        },
        {
          title: 'قائمة الأنفاق حسب كثافة الملاحظات',
          data: this.tunnelsList.slice(0, 20).map(tunnel => ({
            label: tunnel.name,
            value: `${tunnel.notesCount} ملاحظة - ${this.formatPercentage(tunnel.percentage)}`
          }))
        }
      ]
    };

    await this.reportService.generateReport(reportData);
  }
}

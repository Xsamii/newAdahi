import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardService } from '../../../pages/services/dashboard.service';
import { UtilityInfo, TunnelStats } from '../../../core/models/tunnel.model';

interface TunnelOwner {
  id: string;
  title: string;
  count: number;
  utilities?: UtilityInfo[];
  isExpanded?: boolean;
}

interface TunnelItem {
  id: number;
  name: string;
  utilities?: UtilityInfo[];
  isExpanded?: boolean;
}

interface AssetFloor {
  id: string;
  title: string;
  isExpanded: boolean;
  items: AssetItem[];
}

interface AssetItem {
  id: string;
  title: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isTunnelsExpanded = false;
  isHeatmapExpanded = false;
  isAssetsExpanded = false;
  selectedFloorId: string | null = null;
  tunnelOwners: TunnelOwner[] = [];
  allTunnels: TunnelItem[] = [];
  tunnelStats: TunnelStats[] = [];

  assetFloors: AssetFloor[] = [
    {
      id: 'ground-floor',
      title: 'الدور الأرضي',
      isExpanded: false,
      items: [
        { id: 'ground-mechanical', title: 'ميكانيكا', route: '/assets/ground-floor/mechanical' },
        { id: 'ground-electrical', title: 'كهرباء', route: '/assets/ground-floor/electrical' },
        { id: 'ground-fire', title: 'مكافحة حريق', route: '/assets/ground-floor/fire-fighting' }
      ]
    },
    {
      id: 'first-floor',
      title: 'الدور الأول',
      isExpanded: false,
      items: [
        { id: 'first-mechanical', title: 'ميكانيكا', route: '/assets/first-floor/mechanical' },
        { id: 'first-electrical', title: 'كهرباء', route: '/assets/first-floor/electrical' },
        { id: 'first-fire', title: 'مكافحة حريق', route: '/assets/first-floor/fire-fighting' }
      ]
    },
    {
      id: 'second-floor',
      title: 'الدور الثاني',
      isExpanded: false,
      items: [
        { id: 'second-mechanical', title: 'ميكانيكا', route: '/assets/second-floor/mechanical' },
        { id: 'second-electrical', title: 'كهرباء', route: '/assets/second-floor/electrical' },
        { id: 'second-fire', title: 'مكافحة حريق', route: '/assets/second-floor/fire-fighting' }
      ]
    },
    {
      id: 'external-assets',
      title: 'الأصول الخارجية',
      isExpanded: false,
      items: [
        { id: 'external-mechanical', title: 'ميكانيكا', route: '/assets/external/mechanical' },
        { id: 'external-electrical', title: 'كهرباء', route: '/assets/external/electrical' },
        { id: 'external-fire', title: 'مكافحة حريق', route: '/assets/external/fire-fighting' }
      ]
    }
  ];

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    // Subscribe to asset categories (Equipment_Category) from dashboard service
    this.dashboardService.onwers.subscribe((categories) => {
      console.log('Asset categories received in sidebar:', categories);
      this.tunnelOwners = categories.map(category => ({
        id: category.id,
        title: category.title,
        count: category.count,
        utilities: category.tableRows || [],
        isExpanded: false
      }));

      // Update the asset floors dynamically based on Equipment_Category
      this.updateAssetFloorsFromCategories(categories);
    });

    // Subscribe to tunnel stats
    this.dashboardService.tunnelStats.subscribe((stats) => {
      this.tunnelStats = stats;
      // Re-sort tunnels whenever stats are updated
      this.sortTunnelsByNoteCount();
    });

    // Subscribe to all tunnels data
    this.dashboardService.tunnlesData.subscribe((tunnels) => {
      console.log('Loading tunnels in sidebar:', tunnels.length);

      // Show tunnels immediately with empty utilities
      this.allTunnels = tunnels.map(tunnel => ({
        id: tunnel.ID_Number,
        name: tunnel.ARABICNAME,
        utilities: [] as UtilityInfo[],
        isExpanded: false
      }));

      // Sort tunnels by note count
      this.sortTunnelsByNoteCount();

      // Load utilities in the background for each tunnel
      tunnels.forEach(async (tunnel) => {
        try {
          const utilities = await this.dashboardService.getTunnelUtilityStats(tunnel.ARABICNAME);
          const tunnelItem = this.allTunnels.find(t => t.name === tunnel.ARABICNAME);
          if (tunnelItem) {
            tunnelItem.utilities = utilities || [];
          }
        } catch (error) {
          console.error('Error loading utilities for tunnel:', tunnel.ARABICNAME, error);
        }
      });
    });
  }

  private sortTunnelsByNoteCount(): void {
    if (this.allTunnels.length === 0 || this.tunnelStats.length === 0) return;

    this.allTunnels.sort((a, b) => {
      const statsA = this.tunnelStats.find(s => s.tunnelName === a.name);
      const statsB = this.tunnelStats.find(s => s.tunnelName === b.name);

      const notesA = statsA?.notesCount || 0;
      const notesB = statsB?.notesCount || 0;

      // Sort descending (most notes at top)
      return notesB - notesA;
    });
  }

  toggleTunnels() {
    this.isTunnelsExpanded = !this.isTunnelsExpanded;
    // Close other dropdowns when opening tunnels
    if (this.isTunnelsExpanded) {
      this.isHeatmapExpanded = false;
      this.isAssetsExpanded = false;
    }
  }

  toggleHeatmap() {
    this.isHeatmapExpanded = !this.isHeatmapExpanded;
    // Close other dropdowns when opening heatmap
    if (this.isHeatmapExpanded) {
      this.isTunnelsExpanded = false;
      this.isAssetsExpanded = false;
    }
  }

  toggleAssets() {
    this.isAssetsExpanded = !this.isAssetsExpanded;
    // Close other dropdowns when opening assets
    if (this.isAssetsExpanded) {
      this.isTunnelsExpanded = false;
      this.isHeatmapExpanded = false;
    }
  }

  toggleFloor(floor: AssetFloor) {
    // Close all other floors
    this.assetFloors.forEach(f => {
      if (f.id !== floor.id) {
        f.isExpanded = false;
      }
    });
    // Toggle the clicked floor
    floor.isExpanded = !floor.isExpanded;
  }

  async selectFloor(floor: AssetFloor) {
    // Filter assets on map by selected floor
    try {
      this.selectedFloorId = floor.id;
      await this.dashboardService.filterAssetsByFloor(floor.id);
      console.log('Selected floor:', floor.title, floor.id);
    } catch (error) {
      console.error('Error filtering assets by floor:', error);
    }
  }

  async showAllAssets() {
    // Show all assets (remove floor filter)
    this.selectedFloorId = null;
    await this.dashboardService.filterAssetsByFloor('all');
    console.log('Showing all assets');
  }

  updateAssetFloorsFromCategories(categories: any[]) {
    // Keep the existing floor structure but populate with actual Equipment_Category values
    // Map the 3 types we have (mechanical, electrical, fire-fighting) to actual categories
    const categoryMap: { [key: string]: string } = {};

    categories.forEach(cat => {
      const title = cat.title.toLowerCase();
      if (title.includes('ميكانيك') || title.includes('mechanic')) {
        categoryMap['mechanical'] = cat.title;
      } else if (title.includes('كهرب') || title.includes('electric')) {
        categoryMap['electrical'] = cat.title;
      } else if (title.includes('حريق') || title.includes('fire')) {
        categoryMap['fire-fighting'] = cat.title;
      }
    });

    // Update the asset floors with actual category names
    this.assetFloors.forEach(floor => {
      floor.items = floor.items.map(item => ({
        ...item,
        // Keep the route but update with actual category if available
        title: categoryMap[item.id.split('-')[1]] || item.title
      }));
    });

    console.log('Updated asset floors:', this.assetFloors);
  }

  navigateToMain() {
    this.router.navigate(['/dashboard']);
  }

  navigateToTunnel(tunnelId: string) {
    this.router.navigate(['/tunnel-list', tunnelId]);
  }

  navigateToHeatmap() {
    this.router.navigate(['/heatmap']);
  }

  navigateToOwnerHeatmap(ownerId: string) {
    this.router.navigate(['/heatmap', ownerId]);
  }

  toggleOwnerUtilities(owner: TunnelOwner) {
    // Close all other owners' utility lists
    this.tunnelOwners.forEach(o => {
      if (o.id !== owner.id) {
        o.isExpanded = false;
      }
    });

    // Toggle the clicked owner
    owner.isExpanded = !owner.isExpanded;
  }

  navigateToOwnerUtilityHeatmap(ownerId: string, utilityName: string) {
    // Navigate to heatmap with both owner and utility filter
    this.router.navigate(['/heatmap', ownerId], {
      queryParams: { utility: utilityName }
    });
  }

  navigateToTunnelDetail(tunnelId: number) {
    this.router.navigate(['/tunnel-detail', tunnelId]);
  }

  toggleTunnelUtilities(tunnel: TunnelItem) {
    // Close all other tunnels' utility lists
    this.allTunnels.forEach(t => {
      if (t.id !== tunnel.id) {
        t.isExpanded = false;
      }
    });

    // Toggle the clicked tunnel
    tunnel.isExpanded = !tunnel.isExpanded;
  }

  navigateToTunnelUtility(tunnelId: number, utilityName: string) {
    // Find the tunnel name from the tunnelId
    const tunnel = this.allTunnels.find(t => t.id === tunnelId);
    if (!tunnel) return;

    // If already on tunnel-detail page, filter by tunnel + utility
    if (this.router.url.includes('/tunnel-detail/')) {
      // Filter the heatmap by both tunnel and utility
      this.dashboardService.filterHeatmapByTunnelAndUtility(tunnel.name, utilityName);
      return;
    }

    // Otherwise, navigate to heatmap with tunnel name and utility filter
    this.router.navigate(['/heatmap'], {
      queryParams: {
        tunnel: tunnel.name,
        utility: utilityName
      }
    });
  }
}

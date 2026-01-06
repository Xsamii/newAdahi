import { Injectable } from '@angular/core';
import { MapService } from './map.service';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { featureLayersConfig } from './featureLayersConfig';
import {
  TunnelCategory,
  UtilityInfo,
  CategoryTableRow,
  TunnelStats,
  TotalStats,
} from '../../core/models/tunnel.model';
import { BehaviorSubject, map, Observable, Subject, combineLatest } from 'rxjs';
// import Statistics from './statistics.interface';
// import { planarArea, geodesicArea } from '@arcgis/core/geometry/geometryEngine';
// import Polygon from '@arcgis/core/geometry/Polygon';
// import StatisticDefinition from '@arcgis/core/rest/support/StatisticDefinition';
// // import { suggestedMethods } from './suggestedMethods';
// import Query from '@arcgis/core/rest/support/Query';
// export interface ParcelStats {
//   nullAndAbove20Count: number;
//   // above20Count: number;
//   totalCount: number;
// }
export interface TunnelInterface {
  ARABICNAME: string;
  Class: string;
  Field: string | null;
  ID_Number: number;
  Image_path1: string | null;
  Image_path2: string | null;
  Image_path3: string | null;
  Image_path4: string | null;
  L: number | null;
  New_Notes: string;
  OBJECTID: number;
  ONEWAY: string | null;
  Owner: string;
  Path_type: number;
  Reclassfy_class: string;
  Roadcategory: string | null;
  SPEED: number | null;
  Scal: number;
  'Shape.STLength()': number;
  X_End: number;
  X_Start: number;
  Y_End: number;
  Y_Start: number;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  importancroad: string | null;
  leyout: string;
  msarat: string;
  notes: string;
  notes_1: string | null;
  widght: number | null;
  اسم_المرحلة: string;
  اضغط_لعرض_التقرير_الامن_السلامه: string | null;
  اضغط_لعرض_التقرير_الانشائ: string | null;
  اضغط_لعرض_التقرير_البيئ: string | null;
  اضغط_لعرض_التقرير_الطرق: string | null;
  اضغط_لعرض_التقرير_الكهرباء: string | null;
  اضغط_لعرض_التقرير_الميكانيكا: string | null;
  الارتفاع_بالمتر: string;
  الطول_بالمتر: number;
  الطول_كم: number;
  العرض_بالمتر: string;
  الفحص_البصرى_للطرق: string | null;
  الفرق_بين_مستوى_سطح_النفق_ومستو: number;
  المتبقى: number;
  تاريخ_تسليم_المرحلة: string | null;
  تصنيق_التركز: string | null;
  تم_تسليمه: string | null;
  نسبة_التركز: string | null;
}
export const ownerDomain = {
  '2': 'وزارة المالية',
  '1': 'امانة العاصمة المقدسة',
  '3': 'الهئية العامة للعناية بشئون الحرمين',
  '4': 'برج الساعه',
  '5': 'النفق الشرقى',
  '6': 'نفق التوسعه1',
};

export interface OwnerDomain {
  Code: string;
  Description: string;
}

export const OWNER_DOMAIN: OwnerDomain[] = [
  { Code: '1', Description: 'امانة العاصمة المقدسة' },
  { Code: '2', Description: 'وزارة المالية' },
  { Code: '3', Description: 'الهئية العامة للعناية بشئون الحرمين' },
  { Code: '4', Description: 'برج الساعه' },
  { Code: '5', Description: 'النفق الشرقى' },
  { Code: '6', Description: 'نفق التوسعه1' },
  { Code: '0', Description: 'غير محدد' },
];

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private mapView: MapView | undefined;
  private featureLayers!: (FeatureLayer | undefined)[];
  public tunnlesData: BehaviorSubject<TunnelInterface[]> = new BehaviorSubject<
    TunnelInterface[]
  >([]);
  public onwers: BehaviorSubject<TunnelCategory[]> = new BehaviorSubject<
    TunnelCategory[]
  >([]);
  public totalUtilityInof: BehaviorSubject<UtilityInfo[]> = new BehaviorSubject<
    UtilityInfo[]
  >([]);
  public tunnelStats: BehaviorSubject<TunnelStats[]> = new BehaviorSubject<
    TunnelStats[]
  >([]);
  public totalStats: BehaviorSubject<TotalStats> =
    new BehaviorSubject<TotalStats>({
      totalAssets: 0,
      totalNotes: 0,
    });

  constructor(private mapService: MapService) {}

  async initMap(): Promise<void> {
    this.mapService.initializeMap();

    this.featureLayers = featureLayersConfig.map((f) =>
      this.mapService.addFeatureLayer(
        f.url,
        f.title,
        f.visible,
        f.popupTemp,
        f.renderer
      )
    );

    // Update heatmap renderer with improved settings after layers are created
    // Wait for layers to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const heatmapConfig = featureLayersConfig.find((f) => f.index === 22);
    if (heatmapConfig && heatmapConfig.renderer) {
      this.mapService.updateHeatmapRenderer(heatmapConfig.renderer);
    }

    // Chain all API calls
    try {
      await this.getAllTunnelsData(20);
      await this.getAssetsOnwerStats();
      await this.getFahsOnwerStats();
      // Add a small delay to ensure all observables have emitted
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      throw error; // Re-throw to let app.component handle it
    }
  }

  initMapView(containerId: string) {
    this.mapView = this.mapService.initMapView(containerId);
  }
  async getAllTunnelsData(id: number) {
    // console.log('featureLayer', this.featureLayers[id]);
    // this.mapService.getLayerFieldDomains(this.featureLayers[id])
    const res = await this.mapService.filterFeatureLayers(
      this.featureLayers[id],
      '1',
      '1',
      true
    );
    //  console.log('res of tunnels',res);
    if (res?.length > 0) {
      const modifiedRes = res.map((r) => ({
        ...r,
        Owner: OWNER_DOMAIN.find((o) => o.Code == r.Owner)?.Description,
      }));
      // console.log('modified',modifiedRes);
      const uniqueOwners = [
        ...new Set(
          modifiedRes
            .map((tunnel) => tunnel.Owner)
            .filter((owner) => owner != null)
        ),
      ];
      const uniqueTunnelsTitle = [
        ...new Set(
          modifiedRes
            .map((tunnel) => tunnel.ARABICNAME)
            .filter((ARABICNAME) => ARABICNAME != null)
        ),
      ];
      //  console.log('names', uniqueTunnelsTitle);
      // console.log('owners', uniqueOwners);

      const onwersData = uniqueOwners.map((owner, index) => {
        const count = modifiedRes.filter(
          (tunnel) => tunnel.Owner === owner
        ).length;
        //  console.log('owner', owner, count);
        return {
          id: OWNER_DOMAIN.find((o) => o.Description == owner)?.Code,
          title: owner,
          count: count,
        };
      });
      // console.log('onwersData', onwersData);
      this.onwers.next(onwersData);
      this.tunnlesData.next(modifiedRes);

      // Apply color renderer to tunnel layer
      this.applyTunnelColorRenderer();
    }
  }

  private applyTunnelColorRenderer(filteredTunnels?: TunnelInterface[], colorByOwner: boolean = false): void {
    const tunnelLayer = this.featureLayers[20];
    if (!tunnelLayer) return;

    // Use filtered tunnels if provided, otherwise use all tunnels
    const tunnels = filteredTunnels || this.tunnlesData.value;
    if (tunnels.length === 0) return;

    // Color arrays matching tunnel-list component
    const colors = [
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

    let uniqueValueInfos;

    if (colorByOwner) {
      // Color by owner - group tunnels by owner and assign same color
      const uniqueOwners = [...new Set(tunnels.map(t => t.Owner || 'undefined'))];
      const ownerColorMap = new Map<string, string>();

      uniqueOwners.forEach((owner, index) => {
        const colorIndex = index % colors.length;
        ownerColorMap.set(owner, colors[colorIndex]);
      });

      uniqueValueInfos = tunnels.map((tunnel) => {
        const ownerName = tunnel.Owner || 'undefined';
        const color = ownerColorMap.get(ownerName) || colors[0];
        return {
          value: tunnel.ARABICNAME,
          symbol: {
            type: 'simple-line',
            color: color,
            width: 3,
            style: 'solid',
          },
          label: tunnel.ARABICNAME,
        };
      });
    } else {
      // Color by individual tunnel - each tunnel gets different color
      uniqueValueInfos = tunnels.map((tunnel, index) => {
        const colorIndex = index % colors.length;
        return {
          value: tunnel.ARABICNAME,
          symbol: {
            type: 'simple-line',
            color: colors[colorIndex],
            width: 3,
            style: 'solid',
          },
          label: tunnel.ARABICNAME,
        };
      });
    }

    // Create and apply the renderer
    const renderer = {
      type: 'unique-value',
      field: 'ARABICNAME',
      uniqueValueInfos: uniqueValueInfos,
      defaultSymbol: {
        type: 'simple-line',
        color: [128, 128, 128, 0.8],
        width: 2,
      },
    };

    tunnelLayer.when(() => {
      (tunnelLayer as any).renderer = renderer;
    });
  }
  async getAssetsOnwerStats() {
    const tunnelCounts = await this.mapService.getFieldValueCounts(
      this.featureLayers[20],
      'Owner',
      '1=1'
    );

    // Get tunnel data to map tunnel names (ARABICNAME) to owners
    const tunnelData = this.tunnlesData.value || [];

    // Helper function to normalize names for matching (remove special chars, convert to uppercase)
    const normalizeName = (name: string): string => {
      if (!name) return '';
      return name
        .toString()
        .toUpperCase()
        .replace(/[_\s-]/g, '') // Remove underscores, spaces, dashes
        .trim();
    };

    // Helper function to extract core identifier (e.g., "T_02" -> "T02", "T2_Lift" -> "T2")
    const extractCoreId = (name: string): string => {
      if (!name) return '';
      const normalized = normalizeName(name);
      // Match pattern like T02, T2, T_02, etc. - extract alphanumeric parts
      const match = normalized.match(/([A-Z]+)(\d+)/);
      if (match) {
        const letter = match[1];
        const number = match[2].padStart(2, '0'); // Pad to 2 digits
        return letter + number;
      }
      return normalized;
    };

    // Helper function to find matching tunnel name
    const findMatchingTunnel = (
      pathName: string
    ): { name: string; owner: string } | null => {
      if (!pathName) return null;

      const normalizedPath = normalizeName(pathName);
      const corePathId = extractCoreId(pathName);

      // First try exact match
      const exactMatch = tunnelData.find(
        (tunnel) => normalizeName(tunnel.ARABICNAME || '') === normalizedPath
      );
      if (exactMatch) {
        return {
          name: exactMatch.ARABICNAME,
          owner: exactMatch.Owner || '',
        };
      }

      // Try core ID match (e.g., T_02 matches T2_Lift, T02_Lift, etc.)
      const coreMatch = tunnelData.find((tunnel) => {
        const tunnelCoreId = extractCoreId(tunnel.ARABICNAME || '');
        return tunnelCoreId === corePathId && tunnelCoreId !== '';
      });
      if (coreMatch) {
        return {
          name: coreMatch.ARABICNAME,
          owner: coreMatch.Owner || '',
        };
      }

      // Try partial match - check if normalized path is contained in tunnel name
      const partialMatch = tunnelData.find((tunnel) => {
        const normalizedTunnel = normalizeName(tunnel.ARABICNAME || '');
        return (
          normalizedTunnel.includes(normalizedPath) ||
          normalizedPath.includes(normalizedTunnel)
        );
      });
      if (partialMatch) {
        return {
          name: partialMatch.ARABICNAME,
          owner: partialMatch.Owner || '',
        };
      }

      return null;
    };

    const getAssetCountsByPath = async (
      layer: FeatureLayer | undefined
    ): Promise<{ [ownerCode: string]: number }> => {
      if (!layer) return {};

      try {
        const allAssets = await this.mapService.filterFeatureLayers(
          layer,
          '1',
          '1',
          false
        );
        const counts: { [ownerCode: string]: number } = {};

        allAssets.forEach((asset: any) => {
          const pathName = asset.المسار || asset['المسار']; // Get المسار value
          if (pathName) {
            // Find matching tunnel by fuzzy matching
            const matchingTunnel = findMatchingTunnel(pathName);
            if (matchingTunnel && matchingTunnel.owner) {
              // Find the owner code from the description
              const ownerDomain = OWNER_DOMAIN.find(
                (o) => o.Description === matchingTunnel.owner
              );
              if (ownerDomain) {
                counts[ownerDomain.Code] = (counts[ownerDomain.Code] || 0) + 1;
              }
            } else {
              console.warn(`No matching tunnel found for path: ${pathName}`);
            }
          }
        });

        return counts;
      } catch (error) {
        console.error('Error getting asset counts by path:', error);
        return {};
      }
    };

    // Helper function to get assets per tunnel
    const getAssetsPerTunnel = async (
      layer: FeatureLayer | undefined
    ): Promise<{ [tunnelName: string]: number }> => {
      if (!layer) return {};

      try {
        const allAssets = await this.mapService.filterFeatureLayers(
          layer,
          '1',
          '1',
          false
        );
        const tunnelAssetCounts: { [tunnelName: string]: number } = {};

        allAssets.forEach((asset: any) => {
          const pathName = asset.المسار || asset['المسار']; // Get المسار value
          if (pathName) {
            // Find matching tunnel by fuzzy matching
            const matchingTunnel = findMatchingTunnel(pathName);
            if (matchingTunnel && matchingTunnel.name) {
              const tunnelName = matchingTunnel.name;
              tunnelAssetCounts[tunnelName] =
                (tunnelAssetCounts[tunnelName] || 0) + 1;
            }
          }
        });

        return tunnelAssetCounts;
      } catch (error) {
        console.error('Error getting assets per tunnel:', error);
        return {};
      }
    };

    // Get asset counts by owner code for each asset type using المسار field
    // Index 10: DBO.Property_inventory_Construction (structural)
    const struc = await getAssetCountsByPath(this.featureLayers[10]);
    // Index 7: DBO.Property_inventory_Security_safety (safety)
    const safty = await getAssetCountsByPath(this.featureLayers[7]);
    // Index 8: DBO.Property_inventory_Mechanics (mechanical)
    const mech = await getAssetCountsByPath(this.featureLayers[8]);
    // Index 9: DBO.Property_inventory_Electricity (electrical)
    const elec = await getAssetCountsByPath(this.featureLayers[9]);

    // Collect assets per tunnel from all asset layers
    const strucAssetsPerTunnel = await getAssetsPerTunnel(
      this.featureLayers[10]
    );
    const saftyAssetsPerTunnel = await getAssetsPerTunnel(
      this.featureLayers[7]
    );
    const mechAssetsPerTunnel = await getAssetsPerTunnel(this.featureLayers[8]);
    const elecAssetsPerTunnel = await getAssetsPerTunnel(this.featureLayers[9]);

    // Combine all assets per tunnel (sum across all asset types)
    const allAssetsPerTunnel: { [tunnelName: string]: number } = {};
    const allTunnelNames = new Set<string>();

    [
      strucAssetsPerTunnel,
      saftyAssetsPerTunnel,
      mechAssetsPerTunnel,
      elecAssetsPerTunnel,
    ].forEach((tunnelCounts) => {
      Object.keys(tunnelCounts).forEach((tunnelName) => {
        allTunnelNames.add(tunnelName);
        allAssetsPerTunnel[tunnelName] =
          (allAssetsPerTunnel[tunnelName] || 0) + tunnelCounts[tunnelName];
      });
    });

    // Store assets per tunnel
    this.updateTunnelStatsAssets(allAssetsPerTunnel);

    //  console.log('Tunnel counts by owner:', tunnelCounts);
    //  console.log('Asset counts by owner:',{
    //   mech,
    //   elec,
    //   roads,
    //   env,
    //   struc,
    //   safty
    //  });

    // Calculate total count for each asset type (sum across all owners)
    const calculateTotal = (assetCounts: { [key: string]: number }): number => {
      return Object.values(assetCounts).reduce((sum, count) => sum + count, 0);
    };

    const totalMech = calculateTotal(mech) || 0;
    const totalElec = calculateTotal(elec) || 0;
    const totalSafty = calculateTotal(safty) || 0;
    const totalStruc = calculateTotal(struc) || 0;

    // Create UtilityInfo array with total counts for each type
    const utilities: UtilityInfo[] = [
      { name: 'الميكانيكا', assetsCount: Number(totalMech) || 0 },
      { name: 'الكهرباء', assetsCount: Number(totalElec) || 0 },
      //  { name: 'الطرق', assetsCount: Number(totalRoads) },
      { name: 'البيئية', assetsCount: 0 },
      { name: 'السلامة', assetsCount: Number(totalSafty) || 0 },
      { name: 'الإنشائية', assetsCount: Number(totalStruc) || 0 },
    ];
    console.log('utilitiessssssssss', utilities);
    this.totalUtilityInof.next(utilities);

    // Get all unique owner codes from tunnel counts and asset counts
    const allOwnerCodes = new Set<string>();
    Object.keys(tunnelCounts).forEach((code) => allOwnerCodes.add(code));
    [mech, elec, safty, struc].forEach((assetCounts) => {
      Object.keys(assetCounts).forEach((code) => allOwnerCodes.add(code));
    });

    const ownersWithUtilities: TunnelCategory[] = Array.from(allOwnerCodes).map(
      (ownerCode) => {
        // Normalize null/undefined/empty owner codes to '0'
        const normalizedCode =
          !ownerCode || ownerCode === 'null' || ownerCode === 'undefined'
            ? '0'
            : ownerCode;

        // Get owner name from OWNER_DOMAIN (map code to description)
        const ownerDomain = OWNER_DOMAIN.find((o) => o.Code === normalizedCode);
        const ownerName = ownerDomain
          ? ownerDomain.Description
          : normalizedCode;

        // Build tableRows array for this owner with per-owner asset counts
        const tableRows: CategoryTableRow[] = [
          { name: 'الميكانيكا', assetsCount: Number(mech[ownerCode] || 0) },
          { name: 'الكهرباء', assetsCount: Number(elec[ownerCode] || 0) },
          //  { name: 'الطرق', assetsCount: Number(roads[ownerCode] || 0) },
          { name: 'البيئية', assetsCount: 0 },
          { name: 'السلامة', assetsCount: Number(safty[ownerCode] || 0) },
          { name: 'الإنشائية', assetsCount: Number(struc[ownerCode] || 0) },
        ];

        // Use tunnel count as the main count (number of tunnels per owner)
        const tunnelCount = tunnelCounts[ownerCode] || 0;

        return {
          id: normalizedCode,
          title: ownerName,
          count: tunnelCount,
          assets: utilities,
          tableRows: tableRows,
        };
      }
    );

    this.onwers.next(ownersWithUtilities);
  }

  // Helper function to update tunnel stats with assets data
  private updateTunnelStatsAssets(assetsPerTunnel: {
    [tunnelName: string]: number;
  }) {
    const existingStats = this.tunnelStats.value || [];
    const statsMap = new Map<string, TunnelStats>();

    // Initialize with existing stats
    existingStats.forEach((stat) => {
      statsMap.set(stat.tunnelName, { ...stat });
    });

    // Update or create stats with assets data
    Object.keys(assetsPerTunnel).forEach((tunnelName) => {
      const existing = statsMap.get(tunnelName);
      if (existing) {
        existing.assetsCount = assetsPerTunnel[tunnelName];
      } else {
        statsMap.set(tunnelName, {
          tunnelName,
          assetsCount: assetsPerTunnel[tunnelName],
          notesCount: 0,
        });
      }
    });

    // Update BehaviorSubject
    const updatedStats = Array.from(statsMap.values());
    this.tunnelStats.next(updatedStats);

    // Calculate and update total assets count
    const totalAssets = updatedStats.reduce(
      (sum, stat) => sum + (stat.assetsCount || 0),
      0
    );
    const currentTotalStats = this.totalStats.value;
    this.totalStats.next({
      ...currentTotalStats,
      totalAssets,
    });
  }

  // Helper function to update tunnel stats with notes data
  private updateTunnelStatsNotes(notesPerTunnel: {
    [tunnelName: string]: number;
  }) {
    const existingStats = this.tunnelStats.value || [];
    const statsMap = new Map<string, TunnelStats>();

    // Initialize with existing stats
    existingStats.forEach((stat) => {
      statsMap.set(stat.tunnelName, { ...stat });
    });

    // Update or create stats with notes data
    Object.keys(notesPerTunnel).forEach((tunnelName) => {
      const existing = statsMap.get(tunnelName);
      if (existing) {
        existing.notesCount = notesPerTunnel[tunnelName];
      } else {
        statsMap.set(tunnelName, {
          tunnelName,
          assetsCount: 0,
          notesCount: notesPerTunnel[tunnelName],
        });
      }
    });

    // Update BehaviorSubject
    const updatedStats = Array.from(statsMap.values());
    this.tunnelStats.next(updatedStats);

    // Calculate and update total notes count
    const totalNotes = updatedStats.reduce(
      (sum, stat) => sum + (stat.notesCount || 0),
      0
    );
    const currentTotalStats = this.totalStats.value;
    this.totalStats.next({
      ...currentTotalStats,
      totalNotes,
    });
  }

  async getFahsOnwerStats() {
    // Get tunnel data for matching
    const tunnelData = this.tunnlesData.value || [];

    // Helper function to normalize names for matching (same as in getAssetsOnwerStats)
    const normalizeName = (name: string): string => {
      if (!name) return '';
      return name
        .toString()
        .toUpperCase()
        .replace(/[_\s-]/g, '')
        .trim();
    };

    const extractCoreId = (name: string): string => {
      if (!name) return '';
      const normalized = normalizeName(name);
      const match = normalized.match(/([A-Z]+)(\d+)/);
      if (match) {
        const letter = match[1];
        const number = match[2].padStart(2, '0');
        return letter + number;
      }
      return normalized;
    };

    // Helper function to find matching tunnel name
    const findMatchingTunnelByName = (name: string): string | null => {
      if (!name) return null;
      const normalizedName = normalizeName(name);
      const coreId = extractCoreId(name);

      // Try exact match
      const exactMatch = tunnelData.find(
        (tunnel) => normalizeName(tunnel.ARABICNAME || '') === normalizedName
      );
      if (exactMatch) return exactMatch.ARABICNAME || null;

      // Try core ID match
      const coreMatch = tunnelData.find((tunnel) => {
        const tunnelCoreId = extractCoreId(tunnel.ARABICNAME || '');
        return tunnelCoreId === coreId && tunnelCoreId !== '';
      });
      if (coreMatch) return coreMatch.ARABICNAME || null;

      // Try partial match
      const partialMatch = tunnelData.find((tunnel) => {
        const normalizedTunnel = normalizeName(tunnel.ARABICNAME || '');
        return (
          normalizedTunnel.includes(normalizedName) ||
          normalizedName.includes(normalizedTunnel)
        );
      });
      if (partialMatch) return partialMatch.ARABICNAME || null;

      return null;
    };

    // Helper function to get notes per tunnel from a notes layer
    const getNotesPerTunnel = async (
      layer: FeatureLayer | undefined,
      fieldName: string = 'ARABICNAME'
    ): Promise<{ [tunnelName: string]: number }> => {
      if (!layer) return {};

      try {
        const allNotes = await this.mapService.filterFeatureLayers(
          layer,
          '1',
          '1',
          false
        );
        const tunnelNotesCounts: { [tunnelName: string]: number } = {};

        allNotes.forEach((note: any) => {
          // Try different possible field names for tunnel name
          const tunnelNameFromNote =
            note[fieldName] ||
            note.ARABICNAME ||
            note['ARABICNAME'] ||
            note.المسار ||
            note['المسار'] ||
            note.msarat ||
            note['msarat'];

          if (tunnelNameFromNote) {
            // Find matching tunnel name using fuzzy matching
            const matchingTunnelName =
              findMatchingTunnelByName(tunnelNameFromNote);
            if (matchingTunnelName) {
              tunnelNotesCounts[matchingTunnelName] =
                (tunnelNotesCounts[matchingTunnelName] || 0) + 1;
            }
          }
        });

        return tunnelNotesCounts;
      } catch (error) {
        console.error('Error getting notes per tunnel:', error);
        return {};
      }
    };

    // Get notes counts by owner code for each inspection layer
    // Index 0: الفحص البصري للأعمال الميكانيكية (mechanical inspection)
    const mech = await this.mapService.getFieldValueCounts(
      this.featureLayers[0],
      'Owner',
      '1=1'
    );
    // Index 1: الفحص البصري للأعمال الكهربائية (electrical inspection)
    const elec = await this.mapService.getFieldValueCounts(
      this.featureLayers[1],
      'Owner',
      '1=1'
    );

    // Index 3: الفحص البصرى للنظام البيئى (environmental inspection)
    const env = await this.mapService.getFieldValueCounts(
      this.featureLayers[3],
      'Owner',
      '1=1'
    );
    console.log('env', env);
    // Index 4: الفحص البصرى للنظام الامن والسلامه (safety inspection)
    const safty = await this.mapService.getFieldValueCounts(
      this.featureLayers[4],
      'المالك',
      '1=1'
    );
    // Index 5: الفحص البصرى للاعمال الانشائية (structural inspection)
    const struc = await this.mapService.getFieldValueCounts(
      this.featureLayers[5],
      'Owner',
      '1=1'
    );

    // Collect notes per tunnel from all inspection layers
    const mechNotesPerTunnel = await getNotesPerTunnel(this.featureLayers[0]);
    const elecNotesPerTunnel = await getNotesPerTunnel(this.featureLayers[1]);
    const envNotesPerTunnel = await getNotesPerTunnel(this.featureLayers[3]);
    const saftyNotesPerTunnel = await getNotesPerTunnel(
      this.featureLayers[4],
      'المالك'
    );
    const strucNotesPerTunnel = await getNotesPerTunnel(this.featureLayers[5]);

    // Combine all notes per tunnel (sum across all inspection types)
    const allNotesPerTunnel: { [tunnelName: string]: number } = {};

    [
      mechNotesPerTunnel,
      elecNotesPerTunnel,
      envNotesPerTunnel,
      saftyNotesPerTunnel,
      strucNotesPerTunnel,
    ].forEach((tunnelCounts) => {
      Object.keys(tunnelCounts).forEach((tunnelName) => {
        allNotesPerTunnel[tunnelName] =
          (allNotesPerTunnel[tunnelName] || 0) + tunnelCounts[tunnelName];
      });
    });

    // Store notes per tunnel
    this.updateTunnelStatsNotes(allNotesPerTunnel);

    // Calculate total count for each notes type (sum across all owners)
    const calculateTotal = (notesCounts: { [key: string]: number }): number => {
      return Object.values(notesCounts).reduce((sum, count) => sum + count, 0);
    };

    const totalMech = calculateTotal(mech);
    const totalElec = calculateTotal(elec);
    const totalEnv = calculateTotal(env);
    const totalSafty = calculateTotal(safty);
    const totalStruc = calculateTotal(struc);

    // Get existing utilities and merge notesCount into them
    const existingUtilities = this.totalUtilityInof.value || [];
    const utilities: UtilityInfo[] = existingUtilities.map((utility) => {
      // Find matching notes count for this utility
      let notesCount = 0;
      if (utility.name === 'الميكانيكا') notesCount = Number(totalMech);
      else if (utility.name === 'الكهرباء') notesCount = Number(totalElec);
      // else if (utility.name === 'الطرق') notesCount = Number(totalRoads);
      else if (utility.name === 'البيئية') notesCount = Number(totalEnv);
      else if (utility.name === 'السلامة') notesCount = Number(totalSafty);
      else if (utility.name === 'الإنشائية') notesCount = Number(totalStruc);

      return {
        ...utility,
        notesCount: notesCount || utility.notesCount || 0,
      };
    });
    this.totalUtilityInof.next(utilities);

    // Get existing owners data from BehaviorSubject
    const existingOwners = this.onwers.value || [];

    // Merge notes data into existing owners data
    const ownersWithNotes: TunnelCategory[] = existingOwners.map((owner) => {
      const ownerCode = owner.id;

      // Build notes array for this owner with per-owner notes counts
      const notes: UtilityInfo[] = [
        {
          name: 'الميكانيكا',
          assetsCount: 0,
          notesCount: Number(mech[ownerCode] || 0),
        },
        {
          name: 'الكهرباء',
          assetsCount: 0,
          notesCount: Number(elec[ownerCode] || 0),
        },

        {
          name: 'البيئية',
          assetsCount: 0,
          notesCount: Number(env[ownerCode] || 0),
        },
        {
          name: 'السلامة',
          assetsCount: 0,
          notesCount: Number(safty[ownerCode] || 0),
        },
        {
          name: 'الإنشائية',
          assetsCount: 0,
          notesCount: Number(struc[ownerCode] || 0),
        },
      ];

      // Update tableRows to include notesCount alongside existing assetsCount
      const updatedTableRows: CategoryTableRow[] = owner.tableRows
        ? owner.tableRows.map((row) => {
            // Find matching notes count for this row
            const matchingNote = notes.find((note) => note.name === row.name);
            return {
              ...row,
              notesCount: matchingNote
                ? matchingNote.notesCount
                : row.notesCount || 0,
            };
          })
        : // If no existing tableRows, create new ones with both assetsCount and notesCount
          [
            {
              name: 'الميكانيكا',
              assetsCount: 0,
              notesCount: Number(mech[ownerCode] || 0),
            },
            {
              name: 'الكهرباء',
              assetsCount: 0,
              notesCount: Number(elec[ownerCode] || 0),
            },
            {
              name: 'البيئية',
              assetsCount: 0,
              notesCount: Number(env[ownerCode] || 0),
            },
            {
              name: 'السلامة',
              assetsCount: 0,
              notesCount: Number(safty[ownerCode] || 0),
            },
            {
              name: 'الإنشائية',
              assetsCount: 0,
              notesCount: Number(struc[ownerCode] || 0),
            },
          ];

      return {
        ...owner,
        notes: notes, // Add notes property
        tableRows: updatedTableRows, // Update tableRows with notesCount
      };
    });

    console.log('Owners with notes added:', ownersWithNotes);
    this.onwers.next(ownersWithNotes);
  }

  async getTunnelNotesStats() {
    // console.log('featureLayers', this.featureLayers[22]);
    const notes = await this.mapService.getLayerFeatureCount(
      this.featureLayers[22]
    );
    console.log('notes', notes);
  }

  // Get assets and notes counts per utility for a specific tunnel
  async getTunnelUtilityStats(tunnelName: string): Promise<UtilityInfo[]> {
    if (!tunnelName) return [];

    const tunnelData = this.tunnlesData.value || [];

    // Helper function to normalize names for matching
    const normalizeName = (name: string): string => {
      if (!name) return '';
      return name
        .toString()
        .toUpperCase()
        .replace(/[_\s-]/g, '')
        .trim();
    };

    const extractCoreId = (name: string): string => {
      if (!name) return '';
      const normalized = normalizeName(name);
      const match = normalized.match(/([A-Z]+)(\d+)/);
      if (match) {
        const letter = match[1];
        const number = match[2].padStart(2, '0');
        return letter + number;
      }
      return normalized;
    };

    // Helper function to find matching tunnel name
    const findMatchingTunnel = (pathName: string): string | null => {
      if (!pathName) return null;
      const normalizedPath = normalizeName(pathName);
      const corePathId = extractCoreId(pathName);
      const normalizedTunnelName = normalizeName(tunnelName);

      // First try exact match with target tunnel
      if (normalizedPath === normalizedTunnelName) {
        return tunnelName;
      }

      // Try core ID match
      const tunnelCoreId = extractCoreId(tunnelName);
      if (corePathId === tunnelCoreId && tunnelCoreId !== '') {
        return tunnelName;
      }

      // Try partial match
      if (
        normalizedPath.includes(normalizedTunnelName) ||
        normalizedTunnelName.includes(normalizedPath)
      ) {
        return tunnelName;
      }

      return null;
    };

    // Helper function to get assets per utility for this tunnel
    const getAssetsPerUtility = async (
      layer: FeatureLayer | undefined,
      utilityName: string
    ): Promise<number> => {
      if (!layer) return 0;

      try {
        const allAssets = await this.mapService.filterFeatureLayers(
          layer,
          '1',
          '1',
          false
        );
        let count = 0;

        allAssets.forEach((asset: any) => {
          const pathName = asset.المسار || asset['المسار'];
          if (pathName) {
            const matchingTunnel = findMatchingTunnel(pathName);
            if (matchingTunnel === tunnelName) {
              count++;
            }
          }
        });

        return count;
      } catch (error) {
        console.error(`Error getting assets for ${utilityName}:`, error);
        return 0;
      }
    };

    // Helper function to get notes per utility for this tunnel
    const getNotesPerUtility = async (
      layer: FeatureLayer | undefined,
      utilityName: string,
      fieldName: string = 'ARABICNAME'
    ): Promise<number> => {
      if (!layer) return 0;

      try {
        const allNotes = await this.mapService.filterFeatureLayers(
          layer,
          '1',
          '1',
          false
        );
        let count = 0;

        allNotes.forEach((note: any) => {
          const tunnelNameFromNote =
            note[fieldName] ||
            note.ARABICNAME ||
            note['ARABICNAME'] ||
            note.المسار ||
            note['المسار'] ||
            note.msarat ||
            note['msarat'];

          if (tunnelNameFromNote) {
            const matchingTunnel = findMatchingTunnel(tunnelNameFromNote);
            if (matchingTunnel === tunnelName) {
              count++;
            }
          }
        });

        return count;
      } catch (error) {
        console.error(`Error getting notes for ${utilityName}:`, error);
        return 0;
      }
    };

    // Get assets per utility for this tunnel
    // Index 8: Mechanical assets
    const mechAssets = await getAssetsPerUtility(
      this.featureLayers[8],
      'الميكانيكا'
    );
    // Index 9: Electrical assets
    const elecAssets = await getAssetsPerUtility(
      this.featureLayers[9],
      'الكهرباء'
    );
    // Index 7: Safety assets
    const saftyAssets = await getAssetsPerUtility(
      this.featureLayers[7],
      'السلامة'
    );
    // Index 10: Structural assets
    const strucAssets = await getAssetsPerUtility(
      this.featureLayers[10],
      'الإنشائية'
    );

    // Get notes per utility for this tunnel
    // Index 0: Mechanical notes
    const mechNotes = await getNotesPerUtility(
      this.featureLayers[0],
      'الميكانيكا'
    );
    // Index 1: Electrical notes
    const elecNotes = await getNotesPerUtility(
      this.featureLayers[1],
      'الكهرباء'
    );
    // Index 3: Environmental notes
    const envNotes = await getNotesPerUtility(this.featureLayers[3], 'البيئية');
    // Index 4: Safety notes
    const saftyNotes = await getNotesPerUtility(
      this.featureLayers[4],
      'السلامة',
      'المالك'
    );
    // Index 5: Structural notes
    const strucNotes = await getNotesPerUtility(
      this.featureLayers[5],
      'الإنشائية'
    );

    // Build utility info array with tunnel-specific counts
    const utilities: UtilityInfo[] = [
      {
        name: 'الميكانيكا',
        assetsCount: mechAssets,
        notesCount: mechNotes,
      },
      {
        name: 'الكهرباء',
        assetsCount: elecAssets,
        notesCount: elecNotes,
      },
      {
        name: 'البيئية',
        assetsCount: 0,
        notesCount: envNotes,
      },
      {
        name: 'السلامة',
        assetsCount: saftyAssets,
        notesCount: saftyNotes,
      },
      {
        name: 'الإنشائية',
        assetsCount: strucAssets,
        notesCount: strucNotes,
      },
    ];

    return utilities;
  }
  async filterTunnelsOnOwner(
    ownerId: string | number,
    zoomToFeatures: boolean = true
  ) {
    // Special handling for '0' (undefined) owner - use NULL filtering
    if (ownerId === '0') {
      // For undefined owner, filter for NULL or empty Owner field
      if (this.featureLayers[20]) {
        this.featureLayers[20].definitionExpression =
          "Owner IS NULL OR Owner = '' OR Owner = 'null' OR Owner = 'undefined'";
      }
      // Filter other layers similarly
      [
        this.featureLayers[1],
        this.featureLayers[2],
        this.featureLayers[3],
        this.featureLayers[5],
        this.featureLayers[0],
      ].forEach((layer) => {
        if (layer) {
          layer.definitionExpression =
            "Owner IS NULL OR Owner = '' OR Owner = 'null' OR Owner = 'undefined'";
        }
      });
      // Layer 4 uses different field name
      if (this.featureLayers[4]) {
        this.featureLayers[4].definitionExpression =
          "المالك IS NULL OR المالك = '' OR المالك = 'null' OR المالك = 'undefined'";
      }
    } else {
      // Normal filtering for other owners
      await this.mapService.filterFeatureLayers(
        this.featureLayers[20],
        'Owner',
        ownerId,
        zoomToFeatures
      );
      await this.mapService.filterFeatureLayers(
        this.featureLayers[1],
        'Owner',
        ownerId
      );
      await this.mapService.filterFeatureLayers(
        this.featureLayers[2],
        'Owner',
        ownerId
      );
      await this.mapService.filterFeatureLayers(
        this.featureLayers[3],
        'Owner',
        ownerId
      );
      await this.mapService.filterFeatureLayers(
        this.featureLayers[4],
        'المالك',
        ownerId
      );
      await this.mapService.filterFeatureLayers(
        this.featureLayers[5],
        'Owner',
        ownerId
      );
      await this.mapService.filterFeatureLayers(
        this.featureLayers[0],
        'Owner',
        ownerId
      );
    }

    // Get the owner name to filter tunnels
    const ownerName = OWNER_DOMAIN.find((o) => o.Code == ownerId)?.Description;
    if (ownerName) {
      const filteredTunnels = this.tunnlesData.value.filter((tunnel) => {
        // Special handling for '0' (undefined) owner
        if (ownerId === '0') {
          return (
            !tunnel.Owner ||
            tunnel.Owner === 'null' ||
            tunnel.Owner === 'undefined'
          );
        }
        return tunnel.Owner === ownerName;
      });
      // Reapply colors based on filtered tunnels
      this.applyTunnelColorRenderer(filteredTunnels);
    }
  }
  async filterTunnelOnId(id: string | number) {
    // Hide point layers from index 0 to 5 before filtering
    for (let i = 0; i <= 5; i++) {
      if (this.featureLayers[i]) {
        this.featureLayers[i].visible = false;
      }
    }
    const res = await this.mapService.filterFeatureLayers(
      this.featureLayers[20],
      'ID_Number',
      id,
      true
    );
  }

  // Filter heatmap by specific tunnel ID
  async filterHeatmapByTunnel(tunnelName: string): Promise<void> {
    console.log('heat map filter by tunnel',tunnelName);
    // Filter heatmap layer (index 22) by tunnel name using ID_Number_path field
    if (this.featureLayers[22]) {
      await this.mapService.filterFeatureLayers(
        this.featureLayers[22],
        'ARABICNAME',
        tunnelName,
        true
      );
    }
  }

  toggleUtilityLayers(selectedUtilityIndices: number[]): void {
    // Map utility indices to their corresponding layer indices in featureLayersConfig
    // Utility index 0 (الميكانيكا) -> Layer index 0
    // Utility index 1 (الكهرباء) -> Layer index 1
    // Utility index 2 (السلامة) -> Layer index 4
    // Utility index 3 (الإنشائية) -> Layer index 5

    const utilityToLayerMap: { [key: number]: number } = {
      0: 0, // الميكانيكا -> Mechanical inspection
      1: 1, // الكهرباء -> Electrical inspection
      2: 4, // السلامة -> Safety inspection
      3: 5, // الإنشائية -> Structural inspection
    };

    // Get all inspection layer indices
    const inspectionLayerIndices = [0, 1, 4, 5];

    // Set visibility for all inspection layers
    inspectionLayerIndices.forEach((layerIndex) => {
      const layer = this.featureLayers[layerIndex];
      if (layer) {
        // Check if this layer should be visible based on selected utilities
        const shouldBeVisible = selectedUtilityIndices.some(
          (utilityIndex) => utilityToLayerMap[utilityIndex] === layerIndex
        );
        layer.visible = shouldBeVisible;
      }
    });
  }

  // Show heatmap layers
  showHeatmapLayers(): void {
    this.mapService.setHeatmapVisibility(true);
  }

  // Hide heatmap layers
  hideHeatmapLayers(): void {
    this.mapService.setHeatmapVisibility(false);
  }

  // Filter heatmap by owner and zoom to it
  async filterHeatmapByOwner(ownerId: string | number): Promise<void> {
    // Special handling for '0' (undefined) owner - use NULL filtering
    if (ownerId === '0') {
      // For undefined owner, filter for NULL or empty Owner field
      const nullFilter =
        "Owner IS NULL OR Owner = '' OR Owner = 'null' OR Owner = 'undefined'";

      if (this.featureLayers[22]) {
        this.featureLayers[22].definitionExpression = nullFilter;
      }
      if (this.featureLayers[20]) {
        this.featureLayers[20].definitionExpression = nullFilter;
      }
    } else {
      // Normal filtering for other owners
      // Filter the heatmap layer (index 22) by owner and zoom to it
      await this.mapService.filterFeatureLayers(
        this.featureLayers[22],
        'Owner',
        ownerId,
        true // Zoom to features
      );

      // Also filter the tunnel layer to show colored tunnels (no zoom)
      await this.mapService.filterFeatureLayers(
        this.featureLayers[20],
        'Owner',
        ownerId,
        false // Don't zoom again
      );
    }
    // Filter the heatmap layer (index 22) by owner
    await this.mapService.filterFeatureLayers(
      this.featureLayers[22],
      'Owner',
      ownerId,
      false // Don't zoom on heatmap layer
    );

    // Filter the tunnel layer to show colored tunnels
    await this.mapService.filterFeatureLayers(
      this.featureLayers[20],
      'Owner',
      ownerId,
      false // We'll zoom to tunnels layer separately
    );

    // Zoom to the filtered features in the tunnels layer (index 20)
    // Same as tunnel pages - zoom to actual tunnel features
    await this.mapService.zoomToLayerExtent(this.featureLayers[20], 1.5);

    // Update tunnel colors
    const ownerName = OWNER_DOMAIN.find((o) => o.Code == ownerId)?.Description;
    if (ownerName) {
      const filteredTunnels = this.tunnlesData.value.filter((tunnel) => {
        // Special handling for '0' (undefined) owner
        if (ownerId === '0') {
          return (
            !tunnel.Owner ||
            tunnel.Owner === 'null' ||
            tunnel.Owner === 'undefined'
          );
        }
        return tunnel.Owner === ownerName;
      });
      this.applyTunnelColorRenderer(filteredTunnels);
    }
  }

  // Filter heatmap by owner and utility type
  async filterHeatmapByUtility(
    ownerId: string | number,
    utilityName: string
  ): Promise<void> {
    // Get the owner name from the code
    const ownerName = OWNER_DOMAIN.find((o) => o.Code == ownerId)?.Description;
    if (!ownerName) return;

    // Map utility names to their corresponding MERGE_SRC values
    const utilityMergeSrcMap: { [key: string]: string } = {
      الميكانيكا: 'DBO.الفحص_البصري_للأعمال_الميكانيكية',
      الكهرباء: 'DBO.الفحص_البصري_للأعمال_الكهربائية',
      الطرق: 'DBO.الفحص_البصري_للأعمال_الطرق',
      البيئية: 'DBO.الفحص_البصرى_للنظام_البيئى',
      السلامة: 'DBO.الفحص_البصرى_للنظام_الامن_والسلامه',
      الإنشائية: 'DBO.الفحص_البصرى_للاعمال_الانشائية',
    };

    const mergeSrcValue = utilityMergeSrcMap[utilityName];
    if (!mergeSrcValue) return;

    // Keep main heatmap layer visible
    if (this.featureLayers[22]) {
      this.featureLayers[22].visible = true;
    }

    // Hide all individual inspection layers
    for (let i = 0; i <= 5; i++) {
      if (this.featureLayers[i]) {
        this.featureLayers[i].visible = false;
      }
    }

    // Filter the main heatmap layer by both owner and MERGE_SRC
    const heatmapLayer = this.featureLayers[22];
    if (heatmapLayer) {
      // Create combined filter for owner and MERGE_SRC
      const combinedFilter = `Owner = '${ownerId}' AND MERGE_SRC = '${mergeSrcValue}'`;
      heatmapLayer.definitionExpression = combinedFilter;
    }

    // Filter the tunnel layer to show colored tunnels
    await this.mapService.filterFeatureLayers(
      this.featureLayers[20],
      'Owner',
      ownerId,
      false // We'll zoom to tunnels layer separately
    );

    // Zoom to the filtered features in the tunnels layer (index 20)
    // Same as tunnel pages - zoom to actual tunnel features
    await this.mapService.zoomToLayerExtent(this.featureLayers[20], 1.5);

    // Update tunnel colors
    const filteredTunnels = this.tunnlesData.value.filter(
      (tunnel) => tunnel.Owner === ownerName
    );
    this.applyTunnelColorRenderer(filteredTunnels);
  }

  // Filter heatmap by tunnel name and utility type
  async filterHeatmapByTunnelAndUtility(
    tunnelName: string,
    utilityName: string
  ): Promise<void> {
    // Map utility names to their corresponding MERGE_SRC values
    const utilityMergeSrcMap: { [key: string]: string } = {
      الميكانيكا: 'DBO.الفحص_البصري_للأعمال_الميكانيكية',
      الكهرباء: 'DBO.الفحص_البصري_للأعمال_الكهربائية',
      الطرق: 'DBO.الفحص_البصري_للأعمال_الطرق',
      البيئية: 'DBO.الفحص_البصرى_للنظام_البيئى',
      السلامة: 'DBO.الفحص_البصرى_للنظام_الامن_والسلامه',
      الإنشائية: 'DBO.الفحص_البصرى_للاعمال_الانشائية',
    };

    const mergeSrcValue = utilityMergeSrcMap[utilityName];
    if (!mergeSrcValue) {
      console.warn('Unknown utility name:', utilityName);
      return;
    }

    // Keep main heatmap layer visible
    if (this.featureLayers[22]) {
      this.featureLayers[22].visible = true;
    }

    // Hide all individual inspection layers
    for (let i = 0; i <= 5; i++) {
      if (this.featureLayers[i]) {
        this.featureLayers[i].visible = false;
      }
    }

    // Filter the main heatmap layer by both tunnel name and MERGE_SRC
    const heatmapLayer = this.featureLayers[22];
    if (heatmapLayer) {
      const combinedFilter = `ARABICNAME = '${tunnelName}' AND MERGE_SRC = '${mergeSrcValue}'`;
      heatmapLayer.definitionExpression = combinedFilter;

      // Zoom to the filtered heatmap features
      await this.mapService.zoomToLayerExtent(heatmapLayer, 1.5);
    }

    // Filter the tunnel layer to show only the selected tunnel
    await this.mapService.filterFeatureLayers(
      this.featureLayers[20],
      'ARABICNAME',
      tunnelName,
      false
    );
  }

  // Reset heatmap filters to show all data
  async resetHeatmapFilters(): Promise<void> {
    // Show the main heatmap layer again
    if (this.featureLayers[22]) {
      this.featureLayers[22].visible = true;
    }

    // Show the tunnel layer
    if (this.featureLayers[20]) {
      this.featureLayers[20].visible = true;
    }

    // Hide all individual inspection layers
    for (let i = 0; i <= 5; i++) {
      if (this.featureLayers[i]) {
        this.featureLayers[i].visible = false;
      }
    }

    // Remove filters from heatmap layer (index 22) without going home
    if (this.featureLayers[22]) {
      this.featureLayers[22].definitionExpression = '1=1';
    }

    // Remove filters from tunnel layer (index 20) without going home
    if (this.featureLayers[20]) {
      this.featureLayers[20].definitionExpression = '1=1';
    }

    // Zoom to all features in the tunnels layer (index 20)
    // Same as tunnel pages - zoom to actual tunnel features
    await this.mapService.zoomToLayerExtent(this.featureLayers[20], 1.5);

    // Reapply colors for all tunnels
    this.applyTunnelColorRenderer();
  }

  // Show all tunnels without heatmap (for tunnel-list page)
  showAllTunnels(): void {
    // Remove filters from tunnel layer (index 20)
    this.mapService.removeAllFilters(this.featureLayers[20]);

    // Reapply colors for all tunnels, colored by owner
    this.applyTunnelColorRenderer(undefined, true);
  }

  // Get inspection type statistics
  async getInspectionTypeStats(): Promise<{ name: string; count: number }[]> {
    const inspectionLayers = [
      { index: 0, name: 'الميكانيكا' },
      { index: 1, name: 'الكهرباء' },
      { index: 3, name: 'البيئية' },
      { index: 4, name: 'السلامة' },
      { index: 5, name: 'الإنشائية' },
    ];

    const stats = await Promise.all(
      inspectionLayers.map(async (layer) => {
        const count = await this.mapService.getLayerFeatureCount(
          this.featureLayers[layer.index]
        );
        return { name: layer.name, count };
      })
    );

    return stats;
  }

  // Get danger level statistics from all inspection layers
  async getDangerLevelStats(): Promise<{ name: string; count: number }[]> {
    // The correct field name is "درجةالمخاطروالعيوب"
    const fieldName = 'درجةالمخاطروالعيوب';

    // Aggregate counts from all inspection layers (0, 1, 3, 4, 5)
    const inspectionLayerIndices = [0, 1, 3, 4, 5];
    const allDangerLevels: { [key: string]: number } = {};

    for (const layerIndex of inspectionLayerIndices) {
      const layer = this.featureLayers[layerIndex];
      if (!layer) continue;

      try {
        const counts = await this.mapService.getFieldValueCounts(
          layer,
          fieldName,
          '1=1'
        );

        if (counts && Object.keys(counts).length > 0) {
          // Aggregate the counts
          Object.entries(counts).forEach(([key, value]) => {
            if (key && key !== 'null' && key !== 'undefined') {
              allDangerLevels[key] =
                (allDangerLevels[key] || 0) + Number(value);
            }
          });
        }
      } catch (error) {
        console.error(
          `Error getting danger level stats for layer ${layerIndex}:`,
          error
        );
        continue;
      }
    }

    // Convert to array format
    return Object.entries(allDangerLevels).map(([name, count]) => ({
      name,
      count,
    }));
  }

  //   filterGeoLocation(locations: { name: string; checked: boolean }[]) {
  //     this.clearUIFiltersMethods();
  //     // console.log('vvvv', locations);
  //     const values: string[] = locations
  //       .filter((loc) => loc.checked)
  //       .map((loc) => loc.name);
  //     if (values.length === 0) {
  //       // this.mapService.removeAllFilters(this.featureLayers[3]);
  //       this.mapService.removeAllFilters(this.featureLayers[2], true);
  //     } else {
  //       this.mapService.filterFeatureLayersWithManyValues(
  //         this.featureLayers[3],
  //         'الموقع_بالنسبة_للطرق_الدائري',
  //         values
  //       );
  //       this.mapService.filterFeatureLayersWithManyValues(
  //         this.featureLayers[2],
  //         'الموقع_بالنسبة_للطرق_الدائري',
  //         values,
  //         true
  //       );
  //     }
  //   }
  //   filterMainValues(
  //     locations: { name: string; checked: boolean }[],
  //     ceriteria: { name: string; selected: boolean }[],
  //     suugestedMEth?: { label: string; selected: boolean }[]
  //   ) {
  //     // this.filterName.next('');
  //     console.log('empt', suugestedMEth, locations, ceriteria);
  //     if (suugestedMEth && suugestedMEth.filter((s) => s.selected).length > 0) {
  //       // console.log('11111');
  //       console.log(suugestedMEth);
  //       const filterLocaion: { fieldName: string; values: (string | number)[] } =
  //         {
  //           fieldName: 'الموقع_بالنسبة_للطرق_الدائري',
  //           values: locations.filter((loc) => loc.checked).map((loc) => loc.name),
  //         };
  //       const filterCriteria: { fieldName: string; values: (string | number)[] } =
  //         {
  //           fieldName: 'التصنيف_الرئيسي_1',
  //           values: ceriteria
  //             .filter((cer) => cer.selected)
  //             .map((cer) => cer.name),
  //         };
  //       const filterSuggested: {
  //         fieldName: string;
  //         values: (string | number)[];
  //       } = {
  //         fieldName: 'التصنيف_الفرعي',
  //         values: suugestedMEth.filter((m) => m.selected).map((m) => m.label),
  //       };
  //       console.log('filterrr suggested', filterSuggested);
  //       this.mapService.filterFeatureLayersWithManyFieldsAndValues(
  //         this.featureLayers[2],
  //         [filterLocaion, filterSuggested],
  //         true
  //       );
  //       //filtering services on geolocation
  //       this.mapService.filterFeatureLayersWithManyFieldsAndValues(
  //         this.featureLayers[8],
  //         [filterLocaion]
  //       );
  //     } else {
  //       console.log('22222');
  //       const filterLocaion: { fieldName: string; values: (string | number)[] } =
  //         {
  //           fieldName: 'الموقع_بالنسبة_للطرق_الدائري',
  //           values: locations.filter((loc) => loc.checked).map((loc) => loc.name),
  //         };
  //       const filterCriteria: { fieldName: string; values: (string | number)[] } =
  //         {
  //           fieldName: 'التصنيف_الرئيسي_1',
  //           values: ceriteria
  //             .filter((cer) => cer.selected)
  //             .map((cer) => cer.name),
  //         };
  //       this.mapService.filterFeatureLayersWithManyFieldsAndValues(
  //         this.featureLayers[2],
  //         [filterLocaion, filterCriteria],
  //         true
  //       );
  //       //filtering services on geolocation
  //       this.mapService.filterFeatureLayersWithManyFieldsAndValues(
  //         this.featureLayers[8],
  //         [filterLocaion]
  //       );
  //     }
  //   }

  //   filterServices(
  //     locations: { name: string; checked: boolean }[],
  //     services: { name: string; checked: boolean }[]
  //   ) {
  //     const filterLocaion: { fieldName: string; values: (string | number)[] } = {
  //       fieldName: 'الموقع_بالنسبة_للطرق_الدائري',
  //       values: locations.filter((loc) => loc.checked).map((loc) => loc.name),
  //     };
  //     const filterSerices: { fieldName: string; values: (string | number)[] } = {
  //       fieldName: 'تصنيف',
  //       values: services.filter((ser) => ser.checked).map((ser) => ser.name),
  //     };
  //     this.mapService.filterFeatureLayersWithManyFieldsAndValues(
  //       this.featureLayers[8],
  //       [filterLocaion, filterSerices]
  //     );
  //   }
  //   // filterParcels(
  //   //   locations: { name: string; checked: boolean }[],
  //   //   services: { name: string; checked: boolean }[]
  //   // ) {
  //   //   const filterLocaion: { fieldName: string; values: (string | number)[] } = {
  //   //     fieldName: 'الموقع_بالنسبة_للطرق_الدائري',
  //   //     values: locations.filter((loc) => loc.checked).map((loc) => loc.name),
  //   //   };
  //   //   const filterSerices: { fieldName: string; values: (string | number)[] } = {
  //   //     fieldName: 'حالات_البناء',
  //   //     values: services.filter((ser) => ser.checked).map((ser) => ser.name),
  //   //   };
  //   //   this.mapService.filterFeatureLayersWithManyFieldsAndValues(
  //   //     this.featureLayers[7],
  //   //     [filterLocaion, filterSerices]
  //   //   );
  //   // }

  //   filterParcels(
  //     locations: { name: string; checked: boolean }[],
  //     services: { name: string; checked: boolean }[],
  //     buildingTypes: { name: string; checked: boolean }[],
  //     constructionMaterials: { name: string; checked: boolean }[],
  //     permits: { name: string; checked: boolean }[],
  //     nameFilter: string
  //   ) {
  //     console.log('xxxxx', nameFilter);

  //     const filterLocation: { fieldName: string; values: (string | number)[] } = {
  //       fieldName: 'location',
  //       values: locations.filter((loc) => loc.checked).map((loc) => loc.name),
  //     };

  //     const filterServices: { fieldName: string; values: (string | number)[] } = {
  //       fieldName: 'state',
  //       values: services.filter((ser) => ser.checked).map((ser) => ser.name),
  //     };

  //     const filterBuildingTypes: {
  //       fieldName: string;
  //       values: (string | number)[];
  //     } = {
  //       fieldName: 'usage',
  //       values: buildingTypes
  //         .filter((type) => type.checked)
  //         .map((type) => type.name),
  //     };

  //     const filterConstructionMaterials: {
  //       fieldName: string;
  //       values: (string | number)[];
  //     } = {
  //       fieldName: 'buildingType',
  //       values: constructionMaterials
  //         .filter((mat) => mat.checked)
  //         .map((mat) => mat.name),
  //     };
  //     let checked = false;
  //     if (permits.some((p) => p.name === 'التعديات' && p.checked)) {
  //       checked = true;
  //     }
  //     if (permits.some((p) => p.name === 'الكل' && p.checked)) {
  //       checked = false;
  //     }
  //     let filerName = { fieldName: 'الاسم', values: [] };
  //     if (nameFilter && nameFilter !== '') {
  //       console.log('sssss', nameFilter);

  //       filerName = { fieldName: 'الاسم', values: [nameFilter] };
  //     }
  //     console.log('fff', filerName, filterLocation);

  //     this.mapService.filterParcelssWithManyFieldsAndValues(
  //       this.featureLayers[7],
  //       [
  //         filterLocation,
  //         filterServices,
  //         filterBuildingTypes,
  //         filterConstructionMaterials,
  //         filerName,
  //       ],
  //       checked
  //     );
  //   }
  //   countParcels(
  //     locations: { name: string; checked: boolean }[],
  //     services: { name: string; checked: boolean }[],
  //     buildingTypes: { name: string; checked: boolean }[],
  //     constructionMaterials: { name: string; checked: boolean }[],
  //     nameFilter: string
  //   ) {
  //     const filterLocation: { fieldName: string; values: (string | number)[] } = {
  //       fieldName: 'location',
  //       values: locations.filter((loc) => loc.checked).map((loc) => loc.name),
  //     };

  //     const filterServices: { fieldName: string; values: (string | number)[] } = {
  //       fieldName: 'state',
  //       values: services.filter((ser) => ser.checked).map((ser) => ser.name),
  //     };

  //     const filterBuildingTypes: {
  //       fieldName: string;
  //       values: (string | number)[];
  //     } = {
  //       fieldName: 'usage',
  //       values: buildingTypes
  //         .filter((type) => type.checked)
  //         .map((type) => type.name),
  //     };

  //     const filterConstructionMaterials: {
  //       fieldName: string;
  //       values: (string | number)[];
  //     } = {
  //       fieldName: 'buildingType',
  //       values: constructionMaterials
  //         .filter((mat) => mat.checked)
  //         .map((mat) => mat.name),
  //     };
  //     let filerName = { fieldName: 'الاسم', values: [] };
  //     if (nameFilter && nameFilter !== '') {
  //       console.log('filter name', nameFilter);

  //       filerName = { fieldName: 'الاسم', values: [nameFilter] };
  //     }
  //     this.mapService
  //       .getFeatureLayerParcelCountWithManyFieldsAndValues(
  //         this.featureLayers[7],
  //         [
  //           filterLocation,
  //           filterServices,
  //           filterBuildingTypes,
  //           filterConstructionMaterials,
  //           filerName,
  //         ]
  //       )
  //       .then((r) => {
  //         this.parcelsCount.next(r);
  //       });
  //   }

  //   getNamesOfLayer() {
  //     console.log('this feature ', this.featureLayers[3]);
  //   }

  //   getFeaturesFieldValues(lyrIdx, fieldName: string): Observable<string[]> {
  //     return this.mapService.getAllFieldValues(
  //       this.featureLayers[lyrIdx],
  //       fieldName
  //     );
  //   }
  //   filterOnNameValue(name: string) {
  //     this.clearUIFiltersLocations();
  //     this.clearUIFiltersMethods();
  //     this.mapService.filterFeatureLayersWithPopup(
  //       this.featureLayers[2],
  //       'الاسم_حسب_الاستشاري',
  //       name,
  //       true
  //     );
  //     // this.mapService.filterFeatureLayers(
  //     //   this.featureLayers[3],
  //     //   'الاسم_حسب_الاستشاري',
  //     //   name
  //     // );
  //   }
  //   filterOnLicenceOwnershipValue(
  //     layerIdx: number,
  //     field: string,
  //     value: string
  //   ) {
  //     console.log('here in filter licence', value, this.featureLayers[layerIdx]);

  //     // this.clearUIFiltersLocations();
  //     // this.clearUIFiltersMethods();
  //     this.mapService.filterFeatureLayersWithPopup(
  //       this.featureLayers[layerIdx],
  //       field,
  //       value
  //     );
  //   }
  //   getStatistics(): Observable<Statistics> {
  //     return this.mapService.getFeatures().pipe(
  //       map((features) => {
  //         // console.log('ffffffffff', features);
  //         // Transform the array of Esri Graphics to a Statistics object
  //         let buildingsNum = features.reduce((sum, feature) => {
  //           return sum + feature.attributes['join_count_1'];
  //         }, 0);
  //         let amanasArea = features.reduce((sum, feature) => {
  //           return (
  //             sum + Number(feature.attributes['مساحة_المنطقة_العشوائية_طبقا_لأ'])
  //           );
  //         }, 0);
  //         // console.log('amanas area', amanasArea);
  //         let areaDiff = features.reduce((sum, feature) => {
  //           return (
  //             sum + Number(feature.attributes['فرق_المساحة_بين_الاستشاري_والأم'])
  //           );
  //         }, 0);
  //         // console.log('new area', consArea);
  //         let consArea = features.reduce((sum, feature) => {
  //           // Calculate area if the feature has a polygon geometry
  //           if (feature.geometry.type === 'polygon') {
  //             const polygon = feature.geometry as Polygon;
  //             const area = planarArea(
  //               polygon,
  //               'square-kilometers' // You can use other units like 'hectares', 'square-kilometers', etc.
  //             );
  //             return sum + area;
  //           }
  //           return sum;
  //         }, 0);

  //         let sakani = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['sakani2']);
  //         }, 0);
  //         let empty = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['emptyland2']);
  //         }, 0);
  //         let wall = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['wall2']);
  //         }, 0);
  //         let sakani_com = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['sakani_com2']);
  //         }, 0);
  //         let enter = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['entertain2']);
  //         }, 0);
  //         let good = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['good2']);
  //         }, 0);
  //         let medium = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['mediuam2']);
  //         }, 0);
  //         let bad = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['bad2']);
  //         }, 0);
  //         let adj = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['adj2']);
  //         }, 0);
  //         let struc = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['struc2']);
  //         }, 0);
  //         let lbw = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['lbw2']);
  //         }, 0);
  //         let loc = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['loc2']);
  //         }, 0);
  //         let wood = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['wood2']);
  //         }, 0);
  //         let enterServ = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['ترفيهي']);
  //         }, 0);
  //         let medServ = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['صحي']);
  //         }, 0);
  //         let educServ = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['تعليمى']);
  //         }, 0);
  //         let relServ = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['ديني']);
  //         }, 0);
  //         let investServ = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['استثماري']);
  //         }, 0);
  //         let supplyServ = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['تموينات']);
  //         }, 0);
  //         let govServ = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['حكومي']);
  //         }, 0);
  //         let miscServ = features.reduce((sum, feature) => {
  //           return sum + Number(feature.attributes['متنوعة']);
  //         }, 0);
  //         // let amanasArea = features.reduce((sum, feature) => {
  //         //   return sum + feature.attributes['amanaFieldName']; // Replace 'amanaFieldName' with the actual field name for amanas area
  //         // }, 0);
  //         // let consultantArea = features.reduce((sum, feature) => {
  //         //   return sum + feature.attributes['consultantFieldName']; // Replace 'consultantFieldName' with the actual field name for consultant area
  //         // }, 0);
  //         return {
  //           areaNum: features.length,
  //           buildingsNum: buildingsNum,
  //           totalArea: amanasArea / 1000000,
  //           amanasArea: amanasArea / 1000000,
  //           areaDiff: areaDiff / 1000000,
  //           consultantArea: consArea,
  //           areaPrecent: Math.round((amanasArea / 2773596482.400712) * 100),
  //           lu_sakani: sakani,
  //           lu_sakani_com: sakani_com,
  //           lu_enter: enter,
  //           lu_wall: wall,
  //           empty: empty,
  //           st_good: good,
  //           st_medium: medium,
  //           st_bad: bad,
  //           st_adj: adj,
  //           mt_lbw: lbw,
  //           mt_struc: struc,
  //           mt_loc: loc,
  //           mt_wood: wood,
  //           educServ: educServ,
  //           medServ: medServ,
  //           relServ: relServ,
  //           enterServ: enterServ,
  //           investServ: investServ,
  //           miscServ: miscServ,
  //           govServ: govServ,
  //           supplyServ: supplyServ,
  //         } as Statistics;
  //       })
  //     );
  //   }
  //   toggleLayerList() {
  //     this.displayLayerList.next(!this.displayLayerList.value);
  //   }
  //   toggleBaseMap() {
  //     this.displayBaseMap.next(!this.displayBaseMap.value);
  //   }
  //   toggleInfo() {
  //     this.displayInfo.next(!this.displayInfo.value);
  //   }
  //   closeCards() {
  //     this.displayLayerList.next(false);
  //     this.displayBaseMap.next(false);
  //     this.displayInfo.next(false);
  //   }
  //   clearUIFiltersLocations() {
  //     this.geoLocations.next([
  //       { name: 'داخل الدائري الثاني', checked: false },
  //       { name: 'داخل الدائري الثالث', checked: false },
  //       { name: 'داخل الدائري الرابع', checked: false },
  //       { name: 'داخل الدائري الخامس', checked: false },
  //       { name: 'خارج الدائري الخامس', checked: false },
  //     ]);
  //   }
  //   clearUIFiltersMethods() {
  //     this.ceriteria.next([
  //       { name: 'ارتقاء', selected: false },
  //       { name: 'تحسين', selected: false },
  //       { name: 'تخضع لسياسة', selected: false },
  //       { name: 'تطوير', selected: false },
  //     ]);
  //   }
  //   //filter on criteria handler
  //   filterOnCriteria(methods: { name: string; selected: boolean }[]) {
  //     this.clearUIFiltersLocations();
  //     const values: string[] = methods
  //       .filter((loc) => loc.selected)
  //       .map((loc) => loc.name);
  //     if (values.length === 0) {
  //       this.mapService.removeAllFilters(this.featureLayers[3]);
  //       this.mapService.removeAllFilters(this.featureLayers[2]);
  //     } else {
  //       this.mapService.filterFeatureLayersWithManyValues(
  //         this.featureLayers[2],
  //         'التصنيف_الرئيسي',
  //         values,
  //         true
  //       );
  //     }
  //   }

  //   handleStandardsSearch(layerName: string, layers) {
  //     // console.log('kkkkk');
  //     this.mapService.updateFeatureLayers(layers, layerName);
  //   }
  //   reset() {
  //     this.geoLocations.next([
  //       { name: 'داخل الدائري الثاني', checked: false },
  //       { name: 'داخل الدائري الثالث', checked: false },
  //       { name: 'داخل الدائري الرابع', checked: false },
  //       { name: 'داخل الدائري الخامس', checked: false },
  //       { name: 'خارج الدائري الخامس', checked: false },
  //     ]);
  //     this.services.next([
  //       { name: 'صحي', checked: false },
  //       { name: 'ديني', checked: false },
  //       { name: 'تعليمي', checked: false },
  //       { name: 'ترفيهي', checked: false },
  //       { name: 'استثماري', checked: false },
  //       { name: 'تموينات', checked: false },
  //       { name: 'حكومي', checked: false },
  //       { name: 'خارج النطاق', checked: false },
  //       { name: 'زنك', checked: false },
  //       { name: 'متنوعة', checked: false },
  //     ]);
  //     this.buildingStatus.next([
  //       { name: 'هيكلي', checked: false },
  //       { name: 'حوائط حاملة', checked: false },
  //       { name: 'أرض فضاء', checked: false },
  //       { name: 'شعبي', checked: false },
  //     ]);
  //     this.buildingTypes.next([
  //       { name: 'سكنى', checked: false },
  //       { name: 'ارض فضاء', checked: false },
  //       { name: 'سكنى تجارى', checked: false },
  //       { name: 'أرض مسورة', checked: false },
  //       { name: 'ترفيه', checked: false },
  //     ]);
  //     this.ceriteria.next([
  //       { name: 'ارتقاء', selected: false },
  //       { name: 'تحسين', selected: false },
  //       // { name: 'تخضع لسياسة', selected: false },
  //       { name: 'تطوير', selected: false },
  //       { name: 'مواقع متعارضة مع أراضي حكومية', selected: false },
  //     ]);
  //     this.constructionMaterials.next([
  //       { name: 'هيكلي', checked: false },
  //       { name: 'حوائط حاملة', checked: false },
  //       { name: 'أرض فضاء', checked: false },
  //       { name: 'شعبي', checked: false },
  //     ]);
  //     this.mapService.goHome();
  //   }
  //   // reset() {
  //   //   window.location.reload();
  //   // }

  //   async getParcelStats(): Promise<ParcelStats> {
  //     const featureLayer = this.featureLayers[7];
  //     console.log(
  //       '🏁 Running stats query on layer:',
  //       featureLayer?.url || 'undefined'
  //     );

  //     if (!featureLayer) {
  //       console.warn('⚠️ No feature layer found at index 7.');
  //       return Promise.resolve({ nullAndAbove20Count: 0, totalCount: 0 });
  //     }

  //     // Helper function for count queries
  //     const runQuery = async (where: string, label: string): Promise<number> => {
  //       const query = featureLayer.createQuery();
  //       query.where = where;
  //       query.returnGeometry = false;

  //       // ✅ Properly typed StatisticDefinition
  //       const statDef = new StatisticDefinition({
  //         statisticType: 'count',
  //         onStatisticField: 'OBJECTID',
  //         outStatisticFieldName: 'count',
  //       });

  //       query.outStatistics = [statDef];

  //       try {
  //         const result = await featureLayer.queryFeatures(query);
  //         const count = result.features[0]?.attributes?.count ?? 0;
  //         console.log(`✅ ${label}: ${count}`);
  //         return count;
  //       } catch (err) {
  //         console.error(`❌ Error in query [${label}]:`, err);
  //         return 0;
  //       }
  //     };

  //     try {
  //       const [nullAndAbove20Count, totalCount] = await Promise.all([
  //         runQuery('isValid = 0', 'Null & Above 20 Count'),
  //         runQuery('1=1', 'Total Count'),
  //       ]);

  //       const stats: ParcelStats = { nullAndAbove20Count, totalCount };
  //       console.log('📊 Final Stats:', stats);
  //       return stats;
  //     } catch (error) {
  //       console.error('❌ Error getting parcel stats:', error);
  //       return { nullAndAbove20Count: 0, totalCount: 0 };
  //     }
  //   }
  //   async getStatsFromServer(): Promise<{
  //     total: number;
  //     nullAndAbove20Count: number;
  //     t3dyatwithoutAhkam?: number;
  //     planedParcelsCount?: number;
  //   }> {
  //     const baseUrl =
  //       featureLayersConfig[7].url + '/query' ||
  //       'https://144.76.146.59:6443/arcgis/rest/services/mecca/mekkah04091orbits/MapServer/68/query';
  //     const base2Url = featureLayersConfig[11].url + '/query';
  //     console.log('baseUrl', base2Url);

  //     // ✅ Corrected: use parce_1010 (not parcel_1010)
  //     // ✅ Check if parcel_993 is NULL or an empty string
  //     const query1 = 'newValid = 0';
  //     const query2 = '1=1'; // for total count
  //     const query3 = 'isValid = 0';

  //     const buildUrl = (where: string) =>
  //       `${baseUrl}?where=${encodeURIComponent(
  //         where
  //       )}&returnCountOnly=true&f=json`;

  //     const buildUrl2 = (where: string) =>
  //       `${base2Url}?where=${encodeURIComponent(
  //         where
  //       )}&returnCountOnly=true&f=json`;
  //     try {
  //       // Fetch both counts in parallel
  //       const [res1, res2, res3, res4] = await Promise.all([
  //         fetch(buildUrl(query1)),
  //         fetch(buildUrl(query2)),
  //         fetch(buildUrl(query3)),
  //         fetch(buildUrl2(query2)),
  //       ]);
  //       console.log('new urllll', buildUrl(query2));

  //       const [data1, data2, data3, data4] = await Promise.all([
  //         res1.json(),
  //         res2.json(),
  //         res3.json(),
  //         res4.json(),
  //       ]);

  //       console.log('Query 1 URL:', buildUrl(query1));
  //       console.log('Query 1 Response:', data1);
  //       console.log('Query 2 URL:', buildUrl(query2));
  //       console.log('Query 4 Response:', data4.count);

  //       return {
  //         total: data2.count || 0,
  //         nullAndAbove20Count: data1.count || 0,
  //         t3dyatwithoutAhkam: data3.count || 0,
  //         planedParcelsCount: data4.count || 0,
  //       };
  //     } catch (error) {
  //       console.error('Error fetching stats from ArcGIS Server:', error);
  //       return { total: 0, nullAndAbove20Count: 0 };
  //     }
  //   }
}

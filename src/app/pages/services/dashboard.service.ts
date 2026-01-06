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
  AssetInterface,
  AssetCategory,
  AssetStats,
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

  // Asset-specific BehaviorSubjects
  public assetsData: BehaviorSubject<AssetInterface[]> = new BehaviorSubject<
    AssetInterface[]
  >([]);
  public assetCategories: BehaviorSubject<AssetCategory[]> = new BehaviorSubject<
    AssetCategory[]
  >([]);
  public assetStats: BehaviorSubject<AssetStats> = new BehaviorSubject<AssetStats>({
    totalAssets: 0,
    categories: new Map(),
    types: new Map(),
    subTypes: new Map(),
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

    // Wait for layers to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Chain all API calls for asset system
    try {
      await this.getAllAssetsData(0); // Index 0 is the merge layer
      await this.getEquipmentCategoryStats();
      // Add a small delay to ensure all observables have emitted
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('All asset data loaded successfully');
    } catch (error) {
      console.error('Error loading asset data:', error);
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

  // New asset methods
  async getAllAssetsData(layerIndex: number) {
    console.log('Loading assets from merge layer...');
    const res = await this.mapService.filterFeatureLayers(
      this.featureLayers[layerIndex],
      '1',
      '1',
      true
    );

    if (res?.length > 0) {
      console.log('Assets loaded:', res.length);
      const assets: AssetInterface[] = res.map((r: any) => ({
        OBJECTID: r.OBJECTID,
        type: r.type || null,
        sub_type: r.sub_type || null,
        Note: r.Note || null,
        QR_Code: r.QR_Code || null,
        Equipment_Category: r.Equipment_Category || null,
        Manufacturer: r.Manufacturer || null,
        Equipment_Model: r.Equipment_Model || null,
        MERGE_SRC: r.MERGE_SRC || null,
      }));

      this.assetsData.next(assets);

      // Calculate statistics
      const stats: AssetStats = {
        totalAssets: assets.length,
        categories: new Map(),
        types: new Map(),
        subTypes: new Map(),
      };

      // Count by Equipment_Category
      assets.forEach((asset) => {
        if (asset.Equipment_Category) {
          const count = stats.categories.get(asset.Equipment_Category) || 0;
          stats.categories.set(asset.Equipment_Category, count + 1);
        }
        if (asset.type) {
          const count = stats.types.get(asset.type) || 0;
          stats.types.set(asset.type, count + 1);
        }
        if (asset.sub_type) {
          const count = stats.subTypes.get(asset.sub_type) || 0;
          stats.subTypes.set(asset.sub_type, count + 1);
        }
      });

      this.assetStats.next(stats);
      console.log('Asset statistics:', stats);
    }
  }

  async getEquipmentCategoryStats() {
    const assets = this.assetsData.value;
    if (assets.length === 0) return;

    // Get unique Equipment_Category values
    const uniqueCategories = [
      ...new Set(
        assets
          .map((asset) => asset.Equipment_Category)
          .filter((cat) => cat != null && cat !== '')
      ),
    ] as string[];

    console.log('Unique Equipment Categories:', uniqueCategories);

    // Create category data
    const categoryData: AssetCategory[] = uniqueCategories.map((category, index) => {
      const categoryAssets = assets.filter(
        (asset) => asset.Equipment_Category === category
      );
      return {
        id: `cat-${index}`,
        title: category,
        count: categoryAssets.length,
        assets: categoryAssets,
      };
    }).sort((a, b) => b.count - a.count); // Sort by count descending

    this.assetCategories.next(categoryData);
    console.log('Asset categories:', categoryData);

    // Also update the tunnel categories for backward compatibility with sidebar
    const tunnelCategoryFormat: TunnelCategory[] = categoryData.map(cat => ({
      id: cat.id,
      title: cat.title,
      count: cat.count,
    }));
    this.onwers.next(tunnelCategoryFormat);
  }

  /**
   * Get asset counts by Manufacturer field
   * Returns distribution of assets by manufacturer
   */
  async getAssetManufacturerDistribution(): Promise<{ name: string; count: number }[]> {
    const assets = this.assetsData.value;
    if (assets.length === 0) {
      // If assets not loaded yet, query from merge layer
      const mergeLayer = this.featureLayers[0];
      if (mergeLayer) {
        const res = await this.mapService.getFieldValueCounts(
          mergeLayer,
          'Manufacturer',
          '1=1'
        );
        
        // Map Manufacturer values to Arabic names where appropriate
        const manufacturerMap: { [key: string]: string } = {
          'N/A': 'غير متاح',
          'Local': 'محلي',
          'Local industry': 'صناعة محلية',
          'لم يستدل عليها': 'لم يستدل عليها'
        };

        // Normalize manufacturer values
        const normalizeManufacturer = (manufacturer: string | null): string => {
          if (!manufacturer || manufacturer.trim() === '' || manufacturer === 'null' || manufacturer === 'undefined') {
            return 'غير محدد';
          }
          const normalized = manufacturer.trim();
          return manufacturerMap[normalized] || normalized;
        };

        const manufacturerCounts: { [key: string]: number } = {};
        
        Object.entries(res).forEach(([key, count]) => {
          if (key && key !== 'null' && key !== 'undefined' && key !== '') {
            const normalizedKey = normalizeManufacturer(key);
            manufacturerCounts[normalizedKey] = (manufacturerCounts[normalizedKey] || 0) + Number(count);
          } else {
            // Handle NULL values
            manufacturerCounts['غير محدد'] = (manufacturerCounts['غير محدد'] || 0) + Number(count);
          }
        });

        const manufacturerDistribution = Object.entries(manufacturerCounts)
          .map(([name, count]) => ({
            name,
            count
          }))
          .filter(item => item.count > 0) // Only include manufacturers with assets
          .sort((a, b) => b.count - a.count); // Sort by count descending

        return manufacturerDistribution;
      }
      return [];
    }

    // Count assets by Manufacturer from loaded assets
    const manufacturerCounts: { [key: string]: number } = {};
    
    // Map Manufacturer values to Arabic names where appropriate
    const manufacturerMap: { [key: string]: string } = {
      'N/A': 'غير متاح',
      'Local': 'محلي',
      'Local industry': 'صناعة محلية',
      'لم يستدل عليها': 'لم يستدل عليها'
    };

    // Normalize manufacturer values
    const normalizeManufacturer = (manufacturer: string | null): string => {
      if (!manufacturer || manufacturer.trim() === '' || manufacturer === 'null' || manufacturer === 'undefined') {
        return 'غير محدد';
      }
      const normalized = manufacturer.trim();
      return manufacturerMap[normalized] || normalized;
    };

    assets.forEach((asset) => {
      const normalizedManufacturer = normalizeManufacturer(asset.Manufacturer);
      manufacturerCounts[normalizedManufacturer] = (manufacturerCounts[normalizedManufacturer] || 0) + 1;
    });

    const manufacturerDistribution = Object.entries(manufacturerCounts)
      .map(([name, count]) => ({
        name,
        count
      }))
      .filter(item => item.count > 0) // Only include manufacturers with assets
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return manufacturerDistribution;
  }

  /**
   * Get asset counts by type field
   * Returns distribution of assets by type
   */
  async getAssetTypeDistribution(): Promise<{ name: string; count: number }[]> {
    const assets = this.assetsData.value;
    if (assets.length === 0) {
      // If assets not loaded yet, query from merge layer
      const mergeLayer = this.featureLayers[0];
      if (mergeLayer) {
        const res = await this.mapService.getFieldValueCounts(
          mergeLayer,
          'type',
          '1=1'
        );
        
        // Normalize type values (handle duplicates and variations)
        const normalizeType = (type: string | null): string => {
          if (!type || type.trim() === '' || type === 'null' || type === 'undefined') {
            return 'غير محدد';
          }
          // Normalize variations - trim and handle common variations
          let normalized = type.trim();
          
          // Handle spelling variations (ي vs ى)
          normalized = normalized.replace(/ى/g, 'ي');
          
          // Handle specific known variations
          if (normalized === 'طفايه حريق' || normalized === 'طفاية حريق') {
            return 'طفاية حريق';
          }
          if (normalized === 'لوحه تحكم' || normalized === 'لوحة تحكم') {
            return 'لوحة تحكم';
          }
          
          return normalized;
        };

        const typeCounts: { [key: string]: number } = {};
        
        Object.entries(res).forEach(([key, count]) => {
          if (key && key !== 'null' && key !== 'undefined' && key !== '') {
            const normalizedKey = normalizeType(key);
            typeCounts[normalizedKey] = (typeCounts[normalizedKey] || 0) + Number(count);
          } else {
            // Handle NULL values
            typeCounts['غير محدد'] = (typeCounts['غير محدد'] || 0) + Number(count);
          }
        });

        const typeDistribution = Object.entries(typeCounts)
          .map(([name, count]) => ({
            name,
            count
          }))
          .filter(item => item.count > 0) // Only include types with assets
          .sort((a, b) => b.count - a.count); // Sort by count descending

        return typeDistribution;
      }
      return [];
    }

    // Count assets by type from loaded assets
    const typeCounts: { [key: string]: number } = {};
    
    // Normalize type values (handle duplicates and variations)
    const normalizeType = (type: string | null): string => {
      if (!type || type.trim() === '' || type === 'null' || type === 'undefined') {
        return 'غير محدد';
      }
      // Normalize variations - trim and handle common variations
      let normalized = type.trim();
      
      // Handle spelling variations (ي vs ى)
      normalized = normalized.replace(/ى/g, 'ي');
      
      // Handle specific known variations
      if (normalized === 'طفايه حريق' || normalized === 'طفاية حريق') {
        return 'طفاية حريق';
      }
      if (normalized === 'لوحه تحكم' || normalized === 'لوحة تحكم') {
        return 'لوحة تحكم';
      }
      
      return normalized;
    };

    assets.forEach((asset) => {
      const normalizedType = normalizeType(asset.type);
      typeCounts[normalizedType] = (typeCounts[normalizedType] || 0) + 1;
    });

    const typeDistribution = Object.entries(typeCounts)
      .map(([name, count]) => ({
        name,
        count
      }))
      .filter(item => item.count > 0) // Only include types with assets
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return typeDistribution;
  }

  /**
   * Get asset counts by Equipment_Category with Arabic translations
   * Returns distribution of assets by equipment category
   */
  async getAssetCategoryDistribution(): Promise<{ name: string; count: number }[]> {
    const assets = this.assetsData.value;
    if (assets.length === 0) {
      // If assets not loaded yet, query from merge layer
      const mergeLayer = this.featureLayers[0];
      if (mergeLayer) {
        const res = await this.mapService.getFieldValueCounts(
          mergeLayer,
          'Equipment_Category',
          '1=1'
        );
        
        // Map Equipment_Category values to Arabic names
        const categoryMap: { [key: string]: string } = {
          'Electrical': 'كهربائي',
          'Electrical Substation': 'محطة كهربائية',
          'Electrical Substation / AC': 'محطة كهربائية / تكييف',
          'Mechanical': 'ميكانيكي',
          'Refrigeration': 'تبريد',
          'لم يستدل عليها': 'لم يستدل عليها'
        };

        const categoryDistribution = Object.entries(res)
          .filter(([key]) => key && key !== 'null' && key !== 'undefined' && key !== '')
          .map(([key, count]) => ({
            name: categoryMap[key] || key, // Use mapped name or original if not in map
            count: Number(count) || 0
          }))
          .filter(item => item.count > 0) // Only include categories with assets
          .sort((a, b) => b.count - a.count); // Sort by count descending

        return categoryDistribution;
      }
      return [];
    }

    // Count assets by Equipment_Category from loaded assets
    const categoryCounts: { [key: string]: number } = {};
    const categoryMap: { [key: string]: string } = {
      'Electrical': 'كهربائي',
      'Electrical Substation': 'محطة كهربائية',
      'Electrical Substation / AC': 'محطة كهربائية / تكييف',
      'Mechanical': 'ميكانيكي',
      'Refrigeration': 'تبريد',
      'لم يستدل عليها': 'لم يستدل عليها'
    };

    assets.forEach((asset) => {
      if (asset.Equipment_Category && asset.Equipment_Category.trim() !== '') {
        const categoryName = categoryMap[asset.Equipment_Category] || asset.Equipment_Category;
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      }
    });

    const categoryDistribution = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count
      }))
      .filter(item => item.count > 0) // Only include categories with assets
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return categoryDistribution;
  }

  /**
   * Get asset counts by floor based on MERGE_SRC field
   * Returns distribution of assets across floors
   * MERGE_SRC values: 'DBO.AssetsPoint' (ground), 'DBO.AssetsPoint_1' (first), 'DBO.AssetsPoint_2' (second)
   */
  async getAssetFloorDistribution(): Promise<{ name: string; count: number }[]> {
    const assets = this.assetsData.value;
    if (assets.length === 0) {
      // If assets not loaded yet, query from merge layer
      const mergeLayer = this.featureLayers[0];
      if (mergeLayer) {
        const res = await this.mapService.getFieldValueCounts(
          mergeLayer,
          'MERGE_SRC',
          '1=1'
        );
        
        // Map MERGE_SRC values to floor names
        const floorMap: { [key: string]: string } = {
          'DBO.AssetsPoint': 'الطابق الأرضي',
          'DBO.AssetsPoint_1': 'الطابق الأول',
          'DBO.AssetsPoint_2': 'الطابق الثاني'
        };

        const floorDistribution = Object.entries(res)
          .filter(([key]) => key && key !== 'null' && key !== 'undefined' && key !== '')
          .map(([key, count]) => ({
            name: floorMap[key] || key, // Use mapped name or original if not in map
            count: Number(count) || 0
          }))
          .filter(item => item.count > 0) // Only include floors with assets
          .sort((a, b) => {
            // Sort by floor order: ground, first, second
            const order = ['الطابق الأرضي', 'الطابق الأول', 'الطابق الثاني'];
            const indexA = order.indexOf(a.name);
            const indexB = order.indexOf(b.name);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.name.localeCompare(b.name);
          });

        return floorDistribution;
      }
      return [];
    }

    // Count assets by MERGE_SRC from loaded assets
    const floorCounts: { [key: string]: number } = {};
    const floorMap: { [key: string]: string } = {
      'DBO.AssetsPoint': 'الطابق الأرضي',
      'DBO.AssetsPoint_1': 'الطابق الأول',
      'DBO.AssetsPoint_2': 'الطابق الثاني'
    };

    assets.forEach((asset) => {
      if (asset.MERGE_SRC && asset.MERGE_SRC.trim() !== '') {
        const floorName = floorMap[asset.MERGE_SRC] || asset.MERGE_SRC;
        floorCounts[floorName] = (floorCounts[floorName] || 0) + 1;
      }
    });

    const floorDistribution = Object.entries(floorCounts)
      .map(([name, count]) => ({
        name,
        count
      }))
      .filter(item => item.count > 0) // Only include floors with assets
      .sort((a, b) => {
        // Sort by floor order: ground, first, second
        const order = ['الطابق الأرضي', 'الطابق الأول', 'الطابق الثاني'];
        const indexA = order.indexOf(a.name);
        const indexB = order.indexOf(b.name);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

    return floorDistribution;
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
}

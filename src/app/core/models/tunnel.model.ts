export interface TunnelStatistics {
  totalTunnels: number;
  totalLength: string;
  totalSize: string;
  totalAssets: number;
  networkBreakdown: {
    local: number;
    property: number;
    trusteeship: number;
    other: number;
  };
}

export interface TotalStats {
  totalAssets: number;
  totalNotes: number;
}

export interface TunnelCategory {
  id: string;
  title: string;
  count: number;
  notes?: UtilityInfo[];
  assets?: UtilityInfo[];
  tableRows?: CategoryTableRow[];
}

export interface CategoryTableRow {
  name: string;
  assetsCount?: number;
  notesCount?: number;
}

export interface UtilityInfo {
  name: string;
  assetsCount?: number;
  notesCount?: number;
}

export interface Tunnel {
  id: string;
  name: string;
  length: string;
  size: string;
  assetCount: number;
  categoryId: string;
}

export interface TunnelDetail extends Tunnel {
  usage: string;
  area: string;
  notesCount: number;
  maxWidth: string;
  minWidth: string;
  systems: TunnelSystem[];
}

export interface TunnelSystem {
  id: string;
  name: string;
  type: 'mechanical' | 'structural' | 'electrical' | 'safety' | 'environmental';
  components: SystemComponent[];
}

export interface SystemComponent {
  name: string;
  value: string;
}

export interface TunnelStats {
  tunnelName: string;
  assetsCount: number;
  notesCount: number;
}

// Asset Models
export interface AssetInterface {
  OBJECTID: number;
  type: string | null;
  sub_type: string | null;
  Note: string | null;
  QR_Code: string | null;
  Equipment_Category: string | null;
  Manufacturer: string | null;
  Equipment_Model: string | null;
  MERGE_SRC: string | null;
}

export interface AssetCategory {
  id: string;
  title: string;
  count: number;
  assets?: AssetInterface[];
}

export interface AssetStats {
  totalAssets: number;
  categories: Map<string, number>;
  types: Map<string, number>;
  subTypes: Map<string, number>;
}

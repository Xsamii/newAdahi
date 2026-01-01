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

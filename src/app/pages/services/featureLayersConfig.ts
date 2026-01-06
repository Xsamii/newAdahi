interface FeatureLayerConfig {
  index: number;
  url: string;
  title: string;
  main?: boolean;
  visible: boolean;
  popupTemp?: any;
  renderer?: any;
}

export const featureLayersConfig: FeatureLayerConfig[] = [
  // Main merge layer - DBO.DBO_Merge (6)
  {
    index: 0,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/6`,
    title: 'الأصول المدمجة',
    visible: true,
    main: true,
  },
  // Building layers
  {
    index: 1,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/23`,
    title: 'المباني',
    visible: false,
  },
  {
    index: 2,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/22`,
    title: 'المخطط الداخلي',
    visible: false,
  },
  {
    index: 3,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/21`,
    title: 'المخطط الداخلي - الدور الأول',
    visible: false,
  },
  {
    index: 4,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/20`,
    title: 'المخطط الداخلي - الدور الثاني',
    visible: false,
  },
  {
    index: 5,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/19`,
    title: 'مباني أخرى',
    visible: false,
  },
  // Parcel and zone layers
  {
    index: 6,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/18`,
    title: 'القطع',
    visible: false,
  },
  {
    index: 7,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/17`,
    title: 'خزان المياه',
    visible: false,
  },
  {
    index: 8,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/16`,
    title: 'المناطق',
    visible: false,
  },
  // Asset Polygon layers
  {
    index: 9,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/26`,
    title: 'أصول المضلعات',
    visible: false,
  },
  {
    index: 10,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/25`,
    title: 'أصول المضلعات - المستوى الأول',
    visible: false,
  },
  {
    index: 11,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/24`,
    title: 'أصول المضلعات - المستوى الثاني',
    visible: false,
  },
  // Asset Line layers
  {
    index: 12,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/15`,
    title: 'أصول الخطوط',
    visible: false,
  },
  {
    index: 13,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/14`,
    title: 'أصول الخطوط - المستوى الأول',
    visible: false,
  },
  {
    index: 14,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/13`,
    title: 'أصول الخطوط - المستوى الثاني',
    visible: false,
  },
  {
    index: 15,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/12`,
    title: 'السياج',
    visible: false,
  },
  // Asset Point layers
  {
    index: 16,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/11`,
    title: 'أصول النقاط',
    visible: false,
  },
  {
    index: 17,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/10`,
    title: 'أصول النقاط - المستوى الأول',
    visible: false,
  },
  {
    index: 18,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/9`,
    title: 'أصول النقاط - المستوى الثاني',
    visible: false,
  },
  {
    index: 19,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/8`,
    title: 'أصول أخرى',
    visible: false,
  },
  {
    index: 20,
    url: `https://144.76.146.59:6443/arcgis/rest/services/MajzraNewSDE/MapServer/7`,
    title: 'الأعمدة',
    visible: false,
  },
];

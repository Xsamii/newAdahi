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
  // Index 0: DBO.struct_tunnel (0) - Structural
  {
    index: 0,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/2`,
    title: 'الفحص البصري للأعمال الميكانيكية',
    visible: false,
  },
  // Index 1: DBO.safe_tunnel (1) - Safety
  {
    index: 1,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/3`,
    title: 'الفحص البصري للأعمال الكهربائية',
    visible: false,
  },
  // Index 2: DBO.road_tunnel (2) - Roads
  {
    index: 2,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/4`,
    title: 'الفحص البصري للأعمال الطرق',
    visible: false,
  },
  // Index 3: DBO.mech_tunnel (3) - Mechanical
  {
    index: 3,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/5`,
    title: 'الفحص البصرى للنظام البيئى',
    visible: false,
  },
  // Index 4: DBO.env_tunnel (4) - Environmental
  {
    index: 4,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/6`,
    title: 'الفحص البصرى للنظام الامن والسلامه',
    visible: false,
  },
  // Index 5: DBO.elec_tunnel (5) - Electrical
  {
    index: 5,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/7`,
    title: 'الفحص البصرى للاعمال الانشائية',
    visible: false,
  },

  {
    index: 6,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/8`,
    title: 'tunnel enterances extits',
    visible: false,
  },
  // Index 13: DBO.Property_inventory_Security_safety_1 (13)
  {
    index: 7,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/9`,
    title: 'أصول الأمن والسلامة',
    visible: false,
  },

  // Index 15: DBO.Property_inventory_Mechanics (15)
  {
    index: 8,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/10`,
    title: 'الأصول الميكانيكية',
    visible: false,
  },
  // Index 16: DBO.Property_inventory_Electricity (16)
  {
    index: 9,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/11`,
    title: 'الأصول الكهربائية',
    visible: false,
  },
  {
    index: 10,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/29`,
    title: 'الأصول الأنشائية',
    visible: false,
  },
  // Index 17: DBO.PCiRoads (17)
  {
    index: 11,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/12`,
    title: 'PCiRoads',
    visible: false,
  },
  // Index 18: DBO.mobily_tower (18)
  {
    index: 12,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/13`,
    title: 'mobily tower',
    visible: false,
  },
  // Index 19: DBO.labortory__location (19)
  {
    index: 13,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/14`,
    title: 'labortory location',
    visible: false,
  },
  // Index 20: DBO.GCPS_UP_DOWN (20)
  {
    index: 14,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/15`,
    title: 'GCPS UP DOWN',
    visible: false,
  },
  // Index 21: DBO.Camera_GeoTagged (21)
  {
    index: 15,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/16`,
    title: 'Camera GeoTagged',
    visible: false,
  },
  // Index 22: DBO.roadsring (22)
  {
    index: 16,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/18`,
    title: 'roadsring',
    visible: false,
  },
  // Index 23: DBO.نطاق_العملLine (23)
  {
    index: 17,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/19`,
    title: 'نطاق العملLine',
    visible: false,
  },
  // Index 24: DBO.مسارات_الطرق_الجزء_الاول (24)
  {
    index: 18,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/21`,
    title: 'مسارات الطرق الجزء الاول',
    visible: false,
  },
  // Index 25: DBO.مسارات_الطرق (25)
  {
    index: 19,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/21`,
    title: 'مسارات الطرق',
    visible: false,
  },
  {
    index: 20,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/22`,
    title: 'الانفاق',
    visible: true,
    main: true,
  },
  {
    index: 21,
    url: ` https://144.76.146.59:6443/arcgis/rest/services/mecca2/mekkah04091orbits3/MapServer/4`,
    title: 'الطرق الدائرية',
    visible: true,
  },
  {
    index: 22,
    url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/0`,
    title: 'الفحص الكلي',
    visible: true,
    renderer: {
      type: 'heatmap',
      colorStops: [
        { ratio: 0, color: 'rgba(0, 255, 255, 0)' },
        { ratio: 0.15, color: 'rgba(0, 255, 255, 0.9)' },
        { ratio: 0.4, color: 'rgba(0, 191, 255, 0.9)' },
        { ratio: 0.65, color: 'rgba(255, 140, 0, 0.9)' },
        { ratio: 0.9, color: 'rgba(255, 0, 0, 0.9)' },
      ],
      minPixelIntensity: 0,
      maxPixelIntensity: 150,
      weightExpression: '1',
    },
  },
  // Index 27: DBO.الطرق_الدائرية_طرق_انفاق (27)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/27`,
  //   title: 'الطرق الدائرية طرق انفاق',
  //   visible: false,
  // },
  // // Index 28: DBO.Zones_d_path_up (28)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/28`,
  //   title: 'Zones d path up',
  //   visible: false,
  // },
  // // Index 29: DBO.Roed_open_scoures_1 (29)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/29`,
  //   title: 'Roed open scoures 1',
  //   visible: false,
  // },
  // // Index 30: DBO.Roed_open_scoures (30)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/30`,
  //   title: 'Roed open scoures',
  //   visible: false,
  // },
  // // Index 31: DBO.roadsring (31)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/31`,
  //   title: 'roadsring',
  //   visible: false,
  // },
  // // Index 32: DBO.mobily_line (32)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/32`,
  //   title: 'mobily line',
  //   visible: false,
  // },
  // // Index 33: DBO.IRI (33)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/33`,
  //   title: 'IRI',
  //   visible: false,
  // },
  // // Index 34: DBO.نطاق_العمل (34)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/34`,
  //   title: 'نطاق العمل',
  //   visible: false,
  // },
  // // Index 35: DBO.Quality_laboratory_Cover_Meter_1 (35)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/35`,
  //   title: 'Quality laboratory Cover Meter 1',
  //   visible: false,
  // },
  // // Index 36: DBO.Quality_laboratory_Cover_Meter (36)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/36`,
  //   title: 'Quality laboratory Cover Meter',
  //   visible: false,
  // },
  // // Index 37: DBO.Makkah_Main_Roads_Buffers_1 (37)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/37`,
  //   title: 'Makkah Main Roads Buffers 1',
  //   visible: false,
  // },
  // // Index 38: DBO.Makkah_Main_Roads_Buffers (38)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/38`,
  //   title: 'Makkah Main Roads Buffers',
  //   visible: false,
  // },
  // // Index 39: DBO.labortory_location_Schmidit_Hammer (39)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/39`,
  //   title: 'labortory location Schmidit Hammer',
  //   visible: false,
  // },
  // // Index 40: DBO.boundery_firest_roed (40)
  // {
  //   url: `https://144.76.146.59:6443/arcgis/rest/services/tunnelsServer/MapServer/40`,
  //   title: 'boundery firest roed',
  //   visible: false,
  // },
];

import { Injectable } from '@angular/core';
import Map from '@arcgis/core/Map';
import LayerList from '@arcgis/core/widgets/LayerList';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';
import Extent from '@arcgis/core/geometry/Extent';
import Slider from '@arcgis/core/widgets/Slider';
import Legend from '@arcgis/core/widgets/Legend';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';
import Graphic from '@arcgis/core/Graphic';
import PopupTemplate from '@arcgis/core/PopupTemplate.js';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle.js';
import Basemap from '@arcgis/core/Basemap.js';
import Expand from '@arcgis/core/widgets/Expand.js';
import DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D.js';
import AreaMeasurement2D from '@arcgis/core/widgets/AreaMeasurement2D.js';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery.js';
import Print from '@arcgis/core/widgets/Print';
import StatisticDefinition from '@arcgis/core/rest/support/StatisticDefinition.js';
import TileLayer from '@arcgis/core/layers/TileLayer.js';

// import Feature from "esri/Graphic";
// import * as geometryEngine from "esri/geometry/geometryEngine";

import * as reactiveUtuils from '@arcgis/core/core/reactiveUtils';
import {
  getSchemes,
  getSchemeByName,
} from '@arcgis/core/smartMapping/symbology/color';
import { UniqueValueRenderer } from '@arcgis/core/renderers';
import HeatmapRenderer from '@arcgis/core/renderers/HeatmapRenderer';

import { BehaviorSubject, from, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private map: Map | undefined;
  private mapView: MapView | undefined;
  public showPopup: boolean = false;
  private layerList: LayerList;
  private popUpTemplate = new PopupTemplate();
  private mainLayer: FeatureLayer;

  private extentArray: __esri.Extent[] = [];
  private currentExtentIndex: number = -1;

  private currentFeatures: BehaviorSubject<__esri.Graphic[]> =
    new BehaviorSubject<__esri.Graphic[]>([]);
  private heatmapLayers: FeatureLayer[] = [];
  private heatmapVisible = true;
  private legend: Legend | undefined;

  initializeMap(): void {
    this.map = new Map({
      basemap: 'topo-vector',
    });
  }

  initMapView(container: string) {
    this.mapView = new MapView({
      container,
      map: this.map,
      center: [39.8262, 21.4225],
      zoom: 13,
      ui: {
        components: [],
      },
    });

    this.mapView.popupEnabled = true;
    this.mapView.ui.remove('attribution');
    this.mapView.ui.add(
      new Fullscreen({
        view: this.mapView,
        container: 'mapView',
      }),
      'top-left'
    );
    // Create legend widget but don't add it to UI (will be shown/hidden via toggle)
    this.legend = new Legend({
      id: 'legend',
      icon: 'templates',
      style: 'border-radius:"10px"',
      view: this.mapView,
      container: 'legendContainer',
    });

    reactiveUtuils.when(
      () => this.mapView.stationary === true,
      () => {
        console.log('here');
        this.saveExtent(this.mapView.extent);
      }
    );
    // Example custom basemap 2 - Light Gray Canvas
    const customLightGray = new Basemap({
      baseLayers: [
        new TileLayer({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer',
        }),
      ],
      title: 'فبراير 2025',
      id: 'custom-light-gray',
      // thumbnailUrl:
      //   'https://www.arcgis.com/sharing/rest/content/items/f9b24e5ab4e34508a7a5e9c4150a2b5c/info/thumbnail/thumbnail160.png',
    });

    // Example custom basemap 3 - Topographic
    const customTopo = new Basemap({
      baseLayers: [
        new TileLayer({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer',
        }),
      ],
      title: 'مارس 2025',
      id: 'custom-topo',
      // thumbnailUrl:
      //   'https://www.arcgis.com/sharing/rest/content/items/30e5fe3149c34df1ba922e6f5bbf808f/info/thumbnail/thumbnail160.png',
    });
    const customTopo2 = new Basemap({
      baseLayers: [
        new TileLayer({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer',
        }),
      ],
      title: 'ابريل 2025',
      id: 'custom-topo',
      // thumbnailUrl:
      //   'https://www.arcgis.com/sharing/rest/content/items/30e5fe3149c34df1ba922e6f5bbf808f/info/thumbnail/thumbnail160.png',
    });

    // Add your gallery
    let basemapGallery = new BasemapGallery({
      view: this.mapView,
      container: 'baseMapDiv',
      source: [
        // customSatellite,
        customLightGray,
        customTopo,
        customTopo2,
        Basemap.fromId('topo-vector'),
        Basemap.fromId('hybrid'),
        Basemap.fromId('dark-gray-vector'),
      ],
    });

    return this.mapView;
  }

  addLegendToElement(id: string) {
    if (this.legend) {
      // Update the container if legend already exists
      this.legend.container = id;
    } else {
      this.legend = new Legend({
        id: 'legend',
        icon: 'templates',
        style: 'border-radius:"10px"',
        view: this.mapView,
        container: id,
      });
    }
  }

  getLegend(): Legend | undefined {
    return this.legend;
  }
  makeLayerVisible(layer: __esri.Layer) {
    if (!layer) {
      console.warn('Layer is undefined or null.');
      return;
    }

    layer.visible = true;
    console.log(`Layer "${layer.title || layer.id}" is now visible.`);
  }
  getMapCanvas(): HTMLCanvasElement | undefined {
    return this.mapView?.container.querySelector('canvas') as HTMLCanvasElement;
  }
  getMapView(): MapView | undefined {
    return this.mapView;
  }
  async takeMapScreenshot(): Promise<string | null> {
    if (!this.mapView) {
      console.warn('MapView not initialized');
      return null;
    }

    try {
      const screenshot = await this.mapView.takeScreenshot({ format: 'png', quality: 95 });
      return screenshot?.dataUrl || null;
    } catch (error) {
      console.error('Error taking map screenshot:', error);
      return null;
    }
  }
  addLayerList() {
    this.layerList = new LayerList({
      id: 'layerList',
      container: 'layerListDiv',
      view: this.mapView,
      listItemCreatedFunction: async (event) => {
        const item = event.item;
        await item.layer.when();

        const slider = new Slider({
          min: 0,
          max: 1,
          precision: 2,
          values: [1],
          visibleElements: {
            labels: true,
            rangeLabels: true,
          },
          icon: 'sliders-horizontal',
        });

        item.panel = {
          content: [slider],
          // className: 'esri-icon-sliders-horizontal',
          title: 'Change layer opacity',
        };

        slider.on('thumb-drag', (event) => {
          const { value } = event;
          item.layer.opacity = value;
        });
        // }
      },
    });

    this.layerList.on('trigger-action', (event) => {
      const id = event.action.id;
      const layr = event.item.layer;
      // const visibleLayer =layr.visible;

      if (id === 'increase-opacity') {
        if (layr.opacity < 1) {
          layr.opacity += 0.25;
        }
      } else if (id === 'decrease-opacity') {
        if (layr.opacity > 0) {
          layr.opacity -= 0.25;
        }
      }
    });
  }

  gotToHomeExtent() {}

  clickOnMapHandler(event: any) {
    if (this.showPopup) {
      console.log('event', event);
    }
  }

  addFeatureLayer(
    url: string,
    title: string,
    layerVisible: boolean,
    template?: any,
    renderer?: any
  ): undefined | FeatureLayer {
    // console.log('adding layer ', title);

    if (this.map) {
      // console.log(url);
      const layerOptions: __esri.FeatureLayerProperties = {
        url,
        title,
        visible: layerVisible,
      };

      if (template) {
        layerOptions.popupTemplate = template;
      }

      const featureLayer = new FeatureLayer(layerOptions);

      if (renderer) {
        featureLayer.when(() => {
          if (renderer.type === 'heatmap') {
            featureLayer.renderer = new HeatmapRenderer(renderer);
            if (!this.heatmapLayers.includes(featureLayer)) {
              this.heatmapLayers.push(featureLayer);
              this.heatmapVisible = layerVisible;
            }
          } else {
            featureLayer.renderer = renderer as any;
          }
        });
      }

      if (template) {
        this.mainLayer = featureLayer;
        featureLayer.when(() => {
          console.log('fields', featureLayer.fields);
        });
      }
      this.map.add(featureLayer);

      return featureLayer;
    }
    return undefined;
  }

  toggleHeatmapVisibility(): boolean {
    this.heatmapVisible = !this.heatmapVisible;
    this.heatmapLayers.forEach((layer) => {
      layer.visible = this.heatmapVisible;
    });
    return this.heatmapVisible;
  }

  setHeatmapVisibility(visible: boolean): void {
    this.heatmapVisible = visible;
    this.heatmapLayers.forEach((layer) => {
      layer.visible = this.heatmapVisible;
    });
  }

  isHeatmapVisible(): boolean {
    return this.heatmapVisible;
  }

  /**
   * Updates the heatmap renderer for all heatmap layers
   * @param rendererOptions - Options for the HeatmapRenderer
   */
  updateHeatmapRenderer(rendererOptions: any): void {
    this.heatmapLayers.forEach((layer) => {
      if (layer && layer.renderer && layer.renderer.type === 'heatmap') {
        // Create new HeatmapRenderer with updated options
        layer.renderer = new HeatmapRenderer(rendererOptions);
      }
    });
  }

  setCenter(longitude: number, latitude: number): void {
    if (this.mapView) {
      // this.mapView.center = [longitude, latitude];
    }
  }

  setZoom(zoomLevel: number): void {
    if (this.mapView) {
      this.mapView.zoom = zoomLevel;
    }
  }
  zoomIn() {
    if (this.mapView) {
      this.mapView.goTo(
        {
          target: this.mapView.extent,
          zoom: this.mapView.zoom + 1,
        },
        {
          duration: 1000, // Animation duration in milliseconds
          easing: 'ease-in-out', // Easing function for the animation
        }
      );
      // ++this.mapView.zoom;
    }
  }
  zoomOut() {
    if (this.mapView) {
      this.mapView.goTo(
        {
          target: this.mapView.extent,
          zoom: this.mapView.zoom - 1,
        },
        {
          duration: 1000, // Animation duration in milliseconds
          easing: 'ease-in-out', // Easing function for the animation
        }
      );
      // ++this.mapView.zoom;
    }
  }
  goHome() {
    if (this.mapView) {
      this.mapView.goTo(
        {
          center: [39.8262, 21.4225], // Mecca Haram coordinates
          zoom: 10,
        },
        {
          duration: 1000, // Animation duration in milliseconds
          easing: 'ease-in-out', // Easing function for the animation
        }
      );
    }
  }

  getLayers() {
    return this.map;
  }
  async filterFeatureLayers(
    featureLayer: FeatureLayer | undefined,
    fieldName: string,
    value: string | number,
    main?: boolean
  ): Promise<any[]> {
    // console.log(featureLayer);
    if (featureLayer) {
      featureLayer.definitionExpression = `${fieldName} = N'${value}'`;
      const query = new Query({
        where: `${fieldName} = '${value}'`,
        returnGeometry: true,
        outFields: ['*'],
      });
      //setting only features of main layer

      try {
        const result = await featureLayer.queryFeatures(query);
        if (result.features.length > 0) {
          console.log(
            'ffff',
            result.features.map((f) => f.attributes)
          );
          if (main) {
            let featuresExtent = result.features[0].geometry.extent.clone();
            this.setFeatures(result.features);
            result.features.forEach((feature) => {
              featuresExtent = featuresExtent.union(feature.geometry.extent);
            });

            this.mapView?.goTo(featuresExtent.expand(1));
          }
          return result.features.map((f) => f.attributes);
        } else {
          console.log('No features found.');
          return [];
        }
      } catch (error) {
        console.error('Error querying features: ', error);
        return [];
      }
    }
    return [];
  }
  filterFeatureLayersWithPopup(
    featureLayer: FeatureLayer | undefined,
    fieldName: string,
    value: string | number,
    main?: boolean
  ) {
    if (featureLayer) {
      featureLayer.definitionExpression = `${fieldName} = N'${value}'`;

      const query = new Query({
        where: `${fieldName} = '${value}'`,
        returnGeometry: true,
        outFields: ['*'],
      });

      if (main) {
        featureLayer
          .queryFeatures(query)
          .then(async (result) => {
            if (result.features.length > 0) {
              let featuresExtent = result.features[0].geometry.extent.clone();
              this.setFeatures(result.features);

              // Combine all feature extents
              result.features.forEach((feature) => {
                featuresExtent = featuresExtent.union(feature.geometry.extent);
              });

              // Zoom to features
              await this.mapView?.goTo(featuresExtent.expand(1));

              // Open popup after zooming
              if (this.mapView && result.features.length > 0) {
                console.log('features', result.features[0].geometry);

                const firstFeature = result.features[0];
                this.mapView.popup.open({
                  features: [firstFeature],
                  // location: firstFeature.geometry., // ensures popup opens at the feature
                });
              }
            } else {
              console.log('No features found.');
            }
          })
          .catch((error) => {
            console.error('Error querying features: ', error);
          });
      } else {
        featureLayer
          .queryFeatures(query)
          .then(async (result) => {
            if (result.features.length > 0) {
              //  this.setFeatures(result.features);

              // check if layer is a point layer
              const isPointLayer = featureLayer.geometryType === 'point';

              if (isPointLayer) {
                // go to first point directly
                const firstFeature = result.features[0];
                const point = firstFeature.geometry;

                if (this.mapView && point) {
                  await this.mapView.goTo({
                    target: point,
                    zoom: 17, // adjust zoom level as needed
                  });

                  this.mapView.popup.open({
                    features: [firstFeature],
                    // location: point,
                  });
                }
              } else {
                // handle polygon or polyline layers
                let featuresExtent = result.features[0].geometry.extent.clone();

                result.features.forEach((feature) => {
                  if (feature.geometry && feature.geometry.extent) {
                    featuresExtent = featuresExtent.union(
                      feature.geometry.extent
                    );
                  }
                });

                await this.mapView?.goTo(featuresExtent.expand(1));

                // open popup after zooming
                const firstFeature = result.features[0];
                this.mapView?.popup.open({
                  features: [firstFeature],
                  // location: firstFeature.geometry,
                });
              }
            } else {
              console.log('No features found.');
            }
          })
          .catch((error) => {
            console.error('Error querying features: ', error);
          });
      }
    }
  }

  filterFeatureLayersWithManyValues(
    featureLayer: FeatureLayer | undefined,
    fieldName: string,
    values: (string | number)[],
    main?: boolean
  ) {
    if (featureLayer) {
      // Convert array of values to a string for SQL 'IN' clause
      const formattedValues = values
        .map((value) => (typeof value === 'string' ? `'${value}'` : value))
        .join(',');

      featureLayer.definitionExpression = `${fieldName} IN (${formattedValues})`;

      const query = new Query({
        where: `${fieldName} IN (${formattedValues})`,
        returnGeometry: true,
        outFields: ['*'],
      });
      // console.log('query', query);

      featureLayer
        .queryFeatures(query)
        .then((result) => {
          // console.log('resulttttt', result);
          if (result.features.length > 0) {
            if (main) {
              // Initialize the extent with the first feature's extent
              let featuresExtent = result.features[0].geometry.extent.clone();
              // console.log('feature layer', featureLayer);
              this.setFeatures(result.features);
              // Iterate over the rest of the features to union their extents
              result.features.forEach((feature) => {
                featuresExtent = featuresExtent.union(feature.geometry.extent);
              });

              this.mapView?.goTo(featuresExtent.expand(1));
            }
          } else {
            // console.log('hereeeeeeeeeeeeeeeee');
            console.log('No features found.');
          }
        })
        .catch((error) => {
          console.error('Error querying features: ', error, featureLayer);
        });
    }
  }
  async getFeatureLayerParcelCountWithManyFieldsAndValues(
    featureLayer: __esri.FeatureLayer | undefined,
    fieldValues: { fieldName: string; values: (string | number)[] }[]
  ): Promise<number> {
    if (!featureLayer) {
      console.warn('Feature layer is undefined.');
      return 0;
    }

    try {
      const queryParts = fieldValues
        .filter(({ values }) => values.length > 0)
        .map(({ fieldName, values }) => {
          const formattedValues = values
            .map((value) => (typeof value === 'string' ? `N'${value}'` : value))
            .join(',');

          return `${fieldName} IN (${formattedValues})`;
        });

      const whereClause =
        queryParts.length > 0
          ? queryParts.join(' AND ') + ' AND ' + 'newValid = 0'
          : 'newValid = 0';
      console.log('qqqq', queryParts);

      // 2️⃣ Create statistic definition for COUNT
      const statDef = new StatisticDefinition({
        statisticType: 'count',
        onStatisticField: 'OBJECTID',
        outStatisticFieldName: 'feature_count',
      });

      // 3️⃣ Build and execute query
      const query = featureLayer.createQuery();
      query.where = whereClause;
      query.outStatistics = [statDef];
      console.log('stats query', query);

      const result = await featureLayer.queryFeatures(query);
      console.log('stats result', result);

      // 4️⃣ Extract and return count
      const count =
        result.features.length > 0
          ? result.features[0].attributes['feature_count'] || 0
          : 0;

      console.log('Feature count:', count);
      return count;
    } catch (error) {
      console.error('Error getting feature count:', error);
      return 0;
    }
  }

  /**
   * Gets the total feature count for a layer
   * @param featureLayer - The FeatureLayer to get the count from
   * @param whereClause - Optional where clause to filter features (default: '1=1' for all features)
   * @returns Promise that resolves to the total feature count
   */
  async getLayerFeatureCount(
    featureLayer: FeatureLayer | undefined,
    whereClause: string = '1=1'
  ): Promise<number> {
    if (!featureLayer) {
      console.warn('Feature layer is undefined.');
      return 0;
    }

    try {
      // Create statistic definition for COUNT
      const statDef = new StatisticDefinition({
        statisticType: 'count',
        onStatisticField: 'OBJECTID',
        outStatisticFieldName: 'feature_count',
      });

      // Build and execute query
      const query = featureLayer.createQuery();
      query.where = whereClause;
      query.outStatistics = [statDef];
      query.returnGeometry = false;

      const result = await featureLayer.queryFeatures(query);
      console.log('result5555', result);
      // Extract and return count
      const count =
        result.features.length > 0
          ? result.features[0].attributes['feature_count'] || 0
          : 0;

      console.log('Total feature count:', count);
      return count;
    } catch (error) {
      console.error('Error getting layer feature count:', error);
      return 0;
    }
  }

  async getFieldValueCounts(
    featureLayer: __esri.FeatureLayer | undefined,
    fieldName: string,
    whereClause?: string
  ): Promise<{ [key: string]: number }> {
    if (!featureLayer) {
      console.warn('Feature layer is undefined.');
      return {};
    }

    try {
      // Create statistic definition for COUNT grouped by the field
      const statDef = new StatisticDefinition({
        statisticType: 'count',
        onStatisticField: 'OBJECTID',
        outStatisticFieldName: 'feature_count',
      });

      // Build and execute query with groupByFields
      const query = featureLayer.createQuery();
      if (whereClause) {
        query.where = whereClause;
      }
      query.groupByFieldsForStatistics = [fieldName];
      query.outStatistics = [statDef];
      query.returnGeometry = false;

      // console.log('Group by query:', query);
      // console.log('Group by field:', fieldName);

      const result = await featureLayer.queryFeatures(query);
      // console.log('Group by result:', result);

      // Extract counts and build result object
      const counts: { [key: string]: number } = {};

      if (result.features && result.features.length > 0) {
        result.features.forEach((feature) => {
          const fieldValue = feature.attributes[fieldName];
          const count = feature.attributes['feature_count'] || 0;
          // Handle null/undefined values
          const key = fieldValue != null ? String(fieldValue) : 'null';
          counts[key] = count;
        });
      }

      // console.log('Field value counts:', counts);
      return counts;
    } catch (error) {
      console.error('Error getting field value counts:', error);
      return {};
    }
  }

  filterFeatureLayersWithManyFieldsAndValues(
    featureLayer: FeatureLayer | undefined,
    fieldValues: { fieldName: string; values: (string | number)[] }[],
    main?: boolean
  ) {
    if (featureLayer) {
      const queryParts = fieldValues
        .filter(({ values }) => values.length > 0)
        .map(({ fieldName, values }) => {
          // Special handling for IS NULL / IS NOT NULL cases
          if (values.includes('IS_NULL')) {
            return `${fieldName} IS NULL OR ${fieldName} = ''`;
          } else if (values.includes('IS_NOT_NULL')) {
            return ` ${fieldName} <> '' AND ${fieldName} IS NOT NULL`;
          }

          // Normal IN (...) case
          const formattedValues = values
            .map((value) => (typeof value === 'string' ? `N'${value}'` : value))
            .join(',');

          return `${fieldName} IN (${formattedValues})`;
        });

      if (queryParts.length === 0) {
        this.filterFeatureLayers(featureLayer, '1', '1');
        return;
      }
      const newDefinitionExpression = queryParts.join(' AND ');
      console.log('definition', newDefinitionExpression);

      console.log('new definition', newDefinitionExpression);

      featureLayer.definitionExpression = newDefinitionExpression;

      const query = new Query({
        where: newDefinitionExpression,
        returnGeometry: true,
        outFields: ['*'],
      });
      console.log('query', query);

      featureLayer
        .queryFeatures(query)
        .then((result) => {
          if (result.features.length > 0) {
            if (main) {
              let featuresExtent = result.features[0].geometry.extent.clone();
              this.setFeatures(result.features);
              result.features.forEach((feature) => {
                featuresExtent = featuresExtent.union(feature.geometry.extent);
              });
              this.mapView?.goTo(featuresExtent.expand(1));
            }
          } else {
            console.log('No features found.');
          }
        })
        .catch((error) => {
          console.error('Error querying features: ', error, featureLayer);
        });
    }
  }
  filterParcelssWithManyFieldsAndValues(
    featureLayer: FeatureLayer | undefined,
    fieldValues: { fieldName: string; values: (string | number)[] }[],
    chekced?: boolean
  ) {
    if (featureLayer) {
      const queryParts = fieldValues
        .filter(({ values }) => values.length > 0)
        .map(({ fieldName, values }) => {
          // Normal IN (...) case
          const formattedValues = values
            .map((value) => (typeof value === 'string' ? `N'${value}'` : value))
            .join(',');

          return `${fieldName} IN (${formattedValues})`;
        });
      console.log('parcel parts', queryParts);

      if (queryParts.length === 0 && !chekced) {
        this.filterFeatureLayers(featureLayer, '1', '1');
        return;
      }
      let newDefinitionExpression;
      if (chekced) {
        newDefinitionExpression =
          queryParts.length > 0
            ? queryParts.join(' AND ') + ' AND ' + 'newValid = 0'
            : 'newValid = 0';
      } else {
        newDefinitionExpression = queryParts.join(' AND ');
      }
      console.log('definitionjjjjj', newDefinitionExpression);

      console.log('new definition', newDefinitionExpression);

      featureLayer.definitionExpression = newDefinitionExpression;

      const query = new Query({
        where: newDefinitionExpression,
        returnGeometry: true,
        outFields: ['*'],
      });
      console.log('query', query);

      featureLayer
        .queryFeatures(query)
        .then((result) => {
          if (result.features.length > 0) {
          } else {
            console.log('No features found.');
          }
        })
        .catch((error) => {
          console.error('Error querying features: ', error, featureLayer);
        });
    }
  }

  removeAllFilters(featureLayer: FeatureLayer | undefined, main?: boolean) {
    if (featureLayer) {
      console.log('All filters removed.');
      this.goHome();
      this.filterFeatureLayers(featureLayer, '1', '1', main);
    } else {
      console.log('FeatureLayer is undefined.');
    }
  }

  /**
   * Zooms to the extent of filtered features in a layer
   * @param featureLayer - The FeatureLayer to zoom to
   * @param expandFactor - Factor to expand the extent (default: 1.5 for better coverage)
   */
  async zoomToLayerExtent(
    featureLayer: FeatureLayer | undefined,
    expandFactor: number = 1.5
  ): Promise<void> {
    if (!featureLayer || !this.mapView) {
      return;
    }

    try {
      // Wait for layer to be ready
      await featureLayer.when();

      // Create a query to get all features currently visible (respecting definitionExpression)
      const query = featureLayer.createQuery();
      query.where = featureLayer.definitionExpression || '1=1';
      query.returnGeometry = true;
      query.outFields = ['*'];
      // Request a large number of features to get all results
      query.num = 10000; // Increased to handle large feature sets

      // Query all features (handle pagination if needed)
      let allFeatures: __esri.Graphic[] = [];
      let result = await featureLayer.queryFeatures(query);

      if (result.features) {
        allFeatures = allFeatures.concat(result.features);
      }

      // Check if there are more features to fetch (use FeatureSet properties)
      let hasMore = (result as any).exceededTransferLimit || false;
      let start = result.features.length;

      while (hasMore && start < 50000) {
        // Safety limit
        query.start = start;
        result = await featureLayer.queryFeatures(query);
        if (result.features && result.features.length > 0) {
          allFeatures = allFeatures.concat(result.features);
          start += result.features.length;
          hasMore = (result as any).exceededTransferLimit || false;
        } else {
          break;
        }
      }

      if (allFeatures.length > 0) {
        // Calculate the union extent of all features
        let featuresExtent = allFeatures[0].geometry.extent.clone();

        allFeatures.forEach((feature) => {
          if (feature.geometry && feature.geometry.extent) {
            featuresExtent = featuresExtent.union(feature.geometry.extent);
          }
        });

        // Calculate dynamic padding based on extent size
        // For smaller extents, use larger padding; for larger extents, use smaller padding
        const extentWidth = featuresExtent.width;
        const extentHeight = featuresExtent.height;
        const extentSize = Math.max(extentWidth, extentHeight);

        // Use larger expand factor for smaller extents (more padding needed for point features)
        let dynamicExpandFactor = expandFactor;
        if (extentSize < 0.01) {
          // Very small extent - likely point features, use larger padding
          dynamicExpandFactor = 2.5;
        } else if (extentSize < 0.1) {
          // Small extent - use larger padding
          dynamicExpandFactor = 2.0;
        } else if (extentSize < 1.0) {
          // Medium extent - use moderate padding
          dynamicExpandFactor = 1.5;
        }

        // Expand the extent
        const expandedExtent = featuresExtent.expand(dynamicExpandFactor);

        // Zoom to the extent with padding
        await this.mapView.goTo(
          {
            target: expandedExtent,
            padding: {
              left: 50,
              right: 50,
              top: 50,
              bottom: 50,
            },
          },
          {
            duration: 1000,
            easing: 'ease-in-out',
          }
        );
      }
    } catch (error) {
      console.error('Error zooming to layer extent:', error);
    }
  }
  async getStats(
    featureLayer: FeatureLayer | undefined,
    fieldValues: { fieldName: string; values: (string | number)[] }[],
    statistics: {
      field: string;
      type: 'count' | 'sum' | 'avg' | 'min' | 'max';
      outField: string;
    }[]
  ) {
    if (!featureLayer) return;

    const queryParts = fieldValues
      .filter(({ values }) => values.length > 0)
      .map(({ fieldName, values }) => {
        if (values.includes('IS_NULL')) {
          return `${fieldName} IS NULL OR ${fieldName} = ''`;
        } else if (values.includes('IS_NOT_NULL')) {
          return `${fieldName} <> '' AND ${fieldName} IS NOT NULL`;
        }

        const formattedValues = values
          .map((value) => (typeof value === 'string' ? `N'${value}'` : value))
          .join(',');

        return `${fieldName} IN (${formattedValues})`;
      });

    const where = queryParts.length > 0 ? queryParts.join(' AND ') : '1=1';
    console.log('Stats query WHERE:', where);

    // 🧮 Build the statistics definitions
    const outStatistics = statistics.map((s) => ({
      statisticType: s.type,
      onStatisticField: s.field,
      outStatisticFieldName: s.outField,
    }));

    const query = new Query({
      where,
      outStatistics,
      returnGeometry: false,
    });

    try {
      const result = await featureLayer.queryFeatures(query);

      if (result.features.length > 0) {
        const stats = result.features[0].attributes;
        console.log('📊 Statistics result:', stats);
        return stats;
      } else {
        console.log('No data found for the specified filters.');
        return null;
      }
    } catch (error) {
      console.error('Error getting statistics:', error);
    }
  }
  getAllFieldValues(
    featureLayer: FeatureLayer | undefined,
    fieldName: string
  ): Observable<string[]> {
    return new Observable((observer) => {
      if (featureLayer) {
        const query = new Query({
          where: '1=1',
          outFields: [fieldName],
          returnDistinctValues: true,
          returnGeometry: false,
        });

        from(featureLayer.queryFeatures(query)).subscribe({
          next: (result) => {
            const values = result.features.map(
              (feature) => feature.attributes[fieldName]
            );
            // console.log('values', values, featureLayer, fieldName);

            observer.next(values);
            observer.complete();
          },
          error: (error) => {
            console.error('Error querying feature layer: ', error);
            observer.error(error);
          },
        });
      } else {
        console.error('FeatureLayer is undefined.');
        observer.error('FeatureLayer is undefined.');
      }
    });
  }
  setFeatures(newValue: __esri.Graphic[]) {
    // console.log('new values', newValue);
    this.currentFeatures.next(newValue);
  }
  getFeatures() {
    return this.currentFeatures.asObservable();
  }
  ////////////////extent handlers
  private saveExtent(newExtent: __esri.Extent) {
    if (newExtent) {
      // Check if the new extent is already in the array
      const isAlreadySaved = this.extentArray.some((savedExtent) => {
        return savedExtent.equals(newExtent);
      });

      if (!isAlreadySaved) {
        // If the extent is not already saved, push it to the array and update the index
        this.extentArray.push(newExtent.clone());
        this.currentExtentIndex++;
        // console.log('Saved new extent', this.extentArray);
      } else {
        // console.log('Extent is already saved');
      }
    }
  }

  goBackExtent(): void {
    if (this.currentExtentIndex > 0) {
      this.currentExtentIndex--;
      const previousExtent = this.extentArray[this.currentExtentIndex];
      this.mapView?.goTo(previousExtent, {
        duration: 300,
        easing: 'ease-in-out',
      });
      console.log('Going back to extent:', previousExtent);
    } else {
      console.log('No previous extent available');
    }
  }

  goForwardExtent(): void {
    if (this.currentExtentIndex < this.extentArray.length - 1) {
      this.currentExtentIndex++;
      const nextExtent = this.extentArray[this.currentExtentIndex];
      this.mapView?.goTo(nextExtent, {
        duration: 300,
        easing: 'ease-in-out',
      });
      console.log('Going forward to extent:', nextExtent);
    } else {
      console.log('No forward extent available');
    }
  }

  getUniqueValues(
    layer: __esri.FeatureLayer,
    field: string
  ): Promise<string[]> {
    // Create a new query object
    const query = layer.createQuery();

    query.where = '1=1';
    query.returnDistinctValues = true;
    query.outFields = [field];
    query.orderByFields = [field];
    query.returnGeometry = false;

    return layer
      .queryFeatures(query)
      .then((result) => {
        const uniqueValues = result.features.map(
          (feature) => feature.attributes[field]
        );
        console.log('unique', uniqueValues);
        return uniqueValues;
      })
      .catch((error): [] => {
        console.error('Error fetching unique values:', error);
        return [];
      });
  }

  /**
   * Gets domain key-value pairs for all fields in a feature layer
   * @param layer - The FeatureLayer to get domains from
   * @returns Promise that resolves to an object with field names as keys and domain key-value pairs as values
   * Example return: { "Owner": { "1": "Owner Name 1", "2": "Owner Name 2" }, "Status": { "A": "Active", "I": "Inactive" } }
   */
  async getLayerFieldDomains(
    layer: FeatureLayer | undefined
  ): Promise<{ [fieldName: string]: { [key: string | number]: string } }> {
    if (!layer) {
      console.warn('Layer is undefined');
      return {};
    }

    try {
      // Wait for the layer to load to ensure fields are available
      await layer.when();

      const domains: {
        [fieldName: string]: { [key: string | number]: string };
      } = {};

      // Iterate through all fields
      layer.fields.forEach((field) => {
        // Check if the field has a domain
        if (field.domain) {
          // Check if it's a coded value domain
          if (field.domain.type === 'coded-value') {
            const codedValueDomain = field.domain as __esri.CodedValueDomain;
            const domainMap: { [key: string | number]: string } = {};

            // Extract key-value pairs from coded values
            if (codedValueDomain.codedValues) {
              codedValueDomain.codedValues.forEach((codedValue) => {
                // Convert code to string for consistent key type, but preserve original type
                const code = codedValue.code;
                domainMap[code] = codedValue.name;
              });
            }

            // Only add to result if domain has values
            if (Object.keys(domainMap).length > 0) {
              domains[field.name] = domainMap;
            }
          }
        }
      });

      console.log('Field domains:', domains);
      return domains;
    } catch (error) {
      console.error('Error getting field domains:', error);
      return {};
    }
  }

  async styleLayerWithUniqueValues(
    layer: __esri.FeatureLayer,
    schemaName: string,
    fieldName: string
  ) {
    try {
      const uniqueValues = await this.getUniqueValues(layer, fieldName);

      const limitedUniqueValues = uniqueValues;

      const scheme = await getSchemeByName({
        basemap: this.mapView.map.basemap,
        geometryType: 'polygon',
        name: 'Basic Random',
        theme: 'high-to-low',
      });

      const schemeColors = scheme.colors.slice(0, limitedUniqueValues.length);

      const uniqueValueInfos = limitedUniqueValues.map((value, index) => ({
        value: value,
        symbol: {
          type: 'simple-fill',
          color: schemeColors[index],
          outline: {
            width: 1,
            color: [0, 0, 0, 0.5],
          },
        },
        label: value,
      }));

      const renderer = new UniqueValueRenderer({
        field: fieldName,
        // uniqueValueInfos: uniqueValueInfos,
      });

      layer.renderer = renderer;

      console.log(
        `Layer styled with ${uniqueValues.length} unique values using the ${schemaName} schema.`
      );
    } catch (error) {
      console.error('Error styling the layer:', error);
    }
  }

  updateFeatureLayers(
    layerArray: { url: string; name: string }[],
    layerName: string
  ): void {
    if (!this.map) {
      return;
    }
    layerArray.forEach((layerInfo) => {
      const layersToRemove = this.map?.layers.filter(
        (layer) => layer.title === layerInfo.name
      );
      layersToRemove?.forEach((layer) => {
        this.map?.remove(layer);
      });
    });

    const layerToAdd = layerArray.find(
      (layerInfo) => layerInfo.name === layerName
    );

    if (layerToAdd) {
      const featureLayer = new FeatureLayer({
        url: layerToAdd.url,
        title: layerToAdd.name,
      });

      this.map.add(featureLayer);
      console.log(`Added layer: ${layerToAdd.name}`);
    } else {
      console.error(`Layer with name "${layerName}" not found in the array.`);
    }
  }
  //   async  filterLayerByIntersection(
  //   targetLayer: FeatureLayer,
  //   filterFeatures: Feature[]
  // ) {
  //   try {
  //     if (!targetLayer || !filterFeatures?.length) {
  //       console.warn("Missing layer or features for filtering.");
  //       return;
  //     }

  //     // --- Step 1: Merge geometries of input features into one union geometry ---
  //     const geometries = filterFeatures.map((f) => f.geometry);
  //     const unionGeometry = geometryEngine.union(geometries);

  //     // --- Step 2: Build a spatial query to find intersecting features ---
  //     const query = new Query({
  //       geometry: unionGeometry,
  //       spatialRelationship: "intersects", // could also use "contains" or "within"
  //       returnGeometry: true,
  //       outFields: ["*"],
  //     });

  //     // --- Step 3: Run query ---
  //     const result = await targetLayer.queryFeatures(query);

  //     // --- Step 4: Apply filter (definition expression) if needed ---
  //     // If you want to *filter the map layer visually*, build a WHERE clause
  //     if (result.features.length > 0) {
  //       const objectIds = result.features.map((f) => f.attributes[targetLayer.objectIdField]);
  //       const objectIdList = objectIds.join(",");

  //       // Apply filter to the layer
  //       targetLayer.definitionExpression = `${targetLayer.objectIdField} IN (${objectIdList})`;

  //       console.log(`Filtered layer to ${objectIds.length} intersecting features.`);
  //     } else {
  //       console.log("No intersecting features found.");
  //       targetLayer.definitionExpression = "1=0"; // Hide all features
  //     }

  //     return result.features;
  //   } catch (err) {
  //     console.error("Error filtering layer by intersection:", err);
  //   }
  // }
}

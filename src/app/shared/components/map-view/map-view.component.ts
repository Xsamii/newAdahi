import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../../pages/services/map.service';
import { DashboardService } from '../../../pages/services/dashboard.service';
import { MapControlsComponent } from '../map-controls/map-controls.component';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, MapControlsComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Input() height: string = '50vh';
  isLayerListVisible = false;
  isBaseMapVisible = false;
  isLegendVisible = false;

  constructor(
    private dashboardService: DashboardService,
    private mapService: MapService
  ) {}

  ngAfterViewInit() {
    this.dashboardService.initMapView('mapContainer');
    // Initialize the layer list after a short delay to ensure map is ready
    setTimeout(() => {
      this.mapService.addLayerList();
      // Initialize legend after map is ready
      const legend = this.mapService.getLegend();
      if (legend) {
        // Legend is already created, just ensure container is set
        this.mapService.addLegendToElement('legendContainer');
      }
    }, 1000);
  }

  toggleLayerList(): void {
    this.isLayerListVisible = !this.isLayerListVisible;
    // Close basemap if opening layer list
    if (this.isLayerListVisible) {
      this.isBaseMapVisible = false;
    }
  }

  toggleBaseMap(): void {
    this.isBaseMapVisible = !this.isBaseMapVisible;
    // Close layer list if opening basemap
    if (this.isBaseMapVisible) {
      this.isLayerListVisible = false;
    }
  }

  toggleLegend(): void {
    this.isLegendVisible = !this.isLegendVisible;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';
import { LoadingService } from './core/services/loading.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { DashboardService } from './pages/services/dashboard.service';
import { LoadingScreenComponent } from './shared/components/loading-screen/loading-screen.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoadingScreenComponent, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'visual-inspection-for-roads-and-tunnels';
  isLoading = true;
  private loadingSubscription?: Subscription;

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private dashboardService: DashboardService,
    public loadingService: LoadingService
  ) {
    // Set default language for translate service
    this.translate.setDefaultLang('ar');
  }

  async ngOnInit() {
    // Initialize language service (will set language and direction)
    this.languageService.initialize();

    // Subscribe to loading service for API call loading
    this.loadingSubscription = this.loadingService.isLoading$.subscribe(
      loading => {
        // Only update if initial loading is done
        if (!this.isLoading) {
          this.isLoading = loading;
        }
      }
    );

    try {
      // Wait for all map data to load before hiding the loader
      await this.dashboardService.initMap();
      console.log('Map initialization complete');
    } catch (error) {
      console.error('Error initializing map:', error);
    } finally {
      // Ensure minimum 2 seconds for smooth animation
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    }
  }

  ngOnDestroy() {
    this.loadingSubscription?.unsubscribe();
  }
}

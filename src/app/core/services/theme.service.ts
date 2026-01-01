import { Injectable, Renderer2, RendererFactory2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme$ = new BehaviorSubject<Theme>('light');

  // ArcGIS theme CSS links
  private arcgisLightTheme = '@arcgis/core/assets/esri/themes/light/main.css';
  private arcgisDarkTheme = '@arcgis/core/assets/esri/themes/dark/main.css';

  // PrimeNG theme CSS links
  private primeNGLightTheme = 'primeng/resources/themes/lara-light-blue/theme.css';
  private primeNGDarkTheme = 'primeng/resources/themes/lara-dark-blue/theme.css';

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadSavedTheme();
  }

  /**
   * Get current theme as observable
   */
  get theme$(): Observable<Theme> {
    return this.currentTheme$.asObservable();
  }

  /**
   * Get current theme value
   */
  get currentTheme(): Theme {
    return this.currentTheme$.value;
  }

  /**
   * Load saved theme from localStorage or default to light
   */
  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  /**
   * Set theme (light or dark)
   */
  setTheme(theme: Theme): void {
    this.currentTheme$.next(theme);
    localStorage.setItem('theme', theme);

    // Update HTML class for Tailwind dark mode
    if (theme === 'dark') {
      this.renderer.addClass(this.document.documentElement, 'dark');
    } else {
      this.renderer.removeClass(this.document.documentElement, 'dark');
    }

    // Update theme stylesheets
    this.updateThemeStylesheets(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Update theme stylesheets dynamically
   */
  private updateThemeStylesheets(theme: Theme): void {
    // Note: Since we already have ArcGIS light theme in angular.json,
    // we only need to handle dynamic switching if needed
    // For now, we'll rely on CSS custom properties and Tailwind dark mode
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }
}

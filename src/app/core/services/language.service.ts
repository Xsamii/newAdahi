import { Injectable, Renderer2, RendererFactory2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'ar' | 'en';

export interface LanguageConfig {
  code: Language;
  name: string;
  direction: 'rtl' | 'ltr';
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private renderer: Renderer2;
  private currentLanguage$ = new BehaviorSubject<Language>('ar');

  // Available languages configuration
  readonly languages: LanguageConfig[] = [
    { code: 'ar', name: 'العربية', direction: 'rtl' },
    { code: 'en', name: 'English', direction: 'ltr' }
  ];

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Initialize language service with default language
   */
  initialize(): void {
    const savedLang = this.getSavedLanguage();
    this.setLanguage(savedLang);
  }

  /**
   * Get current language as observable
   */
  get language$(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  /**
   * Get current language value
   */
  get currentLanguage(): Language {
    return this.currentLanguage$.value;
  }

  /**
   * Get saved language from localStorage or return default (ar)
   */
  private getSavedLanguage(): Language {
    const savedLang = localStorage.getItem('language') as Language;
    return savedLang || 'ar';
  }

  /**
   * Set language and update direction
   */
  setLanguage(lang: Language): void {
    this.currentLanguage$.next(lang);
    localStorage.setItem('language', lang);

    // Update translate service
    this.translate.use(lang);

    // Get language config
    const config = this.languages.find(l => l.code === lang);
    if (config) {
      this.setDirection(config.direction);
    }
  }

  /**
   * Toggle between Arabic and English
   */
  toggleLanguage(): void {
    const newLang = this.currentLanguage === 'ar' ? 'en' : 'ar';
    this.setLanguage(newLang);
  }

  /**
   * Set text direction (RTL/LTR)
   */
  private setDirection(direction: 'rtl' | 'ltr'): void {
    this.renderer.setAttribute(this.document.documentElement, 'dir', direction);
    this.renderer.setAttribute(this.document.documentElement, 'lang', this.currentLanguage);
  }

  /**
   * Check if current language is RTL
   */
  isRTL(): boolean {
    const config = this.languages.find(l => l.code === this.currentLanguage);
    return config?.direction === 'rtl';
  }

  /**
   * Get current language direction
   */
  getCurrentDirection(): 'rtl' | 'ltr' {
    const config = this.languages.find(l => l.code === this.currentLanguage);
    return config?.direction || 'rtl';
  }
}

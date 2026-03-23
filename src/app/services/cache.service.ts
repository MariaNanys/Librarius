import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CacheService {
  // 1. NASZ NOWY SYGNAŁ DO TRZYMANIA STANU UŻYTKOWNIKA
  user = signal<{ first_name: string } | null>(null);

  // --- Twoja dotychczasowa logika cachowania ---
  private cacheMap = new Map<string, { data: any; expiry: number }>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; 

  set(cacheKey: string, body: any, ttl: number = this.DEFAULT_TTL): void {
    const expiry = Date.now() + ttl;
    this.cacheMap.set(cacheKey, { data: body, expiry });
  }

  get(cacheKey: string): any | null {
    const cachedItem = this.cacheMap.get(cacheKey);
    if (!cachedItem) return null;
    if (Date.now() > cachedItem.expiry) {
      this.cacheMap.delete(cacheKey); 
      return null;
    }
    return cachedItem.data;
  }
  
  clear(cacheKey?: string): void {
    if (cacheKey) {
      this.cacheMap.delete(cacheKey);
    } else {
      this.cacheMap.clear();
      // Przy pełnym czyszczeniu (np. wylogowaniu) resetujemy też użytkownika
      this.user.set(null); 
    }
  }
}
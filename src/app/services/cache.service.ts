import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CacheService {
  user = signal<{ first_name: string } | null>(null);

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
      this.user.set(null); 
    }
  }
}
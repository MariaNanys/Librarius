import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CacheService {
  // Magazyn na nasze dane (klucz: adres URL, wartość: dane + czas wygaśnięcia)
  private cacheMap = new Map<string, { data: any; expiry: number }>();
  
  // Domyślny czas życia danych w cache'u (np. 30 minut w milisekundach)
  private readonly DEFAULT_TTL = 30 * 60 * 1000; 

  set(cacheKey: string, body: any, ttl: number = this.DEFAULT_TTL): void {
    const expiry = Date.now() + ttl;
    this.cacheMap.set(cacheKey, { data: body, expiry });
  }

  get(cacheKey: string): any | null {
    const cachedItem = this.cacheMap.get(cacheKey);

    // Jeśli nie ma nic pod tym kluczem
    if (!cachedItem) {
      return null;
    }

    // Jeśli dane są przeterminowane
    if (Date.now() > cachedItem.expiry) {
      this.cacheMap.delete(cacheKey); 
      return null;
    }

    // Zwracamy prawidłowe dane
    return cachedItem.data;
  }
  
  // Przydatne przy wylogowywaniu użytkownika, żeby wyczyścić mu cache
  clear(cacheKey?: string): void {
    if (cacheKey) {
      this.cacheMap.delete(cacheKey);
    } else {
      this.cacheMap.clear();
    }
  }
}
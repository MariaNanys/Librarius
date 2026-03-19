import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service'; // Zmień ścieżkę, jeśli plik jest gdzie indziej

export const cacheInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  // 1. Cache'ujemy tylko zapytania GET. POST, PUT, DELETE zawsze trafiają prosto do serwera.
  if (req.method !== 'GET') {
    return next(req);
  }

  const cacheService = inject(CacheService);
  // Unikalnym kluczem dla naszych danych będzie pełny adres URL (wraz z parametrami np. ?page=1)
  const cacheKey = req.urlWithParams; 

  // 2. Sprawdzamy nasz "tajny nagłówek" - czy chcemy ominąć cache?
  if (req.headers.has('X-Skip-Cache')) {
    console.log('🔄 Wymuszono odświeżenie danych. Omijam cache dla:', cacheKey);
    
    // Usuwamy nagłówek przed wysłaniem do API (backend nie musi o nim wiedzieć)
    const newReq = req.clone({ headers: req.headers.delete('X-Skip-Cache') });
    
    return next(newReq).pipe(
      tap(event => {
        // Zapisujemy nowiutkie dane do pamięci podręcznej
        if (event instanceof HttpResponse) {
          cacheService.set(cacheKey, event.body);
        }
      })
    );
  }

  // 3. Normalny przepływ - szukamy danych w naszym CacheService
  const cachedData = cacheService.get(cacheKey);

  if (cachedData) {
    console.log('✅ Zwracam dane bezpośrednio z CacheService:', cacheKey);
    // Budujemy sztuczną odpowiedź HTTP, żeby Angular nie zorientował się, że nie pytaliśmy serwera
    return of(new HttpResponse({ body: cachedData, status: 200 }));
  }

  // 4. Jeśli nie mamy danych w pamięci, puszczamy zwykłe zapytanie do API
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.log('⬇️ Pobrano z API i zapisano do CacheService:', cacheKey);
        // Zapisujemy wynik do magazynu na przyszłość
        cacheService.set(cacheKey, event.body);
      }
    })
  );
};
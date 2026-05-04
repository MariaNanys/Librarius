import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { CacheService } from '../services/cache.service';

export const cacheInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  if (req.method !== 'GET') {
    return next(req);
  }

  const cacheService = inject(CacheService);
  const cacheKey = req.urlWithParams; 

  if (req.headers.has('X-Skip-Cache')) {
    console.log('🔄 Wymuszono odświeżenie danych. Omijam cache dla:', cacheKey);

    const newReq = req.clone({ headers: req.headers.delete('X-Skip-Cache') });
    
    return next(newReq).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          cacheService.set(cacheKey, event.body);
        }
      })
    );
  }

  const cachedData = cacheService.get(cacheKey);

  if (cachedData) {
    console.log('✅ Zwracam dane bezpośrednio z CacheService:', cacheKey);
    return of(new HttpResponse({ body: cachedData, status: 200 }));
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.log('⬇️ Pobrano z API i zapisano do CacheService:', cacheKey);
        cacheService.set(cacheKey, event.body);
      }
    })
  );
};
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Wyciągamy token z pamięci przeglądarki
  const token = localStorage.getItem('token');

  // 2. Jeśli token istnieje (użytkownik jest zalogowany)
  if (token) {
    // Klonujemy oryginalne zapytanie i dodajemy nagłówek "Authorization: Bearer <token>"
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Puszczamy zmodyfikowane zapytanie dalej
    return next(clonedRequest);
  }

  // 3. Jeśli nie ma tokena (np. przed zalogowaniem), puszczamy zapytanie bez zmian
  return next(req);
};
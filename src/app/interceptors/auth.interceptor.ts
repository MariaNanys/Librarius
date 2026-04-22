import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { EMPTY } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  if (token) {

    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedRequest);
  }
  const loginTime = localStorage.getItem('login_timestamp');
  const oneDayInMs = 24 * 60 * 60 * 1000;

  if (loginTime) {
    const now = new Date().getTime();
    if (now - Number(loginTime) > oneDayInMs) {
      authService.logout();
      return EMPTY;
  }}
  return next(req);
};
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SessionExpiredDialogComponent } from './session-expired-dialog.component';

let dialogoAbierto = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const dialog = inject(MatDialog);
  const router = inject(Router);
  const token = auth.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const esLogin = req.url.includes('/api/auth/login');

      if (err.status === 401 && !esLogin && !dialogoAbierto) {
        dialogoAbierto = true;
        auth.clearSession();

        const ref = dialog.open(SessionExpiredDialogComponent, {
          disableClose: true
        });

        ref.afterClosed().subscribe(() => {
          dialogoAbierto = false;
          router.navigate(['/login']);
        });
      }

      return throwError(() => err);
    })
  );
};
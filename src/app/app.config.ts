import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { authInterceptor } from './core/auth/auth.interceptor';
import { routes } from './app.routes';
import { PaginadorEsIntl } from './shared/paginador-es';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: MatPaginatorIntl, useClass: PaginadorEsIntl }
  ]
};
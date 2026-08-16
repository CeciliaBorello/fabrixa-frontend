import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CuentaContableRequest, CuentaContableResponse } from './cuenta-contable.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CuentaContableService {
  private baseUrl = `${environment.apiUrl}/api/cuentas-contables`;

  constructor(private http: HttpClient) {}

  listar(activo: boolean, busqueda: string): Observable<CuentaContableResponse[]> {
    return this.http.get<CuentaContableResponse[]>(`${this.baseUrl}?activo=${activo}&busqueda=${busqueda}`);
  }

  crear(request: CuentaContableRequest): Observable<CuentaContableResponse> {
    return this.http.post<CuentaContableResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: CuentaContableRequest): Observable<CuentaContableResponse> {
    return this.http.put<CuentaContableResponse>(`${this.baseUrl}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/reactivar`, {});
  }
}

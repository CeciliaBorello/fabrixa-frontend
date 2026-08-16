import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoImpuesto, ImpuestoRequest, ImpuestoResponse } from './impuesto.model';
import { PageResponse } from '../../shared/page-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImpuestoService {
 private baseUrl = `${environment.apiUrl}/api/impuestos`;

  constructor(private http: HttpClient) {}

  listarPaginado(page: number, size: number, estado: EstadoImpuesto | null, busqueda: string, sortBy: string, sortDir: string): Observable<PageResponse<ImpuestoResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), busqueda, sortBy, sortDir });
    if (estado) params.append('estado', estado);
    return this.http.get<PageResponse<ImpuestoResponse>>(`${this.baseUrl}/pagina?${params}`);
  }

  crear(request: ImpuestoRequest): Observable<ImpuestoResponse> {
    return this.http.post<ImpuestoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ImpuestoRequest): Observable<ImpuestoResponse> {
    return this.http.put<ImpuestoResponse>(`${this.baseUrl}/${id}`, request);
  }

  marcarPagado(id: number): Observable<ImpuestoResponse> {
    return this.http.put<ImpuestoResponse>(`${this.baseUrl}/${id}/pagar`, {});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AjusteRequest, MovimientoResponse } from './stock.model';
import { PageResponse } from '../../shared/page-response.model';
import { StockFilaResponse } from './stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private baseUrl = 'http://localhost:8080/api/stock';

  constructor(private http: HttpClient) {}

  historial(productoId: number): Observable<MovimientoResponse[]> {
    return this.http.get<MovimientoResponse[]>(`${this.baseUrl}/${productoId}/movimientos`);
  }

  ajustar(request: AjusteRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(`${this.baseUrl}/ajuste`, request);
  }

  listarPaginado(page: number, size: number, sortBy: string, sortDir: string, busqueda: string, grupo: 'venta' | 'insumos'): Observable<PageResponse<StockFilaResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, sortDir, busqueda, grupo, activo: 'true' });
  return this.http.get<PageResponse<StockFilaResponse>>(`${this.baseUrl}/pagina?${params}`);
}

presentacionesConStock(productoBaseId: number): Observable<StockFilaResponse[]> {
  return this.http.get<StockFilaResponse[]>(`${this.baseUrl}/presentaciones/${productoBaseId}`);
}
}
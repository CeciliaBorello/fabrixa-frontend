import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoRequest, PedidoResponse } from './pedido.model';
import { PageResponse } from '../../shared/page-response.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = 'http://localhost:8080/api/pedidos';

  constructor(private http: HttpClient) {}

  listar(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.baseUrl, request);
  }

  marcarPendienteEntrega(id: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.baseUrl}/${id}/pendiente-entrega`, {});
  }

  marcarEntregado(id: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.baseUrl}/${id}/entregado`, {});
  }

  cancelar(id: number): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  listarPaginado(page: number, size: number, sortBy: string, sortDir: string, soloCancelados: boolean, busqueda: string): Observable<PageResponse<PedidoResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, sortDir, soloCancelados: String(soloCancelados), busqueda });
    return this.http.get<PageResponse<PedidoResponse>>(`${this.baseUrl}/pagina?${params}`);
  }
}
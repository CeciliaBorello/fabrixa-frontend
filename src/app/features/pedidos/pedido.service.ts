import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoRequest, PedidoResponse } from './pedido.model';

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
}
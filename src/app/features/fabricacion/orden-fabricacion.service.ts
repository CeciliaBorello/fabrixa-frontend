import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinalizarRequest, OrdenFabricacionRequest, OrdenFabricacionResponse } from './orden-fabricacion.model';
import { PageResponse } from '../../shared/page-response.model';

@Injectable({ providedIn: 'root' })
export class OrdenFabricacionService {
  private baseUrl = 'http://localhost:8080/api/ordenes-fabricacion';

  constructor(private http: HttpClient) {}

  listar(): Observable<OrdenFabricacionResponse[]> {
    return this.http.get<OrdenFabricacionResponse[]>(this.baseUrl);
  }

  listarPaginado(page: number, size: number, sortBy: string, sortDir: string, soloCanceladas: boolean, busqueda: string): Observable<PageResponse<OrdenFabricacionResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, sortDir, soloCanceladas: String(soloCanceladas), busqueda });
    return this.http.get<PageResponse<OrdenFabricacionResponse>>(`${this.baseUrl}/pagina?${params}`);
  }

  crear(request: OrdenFabricacionRequest): Observable<OrdenFabricacionResponse> {
    return this.http.post<OrdenFabricacionResponse>(this.baseUrl, request);
  }

  iniciar(id: number): Observable<OrdenFabricacionResponse> {
    return this.http.put<OrdenFabricacionResponse>(`${this.baseUrl}/${id}/iniciar`, {});
  }

  finalizar(id: number, request: FinalizarRequest): Observable<OrdenFabricacionResponse> {
    return this.http.put<OrdenFabricacionResponse>(`${this.baseUrl}/${id}/finalizar`, request);
  }

  cancelar(id: number): Observable<OrdenFabricacionResponse> {
    return this.http.put<OrdenFabricacionResponse>(`${this.baseUrl}/${id}/cancelar`, {});
  }

  historialPorProducto(productoId: number): Observable<OrdenFabricacionResponse[]> {
    return this.http.get<OrdenFabricacionResponse[]>(`${this.baseUrl}/por-producto/${productoId}`);
  }
}
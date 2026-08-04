import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductoRequest, ProductoResponse } from './producto.model';
import { PageResponse } from '../../shared/page-response.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private baseUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  listar(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.baseUrl}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/reactivar`, {});
  }

  listarPaginado(page: number, size: number, sortBy: string, sortDir: string, activo: boolean, busqueda: string, grupo: 'terminados' | 'insumos'): Observable<PageResponse<ProductoResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, sortDir, activo: String(activo), busqueda, grupo });
    return this.http.get<PageResponse<ProductoResponse>>(`${this.baseUrl}/pagina?${params}`);
  }

  listarProductosBase(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.baseUrl}/base`);
  }

  listarPresentaciones(productoId: number): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.baseUrl}/${productoId}/presentaciones`);
  }
}
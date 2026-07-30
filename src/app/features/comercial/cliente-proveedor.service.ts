import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteProveedorRequest, ClienteProveedorResponse } from './cliente-proveedor.model';
import { PageResponse } from '../../shared/page-response.model';

@Injectable({ providedIn: 'root' })
export class ClienteProveedorService {
  private baseUrl = 'http://localhost:8080/api/clientes-proveedores';

  constructor(private http: HttpClient) {}

  listar(): Observable<ClienteProveedorResponse[]> {
    return this.http.get<ClienteProveedorResponse[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<ClienteProveedorResponse> {
    return this.http.get<ClienteProveedorResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: ClienteProveedorRequest): Observable<ClienteProveedorResponse> {
    return this.http.post<ClienteProveedorResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: ClienteProveedorRequest): Observable<ClienteProveedorResponse> {
    return this.http.put<ClienteProveedorResponse>(`${this.baseUrl}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/reactivar`, {});
  }

  listarPaginado(page: number, size: number): Observable<PageResponse<ClienteProveedorResponse>> {
    return this.http.get<PageResponse<ClienteProveedorResponse>>(`${this.baseUrl}/pagina?page=${page}&size=${size}`);
  }
}
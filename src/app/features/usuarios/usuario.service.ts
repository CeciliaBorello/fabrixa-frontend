import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Rol, UsuarioRequest, UsuarioResponse } from './usuario.model';
import { PageResponse } from '../../shared/page-response.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private base = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<UsuarioResponse[]>(this.base);
  }

 listarPaginado(
    page: number, size: number, sortBy: string, sortDir: string, activo: boolean, busqueda: string
  ): Observable<PageResponse<UsuarioResponse>> {
    const params = new URLSearchParams({
      page: String(page), size: String(size), sortBy, sortDir, activo: String(activo), busqueda
    });
    return this.http.get<PageResponse<UsuarioResponse>>(`${this.base}/pagina?${params}`);
  }

  buscarPorId(id: number) {
    return this.http.get<UsuarioResponse>(`${this.base}/${id}`);
  }

  crear(request: UsuarioRequest) {
    return this.http.post<UsuarioResponse>(this.base, request);
  }

  actualizar(id: number, request: UsuarioRequest) {
    return this.http.put<UsuarioResponse>(`${this.base}/${id}`, request);
  }

  desactivar(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  reactivar(id: number) {
    return this.http.put<void>(`${this.base}/${id}/reactivar`, {});
  }

  listarRoles() {
    return this.http.get<Rol[]>(`${environment.apiUrl}/api/roles`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpleadoRequest, EmpleadoResponse, TipoRemuneracion } from './empleado.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private baseUrl = `${environment.apiUrl}/api/empleados`;

  constructor(private http: HttpClient) {}

  buscarPorId(id: number): Observable<EmpleadoResponse> {
    return this.http.get<EmpleadoResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: EmpleadoRequest): Observable<EmpleadoResponse> {
    return this.http.post<EmpleadoResponse>(this.baseUrl, request);
  }

  actualizar(id: number, request: EmpleadoRequest): Observable<EmpleadoResponse> {
    return this.http.put<EmpleadoResponse>(`${this.baseUrl}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivar(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/reactivar`, {});
  }

  listar(activo: boolean, busqueda: string, tipoRemuneracion?: TipoRemuneracion) {
    let params = new HttpParams().set('activo', activo).set('busqueda', busqueda);
    if (tipoRemuneracion) {
      params = params.set('tipoRemuneracion', tipoRemuneracion);
    }
    return this.http.get<EmpleadoResponse[]>(this.baseUrl, { params });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NoLiquidadasPorEmpleado, RegistroHorasRequest, RegistroHorasResponse } from './registro-horas.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegistroHorasService {
  private baseUrl = `${environment.apiUrl}/api/registros-horas`;

  constructor(private http: HttpClient) {}

  crear(request: RegistroHorasRequest): Observable<RegistroHorasResponse> {
    return this.http.post<RegistroHorasResponse>(this.baseUrl, request);
  }

  porEmpleado(empleadoId: number): Observable<RegistroHorasResponse[]> {
    return this.http.get<RegistroHorasResponse[]>(`${this.baseUrl}/por-empleado/${empleadoId}`);
  }

  porEmpleadoEnRango(empleadoId: number, fechaDesde: string, fechaHasta: string): Observable<RegistroHorasResponse[]> {
    const params = new HttpParams()
      .set('fechaDesde', fechaDesde)
      .set('fechaHasta', fechaHasta);
    return this.http.get<RegistroHorasResponse[]>(`${this.baseUrl}/por-empleado/${empleadoId}`, { params });
  }

  noLiquidadas(): Observable<NoLiquidadasPorEmpleado[]> {
    return this.http.get<NoLiquidadasPorEmpleado[]>(`${this.baseUrl}/no-liquidadas`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
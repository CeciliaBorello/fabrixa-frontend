import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NoLiquidadasPorEmpleado, RegistroHorasRequest, RegistroHorasResponse } from './registro-horas.model';

@Injectable({ providedIn: 'root' })
export class RegistroHorasService {
  private baseUrl = 'http://localhost:8080/api/registros-horas';

  constructor(private http: HttpClient) {}

  crear(request: RegistroHorasRequest): Observable<RegistroHorasResponse> {
    return this.http.post<RegistroHorasResponse>(this.baseUrl, request);
  }

  porEmpleado(empleadoId: number): Observable<RegistroHorasResponse[]> {
    return this.http.get<RegistroHorasResponse[]>(`${this.baseUrl}/por-empleado/${empleadoId}`);
  }

  noLiquidadas(): Observable<NoLiquidadasPorEmpleado[]> {
    return this.http.get<NoLiquidadasPorEmpleado[]>(`${this.baseUrl}/no-liquidadas`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

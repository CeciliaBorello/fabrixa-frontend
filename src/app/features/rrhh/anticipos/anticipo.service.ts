import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnticipoRequest, AnticipoResponse } from './anticipo.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnticipoService {
  private baseUrl = `${environment.apiUrl}/api/anticipos`;

  constructor(private http: HttpClient) {}

  crear(request: AnticipoRequest): Observable<AnticipoResponse> {
    return this.http.post<AnticipoResponse>(this.baseUrl, request);
  }

  porEmpleado(empleadoId: number): Observable<AnticipoResponse[]> {
    return this.http.get<AnticipoResponse[]>(`${this.baseUrl}/por-empleado/${empleadoId}`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
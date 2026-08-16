import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CiudadResponse, ProvinciaResponse } from './ubicacion.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private baseUrl = `${environment.apiUrl}/api/ubicaciones`;

  constructor(private http: HttpClient) {}

  listarProvincias(): Observable<ProvinciaResponse[]> {
    return this.http.get<ProvinciaResponse[]>(`${this.baseUrl}/provincias`);
  }

  listarCiudades(provinciaId: string): Observable<CiudadResponse[]> {
    return this.http.get<CiudadResponse[]>(`${this.baseUrl}/ciudades?provinciaId=${provinciaId}`);
  }
}
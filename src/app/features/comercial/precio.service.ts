import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrecioRequest, PrecioResponse } from './precio.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PrecioService {
  private baseUrl = `${environment.apiUrl}/api/productos`;

  constructor(private http: HttpClient) {}

  historial(productoId: number): Observable<PrecioResponse[]> {
    return this.http.get<PrecioResponse[]>(`${this.baseUrl}/${productoId}/precios`);
  }

  registrar(productoId: number, request: PrecioRequest): Observable<PrecioResponse> {
    return this.http.post<PrecioResponse>(`${this.baseUrl}/${productoId}/precios`, request);
  }
}
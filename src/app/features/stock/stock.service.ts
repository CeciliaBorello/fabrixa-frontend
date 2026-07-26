import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AjusteRequest, MovimientoResponse, StockActualResponse } from './stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private baseUrl = 'http://localhost:8080/api/stock';

  constructor(private http: HttpClient) {}

  listar(): Observable<StockActualResponse[]> {
    return this.http.get<StockActualResponse[]>(this.baseUrl);
  }

  historial(productoId: number): Observable<MovimientoResponse[]> {
    return this.http.get<MovimientoResponse[]>(`${this.baseUrl}/${productoId}/movimientos`);
  }

  ajustar(request: AjusteRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(`${this.baseUrl}/ajuste`, request);
  }
}
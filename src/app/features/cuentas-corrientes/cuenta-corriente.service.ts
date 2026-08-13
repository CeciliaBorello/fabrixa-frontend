import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AjusteCuentaCorrienteRequest, CuentaCorrienteFila, MovimientoCuentaCorriente } from './cuenta-corriente.model';
import { PageResponse } from '../../shared/page-response.model';

@Injectable({ providedIn: 'root' })
export class CuentaCorrienteService {
  private baseUrl = 'http://localhost:8080/api/cuentas-corrientes';

  constructor(private http: HttpClient) {}

  listarPaginado(page: number, size: number, busqueda: string): Observable<PageResponse<CuentaCorrienteFila>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), busqueda });
    return this.http.get<PageResponse<CuentaCorrienteFila>>(`${this.baseUrl}/pagina?${params}`);
  }

  saldo(clienteId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${clienteId}/saldo`);
  }

  movimientos(clienteId: number): Observable<MovimientoCuentaCorriente[]> {
    return this.http.get<MovimientoCuentaCorriente[]>(`${this.baseUrl}/${clienteId}/movimientos`);
  }

  crearAjuste(request: AjusteCuentaCorrienteRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/ajuste`, request);
  }

  saldosDe(ids: number[]): Observable<Record<number, number>> {
    const params = ids.map((id) => `ids=${id}`).join('&');
    return this.http.get<Record<number, number>>(`${this.baseUrl}/saldos?${params}`);
  }
}

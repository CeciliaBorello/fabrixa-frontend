import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LiquidacionMensualRequest, LiquidacionMensualResponse } from './liquidacion.model';
import { PageResponse } from '../../../shared/page-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LiquidacionMensualService {
  private baseUrl = `${environment.apiUrl}/api/liquidaciones`;

  constructor(private http: HttpClient) {}

  generar(request: LiquidacionMensualRequest): Observable<LiquidacionMensualResponse> {
    return this.http.post<LiquidacionMensualResponse>(this.baseUrl, request);
  }

  listarPaginado(page: number, size: number, busqueda: string): Observable<PageResponse<LiquidacionMensualResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), busqueda });
    return this.http.get<PageResponse<LiquidacionMensualResponse>>(`${this.baseUrl}/pagina?${params}`);
  }
}

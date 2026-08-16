import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChequeResponse, EstadoCheque } from './cheque.model';
import { PageResponse } from '../../../shared/page-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChequeService {
  private baseUrl = `${environment.apiUrl}/api/cheques`;

  constructor(private http: HttpClient) {}

  listarPaginado(page: number, size: number, estado: EstadoCheque, busqueda: string): Observable<PageResponse<ChequeResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), estado, busqueda });
    return this.http.get<PageResponse<ChequeResponse>>(`${this.baseUrl}/pagina?${params}`);
  }

  listarEnCarteraDeTercero(): Observable<PageResponse<ChequeResponse>> {
    // trae hasta 200 en cartera para elegir en el selector de pago (sin paginado real, alcanza para este caso)
    return this.listarPaginado(0, 200, 'EN_CARTERA', '');
  }

  cobrar(id: number): Observable<ChequeResponse> {
    return this.http.put<ChequeResponse>(`${this.baseUrl}/${id}/cobrar`, {});
  }

  rechazar(id: number): Observable<ChequeResponse> {
    return this.http.put<ChequeResponse>(`${this.baseUrl}/${id}/rechazar`, {});
  }
}

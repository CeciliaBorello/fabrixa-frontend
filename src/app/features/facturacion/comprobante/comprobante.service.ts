import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComprobanteRequest, ComprobanteResponse, DireccionComprobante, TipoComprobante } from './comprobante.model';
import { PageResponse } from '../../../shared/page-response.model';

@Injectable({ providedIn: 'root' })
export class ComprobanteService {
  private baseUrl = 'http://localhost:8080/api/comprobantes';

  constructor(private http: HttpClient) {}

  listarPaginado(page: number, size: number, tipos: TipoComprobante[] | null, soloAnulados: boolean, busqueda: string): Observable<PageResponse<ComprobanteResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), soloAnulados: String(soloAnulados), busqueda });
    if (tipos && tipos.length) {
      tipos.forEach((t) => params.append('tipos', t));
    }
    return this.http.get<PageResponse<ComprobanteResponse>>(`${this.baseUrl}/pagina?${params}`);
  }

  buscarPorId(id: number): Observable<ComprobanteResponse> {
    return this.http.get<ComprobanteResponse>(`${this.baseUrl}/${id}`);
  }

  pendientesPorCliente(clienteProveedorId: number, direccion: DireccionComprobante): Observable<ComprobanteResponse[]> {
    return this.http.get<ComprobanteResponse[]>(`${this.baseUrl}/pendientes?clienteProveedorId=${clienteProveedorId}&direccion=${direccion}`);
  }

  crear(request: ComprobanteRequest): Observable<ComprobanteResponse> {
    return this.http.post<ComprobanteResponse>(this.baseUrl, request);
  }

  anular(id: number): Observable<ComprobanteResponse> {
    return this.http.put<ComprobanteResponse>(`${this.baseUrl}/${id}/anular`, {});
  }

  asentar(id: number): Observable<ComprobanteResponse> {
    return this.http.put<ComprobanteResponse>(`${this.baseUrl}/${id}/asentar`, {});
  }
}

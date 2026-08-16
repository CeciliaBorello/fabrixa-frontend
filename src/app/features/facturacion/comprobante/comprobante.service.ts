import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComprobanteRequest, ComprobanteResponse, DireccionComprobante, EstadoComprobante, TipoComprobante } from './comprobante.model';
import { PageResponse } from '../../../shared/page-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComprobanteService {
 private baseUrl = `${environment.apiUrl}/api/comprobantes`;

  constructor(private http: HttpClient) {}

  listarPaginado(
    page: number, size: number, sortBy: string, sortDir: string,
    tipos: TipoComprobante[] | null, estado: EstadoComprobante | null, busqueda: string
  ): Observable<PageResponse<ComprobanteResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, sortDir, busqueda });
    if (tipos && tipos.length) tipos.forEach((t) => params.append('tipos', t));
    if (estado) params.append('estado', estado);
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

  generarArca(id: number): Observable<ComprobanteResponse> {
    return this.http.post<ComprobanteResponse>(`${this.baseUrl}/${id}/generar-arca`, {});
  }

  generarArcaRemito(id: number): Observable<ComprobanteResponse> {
    return this.http.post<ComprobanteResponse>(`${this.baseUrl}/${id}/generar-arca-remito`, {});
  }

  relacionados(id: number): Observable<ComprobanteResponse[]> {
    return this.http.get<ComprobanteResponse[]>(`${this.baseUrl}/${id}/relacionados`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormulaRequest, FormulaResponse } from './formula.model';

@Injectable({ providedIn: 'root' })
export class FormulaService {
  private baseUrl = 'http://localhost:8080/api/formulas';

  constructor(private http: HttpClient) {}

  listar(): Observable<FormulaResponse[]> {
    return this.http.get<FormulaResponse[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<FormulaResponse> {
    return this.http.get<FormulaResponse>(`${this.baseUrl}/${id}`);
  }

  crear(request: FormulaRequest): Observable<FormulaResponse> {
    return this.http.post<FormulaResponse>(this.baseUrl, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reactivar(id: number): Observable<void> {
  return this.http.put<void>(`${this.baseUrl}/${id}/reactivar`, {});
}
}
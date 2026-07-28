import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class PaginadorEsIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Filas por página:';
  override nextPageLabel = 'Página siguiente';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const inicio = page * pageSize;
    const fin = inicio < length ? Math.min(inicio + pageSize, length) : inicio + pageSize;

    return `${inicio + 1} – ${fin} de ${length}`;
  };
}
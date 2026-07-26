export type TipoMovimientoStock =
  | 'INGRESO_FACTURADO' | 'INGRESO_CARTA_PORTE' | 'INGRESO_SIN_FACTURA'
  | 'INGRESO_PRODUCCION' | 'EGRESO_VENTA' | 'EGRESO_FABRICACION_INSUMO' | 'AJUSTE';

export interface StockActualResponse {
  productoId: number;
  productoNombre: string;
  cantidad: number;
}

export interface MovimientoResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  fecha: string;
  referenciaTipo: string | null;
  referenciaId: number | null;
  motivo: string | null;
}

export interface AjusteRequest {
  productoId: number;
  delta: number;
  motivo: string;
}

// Vista combinada: producto + su stock (o 0 si nunca tuvo movimientos)
export interface StockFila {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  unidadMedida: string | null;
}
export interface StockFilaResponse {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  unidadMedida: string | null;
  tienePresentaciones: boolean;
}

export interface AjusteRequest {
  productoId: number;
  delta: number;
  motivo: string;
}

export type TipoMovimientoStock =
  | 'INGRESO_FACTURADO' | 'INGRESO_CARTA_PORTE' | 'INGRESO_SIN_FACTURA'
  | 'INGRESO_PRODUCCION' | 'EGRESO_VENTA' | 'EGRESO_FABRICACION_INSUMO' | 'AJUSTE';

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
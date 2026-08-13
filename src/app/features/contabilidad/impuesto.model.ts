export type EstadoImpuesto = 'PENDIENTE' | 'PAGADO' | 'VENCIDO';

export interface ImpuestoRequest {
  nombre: string;
  periodo: string;
  monto: number;
  fechaVencimiento: string;
}

export interface ImpuestoResponse {
  id: number;
  nombre: string;
  periodo: string;
  monto: number;
  fechaVencimiento: string;
  fechaPago: string | null;
  estado: EstadoImpuesto;
}

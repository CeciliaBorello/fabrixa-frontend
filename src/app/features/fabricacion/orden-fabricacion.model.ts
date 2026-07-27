export type EstadoOrdenFabricacion = 'PLANIFICADA' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA';

export interface OrdenFabricacionResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  formulaId: number;
  cantidadPlanificada: number;
  cantidadProducida: number | null;
  estado: EstadoOrdenFabricacion;
  fechaInicio: string | null;
  fechaFin: string | null;
  usuarioNombre: string;
}

export interface OrdenFabricacionRequest {
  productoId: number;
  formulaId: number;
  cantidadPlanificada: number;
}

export interface FinalizarRequest {
  cantidadProducida: number;
  numeroLote: string;
  fechaVencimiento?: string;
}
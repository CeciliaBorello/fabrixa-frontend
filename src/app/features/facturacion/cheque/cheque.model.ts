export type EstadoCheque = 'EN_CARTERA' | 'ENTREGADO' | 'COBRADO' | 'RECHAZADO';

export interface ChequeResponse {
  id: number;
  numero: string;
  banco: string;
  terceroId: number;
  terceroNombre: string;
  monto: number;
  fechaEmision: string;
  fechaCobro: string;
  estado: EstadoCheque;
  reciboIngresoId: number | null;
  reciboEgresoId: number | null;
}

export type OrigenRegistroHoras = 'MANUAL' | 'DISPOSITIVO';

export interface RegistroHorasRequest {
  empleadoId: number;
  fecha: string;
  horas: number;
}

export interface RegistroHorasResponse {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  fecha: string;
  horas: number;
  origen: OrigenRegistroHoras;
  liquidado: boolean;
}

export interface NoLiquidadasPorEmpleado {
  empleadoId: number;
  empleadoNombre: string;
  totalHoras: number;
  cantidadDias: number;
}

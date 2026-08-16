export interface AnticipoRequest {
  empleadoId: number;
  monto: number;
  fecha: string; // yyyy-MM-dd
  motivo?: string;
}

export interface AnticipoResponse {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  monto: number;
  fecha: string;
  motivo?: string;
  liquidado: boolean;
  liquidacionId?: number;
  usuarioNombre: string;
}
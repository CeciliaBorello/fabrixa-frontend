import { TipoRemuneracion } from '../empleado.model';

export interface LiquidacionMensualRequest {
  empleadoId: number;
  periodo: string;
  totalAPagar: number | null; // solo se usa/requiere si el empleado es SUELDO_FIJO
}

export interface LiquidacionMensualResponse {
  id: number;
  empleadoId: number;
  empleadoNombre: string;
  periodo: string;
  tipoRemuneracionUsado: TipoRemuneracion;
  totalHoras: number | null;      // null si tipoRemuneracionUsado es SUELDO_FIJO
  valorHoraUsado: number | null;  // null si tipoRemuneracionUsado es SUELDO_FIJO
  totalAPagar: number;
  fechaGeneracion: string;
  usuarioNombre: string;
}
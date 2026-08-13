export interface CuentaCorrienteFila {
  clienteProveedorId: number;
  razonSocial: string;
  tipo: string;
  saldo: number;
}

export interface MovimientoCuentaCorriente {
  fecha: string;
  concepto: string;
  origen: 'COMPROBANTE' | 'AJUSTE';
  comprobanteId: number | null;
  debe: number;
  haber: number;
  saldoAcumulado: number;
  motivo: string | null;
}

export interface AjusteCuentaCorrienteRequest {
  clienteProveedorId: number;
  monto: number;
  motivo: string;
}

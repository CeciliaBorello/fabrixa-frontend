export type TipoCuentaContable = 'ACTIVO' | 'PASIVO' | 'PATRIMONIO_NETO' | 'INGRESO' | 'EGRESO';

export interface CuentaContableRequest {
  codigo: string;
  nombre: string;
  tipo: TipoCuentaContable;
  cuentaPadreId?: number | null;
}

export interface CuentaContableResponse {
  id: number;
  codigo: string;
  nombre: string;
  tipo: TipoCuentaContable;
  cuentaPadreId: number | null;
  cuentaPadreNombre: string | null;
  activo: boolean;
}

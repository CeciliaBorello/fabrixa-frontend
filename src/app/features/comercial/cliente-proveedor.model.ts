export type TipoClienteProveedor = 'CLIENTE' | 'PROVEEDOR' | 'AMBOS';
export type CondicionIva = 'RESPONSABLE_INSCRIPTO' | 'MONOTRIBUTISTA' | 'EXENTO' | 'CONSUMIDOR_FINAL';

export interface ClienteProveedorResponse {
  id: number;
  tipo: TipoClienteProveedor;
  razonSocial: string;
  cuit: string;
  condicionIva: CondicionIva | null;
  direccion: string | null;
  provinciaId: string | null;
  provinciaNombre: string | null;
  ciudadId: string | null;
  ciudadNombre: string | null;
  telefono: string | null;
  email: string | null;
  listaPrecioId: number | null;
  saldoCuentaCorriente: number;
  activo: boolean;
}

export interface ClienteProveedorRequest {
  tipo: TipoClienteProveedor;
  razonSocial: string;
  cuit: string;
  condicionIva?: CondicionIva;
  direccion?: string;
  provinciaId?: string;
  ciudadId?: string;
  telefono?: string;
  email?: string;
  listaPrecioId?: number | null;
}
export type TipoClienteProveedor = 'CLIENTE' | 'PROVEEDOR' | 'AMBOS';

export interface ClienteProveedorResponse {
  id: number;
  tipo: TipoClienteProveedor;
  razonSocial: string;
  cuit: string;
  condicionIva: string | null;
  direccion: string | null;
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
  condicionIva?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  listaPrecioId?: number | null;
}
export interface PrecioResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  precio: number;
  fecha: string;
  usuarioNombre: string;
  motivo: string | null;
}

export interface PrecioRequest {
  precio: number;
  motivo: string;
}
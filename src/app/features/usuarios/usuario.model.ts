export interface Rol {
  id: number;
  nombre: string;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

export interface UsuarioRequest {
  nombre: string;
  email: string;
  password: string | null;
  rolId: number | null;
}
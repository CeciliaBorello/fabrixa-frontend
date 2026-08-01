export interface ProvinciaResponse {
  id: string;
  nombre: string;
}

export interface CiudadResponse {
  id: string;
  nombre: string;
  provinciaId: string;
}
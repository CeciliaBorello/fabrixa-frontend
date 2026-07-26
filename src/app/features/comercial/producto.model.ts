export interface ProductoResponse {
  id: number;
  nombre: string;
  codigoBarra: string | null;
  rnpa: string | null;
  valorNutricional: string | null;
  unidadMedida: string | null;
  categoria: string | null;
  activo: boolean;
}

export interface ProductoRequest {
  nombre: string;
  codigoBarra?: string;
  rnpa?: string;
  valorNutricional?: string;
  unidadMedida?: string;
  categoria?: string;
}
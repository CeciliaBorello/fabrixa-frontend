export type TipoProducto = 'INSUMO' | 'TERMINADO' | 'AMBOS';
export type UnidadMedida = 'KG' | 'G' | 'L' | 'ML' | 'UNIDAD';

export interface ProductoResponse {
  id: number;
  nombre: string;
  tipo: TipoProducto;
  codigoBarra: string | null;
  rnpa: string | null;
  valorNutricional: string | null;
  unidadMedida: UnidadMedida;
  categoria: string | null;
  activo: boolean;
}

export interface ProductoRequest {
  nombre: string;
  tipo: TipoProducto;
  codigoBarra?: string;
  rnpa?: string;
  valorNutricional?: string;
  unidadMedida: UnidadMedida;
  categoria?: string;
}
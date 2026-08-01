export type TipoProducto = 'INSUMO' | 'TERMINADO' | 'AMBOS';
export type UnidadMedida = 'KG' | 'G' | 'L' | 'ML' | 'UNIDAD';
export type CategoriaProducto =
  | 'MATERIA_PRIMA' | 'ENVASES_Y_EMPAQUES' | 'ADITIVOS_Y_CONSERVANTES'
  | 'LIMPIEZA_E_HIGIENE' | 'REPUESTOS_Y_MANTENIMIENTO' | 'PRODUCTO_PARA_VENTA' | 'OTROS';

export interface ProductoResponse {
  id: number;
  nombre: string;
  tipo: TipoProducto;
  codigoBarra: string | null;
  rnpa: string | null;
  valorNutricional: string | null;
  unidadMedida: UnidadMedida;
  categoria: CategoriaProducto | null;
  precioActual: number | null;
  activo: boolean;
  productoBaseId: number | null;
  productoBaseNombre: string | null;
  presentacion: string | null;
}

export interface ProductoRequest {
  nombre: string;
  tipo: TipoProducto;
  codigoBarra?: string;
  rnpa?: string;
  valorNutricional?: string;
  unidadMedida: UnidadMedida;
  categoria?: CategoriaProducto;
  productoBaseId?: number;
  presentacion?: string;
}
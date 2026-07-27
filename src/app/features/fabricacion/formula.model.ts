import { UnidadMedida } from '../comercial/producto.model';

export interface InsumoRequest {
  insumoProductoId: number;
  cantidadNecesaria: number;
  unidadMedida: UnidadMedida;
}

export interface Request {
  productoTerminadoId: number;
  nombre: string;
  insumos: InsumoRequest[];
}

export interface InsumoResponse {
  id: number;
  insumoProductoId: number;
  insumoNombre: string;
  cantidadNecesaria: number;
  unidadMedida: UnidadMedida;
}

export interface FormulaResponse {
  id: number;
  productoTerminadoId: number;
  productoTerminadoNombre: string;
  nombre: string;
  version: number;
  activo: boolean;
  insumos: InsumoResponse[];
}

export interface FormulaRequest {
  productoTerminadoId: number;
  nombre: string;
  insumos: InsumoRequest[];
}
export type TipoComprobante =
  | 'FACTURA_A' | 'FACTURA_B_REMITO' | 'FACTURA_C_REMITO' | 'NOTA_CREDITO' | 'NOTA_DEBITO'
  | 'FACTURA_COMPRA' | 'RECIBO_COBRO' | 'RECIBO_PAGO' | 'PAGO_CONTADO';

export type DireccionComprobante = 'VENTA' | 'COMPRA';
export type OrigenComprobante = 'GENERADO' | 'RECIBIDO';
export type EstadoComprobante = 'BORRADOR' | 'EMITIDO' | 'ANULADO' | 'ASENTADA';
export type EstadoCobro = 'PENDIENTE' | 'PARCIAL' | 'COBRADO';
export type EstadoPago = 'RECIBIDO' | 'PARCIAL' | 'PAGADO';
export type TipoFormaPago = 'EFECTIVO' | 'CHEQUE' | 'TRANSFERENCIA';

export interface ItemComprobanteRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  porcentajeIva: number;
}

export interface ItemComprobanteResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  porcentajeIva: number;
  subtotal: number;
  ivaItem: number;
  totalItem: number;
}

export interface RemitoViajeRequest {
  transportista: string;
  chofer: string;
  patente: string;
}

export interface RemitoViajeResponse {
  id: number;
  numero: string;
  transportista: string;
  chofer: string;
  patente: string;
  fecha: string;
  estadoArca: 'NO_GENERADO' | 'PENDIENTE' | 'ENVIADO' | 'ERROR';
  codigoAutorizacion: string | null;
}

export interface FormaPagoRequest {
  tipo: TipoFormaPago;
  monto: number;
  chequeId?: number;
  chequeNumero?: string;
  chequeBanco?: string;
  chequeFechaCobro?: string;
}

export interface FormaPagoResponse {
  id: number;
  tipo: TipoFormaPago;
  monto: number;
  chequeId: number | null;
  chequeNumero: string | null;
}

export interface ComprobanteRequest {
  tipo: TipoComprobante;
  origen?: OrigenComprobante;
  clienteProveedorId: number;
  fechaVencimiento?: string;
  items?: ItemComprobanteRequest[];
  formasPago?: FormaPagoRequest[];
  comprobanteAfectadoId?: number;
  llevaRemito?: boolean;
  remitoViaje?: RemitoViajeRequest;
}

export interface ComprobanteResponse {
  id: number;
  tipo: TipoComprobante;
  direccion: DireccionComprobante;
  origen: OrigenComprobante;
  numero: string | null;
  puntoVenta: string | null;
  clienteProveedorId: number;
  clienteProveedorNombre: string;
  fechaEmision: string;
  fechaVencimiento: string | null;
  estado: EstadoComprobante;
  estadoCobro: EstadoCobro | null;
  estadoPago: EstadoPago | null;
  subtotal: number;
  ivaTotal: number;
  total: number;
  usuarioNombre: string;
  comprobanteAfectadoId: number | null;
  fechaModificacion: string;
  items: ItemComprobanteResponse[];
  remitoViaje: RemitoViajeResponse | null;
  formasPago: FormaPagoResponse[];
  cae: string | null;
  caeVencimiento: string | null;
  estadoArca: 'NO_GENERADO' | 'PENDIENTE' | 'ENVIADO' | 'ERROR';
  montoPendiente: number | null;
}
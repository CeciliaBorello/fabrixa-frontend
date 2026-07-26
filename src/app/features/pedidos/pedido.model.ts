export type EstadoPedido = 'NUEVO' | 'PENDIENTE_ENTREGA' | 'ENTREGADO' | 'CANCELADO';

export interface ItemPedidoResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
}

export interface PedidoResponse {
  id: number;
  clienteId: number;
  clienteNombre: string;
  usuarioNombre: string;
  estado: EstadoPedido;
  fechaPedido: string;
  fechaEntrega: string | null;
  items: ItemPedidoResponse[];
}

export interface ItemPedidoRequest {
  productoId: number;
  cantidad: number;
}

export interface PedidoRequest {
  clienteId: number;
  items: ItemPedidoRequest[];
}
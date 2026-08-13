import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface ModuloCard {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  disponible: boolean;
  rolesPermitidos?: string[]; // si no se define, lo ve cualquier rol logueado
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  todosLosModulos: ModuloCard[] = [
    { titulo: 'Usuarios', descripcion: 'Gestioná usuarios, roles y permisos del sistema', icono: '👥', ruta: '/usuarios', disponible: true, rolesPermitidos: ['ADMINISTRADOR'] },
    { titulo: 'Clientes y proveedores', descripcion: 'Cartera comercial y cuentas corrientes', icono: '🤝', ruta: '/clientes', disponible: true },
    { titulo: 'Productos', descripcion: 'Catálogo de productos terminados e insumos', icono: '📦', ruta: '/productos', disponible: true },
    { titulo: 'Pedidos', descripcion: 'Seguimiento de pedidos, de nuevo a entregado', icono: '🧾', ruta: '/pedidos', disponible: true },
    { titulo: 'Stock', descripcion: 'Cantidad disponible y movimientos por producto', icono: '📊', ruta: '/stock', disponible: true },
    { titulo: 'Fórmulas de producción', descripcion: 'Recetas de fabricación por producto', icono: '🧪', ruta: '/fabricacion/formulas', disponible: true },
    { titulo: 'Órdenes de fabricación', descripcion: 'Planificación y seguimiento de producción', icono: '🏭', ruta: '/fabricacion/ordenes', disponible: true },
    { titulo: 'Facturación', descripcion: 'Comprobantes, remitos y cobros', icono: '💵', ruta: '/facturacion', disponible: true },
    { titulo: 'Cheques', descripcion: 'Cartera de cheques recibidos y entregados', icono: '📄', ruta: '/cheques', disponible: true },
    //{ titulo: 'Plan de Cuentas', descripcion: 'Catálogo de cuentas contables', icono: '📖', ruta: '/cuentas-contables', disponible: true },
    { titulo: 'Impuestos', descripcion: 'IVA, Aportes, Autónomos y otras obligaciones', icono: '🏛️', ruta: '/impuestos', disponible: true },
    { titulo: 'Empleados', descripcion: 'Legajo y datos de contacto', icono: '👷', ruta: '/empleados', disponible: true },
    { titulo: 'Registro de Horas', descripcion: 'Carga diaria de horas trabajadas', icono: '⏱️', ruta: '/horas', disponible: true },
    { titulo: 'Horas no liquidadas', descripcion: 'Total pendiente por empleado', icono: '📋', ruta: '/horas/no-liquidadas', disponible: true },
    { titulo: 'Liquidaciones', descripcion: 'Liquidaciones mensuales generadas', icono: '💰', ruta: '/liquidaciones', disponible: true }
  ];

  constructor(public auth: AuthService) {}

  get modulos(): ModuloCard[] {
    const rolActual = this.auth.currentUser()?.rol;
    return this.todosLosModulos.filter(
      (m) => !m.rolesPermitidos || (rolActual && m.rolesPermitidos.includes(rolActual))
    );
  }
}
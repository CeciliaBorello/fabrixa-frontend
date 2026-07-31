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
    { titulo: 'Facturación', descripcion: 'Comprobantes, remitos y cobros', icono: '💵', ruta: '/facturacion', disponible: false }
  ];

  constructor(public auth: AuthService) {}

  get modulos(): ModuloCard[] {
    const rolActual = this.auth.currentUser()?.rol;
    return this.todosLosModulos.filter(
      (m) => !m.rolesPermitidos || (rolActual && m.rolesPermitidos.includes(rolActual))
    );
  }
}
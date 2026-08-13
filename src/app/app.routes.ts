import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/auth/auth.guard';
import { UsuariosListComponent } from './features/usuarios/usuarios-list/usuarios-list.component';
import { UsuarioFormComponent } from './features/usuarios/usuario-form/usuario-form.component';
import { ClientesListComponent } from './features/comercial/clientes-list/clientes-list.component';
import { ClienteFormComponent } from './features/comercial/cliente-form/cliente-form.component';
import { ProductosListComponent } from './features/comercial/productos-list/productos-list.component';
import { ProductoFormComponent } from './features/comercial/producto-form/producto-form.component';
import { PedidosListComponent } from './features/pedidos/pedidos-list/pedidos-list.component';
import { PedidoFormComponent } from './features/pedidos/pedido-form/pedido-form.component';
import { StockListComponent } from './features/stock/stock-list/stock-list.component';
import { StockHistorialComponent } from './features/stock/stock-historial/stock-historial.component';
import { FormulasListComponent } from './features/fabricacion/formulas-list/formulas-list.component';
import { FormulaFormComponent } from './features/fabricacion/formula-form/formula-form.component';
import { OrdenesListComponent } from './features/fabricacion/ordenes-list/ordenes-list.component';
import { OrdenFormComponent } from './features/fabricacion/orden-form/orden-form.component';
import { PrecioHistorialComponent } from './features/comercial/precio-historial/precio-historial.component';
import { CostoHistorialComponent } from './features/fabricacion/costo-historial/costo-historial.component';
import { ComprobantesListComponent } from './features/facturacion/comprobante/comprobantes-list/comprobantes-list.component';
import { ComprobanteFormComponent } from './features/facturacion/comprobante/comprobante-form/comprobante-form.component';
import { ComprobanteDetalleComponent } from './features/facturacion/comprobante/comprobante-detalle/comprobante-detalle.component';
import { ChequesListComponent } from './features/facturacion/cheque/cheques-list/cheques-list.component';
import { CuentaCorrienteDetalleComponent } from './features/cuentas-corrientes/cuenta-corriente-detalle/cuenta-corriente-detalle.component';
import { CuentasContablesListComponent } from './features/contabilidad/cuentas-contables-list/cuentas-contables-list.component';
import { ImpuestosListComponent } from './features/contabilidad/impuestos-list/impuestos-list.component';
import { EmpleadosListComponent } from './features/rrhh/empleados-list/empleados-list.component';
import { EmpleadoFormComponent } from './features/rrhh/empleado-form/empleado-form.component';
import { RegistroHorasComponent } from './features/rrhh/horas/registro-horas/registro-horas.component';
import { HorasNoLiquidadasComponent } from './features/rrhh/horas/horas-no-liquidadas/horas-no-liquidadas.component';
import { LiquidacionesListComponent } from './features/rrhh/liquidaciones/liquidaciones-list/liquidaciones-list.component';




export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    children: [
      { path: '', component: UsuariosListComponent },
      { path: 'nuevo', component: UsuarioFormComponent },
      { path: ':id/editar', component: UsuarioFormComponent }
    ]
  },
  {
    path: 'clientes',
    canActivate: [authGuard],
    children: [
      { path: '', component: ClientesListComponent },
      { path: 'nuevo', component: ClienteFormComponent },
      { path: ':id/editar', component: ClienteFormComponent }
    ]
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    children: [
      { path: '', component: ProductosListComponent },
      { path: 'nuevo', component: ProductoFormComponent },
      { path: ':id/editar', component: ProductoFormComponent },
      { path: ':id/precios', component: PrecioHistorialComponent }
    ]
  },
  {
  path: 'pedidos',
  canActivate: [authGuard],
  children: [
    { path: '', component: PedidosListComponent },
    { path: 'nuevo', component: PedidoFormComponent }
  ]
  },
  {
    path: 'stock',
    canActivate: [authGuard],
    children: [
      { path: '', component: StockListComponent },
      { path: ':id/historial', component: StockHistorialComponent }
    ]
  },
  {
    path: 'fabricacion',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'ordenes', pathMatch: 'full' },
      { path: 'ordenes', component: OrdenesListComponent },
      { path: 'ordenes/nueva', component: OrdenFormComponent },
      { path: 'formulas', component: FormulasListComponent },
      { path: 'formulas/nueva', component: FormulaFormComponent },
      { path: 'costos/:id', component: CostoHistorialComponent }
    ]
  },

  {
    path: 'facturacion',
    canActivate: [authGuard],
    children: [
      { path: '', component: ComprobantesListComponent },
      { path: 'nuevo', component: ComprobanteFormComponent },
      { path: ':id', component: ComprobanteDetalleComponent }
    ]
  },
  {
    path: 'cheques',
    canActivate: [authGuard],
    children: [
      { path: '', component: ChequesListComponent }
    ]
  },
  
  {
    path: 'cuentas-corrientes',
    canActivate: [authGuard],
    children: [
      { path: ':id', component: CuentaCorrienteDetalleComponent }
    ]
  },

  {
    path: 'cuentas-contables',
    canActivate: [authGuard],
    children: [{ path: '', component: CuentasContablesListComponent }]
  },
  {
    path: 'impuestos',
    canActivate: [authGuard],
    children: [{ path: '', component: ImpuestosListComponent }]
  },

  {
    path: 'empleados',
    canActivate: [authGuard],
    children: [
      { path: '', component: EmpleadosListComponent },
      { path: 'nuevo', component: EmpleadoFormComponent },
      { path: ':id/editar', component: EmpleadoFormComponent }
    ]
  },
  {
    path: 'horas',
    canActivate: [authGuard],
    children: [
      { path: '', component: RegistroHorasComponent },
      { path: 'no-liquidadas', component: HorasNoLiquidadasComponent }
    ]
  },
  {
    path: 'liquidaciones',
    canActivate: [authGuard],
    children: [{ path: '', component: LiquidacionesListComponent }]
  },

  { path: '**', redirectTo: '' }
];
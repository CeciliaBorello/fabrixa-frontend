import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/auth/auth.guard';
import { UsuariosListComponent } from './features/usuarios/usuarios-list/usuarios-list.component';
import { UsuarioFormComponent } from './features/usuarios/usuario-form/usuario-form.component';
import { ClientesListComponent } from './features/comercial/clientes-list.component/clientes-list.component';
import { ClienteFormComponent } from './features/comercial/cliente-form.component/cliente-form.component';
import { ProductosListComponent } from './features/comercial/productos-list.component/productos-list.component';
import { ProductoFormComponent } from './features/comercial/producto-form.component/producto-form.component';
import { PedidosListComponent } from './features/pedidos/pedidos-list.component/pedidos-list.component';
import { PedidoFormComponent } from './features/pedidos/pedido-form.component/pedido-form.component';
import { StockListComponent } from './features/stock/stock-list/stock-list.component';
import { StockHistorialComponent } from './features/stock/stock-historial/stock-historial.component';


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
      { path: ':id/editar', component: ProductoFormComponent }
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
  { path: '**', redirectTo: '' }
];
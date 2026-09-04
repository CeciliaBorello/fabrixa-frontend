import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UsuarioService } from '../usuario.service';
import { UsuarioResponse } from '../usuario.model';
import { AuthService } from '../../../core/auth/auth.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { debounceTime, filter as rxFilter } from 'rxjs';import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ErrorBannerComponent } from '../../../shared/error-banner/error-banner.component';



@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSlideToggleModule, BackButtonComponent, MatDialogModule, ErrorBannerComponent
  ],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss'
})
export class UsuariosListComponent implements OnInit {
  items = signal<UsuarioResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortBy = signal('fechaModificacion');
  sortDir = signal<'asc' | 'desc'>('desc');
  mostrarInactivos = signal(false);
  busqueda = signal('');
  cargando = signal(true);
  error = signal('');
  sinPermiso = signal(false);

  busquedaControl = new FormControl('');

  columnas = ['avatar', 'nombre', 'email', 'rol', 'estado', 'acciones'];

constructor(
  private usuarioService: UsuarioService,
  public auth: AuthService,
  private dialog: MatDialog
) {
  this.busquedaControl.valueChanges
    .pipe(
      debounceTime(2000),
      rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3)
    )
    .subscribe((valor) => {
      this.busqueda.set(valor || '');
      this.pageIndex.set(0);
      this.cargar();
    });
}

  ngOnInit() {
    if (this.auth.currentUser()?.rol !== 'ADMINISTRADOR') {
      this.sinPermiso.set(true);
      this.cargando.set(false);
      return;
    }
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.usuarioService
      .listarPaginado(
        this.pageIndex(), this.pageSize(), this.sortBy(), this.sortDir(),
        !this.mostrarInactivos(), this.busqueda()
      )
      .subscribe({
        next: (pagina) => {
          this.items.set(pagina.content);
          this.totalItems.set(pagina.totalElements);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los usuarios');
          this.cargando.set(false);
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  onSortChange(sort: Sort) {
    if (!sort.direction) {
      // el usuario llegó al tercer click ("sin orden") -> volvemos al default
      this.sortBy.set('fechaModificacion');
      this.sortDir.set('desc');
    } else {
      this.sortBy.set(sort.active);
      this.sortDir.set(sort.direction as 'asc' | 'desc');
    }
    this.pageIndex.set(0);
    this.cargar();
  }

  toggleMostrarInactivos() {
    this.mostrarInactivos.update((v) => !v);
    this.pageIndex.set(0);
    this.cargar();
  }

  toggleEstado(usuario: UsuarioResponse) {
  const ref = this.dialog.open(ConfirmDialogComponent, {
    data: usuario.activo
      ? {
          titulo: 'Desactivar usuario',
          mensaje: `¿Seguro que querés desactivar a ${usuario.nombre}? No va a poder iniciar sesión hasta que lo reactives.`,
          textoConfirmar: 'Desactivar',
          peligroso: true
        }
      : {
          titulo: 'Reactivar usuario',
          mensaje: `¿Reactivar a ${usuario.nombre}?`,
          textoConfirmar: 'Reactivar',
          peligroso: false
        }
  });

  ref.afterClosed().subscribe((confirmado) => {
    if (confirmado) this.ejecutarToggle(usuario);
  });
}

private ejecutarToggle(usuario: UsuarioResponse) {
  const accion = usuario.activo
    ? this.usuarioService.desactivar(usuario.id)
    : this.usuarioService.reactivar(usuario.id);

  accion.subscribe({
    next: () => this.cargar(),
    error: () => this.error.set('No se pudo cambiar el estado del usuario')
  });
}

  iniciales(nombre: string): string {
    return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuarioService } from '../usuario.service';
import { UsuarioResponse } from '../usuario.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';


@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, BackButtonComponent
  ],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss'
})
export class UsuariosListComponent implements OnInit {
  items = signal<UsuarioResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  cargando = signal(true);
  error = signal('');

  columnas = ['avatar', 'nombre', 'email', 'rol', 'estado', 'acciones'];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.listarPaginado(this.pageIndex(), this.pageSize()).subscribe({
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

  toggleEstado(usuario: UsuarioResponse) {
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
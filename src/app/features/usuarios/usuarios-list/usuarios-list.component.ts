import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
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
  dataSource = new MatTableDataSource<UsuarioResponse>([]);
  cargando = signal(true);
  error = signal('');

  columnas = ['avatar', 'nombre', 'email', 'rol', 'estado', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cargando.set(false);
        // el <mat-paginator> recién se renderiza cuando cargando pasa a false,
        // así que esperamos un ciclo antes de conectarlo
        setTimeout(() => (this.dataSource.paginator = this.paginator));
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios');
        this.cargando.set(false);
      }
    });
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
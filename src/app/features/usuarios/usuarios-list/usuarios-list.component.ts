import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuarioService } from '../usuario.service';
import { UsuarioResponse } from '../usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss'
})
export class UsuariosListComponent implements OnInit {
  usuarios = signal<UsuarioResponse[]>([]);
  cargando = signal(true);
  error = signal('');

  sinResultados = computed(() => !this.cargando() && this.usuarios().length === 0);

  columnas = ['avatar', 'nombre', 'email', 'rol', 'estado', 'acciones'];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
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
    return nombre
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
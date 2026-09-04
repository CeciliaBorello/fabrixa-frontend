import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RegistroHorasService } from '../registro-horas.service';
import { NoLiquidadasPorEmpleado } from '../registro-horas.model';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';
import { ErrorBannerComponent } from '../../../../shared/error-banner/error-banner.component';

@Component({
  selector: 'app-horas-no-liquidadas',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatProgressSpinnerModule, BackButtonComponent, ErrorBannerComponent],
  templateUrl: './horas-no-liquidadas.component.html',
  styleUrl: './horas-no-liquidadas.component.scss'
})
export class HorasNoLiquidadasComponent implements OnInit {
  items = signal<NoLiquidadasPorEmpleado[]>([]);
  cargando = signal(true);
  error = signal('');

  columnas = ['empleado', 'cantidadDias', 'totalHoras'];

  constructor(private service: RegistroHorasService) {}

  ngOnInit() {
    this.service.noLiquidadas().subscribe({
      next: (data) => {
        this.items.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las horas pendientes');
        this.cargando.set(false);
      }
    });
  }
}

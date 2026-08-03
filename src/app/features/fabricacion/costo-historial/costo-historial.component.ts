import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrdenFabricacionService } from '../orden-fabricacion.service';
import { OrdenFabricacionResponse } from '../orden-fabricacion.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-costo-historial',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatProgressSpinnerModule, BackButtonComponent],
  templateUrl: './costo-historial.component.html',
  styleUrl: './costo-historial.component.scss'
})
export class CostoHistorialComponent implements OnInit {
  ordenes = signal<OrdenFabricacionResponse[]>([]);
  cargando = signal(true);
  error = signal('');
  nombreProducto = signal('');

  columnas = ['fecha', 'orden', 'cantidad', 'costoTotal', 'costoUnitario'];

  // la orden más reciente queda primera (el backend ya las devuelve ordenadas por fechaFin desc)
  costoMasReciente = computed(() => this.ordenes()[0]?.costoUnitarioProducido ?? null);

  constructor(private ordenService: OrdenFabricacionService, private route: ActivatedRoute) {}

  ngOnInit() {
    const productoId = Number(this.route.snapshot.paramMap.get('id'));

    if (!productoId) {
      this.error.set('No se especificó un producto válido');
      this.cargando.set(false);
      return;
    }

    this.ordenService.historialPorProducto(productoId).subscribe({
      next: (data) => {
        this.ordenes.set(data);
        if (data.length) this.nombreProducto.set(data[0].productoNombre);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial de costos');
        this.cargando.set(false);
      }
    });
  }
}
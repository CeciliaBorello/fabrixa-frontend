import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StockService } from '../stock.service';
import { MovimientoResponse } from '../stock.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-stock-historial',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule, MatProgressSpinnerModule, BackButtonComponent],
  templateUrl: './stock-historial.component.html',
  styleUrl: './stock-historial.component.scss'
})
export class StockHistorialComponent implements OnInit {
  movimientos = signal<MovimientoResponse[]>([]);
  cargando = signal(true);
  nombreProducto = signal('');

  columnas = ['fecha', 'tipo', 'cantidad', 'referencia', 'motivo'];

  constructor(private stockService: StockService, private route: ActivatedRoute) {}

  ngOnInit() {
    const productoId = Number(this.route.snapshot.paramMap.get('id'));
    this.stockService.historial(productoId).subscribe({
      next: (data) => {
        this.movimientos.set(data);
        if (data.length) this.nombreProducto.set(data[0].productoNombre);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  etiquetaTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      INGRESO_FACTURADO: 'Ingreso facturado',
      INGRESO_CARTA_PORTE: 'Ingreso (carta de porte)',
      INGRESO_SIN_FACTURA: 'Ingreso sin factura',
      INGRESO_PRODUCCION: 'Ingreso por producción',
      EGRESO_VENTA: 'Egreso por venta',
      EGRESO_FABRICACION_INSUMO: 'Egreso (insumo fabricación)',
      AJUSTE: 'Ajuste manual'
    };
    return mapa[tipo] ?? tipo;
  }

  esIngreso(tipo: string): boolean {
    return tipo.startsWith('INGRESO');
  }
}
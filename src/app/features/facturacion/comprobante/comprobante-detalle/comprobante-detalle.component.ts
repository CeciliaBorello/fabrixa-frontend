import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ComprobanteService } from '../comprobante.service';
import { ComprobanteResponse } from '../comprobante.model';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-comprobante-detalle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule, BackButtonComponent],
  templateUrl: './comprobante-detalle.component.html',
  styleUrl: './comprobante-detalle.component.scss'
})
export class ComprobanteDetalleComponent implements OnInit {
  comprobante = signal<ComprobanteResponse | null>(null);
  cargando = signal(true);
  error = signal('');

  constructor(private service: ComprobanteService, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.buscarPorId(id).subscribe({
      next: (data) => {
        this.comprobante.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el comprobante');
        this.cargando.set(false);
      }
    });
  }

  etiquetaTipoFormaPago(tipo: string): string {
    const mapa: Record<string, string> = { EFECTIVO: 'Efectivo', CHEQUE: 'Cheque', TRANSFERENCIA: 'Transferencia' };
    return mapa[tipo] ?? tipo;
  }
}

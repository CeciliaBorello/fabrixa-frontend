import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ComprobanteService } from '../comprobante.service';
import { ComprobanteResponse } from '../comprobante.model';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-comprobante-detalle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule, BackButtonComponent, MatButtonModule],
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

  generarArca() {
    const c = this.comprobante();
    if (!c) return;
    this.service.generarArca(c.id).subscribe({
      next: (data) => this.comprobante.set(data),
      error: (err) => this.error.set(err.error ?? 'No se pudo generar el comprobante en ARCA')
    });
  }

  esElegibleParaArca(): boolean {
    const c = this.comprobante();
    if (!c) return false;
    const tipoOk = c.tipo === 'FACTURA_A' || c.tipo === 'FACTURA_B_REMITO'
      || ((c.tipo === 'NOTA_CREDITO' || c.tipo === 'NOTA_DEBITO') && c.origen === 'GENERADO');
    return tipoOk && c.estado !== 'ANULADO' && c.estadoArca !== 'ENVIADO';
  }
}

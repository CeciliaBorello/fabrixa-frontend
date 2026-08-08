import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ComprobanteService } from '../comprobante.service';
import { ComprobanteResponse } from '../comprobante.model';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-comprobante-detalle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule, BackButtonComponent, MatButtonModule, RouterLink],
  templateUrl: './comprobante-detalle.component.html',
  styleUrl: './comprobante-detalle.component.scss'
})
export class ComprobanteDetalleComponent implements OnInit {
  comprobante = signal<ComprobanteResponse | null>(null);
  cargando = signal(true);
  error = signal('');

  constructor(private service: ComprobanteService, private route: ActivatedRoute, private router: Router) {}
  
  relacionados = signal<ComprobanteResponse[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.cargarComprobante(id);
    });
  }

  private cargarComprobante(id: number) {
    this.cargando.set(true);
    this.error.set('');
    this.relacionados.set([]);

    this.service.buscarPorId(id).subscribe({
      next: (data) => {
        this.comprobante.set(data);
        this.cargando.set(false);
        this.service.relacionados(id).subscribe((rel) => this.relacionados.set(rel));
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
    const tipoOk = c.tipo === 'FACTURA_A' || c.tipo === 'FACTURA_B_REMITO' || c.tipo === 'FACTURA_C_REMITO'
  || ((c.tipo === 'NOTA_CREDITO' || c.tipo === 'NOTA_DEBITO') && c.origen === 'GENERADO');
    return tipoOk && c.estado !== 'ANULADO' && c.estadoArca !== 'ENVIADO';
  }

  generarArcaRemito() {
    const c = this.comprobante();
    if (!c) return;
    this.service.generarArcaRemito(c.id).subscribe({
      next: (data) => this.comprobante.set(data),
      error: (err) => this.error.set(err.error ?? 'No se pudo generar el remito en ARCA')
    });
  }

  etiquetaTipoComprobante(tipo: string): string {
    const mapa: Record<string, string> = {
      FACTURA_A: 'Factura A', FACTURA_B_REMITO: 'Remito (Factura B)',
      NOTA_CREDITO: 'Nota de Crédito', NOTA_DEBITO: 'Nota de Débito',
      FACTURA_COMPRA: 'Factura de Compra', RECIBO_COBRO: 'Recibo de Cobro',
      RECIBO_PAGO: 'Recibo de Pago', PAGO_CONTADO: 'Pago Contado'
    };
    return mapa[tipo] ?? tipo;
  }

  puedeCobrar(): boolean {
    const c = this.comprobante();
    return !!c && c.direccion === 'VENTA' && c.estadoCobro != null && c.estadoCobro !== 'COBRADO' && c.estado !== 'ANULADO';
  }

  puedePagar(): boolean {
    const c = this.comprobante();
    return !!c && c.direccion === 'COMPRA' && c.estadoPago != null && c.estadoPago !== 'PAGADO' && c.estado !== 'ANULADO';
  }

  irACobrar() {
    const c = this.comprobante();
    if (c) this.router.navigate(['/facturacion/nuevo'], { queryParams: { cobrar: c.id } });
  }

  irAPagar() {
    const c = this.comprobante();
    if (c) this.router.navigate(['/facturacion/nuevo'], { queryParams: { pagar: c.id } });
  }
}

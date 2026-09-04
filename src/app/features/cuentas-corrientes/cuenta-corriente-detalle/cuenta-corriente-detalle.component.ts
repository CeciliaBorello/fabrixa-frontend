import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CuentaCorrienteService } from '../cuenta-corriente.service';
import { MovimientoCuentaCorriente } from '../cuenta-corriente.model';
import { ClienteProveedorService } from '../../comercial/cliente-proveedor.service';
import { AjusteCuentaCorrienteDialogComponent } from '../ajuste-cuenta-corriente-dialog/ajuste-cuenta-corriente-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { ErrorBannerComponent } from '../../../shared/error-banner/error-banner.component';

@Component({
  selector: 'app-cuenta-corriente-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatDialogModule, BackButtonComponent, ErrorBannerComponent],
  templateUrl: './cuenta-corriente-detalle.component.html',
  styleUrl: './cuenta-corriente-detalle.component.scss'
})
export class CuentaCorrienteDetalleComponent implements OnInit {
  clienteId!: number;
  razonSocial = signal('');
  saldoActual = signal(0);
  movimientos = signal<MovimientoCuentaCorriente[]>([]);
  cargando = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private service: CuentaCorrienteService,
    private clienteService: ClienteProveedorService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.clienteId = Number(params.get('id'));
      this.cargar();
    });
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');

    this.clienteService.buscarPorId(this.clienteId).subscribe({
      next: (cliente) => this.razonSocial.set(cliente.razonSocial),
      error: () => this.error.set('No se pudo cargar el cliente/proveedor')
    });

    this.service.saldo(this.clienteId).subscribe((saldo) => this.saldoActual.set(saldo));

    this.service.movimientos(this.clienteId).subscribe({
      next: (data) => {
        this.movimientos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los movimientos');
        this.cargando.set(false);
      }
    });
  }

  abrirAjuste() {
    const ref = this.dialog.open(AjusteCuentaCorrienteDialogComponent, {
      data: { razonSocial: this.razonSocial(), saldoActual: this.saldoActual() }
    });

    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.service.crearAjuste({
        clienteProveedorId: this.clienteId,
        monto: resultado.monto,
        motivo: resultado.motivo
      }).subscribe({
        next: () => this.cargar(),
        error: (err) => this.error.set(err.error ?? 'No se pudo crear el ajuste')
      });
    });
  }

  claseSaldo(saldo: number): string {
    if (saldo > 0) return 'saldo-a-favor';
    if (saldo < 0) return 'saldo-en-contra';
    return '';
  }
}

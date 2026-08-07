import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ComprobanteService } from '../comprobante.service';
import { ComprobanteResponse, TipoComprobante } from '../comprobante.model';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';


@Component({
  selector: 'app-comprobantes-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSelectModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    MatSlideToggleModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './comprobantes-list.component.html',
  styleUrl: './comprobantes-list.component.scss'
})
export class ComprobantesListComponent implements OnInit {
  items = signal<ComprobanteResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  soloAnulados = signal(false);
  busqueda = signal('');
  filtroTipo = signal<TipoComprobante | null>(null);
  cargando = signal(true);
  error = signal('');

  busquedaControl = new FormControl('');

  columnas = ['id', 'tipo', 'cliente', 'fecha', 'total', 'estado', 'estadoCobroPago', 'acciones'];

  tipos: { value: TipoComprobante; label: string }[] = [
    { value: 'FACTURA_A', label: 'Factura A' },
    { value: 'FACTURA_B_REMITO', label: 'Remito (Factura B)' },
    { value: 'NOTA_CREDITO', label: 'Nota de Crédito' },
    { value: 'NOTA_DEBITO', label: 'Nota de Débito' },
    { value: 'FACTURA_COMPRA', label: 'Factura de Compra' },
    { value: 'RECIBO_COBRO', label: 'Recibo de Cobro' },
    { value: 'RECIBO_PAGO', label: 'Recibo de Pago' },
    { value: 'PAGO_CONTADO', label: 'Pago Contado' }
  ];

  constructor(private service: ComprobanteService, private dialog: MatDialog, private router: Router) {
    this.busquedaControl.valueChanges
      .pipe(debounceTime(500), rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3))
      .subscribe((valor) => {
        this.busqueda.set(valor || '');
        this.pageIndex.set(0);
        this.cargar();
      });
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    const tipos = this.filtroTipo() ? [this.filtroTipo() as TipoComprobante] : null;
    this.service.listarPaginado(this.pageIndex(), this.pageSize(), tipos, this.soloAnulados(), this.busqueda()).subscribe({
      next: (pagina) => {
        this.items.set(pagina.content);
        this.totalItems.set(pagina.totalElements);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los comprobantes');
        this.cargando.set(false);
      }
    });
  }

  onFiltroTipoChange(tipo: TipoComprobante | null) {
    this.filtroTipo.set(tipo);
    this.pageIndex.set(0);
    this.cargar();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  toggleSoloAnulados() {
    this.soloAnulados.update((v) => !v);
    this.pageIndex.set(0);
    this.cargar();
  }

  etiquetaTipo(tipo: string): string {
    return this.tipos.find((t) => t.value === tipo)?.label ?? tipo;
  }

  etiquetaEstadoCobroPago(item: ComprobanteResponse): string {
    if (item.estadoCobro) {
      const mapa: Record<string, string> = { PENDIENTE: 'Pendiente', PARCIAL: 'Parcial', COBRADO: 'Cobrado' };
      return mapa[item.estadoCobro] ?? item.estadoCobro;
    }
    if (item.estadoPago) {
      const mapa: Record<string, string> = { RECIBIDO: 'Recibido', PARCIAL: 'Parcial', PAGADO: 'Pagado' };
      return mapa[item.estadoPago] ?? item.estadoPago;
    }
    return '-';
  }

  claseEstadoCobroPago(item: ComprobanteResponse): string {
    const valor = item.estadoCobro || item.estadoPago;
    if (valor === 'COBRADO' || valor === 'PAGADO') return 'estado-ok';
    if (valor === 'PARCIAL') return 'estado-parcial';
    if (valor === 'PENDIENTE' || valor === 'RECIBIDO') return 'estado-pendiente';
    return '';
  }

  verDetalle(item: ComprobanteResponse) {
    this.router.navigate(['/facturacion', item.id]);
  }

  puedeAnular(item: ComprobanteResponse): boolean {
    return item.estado === 'EMITIDO';
  }

  puedeAsentar(item: ComprobanteResponse): boolean {
    return item.estado === 'EMITIDO' && (item.tipo === 'NOTA_CREDITO' || item.tipo === 'NOTA_DEBITO');
  }

  anular(item: ComprobanteResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Anular comprobante',
        mensaje: `¿Seguro que querés anular ${this.etiquetaTipo(item.tipo)} #${item.id} de ${item.clienteProveedorNombre}? Si afectaba a otro comprobante, se recalcula su estado de cobro/pago.`,
        textoConfirmar: 'Anular',
        peligroso: true
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.anular(item.id).subscribe({
          next: () => this.cargar(),
          error: (err) => this.error.set(err.error ?? 'No se pudo anular el comprobante')
        });
      }
    });
  }

  asentar(item: ComprobanteResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Asentar comprobante',
        mensaje: `¿Marcar ${this.etiquetaTipo(item.tipo)} #${item.id} como asentada?`,
        textoConfirmar: 'Asentar',
        peligroso: false
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.asentar(item.id).subscribe({
          next: () => this.cargar(),
          error: (err) => this.error.set(err.error ?? 'No se pudo asentar el comprobante')
        });
      }
    });
  }
}

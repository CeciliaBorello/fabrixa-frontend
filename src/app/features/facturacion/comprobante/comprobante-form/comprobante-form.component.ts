import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ComprobanteService } from '../comprobante.service';
import { ComprobanteRequest, ComprobanteResponse, DireccionComprobante, TipoComprobante, TipoFormaPago } from '../comprobante.model';
import { ClienteProveedorService } from '../../../comercial/cliente-proveedor.service';
import { ProductoService } from '../../../comercial/producto.service';
import { ChequeService } from '../../../facturacion/cheque/cheque.service';
import { ClienteProveedorResponse } from '../../../comercial/cliente-proveedor.model';
import { ProductoResponse } from '../../../comercial/producto.model';
import { ChequeResponse } from '../../../facturacion/cheque/cheque.model';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-comprobante-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, BackButtonComponent
  ],
  templateUrl: './comprobante-form.component.html',
  styleUrl: './comprobante-form.component.scss'
})
export class ComprobanteFormComponent implements OnInit {
  guardando = signal(false);
  error = signal('');

  clientes = signal<ClienteProveedorResponse[]>([]);
  productos = signal<ProductoResponse[]>([]);
  chequesEnCartera = signal<ChequeResponse[]>([]);
  comprobantesPendientes = signal<ComprobanteResponse[]>([]);

  tipos: { value: TipoComprobante; label: string }[] = [
    { value: 'FACTURA_A', label: 'Factura A' },
    { value: 'FACTURA_B_REMITO', label: 'Remito (Factura B)' },
    { value: 'FACTURA_COMPRA', label: 'Factura de Compra' },
    { value: 'NOTA_CREDITO', label: 'Nota de Crédito' },
    { value: 'NOTA_DEBITO', label: 'Nota de Débito' },
    { value: 'RECIBO_COBRO', label: 'Recibo de Cobro' },
    { value: 'PAGO_CONTADO', label: 'Pago Contado' },
    { value: 'RECIBO_PAGO', label: 'Recibo de Pago' }
  ];

  form;

  get itemsArray() {
    return this.form.get('items') as FormArray;
  }

  get formasPagoArray() {
    return this.form.get('formasPago') as FormArray;
  }

  tipoSeleccionado = signal<TipoComprobante>('FACTURA_A');

  // grupos de comportamiento según el tipo elegido
  llevaItems = computed(() => ['FACTURA_A', 'FACTURA_B_REMITO', 'FACTURA_COMPRA'].includes(this.tipoSeleccionado()));
  llevaRemito = computed(() => ['FACTURA_A', 'FACTURA_B_REMITO'].includes(this.tipoSeleccionado()));
  llevaFormasPago = computed(() => ['RECIBO_COBRO', 'RECIBO_PAGO', 'PAGO_CONTADO'].includes(this.tipoSeleccionado()));
  llevaComprobanteAfectado = computed(() => ['RECIBO_COBRO', 'RECIBO_PAGO'].includes(this.tipoSeleccionado()));
  esNotaFinanciera = computed(() => ['NOTA_CREDITO', 'NOTA_DEBITO'].includes(this.tipoSeleccionado()));
  esCobro = computed(() => ['RECIBO_COBRO', 'PAGO_CONTADO'].includes(this.tipoSeleccionado()));
  direccionActual = computed<DireccionComprobante>(() =>
    ['FACTURA_COMPRA', 'RECIBO_PAGO'].includes(this.tipoSeleccionado()) ? 'COMPRA' : 'VENTA'
  );

  constructor(
    private fb: FormBuilder,
    private service: ComprobanteService,
    private clienteService: ClienteProveedorService,
    private productoService: ProductoService,
    private chequeService: ChequeService,
    private router: Router
  ) {

    this.form = this.fb.group({
    tipo: ['FACTURA_A' as TipoComprobante, Validators.required],
    origen: ['GENERADO'],
    clienteProveedorId: [null as number | null, Validators.required],
    fechaVencimiento: [null as Date | null],
    comprobanteAfectadoId: [null as number | null],
    montoNotaFinanciera: [0],
    items: this.fb.array([this.crearItemForm()]),
    formasPago: this.fb.array([this.crearFormaPagoForm()]),
    remitoNumero: [''],
    remitoTransportista: [''],
    remitoChofer: [''],
    remitoPatente: ['']
  });

  }

  ngOnInit() {
    this.clienteService.listar().subscribe((data) => this.clientes.set(data.filter((c) => c.activo)));
    this.productoService.listar().subscribe((data) => this.productos.set(data.filter((p) => p.activo)));

    this.form.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.tipoSeleccionado.set(tipo as TipoComprobante);
      this.comprobantesPendientes.set([]);
      this.form.get('comprobanteAfectadoId')?.setValue(null);
      this.recargarPendientesSiCorresponde();

      if (this.llevaFormasPago() && this.tieneChequeSeleccionado()) {
        this.cargarChequesEnCartera();
      }
    });

    this.form.get('clienteProveedorId')?.valueChanges.subscribe(() => {
      this.recargarPendientesSiCorresponde();
    });
  }

  private recargarPendientesSiCorresponde() {
    const clienteId = this.form.get('clienteProveedorId')?.value;
    if (this.llevaComprobanteAfectado() && clienteId) {
      this.service.pendientesPorCliente(clienteId, this.direccionActual()).subscribe((data) => {
        this.comprobantesPendientes.set(data);
      });
    }
  }

  private tieneChequeSeleccionado(): boolean {
    return this.formasPagoArray.controls.some((g) => g.get('tipo')?.value === 'CHEQUE');
  }

  cargarChequesEnCartera() {
    this.chequeService.listarEnCarteraDeTercero().subscribe((pagina) => this.chequesEnCartera.set(pagina.content));
  }

  onFormaPagoTipoChange(index: number) {
    const tipo = this.formasPagoArray.at(index).get('tipo')?.value;
    if (tipo === 'CHEQUE' && !this.esCobro()) {
      this.cargarChequesEnCartera();
    }
  }

  crearItemForm() {
    return this.fb.group({
      productoId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(0.001)]],
      precioUnitario: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  agregarItem() {
    this.itemsArray.push(this.crearItemForm());
  }

  quitarItem(index: number) {
    if (this.itemsArray.length > 1) this.itemsArray.removeAt(index);
  }

  crearFormaPagoForm() {
    return this.fb.group({
      tipo: ['EFECTIVO' as TipoFormaPago, Validators.required],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      chequeId: [null as number | null],
      chequeNumero: [''],
      chequeBanco: [''],
      chequeFechaCobro: [null as Date | null]
    });
  }

  agregarFormaPago() {
    this.formasPagoArray.push(this.crearFormaPagoForm());
  }

  quitarFormaPago(index: number) {
    if (this.formasPagoArray.length > 1) this.formasPagoArray.removeAt(index);
  }

  cancelar() {
    this.router.navigate(['/facturacion']);
  }

  private formatearFecha(d: Date | null): string | undefined {
    if (!d) return undefined;
    return d.toISOString().split('T')[0];
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    const v = this.form.getRawValue();

    const request: ComprobanteRequest = {
      tipo: v.tipo!,
      clienteProveedorId: v.clienteProveedorId!,
      fechaVencimiento: this.formatearFecha(v.fechaVencimiento)
    };

    if (this.esNotaFinanciera()) {
      request.origen = v.origen as any;
      request.formasPago = [{ tipo: 'EFECTIVO', monto: v.montoNotaFinanciera! }];
      if (v.comprobanteAfectadoId) request.comprobanteAfectadoId = v.comprobanteAfectadoId;
    }

    if (this.llevaItems()) {
      request.items = v.items!.map((i) => ({ productoId: i.productoId!, cantidad: i.cantidad!, precioUnitario: i.precioUnitario! }));
    }

    if (this.llevaRemito()) {
      request.remitoViaje = {
        numero: v.remitoNumero || '',
        transportista: v.remitoTransportista || '',
        chofer: v.remitoChofer || '',
        patente: v.remitoPatente || ''
      };
    }

    if (this.llevaComprobanteAfectado()) {
      if (!v.comprobanteAfectadoId) {
        this.guardando.set(false);
        this.error.set('Elegí a qué comprobante afecta este recibo');
        return;
      }
      request.comprobanteAfectadoId = v.comprobanteAfectadoId;
    }

    if (this.llevaFormasPago()) {
      request.formasPago = v.formasPago!.map((fp) => ({
        tipo: fp.tipo!,
        monto: fp.monto!,
        chequeId: fp.chequeId || undefined,
        chequeNumero: fp.chequeNumero || undefined,
        chequeBanco: fp.chequeBanco || undefined,
        chequeFechaCobro: this.formatearFecha(fp.chequeFechaCobro || null)
      }));
    }

    this.service.crear(request).subscribe({
      next: () => this.router.navigate(['/facturacion']),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo crear el comprobante');
      }
    });
  }
}

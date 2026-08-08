import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatButtonModule, MatIconModule, MatCheckboxModule, MatDatepickerModule, MatNativeDateModule, BackButtonComponent],
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
    { value: 'FACTURA_B_REMITO', label: 'Factura B' },
    { value: 'FACTURA_C_REMITO', label: 'Factura C' },
    { value: 'FACTURA_COMPRA', label: 'Factura de Compra' },
    { value: 'NOTA_CREDITO', label: 'Nota de Crédito' },
    { value: 'NOTA_DEBITO', label: 'Nota de Débito' },
    { value: 'RECIBO_COBRO', label: 'Recibo de Cobro' },
    { value: 'PAGO_CONTADO', label: 'Pago Contado' },
    { value: 'RECIBO_PAGO', label: 'Recibo de Pago' }
  ];

  opcionesIva = [21, 10.5, 27, 0];

  form: FormGroup;

  get itemsArray() {
    return this.form.get('items') as FormArray;
  }

  get formasPagoArray() {
    return this.form.get('formasPago') as FormArray;
  }

  tipoSeleccionado = signal<TipoComprobante>('FACTURA_A');

  llevaItems = computed(() => ['FACTURA_A', 'FACTURA_B_REMITO', 'FACTURA_C_REMITO', 'FACTURA_COMPRA'].includes(this.tipoSeleccionado()));
  puedeLlevarRemito = computed(() => ['FACTURA_A', 'FACTURA_B_REMITO', 'FACTURA_C_REMITO'].includes(this.tipoSeleccionado()));
  llevaFormasPago = computed(() => ['RECIBO_COBRO', 'RECIBO_PAGO', 'PAGO_CONTADO'].includes(this.tipoSeleccionado()));
  llevaComprobanteAfectado = computed(() => ['RECIBO_COBRO', 'RECIBO_PAGO'].includes(this.tipoSeleccionado()));
  esNotaFinanciera = computed(() => ['NOTA_CREDITO', 'NOTA_DEBITO'].includes(this.tipoSeleccionado()));
  esCobro = computed(() => ['RECIBO_COBRO', 'PAGO_CONTADO'].includes(this.tipoSeleccionado()));
  direccionActual = computed<DireccionComprobante>(() =>
    ['FACTURA_COMPRA', 'RECIBO_PAGO'].includes(this.tipoSeleccionado()) ? 'COMPRA' : 'VENTA'
  );

  productosFiltrados = computed(() => {
    const todos = this.productos();

    if (this.direccionActual() === 'VENTA') {
      return todos.filter((p) => p.tipo === 'TERMINADO' || p.tipo === 'AMBOS');
    }

    return todos.filter((p) => p.tipo === 'INSUMO' || p.tipo === 'AMBOS');
  });

  constructor(
    private fb: FormBuilder,
    private service: ComprobanteService,
    private clienteService: ClienteProveedorService,
    private productoService: ProductoService,
    private chequeService: ChequeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // acá adentro "this.fb" ya está asignado, así que es seguro usarlo
    this.form = this.fb.group({
      tipo: ['FACTURA_A' as TipoComprobante, Validators.required],
      origen: ['GENERADO'],
      clienteProveedorId: [null as number | null, Validators.required],
      fechaVencimiento: [null as Date | null],
      comprobanteAfectadoId: [null as number | null],
      montoNotaFinanciera: [0],
      items: this.fb.array([this.crearItemForm()]),
      formasPago: this.fb.array([this.crearFormaPagoForm()]),
      llevaRemito: [false],
      remitoTransportista: [''],
      remitoChofer: [''],
      remitoPatente: [''],
      montoPendiente: ['']
    });
  }

  ngOnInit() {
    this.clienteService.listar().subscribe((data) => this.clientes.set(data.filter((c) => c.activo)));
    this.productoService.listar().subscribe((data) => this.productos.set(data.filter((p) => p.activo)));

    this.form.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.tipoSeleccionado.set(tipo as TipoComprobante);
      this.comprobantesPendientes.set([]);
      this.form.get('comprobanteAfectadoId')?.setValue(null);
      this.form.get('llevaRemito')?.setValue(false);
      this.recargarPendientesSiCorresponde();

      if (this.llevaFormasPago() && this.tieneChequeSeleccionado()) {
        this.cargarChequesEnCartera();
      }

      this.actualizarControlesHabilitados();
    });

    this.form.get('clienteProveedorId')?.valueChanges.subscribe(() => {
      this.recargarPendientesSiCorresponde();
    });

    this.actualizarControlesHabilitados();

    this.route.queryParamMap.subscribe((params) => {
      const comprobanteId = params.get('cobrar') || params.get('pagar');
      if (!comprobanteId) return;

      const esCobro = !!params.get('cobrar');
      this.form.get('tipo')?.setValue(esCobro ? 'RECIBO_COBRO' : 'RECIBO_PAGO');

      this.service.buscarPorId(Number(comprobanteId)).subscribe((c) => {
        this.form.get('clienteProveedorId')?.setValue(c.clienteProveedorId);
        // recién cuando el cliente ya está seteado, cargamos sus pendientes y preseleccionamos este
        this.recargarPendientesSiCorresponde();
        this.form.get('comprobanteAfectadoId')?.setValue(c.id);
      });
    });
  }

  etiquetaProducto(p: ProductoResponse): string {
    // si no tiene presentacion propia (campo "presentacion" vacío) pero es tipo AMBOS/base de otros,
    // es un producto "a granel" — lo aclaramos en el texto
    return p.presentacion ? p.nombre : `${p.nombre} (a granel)`;
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
      precioUnitario: [0, [Validators.required, Validators.min(0.01)]],
      porcentajeIva: [21, Validators.required]
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

  subtotalCalculado(): number {
    if (!this.llevaItems()) return 0;
    return this.itemsArray.controls.reduce((acc, ctrl) => {
      const cantidad = ctrl.get('cantidad')?.value || 0;
      const precio = ctrl.get('precioUnitario')?.value || 0;
      return acc + cantidad * precio;
    }, 0);
  }

  ivaCalculado(): number {
    if (!this.llevaItems()) return 0;
    return this.itemsArray.controls.reduce((acc, ctrl) => {
      const cantidad = ctrl.get('cantidad')?.value || 0;
      const precio = ctrl.get('precioUnitario')?.value || 0;
      const iva = ctrl.get('porcentajeIva')?.value || 0;
      return acc + (cantidad * precio * iva) / 100;
    }, 0);
  }

  totalCalculado(): number {
    if (this.llevaItems()) return this.subtotalCalculado() + this.ivaCalculado();
    if (this.llevaFormasPago()) {
      return this.formasPagoArray.controls.reduce((acc, ctrl) => acc + (ctrl.get('monto')?.value || 0), 0);
    }
    if (this.esNotaFinanciera()) return this.form.get('montoNotaFinanciera')?.value || 0;
    return 0;
  }

  onProductoItemChange(index: number, productoId: number) {
    const producto = this.productos().find((p) => p.id === productoId);
    if (producto?.precioActual != null) {
      this.itemsArray.at(index).get('precioUnitario')?.setValue(producto.precioActual);
    }
  }

  private actualizarControlesHabilitados() {
    if (this.llevaItems()) {
      this.itemsArray.enable({ emitEvent: false });
    } else {
      this.itemsArray.disable({ emitEvent: false });
    }

    if (this.llevaFormasPago()) {
      this.formasPagoArray.enable({ emitEvent: false });
    } else {
      this.formasPagoArray.disable({ emitEvent: false });
    }

    const montoControl = this.form.get('montoNotaFinanciera');
    if (this.esNotaFinanciera()) {
      montoControl?.enable({ emitEvent: false });
    } else {
      montoControl?.disable({ emitEvent: false });
    }
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
      request.items = v.items!.map((i: any) => ({
        productoId: i.productoId!,
        cantidad: i.cantidad!,
        precioUnitario: i.precioUnitario!,
        porcentajeIva: i.porcentajeIva!
      }));
    }

    if (this.puedeLlevarRemito() && v.llevaRemito) {
      request.llevaRemito = true;
      request.remitoViaje = {
        transportista: v.remitoTransportista || '',
        chofer: v.remitoChofer || '',
        patente: v.remitoPatente || ''
      };
    } else {
      request.llevaRemito = false;
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
      request.formasPago = v.formasPago!.map((fp: any) => ({
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
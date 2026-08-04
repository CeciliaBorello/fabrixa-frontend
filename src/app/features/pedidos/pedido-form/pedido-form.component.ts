import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PedidoService } from '../pedido.service';
import { ClienteProveedorService } from '../../comercial/cliente-proveedor.service';
import { ProductoService } from '../../comercial/producto.service';
import { ClienteProveedorResponse } from '../../comercial/cliente-proveedor.model';
import { ProductoResponse } from '../../comercial/producto.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

interface ItemUiState {
  filtroProducto: string;
}

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatChipsModule, BackButtonComponent
  ],
  templateUrl: './pedido-form.component.html',
  styleUrl: './pedido-form.component.scss'
})
export class PedidoFormComponent implements OnInit {
  clientes = signal<ClienteProveedorResponse[]>([]);
  todosLosProductos = signal<ProductoResponse[]>([]);
  guardando = signal(false);
  error = signal('');

  // estado de UI por cada fila de ítem (texto de búsqueda escrito en el autocomplete)
  estadoPorFila = signal<ItemUiState[]>([{ filtroProducto: '' }]);

  productosRaiz = computed(() =>
    this.todosLosProductos()
      .filter((p) => p.activo && (p.tipo === 'TERMINADO' || p.tipo === 'AMBOS') && p.productoBaseId == null)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  form;

  get itemsArray() {
    return this.form.get('items') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private clienteService: ClienteProveedorService,
    private productoService: ProductoService,
    private router: Router
  ) {
    this.form = this.fb.group({
      clienteId: [null as number | null, Validators.required],
      items: this.fb.array([this.crearItemForm()])
    });
  }

  ngOnInit() {
    this.clienteService.listar().subscribe((data) => {
      this.clientes.set(data.filter((c) => c.activo && (c.tipo === 'CLIENTE' || c.tipo === 'AMBOS')));
    });

    this.productoService.listar().subscribe((data) => {
      this.todosLosProductos.set(data);
    });
  }

  // productos raíz filtrados según lo que se escribió en el autocomplete de esa fila
  productosFiltrados(index: number): ProductoResponse[] {
    const termino = normalizarTexto(this.estadoPorFila()[index]?.filtroProducto || '');
    if (!termino) return this.productosRaiz();
    return this.productosRaiz().filter((p) => normalizarTexto(p.nombre).includes(termino));
  }

  presentacionesDe(productoId: number | null): ProductoResponse[] {
    if (!productoId) return [];
    return this.todosLosProductos()
      .filter((p) => p.activo && p.productoBaseId === productoId)
      .sort((a, b) => (a.presentacion || a.nombre).localeCompare(b.presentacion || b.nombre));
  }

  nombreProductoElegido(index: number): string {
    const id = this.itemsArray.at(index).get('productoId')?.value;
    return this.productosRaiz().find((p) => p.id === id)?.nombre || '';
  }

  onFiltroProductoInput(index: number, valor: string) {
    const estado = [...this.estadoPorFila()];
    estado[index] = { filtroProducto: valor };
    this.estadoPorFila.set(estado);
  }

  onProductoSeleccionado(index: number, productoId: number) {
    const grupo = this.itemsArray.at(index);
    grupo.get('productoId')?.setValue(productoId);
    grupo.get('presentacionId')?.setValue(null); // resetea la presentación al cambiar de producto
  }

  onPresentacionClick(index: number, presentacionId: number) {
    this.itemsArray.at(index).get('presentacionId')?.setValue(presentacionId);
  }

  crearItemForm() {
    return this.fb.group({
      productoId: [null as number | null, Validators.required],
      presentacionId: [null as number | null],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  agregarItem() {
    this.itemsArray.push(this.crearItemForm());
    this.estadoPorFila.set([...this.estadoPorFila(), { filtroProducto: '' }]);
  }

  quitarItem(index: number) {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      const estado = [...this.estadoPorFila()];
      estado.splice(index, 1);
      this.estadoPorFila.set(estado);
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const itemsValores = this.itemsArray.getRawValue();
    const faltaPresentacion = itemsValores.some(
      (i) => this.presentacionesDe(i.productoId).length > 0 && !i.presentacionId
    );
    if (faltaPresentacion) {
      this.error.set('Elegí una presentación para cada producto que la tenga');
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    const valores = this.form.getRawValue();

    const request = {
      clienteId: valores.clienteId!,
      items: valores.items.map((i) => ({
        productoId: i.presentacionId ?? i.productoId!,
        cantidad: i.cantidad!
      }))
    };

    this.pedidoService.crear(request).subscribe({
      next: () => this.router.navigate(['/pedidos']),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo crear el pedido');
      }
    });
  }
}
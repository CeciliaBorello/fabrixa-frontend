import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PedidoService } from '../pedido.service';
import { ClienteProveedorService } from '../../comercial/cliente-proveedor.service';
import { ProductoService } from '../../comercial/producto.service';
import { ClienteProveedorResponse } from '../../comercial/cliente-proveedor.model';
import { ProductoResponse } from '../../comercial/producto.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, BackButtonComponent
  ],
  templateUrl: './pedido-form.component.html',
  styleUrl: './pedido-form.component.scss'
})
export class PedidoFormComponent implements OnInit {
  clientes = signal<ClienteProveedorResponse[]>([]);
  productos = signal<ProductoResponse[]>([]);
  guardando = signal(false);
  error = signal('');

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
      this.productos.set(data.filter((p) => p.activo));
    });
  }

  crearItemForm() {
    return this.fb.group({
      productoId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  agregarItem() {
    this.itemsArray.push(this.crearItemForm());
  }

  quitarItem(index: number) {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    const valores = this.form.getRawValue();

    const request = {
      clienteId: valores.clienteId!,
      items: valores.items.map((i) => ({ productoId: i.productoId!, cantidad: i.cantidad! }))
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
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ProductoService } from '../producto.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { CategoriaProducto, ProductoResponse, TipoProducto, UnidadMedida } from '../producto.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, BackButtonComponent, MatSelectModule
  ],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.scss'
})
export class ProductoFormComponent implements OnInit {
  itemId: number | null = null;
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');

  productosBase = signal<ProductoResponse[]>([]);
  tipoSeleccionado = signal<TipoProducto>('TERMINADO');

  // solo tiene sentido elegir como "base" algo que también se vende (terminado o ambos),
  // un insumo puro no puede ser la base de una presentación de venta
  productosBaseFiltrados = computed(() =>
    this.productosBase().filter((p) => (p.tipo === 'TERMINADO' || p.tipo === 'AMBOS') && p.id !== this.itemId)
  );

  // el campo de presentación/producto base solo aplica si el producto en sí se vende
  mostrarCamposVenta = computed(() => this.tipoSeleccionado() !== 'INSUMO');

  form;

  get esEdicion() {
    return this.itemId !== null;
  }

  constructor(
    private fb: FormBuilder,
    private service: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      tipo: ['TERMINADO', Validators.required],
      nombre: ['', Validators.required],
      codigoBarra: [''],
      rnpa: [''],
      valorNutricional: [''],
      unidadMedida: ['KG', Validators.required],
      categoria: [''],
      productoBaseId: [null as number | null],
      presentacion: ['']
    });
  }

  ngOnInit() {
    this.service.listarProductosBase().subscribe((data) => this.productosBase.set(data));

    this.form.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.tipoSeleccionado.set(tipo as TipoProducto);

      // si pasa a ser Insumo, limpiamos los campos que ya no aplican
      if (tipo === 'INSUMO') {
        this.form.get('productoBaseId')?.setValue(null);
        this.form.get('presentacion')?.setValue('');
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.itemId = Number(idParam);
      this.cargando.set(true);
      this.service.buscarPorId(this.itemId).subscribe({
        next: (item) => {
          this.form.patchValue({
            tipo: item.tipo,
            nombre: item.nombre,
            codigoBarra: item.codigoBarra ?? '',
            rnpa: item.rnpa ?? '',
            valorNutricional: item.valorNutricional ?? '',
            unidadMedida: item.unidadMedida ?? '',
            categoria: item.categoria ?? '',
            productoBaseId: item.productoBaseId ?? null,
            presentacion: item.presentacion ?? ''
          });
          this.tipoSeleccionado.set(item.tipo);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el producto');
          this.cargando.set(false);
        }
      });
    } else {
      this.tipoSeleccionado.set('TERMINADO'); // valor inicial del form
    }
  }

  cancelar() {
    this.router.navigate(['/productos']);
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
      nombre: valores.nombre!,
      tipo: valores.tipo as TipoProducto,
      codigoBarra: valores.codigoBarra || undefined,
      rnpa: valores.rnpa || undefined,
      valorNutricional: valores.valorNutricional || undefined,
      unidadMedida: valores.unidadMedida as UnidadMedida,
      categoria: (valores.categoria || undefined) as CategoriaProducto | undefined,
      productoBaseId: valores.productoBaseId || undefined,
      presentacion: valores.presentacion || undefined
    };

    const accion = this.esEdicion
      ? this.service.actualizar(this.itemId!, request)
      : this.service.crear(request);

    accion.subscribe({
      next: () => this.router.navigate(['/productos']),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo guardar');
      }
    });
  }
}
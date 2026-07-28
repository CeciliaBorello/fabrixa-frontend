import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductoService } from '../producto.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TipoProducto, UnidadMedida } from '../producto.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, BackButtonComponent, MatSelectModule],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.scss'
})
export class ProductoFormComponent implements OnInit {
  itemId: number | null = null;
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');

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
      nombre: ['', Validators.required],
      tipo: ['TERMINADO', Validators.required],
      codigoBarra: [''],
      rnpa: [''],
      valorNutricional: [''],
      unidadMedida: ['KG', Validators.required],
      categoria: ['']
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.itemId = Number(idParam);
      this.cargando.set(true);
      this.service.buscarPorId(this.itemId).subscribe({
        next: (item) => {
          this.form.patchValue({
            nombre: item.nombre,
            tipo: item.tipo,
            codigoBarra: item.codigoBarra ?? '',
            rnpa: item.rnpa ?? '',
            valorNutricional: item.valorNutricional ?? '',
            unidadMedida: item.unidadMedida ?? '',
            categoria: item.categoria ?? ''
          });
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el producto');
          this.cargando.set(false);
        }
      });
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
      nombre: valores.nombre!,
      tipo: valores.tipo as TipoProducto,
      codigoBarra: valores.codigoBarra || undefined,
      rnpa: valores.rnpa || undefined,
      valorNutricional: valores.valorNutricional || undefined,
      unidadMedida: valores.unidadMedida as UnidadMedida,
      categoria: valores.categoria || undefined
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
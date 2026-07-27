import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormulaService } from '../formula.service';
import { ProductoService } from '../../comercial/producto.service';
import { ProductoResponse } from '../../comercial/producto.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { UnidadMedida } from '../../comercial/producto.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-formula-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, BackButtonComponent, MatProgressSpinnerModule
  ],
  templateUrl: './formula-form.component.html',
  styleUrl: './formula-form.component.scss'
})

export class FormulaFormComponent implements OnInit {
  productosTerminados = signal<ProductoResponse[]>([]);
  insumosDisponibles = signal<ProductoResponse[]>([]);
  guardando = signal(false);
  cargando = signal(false);
  error = signal('');
  formulaBaseNombre = signal(''); // para mostrar "Basado en: Fórmula estándar v1"

  form;

  get insumosArray() {
    return this.form.get('insumos') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private formulaService: FormulaService,
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      productoTerminadoId: [null as number | null, Validators.required],
      nombre: ['', Validators.required],
      insumos: this.fb.array([this.crearInsumoForm()])
    });
  }

  ngOnInit() {
    this.productoService.listar().subscribe((data) => {
      const activos = data.filter((p) => p.activo);
      this.productosTerminados.set(activos.filter((p) => p.tipo === 'TERMINADO' || p.tipo === 'AMBOS'));
      this.insumosDisponibles.set(activos.filter((p) => p.tipo === 'INSUMO' || p.tipo === 'AMBOS'));

      // recién ahora que tenemos los productos cargados, revisamos si hay que precargar una fórmula base
      const desdeId = this.route.snapshot.queryParamMap.get('desde');
      if (desdeId) {
        this.precargarDesde(Number(desdeId));
      }
    });
  }

  private precargarDesde(formulaId: number) {
    this.cargando.set(true);
    this.formulaService.buscarPorId(formulaId).subscribe({
      next: (formula) => {
        this.formulaBaseNombre.set(`${formula.nombre} (v${formula.version})`);

        this.form.patchValue({
          productoTerminadoId: formula.productoTerminadoId,
          nombre: formula.nombre // el usuario puede dejarlo igual o cambiarlo, la versión se calcula sola
        });

        // reemplazamos el FormArray de insumos por uno con los datos de la fórmula base
        this.insumosArray.clear();
        formula.insumos.forEach((insumo) => {
          this.insumosArray.push(this.fb.group({
            insumoProductoId: [insumo.insumoProductoId, Validators.required],
            cantidadNecesaria: [insumo.cantidadNecesaria, [Validators.required, Validators.min(0.001)]],
            unidadMedida: [insumo.unidadMedida, Validators.required]
          }));
        });

        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la fórmula base');
        this.cargando.set(false);
      }
    });
  }

  crearInsumoForm() {
    return this.fb.group({
      insumoProductoId: [null as number | null, Validators.required],
      cantidadNecesaria: [1, [Validators.required, Validators.min(0.001)]],
      unidadMedida: ['KG', Validators.required]
    });
  }

  agregarInsumo() {
    this.insumosArray.push(this.crearInsumoForm());
  }

  quitarInsumo(index: number) {
    if (this.insumosArray.length > 1) {
      this.insumosArray.removeAt(index);
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
      productoTerminadoId: valores.productoTerminadoId!,
      nombre: valores.nombre!,
      insumos: valores.insumos.map((i) => ({
        insumoProductoId: i.insumoProductoId!,
        cantidadNecesaria: i.cantidadNecesaria!,
        unidadMedida: i.unidadMedida as UnidadMedida
      }))
    };

    this.formulaService.crear(request).subscribe({
      next: () => this.router.navigate(['/fabricacion/formulas']),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo crear la fórmula');
      }
    });
  }
}
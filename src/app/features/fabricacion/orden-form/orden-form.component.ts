import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { OrdenFabricacionService } from '../orden-fabricacion.service';
import { FormulaService } from '../formula.service';
import { FormulaResponse } from '../formula.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, BackButtonComponent],
  templateUrl: './orden-form.component.html',
  styleUrl: './orden-form.component.scss'
})
export class OrdenFormComponent implements OnInit {
  formulas = signal<FormulaResponse[]>([]);
  guardando = signal(false);
  error = signal('');

  form;

  constructor(
    private fb: FormBuilder,
    private ordenService: OrdenFabricacionService,
    private formulaService: FormulaService,
    private router: Router
  ) {
    this.form = this.fb.group({
    formulaId: [null as number | null, Validators.required],
    cantidadPlanificada: [1, [Validators.required, Validators.min(0.001)]]
  });
  }

  ngOnInit() {
    this.formulaService.listar().subscribe((data) => {
      this.formulas.set(data.filter((f) => f.activo));
    });
  }

  formulaSeleccionada(): FormulaResponse | undefined {
    const id = this.form.getRawValue().formulaId;
    return this.formulas().find((f) => f.id === id);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formula = this.formulaSeleccionada();
    if (!formula) {
      this.error.set('Seleccioná una fórmula válida');
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    const valores = this.form.getRawValue();

    this.ordenService.crear({
      productoId: formula.productoTerminadoId,
      formulaId: formula.id,
      cantidadPlanificada: valores.cantidadPlanificada!
    }).subscribe({
      next: () => this.router.navigate(['/fabricacion/ordenes']),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo crear la orden');
      }
    });
  }
}
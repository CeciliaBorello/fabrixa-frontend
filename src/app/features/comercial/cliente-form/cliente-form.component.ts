import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ClienteProveedorService } from '../cliente-proveedor.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, BackButtonComponent, MatIconModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss'
})
export class ClienteFormComponent implements OnInit {
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
    private service: ClienteProveedorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
    tipo: ['CLIENTE', Validators.required],
    razonSocial: ['', Validators.required],
    cuit: ['', Validators.required],
    condicionIva: [''],
    direccion: [''],
    telefono: [''],
    email: ['', Validators.email]
  })

  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.itemId = Number(idParam);
      this.cargando.set(true);
      this.service.buscarPorId(this.itemId).subscribe({
        next: (item) => {
          this.form.patchValue({
            tipo: item.tipo,
            razonSocial: item.razonSocial,
            cuit: item.cuit,
            condicionIva: item.condicionIva ?? '',
            direccion: item.direccion ?? '',
            telefono: item.telefono ?? '',
            email: item.email ?? ''
          });
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el registro');
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
      tipo: valores.tipo as any,
      razonSocial: valores.razonSocial!,
      cuit: valores.cuit!,
      condicionIva: valores.condicionIva || undefined,
      direccion: valores.direccion || undefined,
      telefono: valores.telefono || undefined,
      email: valores.email || undefined
    };

    const accion = this.esEdicion
      ? this.service.actualizar(this.itemId!, request)
      : this.service.crear(request);

    accion.subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo guardar');
      }
    });
  }
}
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClienteProveedorService } from '../cliente-proveedor.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { CondicionIva, TipoClienteProveedor } from '../cliente-proveedor.model';
import { cuitValidator } from '../../../shared/validators/cuit.validator';
import { CiudadResponse, ProvinciaResponse } from '../ubicacion.model';
import { UbicacionService } from '../ubicacion.service';

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // saca los acentos/diacríticos
}

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatAutocompleteModule, MatButtonModule, BackButtonComponent, MatIconModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss'
})
export class ClienteFormComponent implements OnInit {
  itemId: number | null = null;
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');

  provincias = signal<ProvinciaResponse[]>([]);
  filtroProvincia = signal('');

  provinciasFiltradas = computed(() => {
    const termino = normalizarTexto(this.filtroProvincia().trim());
    if (!termino) return this.provincias();
    return this.provincias().filter((p) => normalizarTexto(p.nombre).includes(termino));
  });

  ciudades = signal<CiudadResponse[]>([]);
  filtroCiudad = signal('');

  ciudadesFiltradas = computed(() => {
    const termino = normalizarTexto(this.filtroCiudad().trim());
    if (!termino) return this.ciudades();
    return this.ciudades().filter((c) => normalizarTexto(c.nombre).includes(termino));
  });

  form;

  get esEdicion() {
    return this.itemId !== null;
  }

  cancelar() {
    this.router.navigate(['/clientes']);
  }

  constructor(
    private fb: FormBuilder,
    private service: ClienteProveedorService,
    private ubicacionService: UbicacionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      tipo: ['CLIENTE', Validators.required],
      razonSocial: ['', Validators.required],
      cuit: ['', [Validators.required, cuitValidator()]],
      condicionIva: [''],
      direccion: [''],
      provinciaId: [null as string | null],
      ciudadId: [null as string | null],
      telefono: [''],
      email: ['', Validators.email]
    });
  }

  ngOnInit() {
    this.ubicacionService.listarProvincias().subscribe((data) => this.provincias.set(data));

    let esPrimeraCarga = true;

    this.form.get('provinciaId')?.valueChanges.subscribe((provinciaId) => {
      this.ciudades.set([]);
      this.filtroCiudad.set('');

      // en la precarga de edición no queremos resetear la ciudad que ya viene seteada
      if (!esPrimeraCarga) {
        this.form.get('ciudadId')?.setValue(null);
      }
      esPrimeraCarga = false;

      if (provinciaId) {
        this.ubicacionService.listarCiudades(provinciaId).subscribe((data) => this.ciudades.set(data));
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
            razonSocial: item.razonSocial,
            cuit: item.cuit,
            condicionIva: item.condicionIva ?? '',
            direccion: item.direccion ?? '',
            telefono: item.telefono ?? '',
            email: item.email ?? ''
          });

          if (item.provinciaId) {
            this.form.get('provinciaId')?.setValue(item.provinciaId);
            this.ubicacionService.listarCiudades(item.provinciaId).subscribe((ciudades) => {
              this.ciudades.set(ciudades);
              this.form.get('ciudadId')?.setValue(item.ciudadId);
            });
          }

          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el registro');
          this.cargando.set(false);
        }
      });
    }
  }

  onProvinciaInput(valor: string) {
    this.filtroProvincia.set(valor);
  }

  onProvinciaSeleccionada(provinciaId: string) {
    this.form.get('provinciaId')?.setValue(provinciaId);
  }

  nombreProvinciaSeleccionada(): string {
    const id = this.form.get('provinciaId')?.value;
    const provincia = this.provincias().find((p) => p.id === id);
    return provincia?.nombre || '';
  }

  onCiudadInput(valor: string) {
    this.filtroCiudad.set(valor);
  }

  onCiudadSeleccionada(ciudadId: string) {
    this.form.get('ciudadId')?.setValue(ciudadId);
  }

  nombreCiudadSeleccionada(): string {
    const id = this.form.get('ciudadId')?.value;
    const ciudad = this.ciudades().find((c) => c.id === id);
    return ciudad?.nombre || '';
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
      tipo: valores.tipo as TipoClienteProveedor,
      razonSocial: valores.razonSocial!,
      cuit: valores.cuit!,
      condicionIva: (valores.condicionIva || undefined) as CondicionIva | undefined,
      direccion: valores.direccion || undefined,
      provinciaId: valores.provinciaId || undefined,
      ciudadId: valores.ciudadId || undefined,
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
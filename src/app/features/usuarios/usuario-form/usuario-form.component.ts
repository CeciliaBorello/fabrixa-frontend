import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioService } from '../usuario.service';
import { Rol } from '../usuario.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    BackButtonComponent
  ],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss'
})
export class UsuarioFormComponent implements OnInit {
  roles: Rol[] = [];
  usuarioId: number | null = null;
  cargando = false;
  error = '';

  form;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      rolId: [null as number | null, Validators.required]
    });
  }

  get esEdicion() {
    return this.usuarioId !== null;
  }

  ngOnInit() {
    this.usuarioService.listarRoles().subscribe((roles) => (this.roles = roles));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.usuarioId = Number(idParam);
      this.form.get('password')?.clearValidators();
      this.usuarioService.buscarPorId(this.usuarioId).subscribe((u) => {
        this.usuarioService.listarRoles().subscribe((roles) => {
          const rolEncontrado = roles.find((r) => r.nombre === u.rol);
          this.form.patchValue({
            nombre: u.nombre,
            email: u.email,
            rolId: rolEncontrado?.id ?? null
          });
        });
      });
    } else {
      this.form.get('password')?.setValidators(Validators.required);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.cargando = true;
    this.error = '';
    const valores = this.form.getRawValue();

    const request = {
      nombre: valores.nombre!,
      email: valores.email!,
      password: valores.password || null,
      rolId: valores.rolId
    };

    const accion = this.esEdicion
      ? this.usuarioService.actualizar(this.usuarioId!, request)
      : this.usuarioService.crear(request);

    accion.subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: (err) => {
        this.cargando = false;
        this.error = err.error ?? 'Ocurrió un error al guardar';
      }
    });
  }
}
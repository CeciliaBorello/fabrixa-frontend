import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnticipoService } from '../anticipo.service';
import { AnticipoResponse } from '../anticipo.model';
import { AnticipoFormComponent } from '../anticipo-form/anticipo-form-dialog.component';

export interface AnticipoListDialogData {
  empleadoId: number;
  empleadoNombre: string;
}

@Component({
  selector: 'app-anticipo-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './anticipo-list-dialog.component.html',
  styleUrl: './anticipo-list-dialog.component.scss'
})
export class AnticipoListDialogComponent implements OnInit {

  private anticipoService = inject(AnticipoService);
  private dialog = inject(MatDialog);

  private dialogRef = inject(
    MatDialogRef<AnticipoListDialogComponent>
  );

  public data = inject(
    MAT_DIALOG_DATA
  ) as AnticipoListDialogData;

  anticipos = signal<AnticipoResponse[]>([]);
  cargando = signal(true);
  columnas = ['fecha', 'monto', 'motivo', 'estado', 'usuario'];

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);

    this.anticipoService
      .porEmpleado(this.data.empleadoId)
      .subscribe((data) => {
        this.anticipos.set(data);
        this.cargando.set(false);
      });
  }

  nuevoAnticipo() {
    const ref = this.dialog.open(
      AnticipoFormComponent,
      {
        data: {
          empleadoId: this.data.empleadoId,
          empleadoNombre: this.data.empleadoNombre
        }
      }
    );

    ref.afterClosed().subscribe((creado) => {
      if (creado) {
        this.cargar();
      }
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
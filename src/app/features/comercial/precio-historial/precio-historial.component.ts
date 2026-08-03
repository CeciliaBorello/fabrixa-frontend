import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PrecioService } from '../precio.service';
import { PrecioResponse } from '../precio.model';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-precio-historial',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule, BackButtonComponent, MatIconModule],
  templateUrl: './precio-historial.component.html',
  styleUrl: './precio-historial.component.scss'
})
export class PrecioHistorialComponent implements OnInit {
  registros = signal<PrecioResponse[]>([]);
  cargando = signal(true);
  nombreProducto = signal('');

  columnas = ['fecha', 'precio', 'usuario', 'motivo'];

  constructor(private precioService: PrecioService, private route: ActivatedRoute) {}

  ngOnInit() {
    const productoId = Number(this.route.snapshot.paramMap.get('id'));
    this.precioService.historial(productoId).subscribe({
      next: (data) => {
        this.registros.set(data);
        if (data.length) this.nombreProducto.set(data[0].productoNombre);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
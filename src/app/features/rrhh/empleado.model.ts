export enum TipoRemuneracion {
  POR_HORA = 'POR_HORA',
  SUELDO_FIJO = 'SUELDO_FIJO'
}

export interface EmpleadoRequest {
  nombre: string;
  dni: string;
  tipoRemuneracion: TipoRemuneracion;
  valorHora: number | null;   // antes: number (obligatorio) — ahora condicional
  sueldoFijo: number | null;  // nuevo
  direccion?: string;
  telefono?: string;
  email?: string;
  fechaNacimiento?: string;
  fechaIngreso?: string;
  puesto?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaVinculo?: string;
  obraSocial?: string;
  observaciones?: string;
}

export interface EmpleadoResponse {
  id: number;
  nombre: string;
  dni: string;
  tipoRemuneracion: TipoRemuneracion;
  valorHora: number | null;   // antes: number — ahora puede ser null si es SUELDO_FIJO
  sueldoFijo: number | null;  // nuevo
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  fechaNacimiento: string | null;
  fechaIngreso: string | null;
  puesto: string | null;
  contactoEmergenciaNombre: string | null;
  contactoEmergenciaTelefono: string | null;
  contactoEmergenciaVinculo: string | null;
  obraSocial: string | null;
  observaciones: string | null;
  activo: boolean;
}
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function cuitValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = (control.value || '').toString().replace(/-/g, '').trim();

    if (!valor) return null; // el required se encarga de esto por separado

    if (!/^\d{11}$/.test(valor)) {
      return { cuitFormato: true };
    }

    const digitos = valor.split('').map(Number);
    const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

    const suma = digitos.slice(0, 10).reduce((acc: number, d: number, i: number) => acc + d * multiplicadores[i], 0);
    const resto = suma % 11;
    let verificador = 11 - resto;
    if (verificador === 11) verificador = 0;
    if (verificador === 10) return { cuitInvalido: true }; // no existe ese CUIT

    if (verificador !== digitos[10]) {
      return { cuitInvalido: true };
    }

    return null;
  };
}
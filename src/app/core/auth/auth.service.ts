import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoginRequest, LoginResponse } from './auth.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'fabrixa_token';
const USER_KEY = 'fabrixa_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<Omit<LoginResponse, 'token'> | null>(this.leerUsuarioGuardado());

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, request).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        const { token, ...usuario } = res;
        localStorage.setItem(USER_KEY, JSON.stringify(usuario));
        this.currentUser.set(usuario);
      })
    );
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private leerUsuarioGuardado() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }
}
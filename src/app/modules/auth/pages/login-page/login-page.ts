import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { IAuthenticactionRequest } from '../../interfaces/IAuth.interface';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login-page',
	imports: [
		CommonModule
		, FormsModule
		, ReactiveFormsModule
		, MatListModule
		, MatGridListModule
		, MatIconModule
		, MatFormFieldModule
		, MatInputModule
		, MatButtonModule
	],
	templateUrl: './login-page.html',
	styleUrl: './login-page.scss'
})
export class LoginPage {
	formLogin: FormGroup;
	isAnimated = false;
	errorMessage: string | null = null; 

	constructor(
		private fb: FormBuilder,
		private authService: Auth,
		private router: Router,
		private cdr: ChangeDetectorRef
	) {
		this.formLogin = this.fb.group({
			vUsuario: ['', [Validators.required, Validators.email]],
			vPassword: ['', Validators.required]
		});
	}

	onAuthentication() {

		this.errorMessage = null; 

		const payload: IAuthenticactionRequest = {
			vUsuario: this.formLogin.get("vUsuario")?.value,
			vPassword: this.formLogin.get("vPassword")?.value
		};

		this.authService.Authentication(payload).subscribe({
			next: (response) => {
				this.authService.saveSession(response.aData);
				this.router.navigate(['/dashboard']);
			},
			error: (err) => {
                if (err.error && err.error.vMessage) {
                    this.errorMessage = err.error.vMessage;
                } else {
                    this.errorMessage = 'Error de conexión. Inténtalo más tarde.';
                }
                // console.error('Ha ocurrido un error:', err);
				this.cdr.detectChanges();
			}
		});
	}

	onStartClick() {
		this.isAnimated = true;
	}
}
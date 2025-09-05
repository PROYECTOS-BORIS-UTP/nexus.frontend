import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

	constructor(
		private fb: FormBuilder,
		private authService: Auth,
		private router: Router
	) {
		this.formLogin = this.fb.group({
			vUsuario: ['', [Validators.required, Validators.email]],
			vPassword: ['', Validators.required]
		});
	}

	onAuthentication() {
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
				console.error('Ha ocurrido un error:', err);
			}
		});
	}

	onStartClick() {
		this.isAnimated = true;
	}
}
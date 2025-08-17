import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
	selector: 'app-login-page',
	imports: [
		CommonModule
		,FormsModule
		,ReactiveFormsModule
		,MatListModule
		,MatGridListModule
		,MatIconModule
		,MatFormFieldModule
		,MatInputModule
		,MatButtonModule
	],
	templateUrl: './login-page.html',
	styleUrl: './login-page.scss'
})
export class LoginPage {
	formLogin: FormGroup;
	isAnimated = false;
	// appearance: MatFormFieldAppearance = 'standard';

	constructor(
		private fb: FormBuilder
	) {
		this.formLogin = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', Validators.required]
		});
	}

	onSubmit() {
		if (this.formLogin.valid) {
			console.log('Login info:', this.formLogin.value);
		}
	}

	onStartClick() {
		this.isAnimated = true;
	}
}
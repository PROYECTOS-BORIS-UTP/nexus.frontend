import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-navbar',
	imports: [
		MatMenuModule
		, MatToolbarModule
		, MatIconModule
		, MatListModule
		, MatButtonModule
	],
	templateUrl: './navbar.html',
	styleUrl: './navbar.scss'
})
export class Navbar {

	setTheme(theme: string) {
		// Remove all known theme classes
		const themes = ['theme-indigo', 'theme-rose', 'theme-azure', 'theme-cyan'];
		document.documentElement.classList.remove(...themes);

		// Add the selected theme if it's not default
		if (theme !== 'default') {
			document.documentElement.classList.add(theme);
		}
	}
}

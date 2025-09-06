import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
	selector: 'app-navbar',
	imports: [
		MatMenuModule
		,MatToolbarModule
		,MatIconModule
		,MatListModule
	],
	templateUrl: './navbar.html',
	styleUrl: './navbar.scss'
})
export class Navbar {
	private menuCloseTimeout: any;

	openMegaMenu(trigger: MatMenuTrigger) {
		clearTimeout(this.menuCloseTimeout);
		trigger.openMenu();
	}

	closeMegaMenu(trigger: MatMenuTrigger) {
		this.menuCloseTimeout = setTimeout(() => {
			trigger.closeMenu();
		}, 50);
	}
}

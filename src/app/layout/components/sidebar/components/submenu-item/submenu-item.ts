import { Component, Input } from '@angular/core';
import { ISubMenuItem } from '../../interfaces/IMenu.interface';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-submenu-item',
	imports: [
		CommonModule
		,MatExpansionModule
		,MatListModule
		,MatIconModule
		,RouterModule
	],
	templateUrl: './submenu-item.html',
	styleUrl: './submenu-item.scss'
})
export class SubmenuItem {
	@Input() items: ISubMenuItem[] = [];
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IMenuItem } from '../../interfaces/IMenu.interface';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-menu-item',
	imports: [
		CommonModule
		,MatIconModule
		,MatTooltipModule
		,RouterModule
	],
	templateUrl: './menu-item.html',
	styleUrl: './menu-item.scss'
})
export class MenuItem {
	@Input() item!: IMenuItem;
	@Input() isActive: boolean = false;
	@Output() itemClick = new EventEmitter<IMenuItem>();

	onItemClicked(): void {
		this.itemClick.emit(this.item);
	}
}

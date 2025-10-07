import { Component, Input } from '@angular/core';
import { IBreadcrumbItem } from './interfaces/IBreadcrumb-item.interface';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-breadcrumb',
	imports: [
		CommonModule
		,RouterLink
		,MatIconModule
	],
	templateUrl: './breadcrumb.html',
	styleUrl: './breadcrumb.scss'
})
export class Breadcrumb {
	@Input() items: IBreadcrumbItem[] = [];
}
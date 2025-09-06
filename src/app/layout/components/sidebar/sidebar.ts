import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { IMenuItem } from './interfaces/IMenu.interface';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MenuItem } from "./components/menu-item/menu-item";
import { SubmenuItem } from "./components/submenu-item/submenu-item";
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-sidebar',
	imports: [
		CommonModule,
		MenuItem,
		MatListModule,
		MatMenuModule,
		SubmenuItem,
		MatTooltipModule,
	],
	templateUrl: './sidebar.html',
	styleUrl: './sidebar.scss'
})
export class Sidebar {
	@ViewChild('submenuPanel') submenuPanel!: ElementRef;

	isSubmenuOpen = false;
	selectedMenu: IMenuItem | null = null;

	// --- ARRAY ACTUALIZADO ---
	menuItems: IMenuItem[] = [
		{
			id: 1
			,icon: 'dashboard'
			, title: 'DS'
			, tooltip: 'Dashboard'
			, color: '#a808ed'
			, route: '/dashboard'
		},
		{
			id: 2
			,icon: 'groups_3'
			, title: 'RH'
			, tooltip: 'Recursos Humanos'
			, color: '#4ac3c2'
			, children: [
				{
					label: 'Colaboradores'
					, icon: 'groups_3'
					, route: '/seguridad'
					// children: [
					//     { label: 'Usuarios', route: '/seguridad/usuarios', icon: 'person' },
					//     { label: 'Perfiles', route: '/seguridad/perfiles', icon: 'group' }
					// ]
				},
				{
					label: 'Organigrama'
					, icon: 'groups_3'
					, route: '/seguridad'
					, children: [
						{
							label: 'Usuarios', route: '/seguridad/usuarios', icon: 'person'
							// ,children: [
							// 	{ label: 'Usuarios', route: '/seguridad/usuarios', icon: 'person' },
							// 	{ label: 'Perfiles', route: '/seguridad/perfiles', icon: 'group' }
							// ]
						},
						{ label: 'Perfiles', route: '/seguridad/perfiles', icon: 'group' }
					]
				}
			]
		},
		{
			id: 3
			,icon: 'local_shipping'
			, title: 'LO'
			, tooltip: 'Logística'
			, color: '#6744ff'
			, children: [
				{
					label: 'Proveedores',
					route: '/seguridad',
					children: [
						{ label: 'Usuarios', route: '/seguridad/usuarios', icon: 'person' },
						{ label: 'Perfiles', route: '/seguridad/perfiles', icon: 'group' }
					]
				},
			]
		},
		{
			id: 4
			,icon: 'credit_score'
			, title: 'FI'
			, tooltip: 'Finanzas'
			, color: '#ff9044'
			, children: []
		},
		{
			id: 5
			,icon: 'settings'
			, title: 'CO'
			, tooltip: 'Configuración'
			, color: '#44a2ff'
			, children: [
				{
					label: 'Seguridad'
					, icon: 'security'
					// ,route: '/seguridad'
					, children: [
						{ label: 'Usuarios', route: '/seguridad/usuario', icon: 'person' },
						{ label: 'Perfiles', route: '/seguridad/usuario', icon: 'group' }
					]
				},
				{
					label: 'Maestras'
					, icon: 'cast_for_education'
					, route: '/maestras'
					, children: [
						{ label: 'Usuarios', route: '/seguridad/usuario', icon: 'person' },
						{ label: 'Perfiles', route: '/seguridad/usuario', icon: 'group' }
					]
				},
			]
		},
	];


	toggleSubmenu(item: IMenuItem) {
		// Si se hace clic en un item sin hijos, no hacemos nada aquí
		if (!item.children || item.children.length === 0) {
			this.isSubmenuOpen = false;
			this.selectedMenu = null;
			return;
		}

		// Lógica para abrir/cerrar el panel
		if (this.selectedMenu === item && this.isSubmenuOpen) {
			this.isSubmenuOpen = false;
			this.selectedMenu = null;
		} else {
			this.selectedMenu = item;
			this.isSubmenuOpen = true;
		}
	}

	// 5. Simplifica el HostListener
	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		if (!this.isSubmenuOpen) {
			return;
		}

		// Cierra el panel si el clic es fuera de él
		const clickedInsidePanel = this.submenuPanel.nativeElement.contains(event.target);

		// También verifica que no se haya hecho clic en uno de los botones del menú principal
		const clickedOnMenuItem = (event.target as HTMLElement).closest('app-menu-item');

		if (!clickedInsidePanel && !clickedOnMenuItem) {
			this.isSubmenuOpen = false;
			this.selectedMenu = null;
		}
	}
}

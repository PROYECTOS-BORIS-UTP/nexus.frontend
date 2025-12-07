import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MenuItem } from "./components/menu-item/menu-item";
import { SubmenuItem } from "./components/submenu-item/submenu-item";
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Auth } from '../../../modules/auth/services/auth';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/dialogs/confirm-dialog/confirm-dialog';

import { IOpcionByUserRequest, IOpcionByUserResponse } from '../../interfaces/ISideBar.interface';
import { Observable } from 'rxjs';
import { LayoutService } from '../../services/layout';

@Component({
	selector: 'app-sidebar',
	imports: [
		CommonModule,
		MenuItem,
		MatListModule,
		MatMenuModule,
		SubmenuItem,
		MatTooltipModule,
		MatIcon,
	],
	templateUrl: './sidebar.html',
	styleUrl: './sidebar.scss'
})
export class Sidebar {
	@ViewChild('submenuPanel') submenuPanel!: ElementRef;

	// Inyección de dependencias moderna con inject()
	private readonly dialog = inject(MatDialog);
	private readonly authService = inject(Auth);
	private readonly layoutService = inject(LayoutService);
	private readonly router = inject(Router);

	isSubmenuOpen = false;
	selectedMenu: IOpcionByUserResponse | null = null;
	menuItems: IOpcionByUserResponse[] = [];

	menuItems$: Observable<IOpcionByUserResponse[]>;

	constructor() {
		this.menuItems$ = this.layoutService.menuItems$;
	}

	ngOnInit(): void {
		this.loadMenuOptions();
	}

	//#region CARGAR OPCIONES DEL MENÚ
	/*
	 * @description Carga las opciones del menú desde el backend.
	 */
	private loadMenuOptions(): void {
		const user = this.authService.getUser();

		if (!user || !user.iIdUsuario) {
			console.error("No se pudo obtener el ID del usuario para cargar el menú.");
			this.authService.logout();
			this.router.navigate(['/login']);
			return;
		}

		const payload: IOpcionByUserRequest = { iIdUsuario: user.iIdUsuario };

		this.layoutService.loadMenuOptions(payload).subscribe({
			error: (err) => {
				const apiError = err.error;
				console.error(`Error ${apiError?.vStatus}: ${apiError?.vMessage}`, err);
			}
		});
	}

	//#region LOGOUT
	/*
	* Esta es la función que llama tu botón
	*/
	abrirDialogoLogout(): void {
		const dialogRef = this.dialog.open(ConfirmDialog);
		dialogRef.afterClosed().subscribe(resultado => {
			if (resultado === true) {
				this.authService.logout();
				this.layoutService.clearMenuOnLogout();
				this.router.navigate(['/login']);
			}
		});
	}
	//#endRegion

	//#region TOGGLE SUBMENU
	/*
	 * @description Maneja la apertura y cierre del submenú.
	 * @param item El ítem del menú que fue clickeado.
	 */
	toggleSubmenu(item: IOpcionByUserResponse) {
		if (!item.children || item.children.length === 0) {
			this.isSubmenuOpen = false;
			this.selectedMenu = null;
			if (item.vRuta) {
				this.router.navigate([item.vRuta]);
			}
			return;
		}

		// Lógica para abrir/cerrar el panel
		if (this.selectedMenu?.iIdOpcion === item.iIdOpcion && this.isSubmenuOpen) {
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
		const clickedInsidePanel = this.submenuPanel.nativeElement.contains(event.target);
		const clickedOnMenuItem = (event.target as HTMLElement).closest('app-menu-item');

		if (!clickedInsidePanel && !clickedOnMenuItem) {
			this.isSubmenuOpen = false;
			this.selectedMenu = null;
		}
	}

	closeSubmenu(): void {
		this.isSubmenuOpen = false;
		this.selectedMenu = null;
	}
}

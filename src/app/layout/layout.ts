import { Component } from '@angular/core';
import { Sidebar } from './components/sidebar/sidebar';
import { Navegacion } from './components/navegacion/navegacion';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { Breadcumb } from './components/breadcrumb/services/breadcumb';
import { Breadcrumb } from './components/breadcrumb/breadcrumb';

@Component({
    selector: 'app-layout',
    imports: [
        CommonModule,
        RouterModule,
        Sidebar,
        // Navegacion,
        Navbar,
        Breadcrumb
    ],
    templateUrl: './layout.html',
    styleUrl: './layout.scss'
})
export class Layout {
    constructor(public breadcrumbService: Breadcumb) {}	
}

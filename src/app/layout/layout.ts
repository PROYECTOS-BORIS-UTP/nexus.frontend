import { Component } from '@angular/core';
import { Sidebar } from './components/sidebar/sidebar';
import { Navegacion } from './components/navegacion/navegacion';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";

@Component({
    selector: 'app-layout',
    imports: [
        CommonModule,
        RouterModule,
        Sidebar,
        // Navegacion,
        Navbar
    ],
    templateUrl: './layout.html',
    styleUrl: './layout.scss'
})
export class Layout {

}

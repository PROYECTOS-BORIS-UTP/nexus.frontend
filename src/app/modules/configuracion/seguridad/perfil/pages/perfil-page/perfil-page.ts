/*import { Component } from '@angular/core';

@Component({
  selector: 'app-perfil-page',
  imports: [],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.scss'
})
export class PerfilPage {

}
/*
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

// 1. Interfaz que simula el resultado del JOIN de las tablas:
// Usuario (idUsuario, usuario, activo) + Perfil (perfil, descripcion)
interface PerfilUsuarioVista {
  idUsuario: number;
  usuario: string;
  perfil: string;
  descripcion: string;
  activo: boolean; // Coincide con bActivo en la DB
}

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  // Solo se necesita CommonModule y FormsModule para la vista y el filtro
  imports: [CommonModule, FormsModule], 
  templateUrl: './perfil-page.html',
  styleUrls: ['./perfil-page.scss']
})
export class PerfilPage implements OnInit {

  // Almacena todos los perfiles cargados (simulación)
  public todosLosPerfiles: PerfilUsuarioVista[] = [];
  // Almacena los perfiles que se mostrarán en la vista (filtrada)
  public perfilesMostrados: PerfilUsuarioVista[] = [];

  // Variable para el input de búsqueda
  public filtroBusqueda: string = '';

  ngOnInit(): void {
    // Carga de datos estáticos simulando la respuesta del backend
    this.cargarPerfilesSimulados();
  }

  // 2. Función de carga de datos estáticos
  cargarPerfilesSimulados(): void {
    this.todosLosPerfiles = [
      { idUsuario: 1, usuario: 'admin', perfil: 'Administrador', descripcion: 'Acceso total al sistema', activo: true },
      { idUsuario: 2, usuario: 'jlopez', perfil: 'Operador', descripcion: 'Acceso limitado a reportes', activo: true },
      { idUsuario: 3, usuario: 'mvaldez', perfil: 'Invitado', descripcion: 'Solo lectura', activo: false },
      { idUsuario: 4, usuario: 'srodriguez', perfil: 'Supervisor', descripcion: 'Revisión y aprobación de procesos', activo: true },
      { idUsuario: 5, usuario: 'anavarro', perfil: 'Auditor', descripcion: 'Consulta de logs históricos', activo: true },
      { idUsuario: 6, usuario: 'jgarcia', perfil: 'Invitado', descripcion: 'Solo lectura', activo: false }
    ];
    // Inicialmente, se muestran todos los perfiles
    this.perfilesMostrados = [...this.todosLosPerfiles];
  }

  // 3. Lógica para filtrar la tabla
  aplicarFiltro(): void {
    const textoFiltro = this.filtroBusqueda.toLowerCase().trim();

    if (!textoFiltro) {
      this.perfilesMostrados = [...this.todosLosPerfiles];
      return;
    }

    this.perfilesMostrados = this.todosLosPerfiles.filter(perfil => {
      // Búsqueda en múltiples campos (ID, usuario, perfil y descripción)
      return (
        String(perfil.idUsuario).includes(textoFiltro) ||
        perfil.usuario.toLowerCase().includes(textoFiltro) ||
        perfil.perfil.toLowerCase().includes(textoFiltro) ||
        perfil.descripcion.toLowerCase().includes(textoFiltro)
      );
    });
  }

  // 4. Función de acción simulada
  editarPerfil(perfil: PerfilUsuarioVista): void {
    console.log('Abriendo opciones de edición para:', perfil.usuario);
    alert(`Acción: Abrir modal de edición para el perfil de ${perfil.usuario}`);
  }
}
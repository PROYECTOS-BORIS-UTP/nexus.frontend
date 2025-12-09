# Nexus Frontend

Este proyecto es la interfaz de usuario para el sistema Nexus, desarrollado con [Angular CLI](https://github.com/angular/angular-cli).

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- [Angular CLI](https://github.com/angular/angular-cli):
  ```bash
  npm install -g @angular/cli
  ```

## Configuración e Instalación

1. Clonar el repositorio.
2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

## Ejecutar el Servidor de Desarrollo

Para levantar el servidor local y abrir la aplicación automáticamente en tu navegador por defecto, ejecuta:

```bash
ng serve -o
```

La aplicación estará disponible en `http://localhost:4200/`. La página se recargará automáticamente si realizas cambios en el código fuente.

## Generación de Componentes

Para generar un nuevo componente puedes usar:

```bash
ng generate component nombre-componente
```

## Construcción (Build)

Para compilar el proyecto para producción:

```bash
ng build
```

Los artefactos de construcción se almacenarán en el directorio `dist/`.

## Ayuda

Para más opciones de ayuda sobre Angular CLI:
```bash
ng help
```

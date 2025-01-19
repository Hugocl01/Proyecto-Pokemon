# Proyecto-Pokémon

Este proyecto es una [Aplicación web](https://dwec-pokemon.netlify.app/) que permite a los usuarios explorar, comparar y gestionar información sobre Pokémon. Los usuarios pueden ver detalles de cada Pokémon y comparar estadísticas entre dos Pokémon.

## Integrantes
 - Hugo
 - Víctor.
 - Ruben
 - Nestor

## Descripción

Este proyecto es una aplicación web que permite a los usuarios explorar, comparar y gestionar información sobre Pokémon. Los usuarios pueden ver detalles de cada Pokémon y comparar estadísticas entre dos Pokémon.

## Características

- **Explora la Pokédex**: Navega por la Pokédex y descubre nuevos Pokémon.
- **Detalles del Pokémon**: Visualiza información detallada de cada Pokémon, incluyendo sus evoluciones, estadísticas y habilidades.
- **Comparador de Pokémon**: Compara las estadísticas de dos Pokémon.
- **Generador y gestor de equipos**: Crea tu propio equipo de Pokémon (en proceso de implementación).
- **Batalla entre Pokémon**: Simula batallas entre tus Pokémon (en proceso de implementación).

## Tecnologías Usadas

- **HTML5**, **CSS3** y **JavaScript**: para la construcción del frontend.
- **IndexedDB**: para almacenamiento local de los datos.
- **PokeAPI**: para obtener la información de los Pokémon.

## Estrucutra del Proyecto

Esqueleto de la estructura de archivos y carpetas del proyecto.

```
├── css/                        # Carpeta para archivos CSS
│   └── style.css               # Hoja de estilos principal
├── docs/                       # Carpeta para documentación
│   ├── Arquitectura.drawio     # Diagrama de arquitectura del proyecto
│   └── UD3E10 proyecto.pdf     # Documento del proyecto
│   └── web                     # Web estática con el JSDoc del proyecto
├── html/                       # Carpeta para los archivos HTML
│   ├── comparador.html         # Página para comparar características entre dos Pokémon
│   ├── detalle.html            # Página con información detallada de un Pokémon
│   ├── equipos.html            # Página para gestionar equipos de Pokémon
│   ├── jugar.html              # Página para hacer combates Pokémon
│   ├── pokedex.html            # Página principal de la Pokédex
├── img/                        # Carpeta para imágenes
├── js/                         # Carpeta para archivos JavaScript
│   ├── helpers/                # Carpeta para funciones auxiliares (utilidades, manejo de datos, etc.)
│   │   ├── indexedDB.js        # Manejo de la base de datos IndexedDB
│   │   ├── localStorage.js     # Manejo del almacenamiento local
│   │   └── ui.js               # Manejo de la interfaz de usuario
│   │   └── utils.js            # Funciones utilitarias generales
│   ├── models/                 # Carpeta para clases y modelos de datos
│   │   ├── Equipo.js           # Clase para representar un equipo de Pokémon
│   │   └── Pokemon.js          # Clase para representar un Pokémon
│   ├── carrusel.js             # Lógica para un carrusel de elementos
│   ├── comparador.js           # Lógica para la comparación entre dos Pokémon
│   ├── detalle.js              # Lógica para mostrar detalles de un Pokémon
│   ├── main.js                 # Archivo principal de JavaScript (punto de entrada)
│   └── pokedex.js              # Lógica específica de la Pokédex
├── .editorconfig               # Configuración del editor de código
├── .gitignore                  # Archivo para ignorar archivos al hacer commit
├── index.html                  # Página de inicio de la aplicación
├── jsdoc.json                  # Configuración para generar documentación JSDoc
├── manifest.appcache           # Manifesto para caché en la aplicación web
├── package-lock.json           # Información sobre las dependencias instaladas
├── package.json                # Archivo de configuración de npm
└── README.md                   # Archivo README con información general del proyecto
```

## Diagrama de Gantt

Diagrama de Gantt con las tareas y su programación en el tiempo.

| Tarea                                           | 10  | 11  | 12  | 13  | 14  | 15  | 16  | 17  | 18  | 19  | 20  |
| ----------------------------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Análisis de requisitos                          | ██  | ██  | ██  | ██  |     |     |     |     |     |     |     |
| Diseño de la arquitectura                       |     | ██  | ██  | ██  |     |     |     |     |     |     |     |
| Implementación: Buscador y ficha de Pokémon     |     |     | ██  | ██  | ██  | ██  |     |     |     |     |     |
| Implementación: Comparador de Pokémon           |     |     |     |     |     | ██  | ██  | ██  | ██  |     |     |
| Implementación: Generador y gestor de equipos   |     |     |     |     |     |     |     | ██  | ██  | ██  |     |
| Implementación: Batalla entre Pokémon o equipos |     |     |     |     |     |     |     |     | ██  | ██  | ██  |
| Optimización y caché                            |     |     |     |     |     |     |     |     |     | ██  | ██  |
| Pruebas y correcciones                          |     |     |     |     |     |     |     |     |     | ██  | ██  |
| Documentación del proyecto                      |     |     |     |     |     |     |     |     | ██  | ██  | ██  |
| Preparación de la presentación                  |     |     |     |     |     |     |     |     |     | ██  | ██  |
| Entrega y defensa del proyecto                  |     |     |     |     |     |     |     |     |     |     | ██  |

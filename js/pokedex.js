'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones, mostrarSpinner, ocultarSpinner, mostrarFichaPokemon, limpiarDatosPokemon, modificarImagenHeader } from "./utils.js";
import { app } from "./main.js";

let pokemons = [];
let inicio = 0;
const cantidad = 12;

async function cargaInicial() {
    mostrarSpinner();
    const datosExisten = await existeDatosEnGeneraciones();

    if (!datosExisten) {
        const generaciones = await app.obtenerDatosPokemon();

        if (generaciones) {
            await guardarDatosPokemon(generaciones);
        }
    }

    pokemons = await app.obtenerDatosDesdeIndexedDB('todos');

    if (pokemons.length) {
        mostrarFichaPokemon(pokemons, inicio, cantidad);
        inicio += cantidad;

        if (pokemons.length > cantidad) {
            document.getElementById('cargarMas').style.display = 'block';
        }
    }

    ocultarSpinner();
}

async function desencadenadorEventoBuscarPokemon(inputNombrePokemon, selectGeneracion, botonCargarMas = null) {
    inicio = 0;
    selectGeneracion.value = 'all';
    const idPokemon = parseInt(inputNombrePokemon.value);
    let camposFiltro = [];

    if (idPokemon) {
        camposFiltro = ['id', idPokemon];
    } else {
        camposFiltro = ['name', inputNombrePokemon.value];
    }

    pokemons = await app.obtenerDatosDesdeIndexedDB(camposFiltro[0], camposFiltro[1]);

    if (Array.isArray(pokemons)) { // Puede ser un array de pokemons = por NOMBRE o parte del NOMBRE
        mostrarFichaPokemon(pokemons, inicio, cantidad);
        inicio += cantidad;

        if (botonCargarMas) {
            if (pokemons.length > cantidad) {
                botonCargarMas.style.display = 'block';
            } else {
                botonCargarMas.style.display = 'none';
            }
        }
    } else {
        mostrarFichaPokemon(pokemons); // Puede ser un objeto = por ID

        if (botonCargarMas) {
            botonCargarMas.style.display = 'none';
        }
    }
}

async function desencadenadorEventoLimpiar(contenedorFichas, inputNombrePokemon, selectGeneracion) {
    inicio = 0;
    contenedorFichas.innerHTML = '';
    inputNombrePokemon.value = '';
    selectGeneracion.value = 'all';
    await cargaInicial();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Modificar la imagen del header al hacer hover
    modificarImagenHeader(await app.obtenerMaxPokemons());

    // Recoger elementos del HTML
    const inputNombrePokemon = document.getElementById('buscarNombre');
    const selectGeneracion = document.getElementById('generationFilter');
    const contenedorFichas = document.querySelector('.contenedor-fichas');
    const botonCargarMas = document.getElementById('cargarMas');
    const botonVolverArriba = document.getElementById('volverArriba');

    // Al cargar realizar la obtención de los datos y mostrar pokémons
    await cargaInicial();

    // EVENTO - Select generación
    selectGeneracion.addEventListener('change', async (event) => {
        //mostrarSpinner();
        pokemons = [];
        inicio = 0;
        const generacionSeleccionada = event.target.value;

        if (generacionSeleccionada === 'all') {
            pokemons = await app.obtenerDatosDesdeIndexedDB('todos');
        } else {
            pokemons = await app.obtenerDatosDesdeIndexedDB('generacion', generacionSeleccionada);
        }

        if (pokemons.length) {
            mostrarFichaPokemon(pokemons, inicio, cantidad);
            inicio += cantidad;

            if (pokemons.length > cantidad) {
                botonCargarMas.style.display = 'block';
            } else {
                botonCargarMas.style.display = 'none';
            }
        }

        //ocultarSpinner();
    });

    // EVENTO - Contenedor búsqueda (botón 'Buscar' y 'Limpiar')
    document.querySelector('.contenedor-busqueda-nombre').addEventListener('click', async (event) => {
        if (event.target && event.target.tagName === 'INPUT' && event.target.type === 'button') {
            const accion = event.target.dataset.accion;
            pokemons = [];

            switch (accion) {
                case 'buscar':
                    await desencadenadorEventoBuscarPokemon(inputNombrePokemon, selectGeneracion, botonCargarMas);
                    break;
                case 'limpiar':
                    await desencadenadorEventoLimpiar(contenedorFichas, inputNombrePokemon, selectGeneracion);
                    break;
            }
        }
    });

    // EVENTO - Botón "Cargar más"
    botonCargarMas.addEventListener('click', () => {
        mostrarFichaPokemon(pokemons, inicio, cantidad);
        inicio += cantidad;

        if (inicio >= pokemons.length) {
            botonCargarMas.style.display = 'none';
        }
    });

    // EVENTO - Mostrar/Ocultar botón "Volver arriba"
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            botonVolverArriba.style.display = 'block';
        } else {
            botonVolverArriba.style.display = 'none';
        }
    });

    // EVENTO - Botón "Volver arriba"
    botonVolverArriba.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // EVENTO - Limpiar al presionar F1
    document.addEventListener('keydown', async (event) => {
        if (event.key === 'F1') {
            event.preventDefault();
            await desencadenadorEventoLimpiar(contenedorFichas, inputNombrePokemon, selectGeneracion);
        }
    });

    // EVENTO - vaciar tabla 'generaciones' de IndexedDB (para pruebas en desarrollo)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'F2') {
            limpiarDatosPokemon();
        }
    });

    // EVENTO - Buscar al presionar Enter en el input de búsqueda
    inputNombrePokemon.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            await desencadenadorEventoBuscarPokemon(inputNombrePokemon, selectGeneracion, botonCargarMas);
        }
    });
});
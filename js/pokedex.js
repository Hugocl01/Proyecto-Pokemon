'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones, mostrarSpinner, ocultarSpinner, mostrarFichaPokemon, limpiarDatosPokemon } from "./utils.js";
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

document.addEventListener('DOMContentLoaded', async () => {
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

                        if (pokemons.length > cantidad) {
                            botonCargarMas.style.display = 'block';
                        } else {
                            botonCargarMas.style.display = 'none';
                        }
                    } else {
                        mostrarFichaPokemon(pokemons); // Puede ser un objeto = por ID
                        botonCargarMas.style.display = 'none';
                    }

                    break;
                case 'limpiar':
                    inicio = 0;
                    contenedorFichas.innerHTML = '';
                    inputNombrePokemon.value = '';
                    selectGeneracion.value = 'all';
                    await cargaInicial();
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

    // EVENTO - vaciar tabla 'generaciones' de IndexedDB (para pruebas en desarrollo)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'F2') {
            limpiarDatosPokemon();
        }
    });
});
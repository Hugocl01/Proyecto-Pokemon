/**
 * @fileoverview Manejo de la lógica principal para cargar, buscar, comparar y mostrar información sobre Pokémon.
 * @module comparador
 */

'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones, limpiarDatosPokemon } from "./helpers/indexedDB.js";
import { mostrarSpinner, ocultarSpinner, mostrarFichaPokemon, modificarImagenHeader, devolverDetallePokemon, comparar } from "./helpers/ui.js";
import { app } from "./main.js";
import Pokemon from "./models/Pokemon.js";

let pokemons = [];

// Contenedor para el primer Pokémon
const divPokemon1 = document.querySelector('#pokemon1');

// Contenedor para el segundo Pokémon
const divPokemon2 = document.querySelector('#pokemon2');

/**
 * Carga inicial de datos y muestra los Pokémon almacenados.
 * @async
 * @function cargaInicial
 */
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

    if (pokemons) {
        mostrarFichaPokemon(pokemons, 0, pokemons.length);
    }

    ocultarSpinner();
}

/**
 * Busca un Pokémon por nombre o ID.
 * @async
 * @function desencadenadorEventoBuscarPokemon
 * @param {HTMLInputElement} inputNombrePokemon - Input donde se escribe el nombre o ID del Pokémon.
 * @param {HTMLSelectElement} selectGeneracion - Select para filtrar por generación.
 */
async function desencadenadorEventoBuscarPokemon(inputNombrePokemon, selectGeneracion) {
    selectGeneracion.value = 'all';
    const idPokemon = parseInt(inputNombrePokemon.value);
    let camposFiltro = [];

    if (idPokemon) {
        camposFiltro = ['id', idPokemon];
    } else {
        camposFiltro = ['name', inputNombrePokemon.value];
    }

    pokemons = await app.obtenerDatosDesdeIndexedDB(camposFiltro[0], camposFiltro[1]);

    if (pokemons) {
        mostrarFichaPokemon(pokemons);
    }
}

/**
 * Limpia los datos de la pantalla y reinicia la carga inicial.
 * @async
 * @function desencadenadorEventoLimpiar
 * @param {HTMLElement} contenedorFichas - Contenedor donde se muestran los Pokémon.
 * @param {HTMLInputElement} inputNombrePokemon - Input de búsqueda.
 * @param {HTMLSelectElement} selectGeneracion - Select para filtrar por generación.
 */
async function desencadenadorEventoLimpiar(contenedorFichas, inputNombrePokemon, selectGeneracion) {
    contenedorFichas.innerHTML = '';
    inputNombrePokemon.value = '';
    selectGeneracion.value = 'all';
    await cargaInicial();
}

/**
 * Carga las tarjetas de Pokémon en base a los parámetros de la URL.
 * @async
 * @function cargarTarjetas
 */
async function cargarTarjetas() {
    const validarIDUrl = async (datosPokemon) => {
        if (Array.isArray(datosPokemon) && !datosPokemon.length) {
            alert('Pokémon no encontrado'); // Muestra un mensaje si no se encuentra el Pokémon
            window.location.href = 'comparador.html';
            return;
        }
    }

    const params = new URLSearchParams(window.location.search);
    const mensejeSeleccion = '<p>Selecciona un pokémon</p>';

    switch (params.size) {
        case 0: {
            divPokemon1.innerHTML = mensejeSeleccion;
            divPokemon2.innerHTML = mensejeSeleccion;
        }
            break;

        case 1: {
            const idPokemon1 = parseInt(params.get('pokemon1'));
            const idPokemon2 = parseInt(params.get('pokemon2'));

            if (params.has('pokemon1') && idPokemon1) {
                const datosPokemon = await app.obtenerDatosDesdeIndexedDB('id', idPokemon1);
                validarIDUrl(datosPokemon);
                const pokemon1 = new Pokemon(datosPokemon);
                divPokemon1.innerHTML = devolverDetallePokemon(pokemon1);
                divPokemon2.innerHTML = mensejeSeleccion;
            }

            if (params.has('pokemon2') && idPokemon2) {
                const datosPokemon = await app.obtenerDatosDesdeIndexedDB('id', idPokemon2);
                validarIDUrl(datosPokemon);
                const pokemon2 = new Pokemon(datosPokemon);
                divPokemon2.innerHTML = devolverDetallePokemon(pokemon2);
                divPokemon1.innerHTML = mensejeSeleccion;
            }
        }
            break;

        case 2: {
            if (params.has('pokemon1') && params.has('pokemon2')) {
                const idPokemon1 = parseInt(params.get('pokemon1'));
                const idPokemon2 = parseInt(params.get('pokemon2'));

                const datosPokemon1 = await app.obtenerDatosDesdeIndexedDB('id', idPokemon1);
                validarIDUrl(datosPokemon1);

                const datosPokemon2 = await app.obtenerDatosDesdeIndexedDB('id', idPokemon2);
                validarIDUrl(datosPokemon2);

                const pokemon1 = new Pokemon(datosPokemon1);
                const pokemon2 = new Pokemon(datosPokemon2);

                divPokemon1.innerHTML = devolverDetallePokemon(pokemon1);
                divPokemon2.innerHTML = devolverDetallePokemon(pokemon2);

                comparar(pokemon1, pokemon2);
            }
        }
            break;

        default: {
            console.error("Parámetros URL inválidos");
        }
            break;
    }
}

// Vincula el evento después de insertar el HTML
document.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('eliminar-pokemon')) {
        event.preventDefault();

        // Obtener el ID del Pokémon a eliminar
        const pokemonId = event.target.getAttribute('data-pokemon-id');

        // Actualizar los parámetros de la URL
        const params = new URLSearchParams(window.location.search);

        if (params.has('pokemon1') && params.get('pokemon1') === pokemonId) {
            params.delete('pokemon1');
        } else if (params.has('pokemon2') && params.get('pokemon2') === pokemonId) {
            params.delete('pokemon2');
        }

        // Redirigir a la nueva URL
        const nuevaURL = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.location.href = nuevaURL;
    }
});

// Eventos globales
document.addEventListener('DOMContentLoaded', async () => {
    // Modificar la imagen del header
    modificarImagenHeader(await app.obtenerMaxPokemons());

    const inputNombrePokemon = document.getElementById('buscarNombre');
    const selectGeneracion = document.getElementById('generationFilter');
    const contenedorFichas = document.querySelector('.contenedor-fichas');

    await cargaInicial();
    await cargarTarjetas();

    // Filtrar por generación
    selectGeneracion.addEventListener('change', async (event) => {
        pokemons = [];
        const generacionSeleccionada = event.target.value;

        if (generacionSeleccionada === 'all') {
            pokemons = await app.obtenerDatosDesdeIndexedDB('todos');
        } else {
            pokemons = await app.obtenerDatosDesdeIndexedDB('generacion', generacionSeleccionada);
        }

        if (pokemons) {
            mostrarFichaPokemon(pokemons);
        }
    });

    // Buscar o limpiar usando los botones
    document.querySelector('.contenedor-busqueda-nombre').addEventListener('click', async (event) => {
        if (event.target && event.target.tagName === 'INPUT' && event.target.type === 'button') {
            const accion = event.target.dataset.accion;

            switch (accion) {
                case 'buscar':
                    await desencadenadorEventoBuscarPokemon(inputNombrePokemon, selectGeneracion);
                    break;
                case 'limpiar':
                    await desencadenadorEventoLimpiar(contenedorFichas, inputNombrePokemon, selectGeneracion);
                    break;
            }
        }
    });

    // Limpiar con F1
    document.addEventListener('keydown', async (event) => {
        if (event.key === 'F1') {
            event.preventDefault();
            await desencadenadorEventoLimpiar(contenedorFichas, inputNombrePokemon, selectGeneracion);
        }
    });

    // Vaciar IndexedDB con F2
    document.addEventListener('keydown', (event) => {
        if (event.key === 'F2') {
            limpiarDatosPokemon();
        }
    });

    // Buscar con Enter
    inputNombrePokemon.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            await desencadenadorEventoBuscarPokemon(inputNombrePokemon, selectGeneracion);
        }
    });
});

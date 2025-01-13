'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones, mostrarSpinner, ocultarSpinner, mostrarFichaPokemon, limpiarDatosPokemon } from "./utils.js";
import { app } from "./main.js";

async function cargaInicial() {
    mostrarSpinner();
    const datosExisten = await existeDatosEnGeneraciones();

    if (!datosExisten) {
        const generaciones = await app.obtenerDatosPokemon();

        if (generaciones) {
            await guardarDatosPokemon(generaciones);
        }
    }

    const pokemons = await app.obtenerDatosDesdeIndexedDB('todos');

    if (pokemons) {
        mostrarFichaPokemon(pokemons);
    }

    ocultarSpinner();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Recoger elementos del HTML
    const inputNombrePokemon = document.getElementById('buscarNombre');
    const selectGeneracion = document.getElementById('generationFilter');
    const contenedorFichas = document.querySelector('.contenedor-fichas');

    // Al cargar realizar la obtención de los datos y mostrar pokémons
    await cargaInicial();

    // EVENTO - Select generación
    selectGeneracion.addEventListener('change', async (event) => {
        //mostrarSpinner();
        let pokemons;
        const generacionSeleccionada = event.target.value;

        if (generacionSeleccionada === 'all') {
            pokemons = await app.obtenerDatosDesdeIndexedDB('todos');
        } else {
            pokemons = await app.obtenerDatosDesdeIndexedDB('generacion', generacionSeleccionada);
        }

        if (pokemons) {
            mostrarFichaPokemon(pokemons);
        }

        //ocultarSpinner();
    });

    // EVENTO - Contenedor búsqueda (botón 'Buscar' y 'Limpiar')
    document.querySelector('.contenedor-busqueda-nombre').addEventListener('click', async (event) => {
        if (event.target && event.target.tagName === 'INPUT' && event.target.type === 'button') {
            const accion = event.target.dataset.accion;

            switch (accion) {
                case 'buscar':
                    selectGeneracion.value = 'all';
                    const pokemon = await app.obtenerDatosDesdeIndexedDB('name', inputNombrePokemon.value);

                    if (pokemon) {
                        mostrarFichaPokemon(pokemon);
                    }
                    break;
                case 'limpiar':
                    contenedorFichas.innerHTML = '';
                    inputNombrePokemon.value = '';
                    selectGeneracion.value = 'all';
                    await cargaInicial();
                    break;
            }
        }
    });

    // EVENTO - vaciar tabla 'generaciones' de IndexedDB (para pruebas en desarrollo)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'F2') {
            limpiarDatosPokemon();
        }
    });
});

// Obtener el ID del Pokémon desde la URL
const params = new URLSearchParams(window.location.search);
const id1 = parseInt(params.get('pokemon1'), 10);
const id2 = parseInt(params.get('pokemon2'), 10);

// Buscar el Pokémon
const pokemon1 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', id1));
const pokemon2 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', id2));

if (!pokemon1) {
    alert('Pokémon no encontrado');
}

if (!pokemon2) {
    alert('Pokémon no encontrado');
}

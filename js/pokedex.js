'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones, mostrarSpinner, ocultarSpinner, mostrarFichaPokemon } from "./utils.js";
import { app } from "./main.js";

document.addEventListener('DOMContentLoaded', async () => {
    mostrarSpinner();
    const datosExisten = await existeDatosEnGeneraciones();

    if (!datosExisten) {
        const generaciones = await app.obtenerDatosPokemon();

        if (generaciones) {
            await guardarDatosPokemon(generaciones);
        }
    }

    mostrarFichaPokemon(await app.obtenerDatosDesdeIndexedDB('todos'));
    ocultarSpinner();

    const selectGeneracion = document.getElementById('generationFilter');
    selectGeneracion.addEventListener('change', async (event) => {
        mostrarSpinner();
        const generacionSeleccionada = event.target.value;

        if (generacionSeleccionada === 'all') {
            mostrarFichaPokemon(await app.obtenerDatosDesdeIndexedDB('todos'));
        } else {
            mostrarFichaPokemon(await app.obtenerDatosDesdeIndexedDB('generacion', generacionSeleccionada));
        }

        ocultarSpinner();
    });

    const nombre = document.getElementById('buscarNombre');
    const inputBuscar = document.getElementById('btnBuscarPokemon');
    inputBuscar.addEventListener('click', async () => {
        mostrarSpinner();

        mostrarFichaPokemon(await app.obtenerDatosDesdeIndexedDB('name', nombre.value));

        ocultarSpinner();
    });

    const inputLimpiar = document.getElementById('btnLimpiar');
    inputLimpiar.addEventListener('click', async () => {
        mostrarSpinner();
        nombre.value = '';
        selectGeneracion.value = 'all';
        const datosExisten = await existeDatosEnGeneraciones();

        if (!datosExisten) {
            const generaciones = await app.obtenerDatosPokemon();

            if (generaciones) {
                await guardarDatosPokemon(generaciones);
            }
        }

        mostrarFichaPokemon(await app.obtenerDatosDesdeIndexedDB('todos'));
        ocultarSpinner();
    });
});
'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones, mostrarSpinner, ocultarSpinner } from "./utils.js";
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

    await app.obtenerDatosDesdeIndexedDB();
    ocultarSpinner();

    const selectGeneracion = document.getElementById('generationFilter');
    selectGeneracion.addEventListener('change', async (event) => {
        mostrarSpinner();
        const generacionSeleccionada = event.target.value;

        if (generacionSeleccionada === 'all') {
            await app.obtenerDatosDesdeIndexedDB();
        } else {
            await app.obtenerDatosDesdeIndexedDB(generacionSeleccionada);
        }

        ocultarSpinner();
    });

    const nombre = document.getElementById('buscarNombre');
    const inputBuscar = document.getElementById('btnBuscarPokemon');
    inputBuscar.addEventListener('click', async () => {
        mostrarSpinner();

        await app.buscarYMostrarPokemonPorNombre(nombre.value);

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

        await app.obtenerDatosDesdeIndexedDB();
        ocultarSpinner();
    });
});

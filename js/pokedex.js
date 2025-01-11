'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones } from "./utils.js";
import { app } from "./main.js";

document.addEventListener('DOMContentLoaded', async () => {
    const datosExisten = await existeDatosEnGeneraciones();

    if (!datosExisten) {
        const generaciones = await app.obtenerDatosPokemon();

        if (generaciones) {
            await guardarDatosPokemon(generaciones);
        }
    }

    await app.obtenerDatosDesdeIndexedDB();
});
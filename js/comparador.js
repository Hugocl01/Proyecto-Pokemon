/**
 * @fileoverview Manejo de la lógica principal para cargar, buscar, comparar y mostrar información sobre Pokémon.
 * @module comparador
 */

'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones, mostrarSpinner, ocultarSpinner, mostrarFichaPokemon, limpiarDatosPokemon, capitalizarPrimeraLetra, extraerID, modificarImagenHeader } from "./utils.js";
import { app } from "./main.js";
import Pokemon from "./Pokemon.js";

let pokemons = [];

/** @type {HTMLElement} Contenedor para el primer Pokémon */
const divPokemon1 = document.querySelector('#pokemon1');

/** @type {HTMLElement} Contenedor para el segundo Pokémon */
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
                const pokemon1 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', idPokemon1));
                divPokemon1.innerHTML = devolverDetallePokemon(pokemon1);
                divPokemon2.innerHTML = mensejeSeleccion;
            }

            if (params.has('pokemon2') && idPokemon2) {
                const pokemon2 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', idPokemon2));
                divPokemon2.innerHTML = devolverDetallePokemon(pokemon2);
                divPokemon1.innerHTML = mensejeSeleccion;
            }
        }
            break;

        case 2: {
            if (params.has('pokemon1') && params.has('pokemon2')) {
                const idPokemon1 = parseInt(params.get('pokemon1'));
                const idPokemon2 = parseInt(params.get('pokemon2'));

                const pokemon1 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', idPokemon1));
                const pokemon2 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', idPokemon2));

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

/**
 * Genera el detalle del Pokémon en formato HTML.
 * @function devolverDetallePokemon
 * @param {Pokemon} pokemon - Instancia de la clase Pokemon con la información del Pokémon.
 * @returns {string} HTML generado para mostrar el Pokémon.
 */
function devolverDetallePokemon(pokemon) {
    // Construir tipos
    const typesHTML = pokemon.types.map(tipo => {
        const imgTipo = document.createElement('img');

        // Extrae el número al final de la URL
        const id = extraerID(tipo.type.url);
        imgTipo.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${id}.png`;

        return imgTipo.outerHTML;
    }).join("");

    // Crear un contenedor para los tipos y añadir la clase
    const typesContainer = document.createElement('div');
    typesContainer.classList.add('tipos');
    typesContainer.innerHTML = typesHTML;

    // Construir estadísticas
    const statsHTML = pokemon.stats.map(stat => `
        <li id="${stat.stat.name}"><strong>${capitalizarPrimeraLetra(stat.stat.name)}:</strong> ${stat.base_stat}</li>`).join("\n");

    // Construir habilidades
    const abilitiesHTML = pokemon.abilities.map(ability => `
        <li>${capitalizarPrimeraLetra(ability.ability.name)}</li>`).join("\n");

    // Construir estructura HTML con un botón de eliminación
    const html = `
        <div class="card-pokemon" id="pokemon-${pokemon.id}">
            <div>
                <p>N.º ${pokemon.id}</p>
                <h1>${capitalizarPrimeraLetra(pokemon.name)}</h1>
            </div>

            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" alt="Sprite de ${pokemon.name}">

            <div>
                <p>Generación: ${pokemon.generation || "Desconocida"}</p>
                <p>Altura: ${pokemon.height} metros</p>
                <p>Peso:${pokemon.weight} kilogramos</p>
            </div>

            <div>
                <h2>Tipos</h2>
                <div class="cont-tipos">
                    ${typesContainer.outerHTML}
                </div>
            </div>

            <div class="estadisticas">
                <h2>Estadísticas Base</h2>
                <ul>
                    ${statsHTML}
                    <h2>Media</h2>
                    <li id="average"><strong>Average:</strong> ${pokemon.getAverageStats()}</li>
                </ul>
            </div>

            <div class="habilidades">
                <h2>Habilidades</h2>
                <ul>
                    ${abilitiesHTML}
                </ul>
            </div>

            <a class="btn eliminar-pokemon" data-pokemon-id="${pokemon.id}">Eliminar</a>
        </div>
    `;

    return html;
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

/**
 * Compara las estadísticas entre dos Pokémon y actualiza las clases de los elementos del DOM.
 * @function comparar
 * @param {Pokemon} pokemon1 - Primer Pokémon a comparar.
 * @param {Pokemon} pokemon2 - Segundo Pokémon a comparar.
 */
function comparar(pokemon1, pokemon2) {
    // Crear un objeto para acceder rápidamente a las estadísticas del segundo Pokémon
    const stats2 = pokemon2.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
    }, {});

    // Recorrer las estadísticas del primer Pokémon y compararlas
    pokemon1.stats.forEach(stat1 => {
        const statName = stat1.stat.name;
        const statValue1 = stat1.base_stat;
        const statValue2 = stats2[statName];

        // Buscar el elemento <li> correspondiente al nombre de la estadística
        const statElement1 = document.querySelector(`div#pokemon1.comparador li#${statName}`);
        const statElement2 = document.querySelector(`div#pokemon2.comparador li#${statName}`);

        if (statElement1 && statElement2) {
            // Aplicar clases según la comparación
            if (statValue1 > statValue2) {
                statElement1.classList.add('higher');
                statElement2.classList.add('lower');
            } else if (statValue1 < statValue2) {
                statElement1.classList.add('lower');
                statElement2.classList.add('higher');
            } else {
                // Si son iguales
                statElement1.classList.add('equal');
                statElement2.classList.add('equal');
            }
        }
    });

    // Comparar las estadísticas promedio
    const mediaPokemon1 = pokemon1.getAverageStats();
    const mediaPokemon2 = pokemon2.getAverageStats();

    // Seleccionar los elementos de las estadísticas promedio
    const liMediaPokemon1 = document.querySelector(`div#pokemon1.comparador  li#average`);
    const liMediaPokemon2 = document.querySelector(`div#pokemon2.comparador  li#average`);

    if (liMediaPokemon1 && liMediaPokemon2) {
        if (mediaPokemon1 > mediaPokemon2) {
            liMediaPokemon1.classList.add('higher');
            liMediaPokemon2.classList.add('lower');
        } else if (mediaPokemon1 < mediaPokemon2) {
            liMediaPokemon1.classList.add('lower');
            liMediaPokemon2.classList.add('higher');
        } else {
            // Si son iguales
            liMediaPokemon1.classList.add('equal');
            liMediaPokemon2.classList.add('equal');
        }
    } else {
        console.error('No se encontraron los elementos para las medias.');
    }
}

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

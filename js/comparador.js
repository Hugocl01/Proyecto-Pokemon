'use strict';

import { guardarDatosPokemon, existeDatosEnGeneraciones, mostrarSpinner, ocultarSpinner, mostrarFichaPokemon, limpiarDatosPokemon, capitalizarPrimeraLetra } from "./utils.js";
import { app } from "./main.js";
import Pokemon from "./Pokemon.js";

const divPokemon1 = document.querySelector('#pokemon1');
const divPokemon2 = document.querySelector('#pokemon2');

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
        mostrarFichaPokemon(pokemons, 0, pokemons.length);
    }

    ocultarSpinner();
}

async function cargarTarjetas() {
    // Obtener el ID del Pokémon desde la URL
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

            if (params.has('pokemon1')) {
                if (idPokemon1) {
                    const pokemon1 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', idPokemon1));
                }
                divPokemon1.innerHTML = devolverDetallePokemon(pokemon1);
                divPokemon2.innerHTML = mensejeSeleccion;
            }

            if (params.has('pokemon2')) {
                if (idPokemon2) {
                    const pokemon2 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', idPokemon2));
                    divPokemon2.innerHTML = devolverDetallePokemon(pokemon2);
                    divPokemon1.innerHTML = mensejeSeleccion;
                }
            }
        }
            break;

        case 2: {
            if (params.has('pokemon1') && params.has('pokemon2')) {
                const idPokemon1 = parseInt(params.get('pokemon1'));
                const idPokemon2 = parseInt(params.get('pokemon2'));

                // Busca el Pokémon
                const pokemon1 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', idPokemon1));
                const pokemon2 = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', idPokemon2));

                // console.log(pokemon1);
                // console.log(pokemon2);

                divPokemon1.innerHTML = devolverDetallePokemon(pokemon1);
                divPokemon2.innerHTML = devolverDetallePokemon(pokemon2);

                comparar(pokemon1, pokemon2);
            }
        }
            break;

        default: {
            console.error("Parametros URL invalidos");
        }
            break;
    }
}

function devolverDetallePokemon(pokemon) {
    // Construir tipos
    const typesHTML = pokemon.types.map(tipo => {
        const imgTipo = document.createElement('img');

        // Extrae el número al final de la URL // TODO
        const partes = tipo.type.url.split('/');  // Dividir la URL por las barras
        const id = partes[partes.length - 2]; // Obtener el penúltimo elemento, el id
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

            <button class="btn eliminar-pokemon" data-pokemon-id="${pokemon.id}">Eliminar</button>
        </div>
    `;

    return html;
}

// Vincular el evento después de insertar el HTML
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
        const statElement1 = document.querySelector(`#pokemon-${pokemon1.id} li#${statName}`);
        const statElement2 = document.querySelector(`#pokemon-${pokemon2.id} li#${statName}`);

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
    const liMediaPokemon1 = document.querySelector(`#pokemon-${pokemon1.id} li#average`);
    const liMediaPokemon2 = document.querySelector(`#pokemon-${pokemon2.id} li#average`);

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



document.addEventListener('DOMContentLoaded', async () => {
    // Recoger elementos del HTML
    const inputNombrePokemon = document.getElementById('buscarNombre');
    const selectGeneracion = document.getElementById('generationFilter');
    const contenedorFichas = document.querySelector('.contenedor-fichas');

    // Al cargar realizar la obtención de los datos y mostrar pokémons
    await cargaInicial();
    await cargarTarjetas();

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

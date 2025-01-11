'use strict';

import { almacenarDatosEnLocalStorage, mostrarFichaPokemon } from "./utils.js";
import Pokemon from "./Pokemon.js";

const app = (function () {

    const urlAPI = 'https://pokeapi.co/api/v2';

    async function obtenerDatos(url) {
        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json();
            })
            .catch((error) => {
                console.error(`Error obteniendo datos de ${url}:`, error);
                throw error;
            });
    }

    async function obtenerDatosEspecies(desde, hasta) {
        try {
            const datosRespuesta = await obtenerDatos(`${urlAPI}/pokemon-species?limit=${hasta}&offset=${desde}`);
            const especiesURLs = datosRespuesta.results.map(specie => specie.url);

            const datosEspecies = await Promise.all(especiesURLs.map(async (url) => {
                const datosEspecie = await obtenerDatos(url);

                return {
                    generation: datosEspecie.generation.name,
                    pokemonUrl: datosEspecie.varieties[0].pokemon.url
                };
            }));

            return datosEspecies;
        } catch (error) {
            console.error("Error obteniendo datos de especies:", error);
        }
    }

    async function obtenerDatosPokemon() {
        try {
            const datosEspecies = await obtenerDatosEspecies(0, 1025);

            const datosPokemons = await Promise.all(datosEspecies.map(async (especie) => {
                const datosPokemon = await obtenerDatos(especie.pokemonUrl);

                return {
                    ...datosPokemon,
                    generation: especie.generation
                };
            }));

            const generaciones = groupBy(datosPokemons, pokemon => pokemon.generation);

            console.log("Datos de las generaciones agrupadas:", generaciones);

            return generaciones;
        } catch (error) {
            console.error("Error obteniendo datos de Pokémon:", error);
        }
    }

    /**
     * Agrupa los elementos de un array según una función de clave.
     * @param {Array} array - Array a agrupar.
     * @param {Function} keyFn - Función para obtener la clave de agrupación.
     * @returns {Object} - Objeto con las agrupaciones.
     */
    function groupBy(array, keyFn) {
        return array.reduce((result, item) => {
            const key = keyFn(item);
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(item);
            return result;
        }, {});
    }

    function generarListaPokemon(generaciones) {
        const listaPorGeneraciones = {};

        for (let generationName in generaciones) {
            // Asegurar que cada generación tenga su propio array
            listaPorGeneraciones[generationName] = generaciones[generationName].map((pokemonData) => {
                // Crear una instancia de la clase Pokemon para cada Pokémon
                return new Pokemon(
                    pokemonData.id,
                    pokemonData.name,
                    pokemonData.types,
                    pokemonData.stats,
                    pokemonData.sprites,
                    generationName, // Asignar la generación correspondiente
                    pokemonData.height,
                    pokemonData.weight,
                );
            });
        }

        console.log("Lista de Pokémon organizada por generaciones:", listaPorGeneraciones);
        return listaPorGeneraciones;
    }


    return {
        obtenerDatosPokemon,
        generarListaPokemon
    };

})();

// Ejecución
app.obtenerDatosPokemon().then((generaciones) => {
    if (generaciones) {
        const listaPokemon = app.generarListaPokemon(generaciones);
    }
});

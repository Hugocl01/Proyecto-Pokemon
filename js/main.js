'use strict';

import { mostrarFichaPokemon, obtenerTodosLosPokemon, obtenerPokemonPorGeneracion, capitalizarPrimeraLetra } from "./utils.js";
import Pokemon from "./Pokemon.js";

export const app = (function () {

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

                return new Pokemon(
                    datosPokemon.id,
                    capitalizarPrimeraLetra(datosPokemon.name),
                    datosPokemon.types,
                    datosPokemon.stats,
                    datosPokemon.sprites,
                    especie.generation,
                    datosPokemon.height,
                    datosPokemon.weight
                );
            }));

            const generaciones = Object.groupBy(datosPokemons, pokemon => pokemon.generation);
            //console.log("Datos de las generaciones agrupadas:", generaciones);
            //console.log(datosPokemons);

            return generaciones;
        } catch (error) {
            console.error("Error obteniendo datos de Pokémon:", error);
        }
    }

    async function obtenerDatosDesdeIndexedDB(filtroGeneracion = null) {
        let pokemons;

        if (!filtroGeneracion) {
            pokemons = await obtenerTodosLosPokemon();
        } else {
            pokemons = await obtenerPokemonPorGeneracion(filtroGeneracion);
        }

        mostrarFichaPokemon(pokemons);
    }

    return {
        obtenerDatosPokemon,
        obtenerDatosDesdeIndexedDB
    };

})();
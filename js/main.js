'use strict';

import { obtenerTodosLosPokemon, obtenerPokemonPorGeneracion, obtenerPokemon } from "./utils.js";
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

                return new Pokemon(datosPokemon, especie.generation);
            }));

            const generaciones = Object.groupBy(datosPokemons, pokemon => pokemon.generation);
            //console.log("Datos de las generaciones agrupadas:", generaciones);
            //console.log(datosPokemons);

            return generaciones;
        } catch (error) {
            console.error("Error obteniendo datos de Pokémon:", error);
        }
    }

    async function obtenerDatosDesdeIndexedDB(filtrarPor, valor = null) {
        let pokemons;

        switch (filtrarPor) {
            case 'todos':
                pokemons = await obtenerTodosLosPokemon();
                break;
            case 'generacion':
                pokemons = await obtenerPokemonPorGeneracion(valor);
                break;
            case 'name':
                pokemons = await obtenerPokemon(filtrarPor, valor);
                break;
            case 'id':
                pokemons = await obtenerPokemon(filtrarPor, valor);
                break;
        }

        return pokemons;
    }

    return {
        obtenerDatosPokemon,
        obtenerDatosDesdeIndexedDB
    };

})();

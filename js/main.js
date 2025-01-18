'use strict';

import { obtenerTodosLosPokemon, obtenerPokemonPorGeneracion, obtenerPokemon } from "./helpers/indexedDB.js";
import { extraerID } from "./helpers/utils.js";
import Pokemon from "./models/Pokemon.js";

/**
 * @module app
 * @description Módulo principal de la aplicación que maneja la obtención de datos de Pokémon desde la API y IndexedDB.
 */
export const app = (function () {

    /**
     * La URL base de la API de Pokémon.
     * @constant {string}
     */
    const urlAPI = 'https://pokeapi.co/api/v2';

    /**
     * Obtiene datos de una URL.
     * @param {string} url - La URL desde la cual obtener los datos.
     * @returns {Promise<Object>} Los datos obtenidos de la URL.
     * @throws {Error} Si hay un error al obtener los datos.
     */
    async function obtenerDatos(url) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error();
            }

            return await response.json();
        } catch (error) {
            console.error(`Error obteniendo datos de ${url}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene el número máximo de Pokémon disponibles desde la API.
     * @returns {Promise<number>} El número máximo de Pokémon.
     * @throws {Error} Si hay un error al obtener los datos.
     */
    async function obtenerMaxPokemons() {
        try {
            const datosRespuesta = await obtenerDatos(`${urlAPI}/pokemon-species`);
            return datosRespuesta.count;
        } catch (error) {
            console.error("Error obteniendo el número máximo de Pokémons:", error);
            return 1025;
        }
    }

    /**
     * Obtiene datos de las especies de Pokémon desde la API.
     * @param {number} desde - El índice inicial desde el cual obtener los datos.
     * @param {number} hasta - El número máximo de datos a obtener.
     * @returns {Promise<Array<Object>>} Una promesa que resuelve a un array de objetos con los datos de las especies.
     * @throws {Error} Si hay un error al obtener los datos.
     */
    async function obtenerDatosEspecies(desde, hasta) {
        try {
            const datosRespuesta = await obtenerDatos(`${urlAPI}/pokemon-species?limit=${hasta}&offset=${desde}`);
            const especiesURLs = datosRespuesta.results.map(specie => specie.url);
    
            const datosEspecies = await Promise.all(especiesURLs.map(async (url) => {
                const datosEspecie = await obtenerDatos(url);
    
                return {
                    generation: datosEspecie.generation.name,
                    pokemonUrl: datosEspecie.varieties[0].pokemon.url,
                    evolution_chain_url: datosEspecie.evolution_chain.url
                };
            }));
    
            return datosEspecies;
        } catch (error) {
            console.error("Error obteniendo datos de especies:", error);
        }
    }

    /**
     * Obtiene datos de los Pokémon desde la API.
     * @returns {Promise<Object>} Una promesa que resuelve a un objeto con los datos de los Pokémon agrupados por generación.
     * @throws {Error} Si hay un error al obtener los datos.
     */
    async function obtenerDatosPokemon() {
        try {
            const maxPokemons = await obtenerMaxPokemons();
            const datosEspecies = await obtenerDatosEspecies(0, maxPokemons);
    
            const datosPokemons = await Promise.all(datosEspecies.map(async (especie) => {
                const datosPokemon = await obtenerDatos(especie.pokemonUrl);
                // Correccion unidades y generacion
                datosPokemon.height = datosPokemon.height / 10;
                datosPokemon.weight = datosPokemon.weight / 10;
                datosPokemon.generation = especie.generation;
                datosPokemon.evolution_chain_url = especie.evolution_chain_url;
    
                return new Pokemon(datosPokemon);
            }));
    
            const generaciones = Object.groupBy(datosPokemons, pokemon => pokemon.generation);
            //console.log("Datos de las generaciones agrupadas:", generaciones);
            //console.log(datosPokemons);
    
            return generaciones;
        } catch (error) {
            console.error("Error obteniendo datos de Pokémon:", error);
        }
    }

    /**
     * Obtiene datos de los Pokémon desde IndexedDB según el filtro proporcionado.
     * @param {string} filtrarPor - El criterio de filtrado (puede ser 'todos', 'generacion', 'name' o 'id').
     * @param {string|number|null} [valor=null] - El valor del filtro (puede ser el nombre, ID o generación del Pokémon).
     * @returns {Promise<Array<Object>|Object>} Una promesa que resuelve a un array de objetos con los datos de los Pokémon o un objeto con los datos de un Pokémon.
     * @throws {Error} Si hay un error al obtener los datos.
     */
    async function obtenerDatosDesdeIndexedDB(filtrarPor, valor = null) {
        try {
            let pokemons;

            switch (filtrarPor) {
                case 'todos':
                    pokemons = await obtenerTodosLosPokemon();
                    break;
                case 'generacion':
                    pokemons = await obtenerPokemonPorGeneracion(valor);
                    break;
                case 'name':
                case 'id':
                    pokemons = await obtenerPokemon(filtrarPor, valor);
                    break;
                default:
                    throw new Error(`Filtro desconocido: ${filtrarPor}`);
            }

            return pokemons;
        } catch (error) {
            console.error(`Error obteniendo datos desde IndexedDB con filtro ${filtrarPor}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene la cadena evolutiva de un Pokémon desde IndexedDB y la API.
     * @param {number} pokemonID - El ID del Pokémon para el cual obtener la cadena evolutiva.
     * @returns {Promise<Array<Object>>} Una promesa que resuelve a un array de objetos con los datos de las evoluciones del Pokémon.
     * @throws {Error} Si hay un error al obtener los datos.
     */
    async function obtenerEvoluciones(pokemonID) {
        try {
            // Obtener datos de la especie del Pokémon
            //const datosEspecie = await obtenerDatos(`${urlAPI}/pokemon-species/${pokemonID}`);
            //const urlCadenaEvolutiva = datosEspecie.evolution_chain.url;

            const pokemon = await obtenerDatosDesdeIndexedDB('id', pokemonID);
            const urlCadenaEvolutiva = pokemon.evolution_chain_url;
    
            // Obtener datos de la cadena evolutiva
            const datosCadenaEvolutiva = await obtenerDatos(urlCadenaEvolutiva);
    
            // Recorrer la cadena evolutiva
            const evoluciones = [];
            let actual = datosCadenaEvolutiva.chain;
            //console.log(actual);
    
            do {
                const idPokemon = parseInt(extraerID(actual.species.url));
                const nombrePokemon = actual.species.name;
                evoluciones.push({ idPokemon, nombrePokemon });
                actual = actual.evolves_to[0];
            } while (actual);
    
            return evoluciones;
        } catch (error) {
            console.error("Error obteniendo evoluciones del Pokémon:", error);
        }
    }

    return {
        obtenerDatosPokemon,
        obtenerDatosDesdeIndexedDB,
        obtenerEvoluciones, 
        obtenerMaxPokemons
    };

})();

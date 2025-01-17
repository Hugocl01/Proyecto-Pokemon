'use strict';

import { obtenerTodosLosPokemon, obtenerPokemonPorGeneracion, obtenerPokemon, extraerID } from "./utils.js";
import Pokemon from "./Pokemon.js";

export const app = (function () {

    const urlAPI = 'https://pokeapi.co/api/v2';

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

    async function obtenerDatosPokemon() {
        try {
            const datosEspecies = await obtenerDatosEspecies(0, 1025);
    
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
        obtenerEvoluciones
    };

})();

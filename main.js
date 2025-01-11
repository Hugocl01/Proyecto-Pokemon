'use strict';

import { almacenarDatosEnLocalStorage, mostrarFichaPokemon } from "./utils.js";

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
      .then((datos) => {
        //console.log(`Datos recibidos para ${url}:`, datos);
        return datos;
      })
      .catch((error) => { throw error });
  }

  async function obtenerDatosEspecies(desde, hasta) {
    try {
      const datosRespuesta = await obtenerDatos(`${urlAPI}/pokemon-species?limit=${hasta}&offset=${desde}`);
      const especiesURLs = datosRespuesta.results.map(specie => specie.url);
      //console.log(especiesURLs);

      const datosEspecies = await Promise.all(especiesURLs.map(async (url) => {
        const datosEspecie = await obtenerDatos(url);

        return {
          generation: datosEspecie.generation.name,
          pokemonUrl: datosEspecie.varieties[0].pokemon.url
        };
      }));

      //console.log(datosEspecies);

      return datosEspecies;
    } catch (error) {
      console.error(error);
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

      const generaciones = Object.groupBy(datosPokemons, pokemon => pokemon.generation);
      console.log(generaciones);
      console.log(datosPokemons);
      mostrarFichaPokemon(datosPokemons);
      //console.log(generaciones['generation-i']);

      return generaciones;
    } catch (error) {
      console.error(error);
    }
  }

  return {
    obtenerDatosPokemon
  }

})();

// Pruebas
app.obtenerDatosPokemon();
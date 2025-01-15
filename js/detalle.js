import { app } from "./main.js";
import Pokemon from './Pokemon.js';
import { capitalizarPrimeraLetra } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el ID del Pokémon desde la URL
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);

    // Buscar el Pokémon
    const pokemon = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', id));

    if (!pokemon) {
        alert('Pokémon no encontrado');
        return;
    }

    // Actualizar información básica
    document.getElementById('nombre-pokemon').textContent = pokemon.name.toUpperCase();
    document.getElementById('id-pokemon').textContent = `N.º ${pokemon.id}`;
    document.getElementById('imagen-pokemon').src = pokemon.sprites.other['official-artwork'].front_default;
    document.getElementById('peso').textContent = `${pokemon.weight} kilogramos`;
    document.getElementById('altura').textContent = `${pokemon.height} metros`;

    // Mostrar tipos
    const tiposContenedor = document.getElementById('contenedor-tipos');
    tiposContenedor.classList.add('tipos');
    pokemon.types.forEach(tipo => {
        const imgTipo = document.createElement('img');

        // Extrae el número al final de la URL
        const partes = tipo.type.url.split('/');  // Dividir la URL por las barras
        const id = partes[partes.length - 2]; // Obtener el penúltimo elemento, el id
        imgTipo.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${id}.png`;

        tiposContenedor.appendChild(imgTipo);
    });

    // Mostrar estadísticas
    const listaEstadisticas = document.getElementById('lista-estadisticas');
    pokemon.stats.forEach(stat => {
        const li = document.createElement('li');
        li.textContent = `${stat.stat.name.toUpperCase()}: ${stat.base_stat}`;
        listaEstadisticas.appendChild(li);
    });

    // Mostrar habilidades
    const listaHabilidades = document.getElementById('lista-habilidades');
    // Obtener las habilidades del Pokémon
    const habilidadesTexto = await pokemon.getAbilities();
    habilidadesTexto.forEach(habilidad => {
        const li = document.createElement('li');
        li.textContent = `${capitalizarPrimeraLetra(habilidad.name)}: ${capitalizarPrimeraLetra(habilidad.description)}`;
        listaHabilidades.appendChild(li);
    });

    const btnComparar = document.querySelector('#comparar');
    btnComparar.addEventListener('click', function () {
        window.location.href = `comparador.html?pokemon1=${pokemon.id}`;
    });
});

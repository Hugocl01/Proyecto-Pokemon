import { buscarPokemon } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el ID del Pokémon desde la URL
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);

    // Buscar el Pokémon
    const pokemon = await buscarPokemon(id);

    console.log(pokemon);

    if (!pokemon) {
        alert('Pokémon no encontrado');
        return;
    }

    // Actualizar información básica
    document.getElementById('nombre-pokemon').textContent = pokemon.name.toUpperCase();
    document.getElementById('id-pokemon').textContent = `N.º ${pokemon.id}`;
    document.getElementById('imagen-pokemon').src = pokemon.sprites.other['official-artwork'].front_default;

    // Mostrar tipos
    const tiposContenedor = document.getElementById('contenedor-tipos');
    pokemon.types.forEach(tipo => {
        const spanTipo = document.createElement('span');
        spanTipo.textContent = tipo.type.name.toUpperCase();
        spanTipo.classList.add('tipo', `tipo-${tipo.type.name}`);
        tiposContenedor.appendChild(spanTipo);
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
    pokemon.abilities.forEach(habilidad => {
        const li = document.createElement('li');
        li.textContent = habilidad.ability.name.toUpperCase();
        listaHabilidades.appendChild(li);
    });
});

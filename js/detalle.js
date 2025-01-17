import { app } from "./main.js";
import Pokemon from './Pokemon.js';
import { capitalizarPrimeraLetra, extraerID, modificarImagenHeader } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Modificar la imagen del header al hacer hover
    modificarImagenHeader(await app.obtenerMaxPokemons());

    const main = document.querySelector('body');
    main.classList.add('fondo');

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
    document.getElementById('generacion').textContent = `Generación: ${pokemon.generation}`;
    document.getElementById('peso').textContent = `Peso: ${pokemon.weight} kilogramos`;
    document.getElementById('altura').textContent = `Altura: ${pokemon.height} metros`;

    // Mostrar la foto normal o shiny al pasar el ratón
    const imagenPokemon = document.getElementById('imagen-pokemon');
    const defaultSrc = pokemon.sprites.other['official-artwork'].front_default;
    const hoverSrc = pokemon.sprites.other['official-artwork'].front_shiny;

    imagenPokemon.src = defaultSrc;

    imagenPokemon.addEventListener('mouseover', () => {
        imagenPokemon.src = hoverSrc;
    });

    imagenPokemon.addEventListener('mouseout', () => {
        imagenPokemon.src = defaultSrc;
    });

    // Mostrar tipos
    const tiposContenedor = document.getElementById('contenedor-tipos');
    tiposContenedor.classList.add('tipos');
    pokemon.types.forEach(tipo => {
        const imgTipo = document.createElement('img');

        // Extrae el número al final de la URL
        const id = extraerID(tipo.type.url);
        imgTipo.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${id}.png`;

        tiposContenedor.appendChild(imgTipo);
    });

    // Mostrar sprites
    const spritesContenedor = document.getElementById('contenedor-sprites');
    const spritesCampos = ['front_default', 'back_default', 'front_shiny', 'back_shiny'];

    spritesCampos.forEach(campoSprite => {
        const spriteImg = document.createElement('img');
        spriteImg.alt = campoSprite;
        spriteImg.src = pokemon.sprites[campoSprite];

        if (!pokemon.sprites[campoSprite]) {
            spriteImg.src = '../img/logoPokeball.png';
            spriteImg.width = 50;
            spriteImg.height = 50;
        }
        spritesContenedor.appendChild(spriteImg);
    });

    // Mostrar evoluciones
    const evolucionesContenedor = document.getElementById('contenedor-evoluciones');
    const evoluciones = await app.obtenerEvoluciones(pokemon.id);
    for (const evolucion of evoluciones) {
        const aDetallePokemon = document.createElement('a');
        aDetallePokemon.href = `detalle.html?id=${evolucion.idPokemon}`;
        //aDetallePokemon.classList.add('ficha');

        const divNombre = document.createElement('div');
        divNombre.textContent = capitalizarPrimeraLetra(evolucion.nombrePokemon);
        //divNombre.classList.add('contenedor-nombre-evolucion');

        const evolucionImg = document.createElement('img');
        evolucionImg.alt = evolucion.nombrePokemon;
        const evolucionData = await app.obtenerDatosDesdeIndexedDB('id', evolucion.idPokemon);
        evolucionImg.src = evolucionData.sprites.other['official-artwork'].front_default;
        evolucionImg.width = 100;

        aDetallePokemon.appendChild(evolucionImg);
        aDetallePokemon.appendChild(divNombre);
        evolucionesContenedor.appendChild(aDetallePokemon);
    }

    // Mostrar estadísticas
    const listaEstadisticas = document.getElementById('lista-estadisticas');
    pokemon.stats.forEach(stat => {
        const li = document.createElement('li');
        li.textContent = `${capitalizarPrimeraLetra(stat.stat.name)}: ${stat.base_stat}`;
        listaEstadisticas.appendChild(li);
    });
    const media = document.createElement('li');
    media.textContent = `Average: ${pokemon.getAverageStats()}`;
    listaEstadisticas.appendChild(media);

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

import { app } from "./main.js"; // Importa la instancia de la aplicación principal
import Pokemon from './models/Pokemon.js'; // Importa la clase Pokemon
import { modificarImagenHeader } from "./helpers/ui.js"; // Importa utilidades
import { capitalizarPrimeraLetra, extraerID } from "./helpers/utils.js"; // Importa utilidades

/**
 * Inicializa la página de detalles del Pokémon cuando el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Modifica la imagen del header al pasar el ratón
    modificarImagenHeader(await app.obtenerMaxPokemons());

    const main = document.querySelector('body'); // Selecciona el body
    main.classList.add('fondo'); // Añade una clase para establecer el fondo

    // Obtiene el ID del Pokémon desde la URL
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10); // Convierte el parámetro 'id' en número

    // Busca el Pokémon en la base de datos
    const pokemon = new Pokemon(await app.obtenerDatosDesdeIndexedDB('id', id));

    if (!pokemon) {
        alert('Pokémon no encontrado'); // Muestra un mensaje si no se encuentra el Pokémon
        return;
    }

    // Actualiza la información básica del Pokémon
    document.getElementById('nombre-pokemon').textContent = pokemon.name.toUpperCase();
    document.getElementById('id-pokemon').textContent = `N.º ${pokemon.id}`;
    document.getElementById('generacion').textContent = `Generación: ${pokemon.generation}`;
    document.getElementById('peso').textContent = `Peso: ${pokemon.weight} kilogramos`;
    document.getElementById('altura').textContent = `Altura: ${pokemon.height} metros`;

    // Muestra la foto normal o shiny al pasar el ratón
    const imagenPokemon = document.getElementById('imagen-pokemon');
    const defaultSrc = pokemon.sprites.other['official-artwork'].front_default; // Sprite por defecto
    const hoverSrc = pokemon.sprites.other['official-artwork'].front_shiny; // Sprite shiny

    imagenPokemon.src = defaultSrc;

    imagenPokemon.addEventListener('mouseover', () => {
        imagenPokemon.src = hoverSrc; // Cambia a la imagen shiny al pasar el ratón
    });

    imagenPokemon.addEventListener('mouseout', () => {
        imagenPokemon.src = defaultSrc; // Vuelve a la imagen normal al quitar el ratón
    });

    // Muestra los tipos del Pokémon
    const tiposContenedor = document.getElementById('contenedor-tipos');
    tiposContenedor.classList.add('tipos');
    pokemon.types.forEach(tipo => {
        const imgTipo = document.createElement('img');

        // Extrae el número del final de la URL
        const id = extraerID(tipo.type.url);
        imgTipo.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${id}.png`;

        tiposContenedor.appendChild(imgTipo);
    });

    // Muestra los sprites del Pokémon
    const spritesContenedor = document.getElementById('contenedor-sprites');
    const spritesCampos = ['front_default', 'back_default', 'front_shiny', 'back_shiny'];

    spritesCampos.forEach(campoSprite => {
        const spriteImg = document.createElement('img');
        spriteImg.alt = campoSprite;
        spriteImg.src = pokemon.sprites[campoSprite];

        if (!pokemon.sprites[campoSprite]) {
            // Si no existe el sprite, usa un ícono predeterminado
            spriteImg.src = '../img/logoPokeball.png';
            spriteImg.width = 50;
            spriteImg.height = 50;
        }
        spritesContenedor.appendChild(spriteImg);
    });

    // Muestra las evoluciones del Pokémon
    const evolucionesContenedor = document.getElementById('contenedor-evoluciones');
    const evoluciones = await app.obtenerEvoluciones(pokemon.id);
    for (const evolucion of evoluciones) {
        const aDetallePokemon = document.createElement('a');
        aDetallePokemon.href = `detalle.html?id=${evolucion.idPokemon}`;

        const divNombre = document.createElement('div');
        divNombre.textContent = capitalizarPrimeraLetra(evolucion.nombrePokemon);

        const evolucionImg = document.createElement('img');
        evolucionImg.alt = evolucion.nombrePokemon;
        const evolucionData = await app.obtenerDatosDesdeIndexedDB('id', evolucion.idPokemon);
        evolucionImg.src = evolucionData.sprites.other['official-artwork'].front_default;
        evolucionImg.width = 100;

        aDetallePokemon.appendChild(evolucionImg);
        aDetallePokemon.appendChild(divNombre);
        evolucionesContenedor.appendChild(aDetallePokemon);
    }

    // Muestra las estadísticas del Pokémon
    const listaEstadisticas = document.getElementById('lista-estadisticas');
    pokemon.stats.forEach(stat => {
        const li = document.createElement('li');
        li.textContent = `${capitalizarPrimeraLetra(stat.stat.name)}: ${stat.base_stat}`;
        listaEstadisticas.appendChild(li);
    });
    const media = document.createElement('li');
    media.textContent = `Average: ${pokemon.getAverageStats()}`;
    listaEstadisticas.appendChild(media);

    // Muestra las habilidades del Pokémon
    const listaHabilidades = document.getElementById('lista-habilidades');
    const habilidadesTexto = await pokemon.getAbilities();
    habilidadesTexto.forEach(habilidad => {
        const li = document.createElement('li');
        li.textContent = `${capitalizarPrimeraLetra(habilidad.name)}: ${capitalizarPrimeraLetra(habilidad.description)}`;
        listaHabilidades.appendChild(li);
    });

    // Redirige al comparador al hacer clic en el botón "Comparar"
    const btnComparar = document.querySelector('#comparar');
    btnComparar.addEventListener('click', function () {
        window.location.href = `comparador.html?pokemon1=${pokemon.id}`;
    });
});

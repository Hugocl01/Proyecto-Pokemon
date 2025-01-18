import { capitalizarPrimeraLetra, extraerID } from "./utils.js";

/**
 * Muestra un spinner de carga en el contenedor de fichas.
 */
export function mostrarSpinner() {
    const contenedorFichas = document.querySelector('.contenedor-fichas');
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    contenedorFichas.appendChild(spinner);
}

/**
 * Oculta el spinner de carga en el contenedor de fichas.
 */
export function ocultarSpinner() {
    const spinner = document.querySelector('.spinner');
    if (spinner) {
        spinner.remove();
    }
}

/**
 * Muestra las fichas de los Pokémon en el contenedor de fichas.
 * @param {Array<Object>|Object} pokemons - Los datos de los Pokémon a mostrar.
 * @param {number} [inicio=0] - El índice inicial desde el cual mostrar los Pokémon.
 * @param {number} [cantidad=12] - La cantidad de Pokémon a mostrar por carga.
 */
export function mostrarFichaPokemon(pokemons, inicio = 0, cantidad = 12) {
    const contenedorFichas = document.querySelector('.contenedor-fichas');

    if (inicio === 0) {
        contenedorFichas.innerHTML = '';
    }

    pokemons = Array.isArray(pokemons) ? pokemons : [pokemons];
    const pokemonsAMostrar = pokemons.slice(inicio, inicio + cantidad);

    for (const pokemon of pokemonsAMostrar) {
        const divFicha = document.createElement('div');
        divFicha.classList.add('ficha');
        divFicha.dataset.id = pokemon.id;

        const img = document.createElement('img');
        img.src = pokemon.sprites.other['official-artwork'].front_default;
        img.title = capitalizarPrimeraLetra(pokemon.name);
        img.width = 205;
        divFicha.appendChild(img);

        const divDatos = document.createElement('div');
        const pID = document.createElement('p');
        pID.textContent = `N.º ${pokemon.id}`;
        divDatos.appendChild(pID);

        const tituloNombre = document.createElement('h3');
        tituloNombre.textContent = capitalizarPrimeraLetra(pokemon.name);
        divDatos.appendChild(tituloNombre);
        divDatos.classList.add('datos');
        divFicha.appendChild(divDatos);

        const contenedorTipos = document.createElement('div');
        contenedorTipos.classList.add('tipos');
        pokemon.types.forEach(tipo => {
            const imgTipo = document.createElement('img');

            // Extrae el número al final de la URL
            const id = extraerID(tipo.type.url);
            imgTipo.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${id}.png`;

            contenedorTipos.appendChild(imgTipo);
        });
        divDatos.appendChild(contenedorTipos);

        contenedorFichas.appendChild(divFicha);
    }

    // EVENTO - Click en las fichas para mostrar sus detalles o comparar
    contenedorFichas.addEventListener('click', function (event) {
        const ficha = event.target.closest('.ficha');
        if (ficha) {
            const ficha = event.target.closest('.ficha');
            if (ficha) {
                const id = ficha.dataset.id;
                const params = new URLSearchParams(window.location.search)

                if (window.location.pathname.endsWith('pokedex.html')) {
                    window.location.href = `detalle.html?id=${id}`;
                }

                if (window.location.pathname.endsWith('comparador.html')) {
                    const validarPokemon1 = params.get('pokemon1');
                    const validarPokemon2 = params.get('pokemon2');

                    switch (params.size) {
                        case 0:
                            window.location.href += `?&pokemon1=${id}`;
                            break;

                        case 1:
                            if (validarPokemon1) {
                                window.location.href += `&pokemon2=${id}`;
                            }
                            if (validarPokemon2) {
                                window.location.href += `&pokemon1=${id}`;
                            }
                            break;

                        default:
                            alert('No puedes comparar más Pokémons, elimina uno para realizar otra comparación')
                            break;
                    }
                }
            }
        }
    });
}

/**
 * Modifica la imagen del header al pasar el ratón sobre ella.
 * Cambia la imagen de la Pokéball a una imagen aleatoria de un Pokémon.
 * Restaura la imagen original al quitar el ratón.
 * @param {number} maxPokemons - El número máximo de Pokémon disponibles.
 */
export function modificarImagenHeader(maxPokemons) {
    const imgPokeball = document.querySelector('.animar-pokeball');
    const defaultImgPokeballSrc = imgPokeball.src;
    imgPokeball.addEventListener('mouseover', () => {
        imgPokeball.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Math.floor(Math.random() * maxPokemons) + 1}.png`;
    });

    imgPokeball.addEventListener('mouseout', () => {
        imgPokeball.src = defaultImgPokeballSrc;
        //imgPokeball.width = 100;
    });
}

/**
 * Genera el detalle del Pokémon en formato HTML.
 * @function devolverDetallePokemon
 * @param {Pokemon} pokemon - Instancia de la clase Pokemon con la información del Pokémon.
 * @returns {string} HTML generado para mostrar el Pokémon.
 */
export function devolverDetallePokemon(pokemon) {
    // Construir tipos
    const typesHTML = pokemon.types.map(tipo => {
        const imgTipo = document.createElement('img');

        // Extrae el número al final de la URL
        const id = extraerID(tipo.type.url);
        imgTipo.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/${id}.png`;

        return imgTipo.outerHTML;
    }).join("");

    // Crear un contenedor para los tipos y añadir la clase
    const typesContainer = document.createElement('div');
    typesContainer.classList.add('tipos');
    typesContainer.innerHTML = typesHTML;

    // Construir estadísticas
    const statsHTML = pokemon.stats.map(stat => `
        <li id="${stat.stat.name}"><strong>${capitalizarPrimeraLetra(stat.stat.name)}:</strong> ${stat.base_stat}</li>`).join("\n");

    // Construir habilidades
    const abilitiesHTML = pokemon.abilities.map(ability => `
        <li>${capitalizarPrimeraLetra(ability.ability.name)}</li>`).join("\n");

    // Construir estructura HTML con un botón de eliminación
    const html = `
        <div class="card-pokemon" id="pokemon-${pokemon.id}">
            <div>
                <p>N.º ${pokemon.id}</p>
                <h1>${capitalizarPrimeraLetra(pokemon.name)}</h1>
            </div>

            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png" alt="Sprite de ${pokemon.name}">

            <div>
                <p>Generación: ${pokemon.generation || "Desconocida"}</p>
                <p>Altura: ${pokemon.height} metros</p>
                <p>Peso: ${pokemon.weight} kilogramos</p>
            </div>

            <div>
                <h2>Tipos</h2>
                <div class="cont-tipos">
                    ${typesContainer.outerHTML}
                </div>
            </div>

            <div class="estadisticas">
                <h2>Estadísticas Base</h2>
                <ul>
                    ${statsHTML}
                    <h2>Media</h2>
                    <li id="average"><strong>Average:</strong> ${pokemon.getAverageStats()}</li>
                </ul>
            </div>

            <div class="habilidades">
                <h2>Habilidades</h2>
                <ul>
                    ${abilitiesHTML}
                </ul>
            </div>

            <a class="btn eliminar-pokemon" data-pokemon-id="${pokemon.id}">Eliminar</a>
        </div>
    `;

    return html;
}

/**
 * Compara las estadísticas entre dos Pokémon y actualiza las clases de los elementos del DOM.
 * @function comparar
 * @param {Pokemon} pokemon1 - Primer Pokémon a comparar.
 * @param {Pokemon} pokemon2 - Segundo Pokémon a comparar.
 */
export function comparar(pokemon1, pokemon2) {
    // Crear un objeto para acceder rápidamente a las estadísticas del segundo Pokémon
    const stats2 = pokemon2.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
    }, {});

    // Recorrer las estadísticas del primer Pokémon y compararlas
    pokemon1.stats.forEach(stat1 => {
        const statName = stat1.stat.name;
        const statValue1 = stat1.base_stat;
        const statValue2 = stats2[statName];

        // Buscar el elemento <li> correspondiente al nombre de la estadística
        const statElement1 = document.querySelector(`div#pokemon1.comparador li#${statName}`);
        const statElement2 = document.querySelector(`div#pokemon2.comparador li#${statName}`);

        if (statElement1 && statElement2) {
            // Aplicar clases según la comparación
            if (statValue1 > statValue2) {
                statElement1.classList.add('higher');
                statElement2.classList.add('lower');
            } else if (statValue1 < statValue2) {
                statElement1.classList.add('lower');
                statElement2.classList.add('higher');
            } else {
                // Si son iguales
                statElement1.classList.add('equal');
                statElement2.classList.add('equal');
            }
        }
    });

    // Comparar las estadísticas promedio
    const mediaPokemon1 = pokemon1.getAverageStats();
    const mediaPokemon2 = pokemon2.getAverageStats();

    // Seleccionar los elementos de las estadísticas promedio
    const liMediaPokemon1 = document.querySelector(`div#pokemon1.comparador  li#average`);
    const liMediaPokemon2 = document.querySelector(`div#pokemon2.comparador  li#average`);

    if (liMediaPokemon1 && liMediaPokemon2) {
        if (mediaPokemon1 > mediaPokemon2) {
            liMediaPokemon1.classList.add('higher');
            liMediaPokemon2.classList.add('lower');
        } else if (mediaPokemon1 < mediaPokemon2) {
            liMediaPokemon1.classList.add('lower');
            liMediaPokemon2.classList.add('higher');
        } else {
            // Si son iguales
            liMediaPokemon1.classList.add('equal');
            liMediaPokemon2.classList.add('equal');
        }
    } else {
        console.error('No se encontraron los elementos para las medias.');
    }
}
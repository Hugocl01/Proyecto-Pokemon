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
'use strict';

/**
 * Almacena datos en el Local Storage del navegador.
 * @param {string} clave - La clave bajo la cual se almacenarán los datos.
 * @param {Object} datos - Los datos a almacenar.
 */
export function almacenarDatosEnLocalStorage(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

/**
 * Obtiene datos del Local Storage del navegador.
 * @param {string} clave - La clave bajo la cual se almacenan los datos.
 * @returns {Object|null} Los datos obtenidos del Local Storage o null si no existen.
 */
export function obtenerDatosDeLocalStorage(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
}

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
 * Capitaliza la primera letra de una cadena.
 * @param {string} cadena - La cadena a capitalizar.
 * @returns {string} La cadena con la primera letra capitalizada.
 */
export function capitalizarPrimeraLetra(cadena) {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
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
            const partes = tipo.type.url.split('/');  // Dividir la URL por las barras
            const id = partes[partes.length - 2]; // Obtener el penúltimo elemento, el id
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

// Funciones de IndexedDB

/**
 * Abre la base de datos IndexedDB.
 * @returns {Promise<IDBDatabase>} Una promesa que resuelve con la instancia de la base de datos.
 * @throws {Error} Si hay un error al abrir la base de datos.
 */
export function abrirBaseDeDatos() {
    return new Promise((resolve, reject) => {
        const solicitud = indexedDB.open('PokemonDB', 1);

        solicitud.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('generaciones', { keyPath: 'generation' });
        };

        solicitud.onsuccess = (event) => {
            resolve(event.target.result);
        };

        solicitud.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Guarda los datos de los Pokémon en IndexedDB.
 * @param {Object} generaciones - Un objeto que contiene los datos de los Pokémon agrupados por generación.
 * @returns {Promise<void>} Una promesa que se resuelve cuando la transacción se completa.
 * @throws {Error} Si hay un error al guardar los datos.
 */
export async function guardarDatosPokemon(generaciones) {
    const db = await abrirBaseDeDatos();
    const transaccion = db.transaction('generaciones', 'readwrite');
    const almacen = transaccion.objectStore('generaciones');

    for (const generation in generaciones) {
        almacen.put({ generation, pokemons: generaciones[generation] });
    }

    return transaccion.complete;
}

/**
 * Obtiene todos los datos de los Pokémon desde IndexedDB.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve a un array de objetos con los datos de todos los Pokémon.
 * @throws {Error} Si hay un error al obtener los datos.
 */
export async function obtenerTodosLosPokemon() {
    const db = await abrirBaseDeDatos();
    const transaccion = db.transaction('generaciones', 'readonly');
    const almacen = transaccion.objectStore('generaciones');

    return new Promise((resolve, reject) => {
        const solicitud = almacen.getAll();

        solicitud.onsuccess = (event) => {
            const resultado = event.target.result;
            const todosLosPokemon = resultado.reduce((acc, item) => {
                return acc.concat(item.pokemons);
            }, []);

            todosLosPokemon.sort((a, b) => a.id - b.id);

            resolve(todosLosPokemon);
        };

        solicitud.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Obtiene los datos de los Pokémon de una generación específica desde IndexedDB.
 * @param {string} nombreGeneracion - El nombre de la generación de Pokémon a obtener.
 * @returns {Promise<Array<Object>>} Una promesa que resuelve a un array de objetos con los datos de los Pokémon de la generación especificada.
 * @throws {Error} Si hay un error al obtener los datos.
 */
export async function obtenerPokemonPorGeneracion(nombreGeneracion) {
    const db = await abrirBaseDeDatos();
    const transaccion = db.transaction('generaciones', 'readonly');
    const almacen = transaccion.objectStore('generaciones');

    return new Promise((resolve, reject) => {
        const solicitud = almacen.get(nombreGeneracion);

        solicitud.onsuccess = (event) => {
            const resultado = event.target.result;
            resolve(resultado ? resultado.pokemons : []);
        };

        solicitud.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Limpia los datos de los Pokémon en IndexedDB.
 * @returns {Promise<void>} Una promesa que se resuelve cuando la transacción se completa.
 * @throws {Error} Si hay un error al limpiar los datos.
 */
export async function limpiarDatosPokemon() {
    const db = await abrirBaseDeDatos();
    const transaccion = db.transaction('generaciones', 'readwrite');
    const almacen = transaccion.objectStore('generaciones');
    almacen.clear();

    return transaccion.complete;
}

/**
 * Verifica si existen datos en el object store 'generaciones' de IndexedDB.
 * @returns {Promise<boolean>} Una promesa que resuelve a `true` si existen datos, o `false` en caso contrario.
 * @throws {Error} Si hay un error al verificar los datos.
 */
export async function existeDatosEnGeneraciones() {
    const db = await abrirBaseDeDatos();
    const transaccion = db.transaction('generaciones', 'readonly');
    const almacen = transaccion.objectStore('generaciones');

    return new Promise((resolve, reject) => {
        const solicitud = almacen.count();

        solicitud.onsuccess = (event) => {
            resolve(event.target.result > 0);
        };

        solicitud.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Obtiene los datos de un Pokémon desde IndexedDB según el campo y valor proporcionados.
 * @param {string} campo - El campo por el cual buscar el Pokémon (puede ser 'id' o 'name').
 * @param {string|number} valor - El valor del campo por el cual buscar el Pokémon.
 * @returns {Promise<Object|Array<Object>>} Una promesa que resuelve a un objeto con los datos del Pokémon encontrado o un array de objetos si se busca por nombre.
 * @throws {Error} Si hay un error al obtener los datos.
 */
export async function obtenerPokemon(campo, valor) {
    // Obtener todas las generaciones de Pokémon desde IndexedDB
    const db = await abrirBaseDeDatos();
    const transaccion = db.transaction('generaciones', 'readonly');
    const almacen = transaccion.objectStore('generaciones');

    return new Promise((resolve, reject) => {
        // Obtener todas las generaciones de Pokémon
        const solicitud = almacen.getAll();

        solicitud.onsuccess = (event) => {
            const generaciones = event.target.result;
            let pokemonEncontrado = [];

            // Iterar sobre cada generación para buscar el Pokémon con el campo dado
            for (const generacion of generaciones) {
                if (campo === 'id') {
                    pokemonEncontrado = generacion.pokemons.find(pokemon => pokemon[campo] === valor);

                    if (pokemonEncontrado) {
                        break; // Salir del bucle si se encuentra el Pokémon
                    } else {
                        pokemonEncontrado = [];
                    }
                } else if (campo === 'name') {
                    let pokemonsFiltrados = generacion.pokemons.filter(pokemon => pokemon[campo].toLowerCase().includes(valor.toLowerCase()));
                    pokemonEncontrado = pokemonEncontrado.concat(pokemonsFiltrados);
                }
            }

            // Devolver el Pokémon encontrado o [] si no se encuentra
            resolve(pokemonEncontrado);
        };

        solicitud.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

/**
 * Extrae el ID de un Pokémon desde una URL.
 * @param {string} url - La URL desde la cual extraer el ID.
 * @returns {string} El ID extraído de la URL.
 */
export function extraerID(url) {
    const partes = url.split('/');
    return partes[partes.length - 2];
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
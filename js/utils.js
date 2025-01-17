'use strict';

export function almacenarDatosEnLocalStorage(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

export function obtenerDatosDeLocalStorage(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
}

export function mostrarSpinner() {
    const contenedorFichas = document.querySelector('.contenedor-fichas');
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    contenedorFichas.appendChild(spinner);
}

export function ocultarSpinner() {
    const spinner = document.querySelector('.spinner');
    if (spinner) {
        spinner.remove();
    }
}

export function capitalizarPrimeraLetra(cadena) {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
}

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
                            alert('No puedes comparar mas Pokémon, elimna uno para realizar otra comparación')
                            break;
                    }
                }
            }
        }
    });
}

// Funciones de IndexedDB
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

export async function guardarDatosPokemon(generaciones) {
    const db = await abrirBaseDeDatos();
    const transaccion = db.transaction('generaciones', 'readwrite');
    const almacen = transaccion.objectStore('generaciones');

    for (const generation in generaciones) {
        almacen.put({ generation, pokemons: generaciones[generation] });
    }

    return transaccion.complete;
}

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

export async function limpiarDatosPokemon() {
    const db = await abrirBaseDeDatos();
    const transaccion = db.transaction('generaciones', 'readwrite');
    const almacen = transaccion.objectStore('generaciones');
    almacen.clear();

    return transaccion.complete;
}

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

export function extraerID(url) {
    const partes = url.split('/');
    return partes[partes.length - 2];
}

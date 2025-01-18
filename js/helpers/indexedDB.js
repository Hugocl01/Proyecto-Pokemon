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
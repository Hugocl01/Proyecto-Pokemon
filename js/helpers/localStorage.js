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
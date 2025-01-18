/**
 * Capitaliza la primera letra de una cadena.
 * @param {string} cadena - La cadena a capitalizar.
 * @returns {string} La cadena con la primera letra capitalizada.
 */
export function capitalizarPrimeraLetra(cadena) {
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
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
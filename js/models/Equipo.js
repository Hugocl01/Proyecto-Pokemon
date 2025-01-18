/**
 * Representa a un Equipo Pokémon con un nombre y una lista de Pokémon.
 * @class
 */
class Equipo {
    /**
     * Crea una instancia de un Equipo Pokémon.
     * @param {string} nombre - El nombre del equipo.
     * @param {Array<Object>} listaPokemons - Lista de Pokémon pertenecientes al equipo. Cada Pokémon es representado como un objeto.
     */
    constructor(nombre, listaPokemons = []) {
        this.nombre = nombre;
        this.listaPokemons = listaPokemons;
    }

    /**
     * Agrega un Pokémon al equipo.
     * @param {Object} pokemon - El Pokémon a agregar al equipo.
     * @throws {Error} Lanza un error si el equipo ya tiene 6 Pokémon.
     */
    agregarPokemon(pokemon) {
        if (this.listaPokemons.length >= 6) {
            throw new Error('El equipo no puede tener más de 6 Pokémon.');
        }
        this.listaPokemons.push(pokemon);
    }

    /**
     * Elimina un Pokémon del equipo por su índice.
     * @param {number} index - Índice del Pokémon a eliminar.
     * @returns {Object} El Pokémon eliminado.
     * @throws {Error} Lanza un error si el índice es inválido.
     */
    eliminarPokemon(index) {
        if (index < 0 || index >= this.listaPokemons.length) {
            throw new Error('Índice inválido.');
        }
        return this.listaPokemons.splice(index, 1)[0];
    }

    /**
     * Obtiene información detallada del equipo.
     * @returns {string} Una cadena con los detalles del equipo y sus Pokémon.
     */
    obtenerDetalles() {
        return `Equipo: ${this.nombre}\nPokémon:\n${this.listaPokemons.map((pokemon, i) => `${i + 1}. ${pokemon.name}`).join('\n')}`;
    }

    /**
     * Limpia el equipo eliminando todos los Pokémon.
     */
    limpiarEquipo() {
        this.listaPokemons = [];
    }

    /**
     * Verifica si el equipo está completo (6 Pokémon).
     * @returns {boolean} `true` si el equipo está completo, de lo contrario `false`.
     */
    equipoCompleto() {
        return this.listaPokemons.length === 6;
    }
}

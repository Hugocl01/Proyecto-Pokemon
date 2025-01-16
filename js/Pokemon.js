import { capitalizarPrimeraLetra } from './utils.js';

/**
 * Representa a un Pokémon con sus propiedades, tipos, estadísticas, habilidades, etc.
 * @class
 */
class Pokemon {
    /**
     * Crea una instancia de la clase Pokemon.
     * @param {Object} data - Los datos del Pokémon.
     * @param {number} data.id - ID del Pokémon.
     * @param {string} data.name - Nombre del Pokémon.
     * @param {Array<Object>} data.types - Tipos del Pokémon (array de objetos con propiedad `type.name`).
     * @param {Array<Object>} data.abilities - Habilidades del Pokémon (array de objetos con propiedad `ability.name`).
     * @param {Array<Object>} data.stats - Estadísticas base del Pokémon (array de objetos con propiedades `stat.name` y `base_stat`).
     * @param {Object} data.sprites - Sprites del Pokémon (imagen o sprites).
     * @param {number} data.generation - Generación del Pokémon.
     * @param {number} data.height - Altura del Pokémon en decímetros.
     * @param {number} data.weight - Peso del Pokémon en hectogramos.
     */
    constructor(data) {
        this.id = data.id; // ID del Pokémon
        this.name = data.name; // Nombre del Pokémon
        this.types = data.types; // Tipos (array de strings)
        this.abilities = data.abilities; // Habilidades
        this.stats = data.stats; // Estadísticas base
        this.sprites = data.sprites; // Imagenes o sprites
        this.generation = data.generation; // Generación del Pokémon
        this.height = data.height; // Altura del Pokémon
        this.weight = data.weight // Peso del Pokémon
    }

    /**
     * Formatea los tipos del Pokémon como texto.
     * @returns {string} Los tipos del Pokémon como una cadena de texto separada por comas.
     */
    getFormattedTypes() {
        return this.types.map(type => type.type.name).join(", ");
    }

    /**
     * Formatea las estadísticas base del Pokémon como texto.
     * @returns {string} Las estadísticas del Pokémon como una cadena de texto separada por saltos de línea.
     */
    getFormattedStats() {
        return this.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join("\n");
    }

    /**
     * Obtiene las habilidades del Pokémon con sus descripciones en español.
     * @returns {Promise<Array<Object>>} Una promesa que resuelve un array de objetos con el nombre y la descripción de cada habilidad.
     * @throws {Error} Si ocurre un error al obtener los detalles de las habilidades desde la API.
     */
    async getAbilities() {
        const abilitiesWithDescriptions = [];

        for (const ability of this.abilities) {
            try {
                // Obtiene los detalles de la habilidad desde la API
                const response = await fetch(ability.ability.url);
                const abilityData = await response.json();

                // Busca la descripción en español dentro de `effect_entries`
                const effectEntryEs = abilityData.effect_entries.find(entry => entry.language.name === 'es');
                const flavorTextEs = abilityData.flavor_text_entries.find(entry => entry.language.name === 'es');

                abilitiesWithDescriptions.push({
                    name: ability.ability.name,
                    description: flavorTextEs ? flavorTextEs.flavor_text : 'Descripción no disponible en español.',
                });
            } catch (error) {
                console.error(`Error al obtener detalles de la habilidad ${ability.ability.name}:`, error);
            }
        }
        return abilitiesWithDescriptions;
    }

    /**
     * Calcula la media de las estadísticas base del Pokémon.
     * @returns {number} La media de las estadísticas base del Pokémon.
     */
    getAverageStats() {
        const totalStats = this.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
        return totalStats / this.stats.length;
    }
}

export default Pokemon;

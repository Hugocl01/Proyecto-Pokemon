class Pokemon {
    constructor(data, generation = undefined) {
        this.id = data.id; // ID del Pokémon
        this.name = data.name; // Nombre del Pokémon
        this.types = data.types; // Tipos (array de strings)
        this.abilities = data.abilities; // Habilidades
        this.stats = data.stats; // Estadísticas base
        this.sprites = data.sprites; // Imagenes o sprites
        this.generation = generation; // Generación del Pokémon
        this.height = data.height / 10; // Altura del Pokémon
        this.weight = data.weight / 10; // Peso del Pokémon
    }

    // Método para mostrar los tipos del Pokémon como texto
    getFormattedTypes() {
        return this.types.map(type => type.type.name).join(", ");
    }

    // Método para mostrar las estadísticas como texto
    getFormattedStats() {
        return this.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join("\n");
    }

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

    // Método para calcular la media de las estadísticas base
    getAverageStats() {
        const totalStats = this.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
        return totalStats / this.stats.length;
    }
}

export default Pokemon;

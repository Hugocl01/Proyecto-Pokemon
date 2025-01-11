class Pokemon {
    constructor(id, name, types, stats, sprites, generation) {
        this.id = id; // ID del Pokémon
        this.name = name; // Nombre del Pokémon
        this.types = types; // Tipos (array de strings)
        this.stats = stats; // Estadísticas base
        this.sprites = sprites; // Imagenes o sprites
        this.generation = generation; // Generación del Pokémon
    }

    // Método para mostrar los tipos del Pokémon como texto
    getFormattedTypes() {
        return this.types.map(type => type.type.name).join(", ");
    }

    // Método para mostrar las estadísticas como texto
    getFormattedStats() {
        return this.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join("\n");
    }
}

export default Pokemon;

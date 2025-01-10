async function fetchPokemonSpecies(url) {
  const response = await fetch(url);
  return response.json();
}

async function fetchAllPokemonSpecies() {
  const url = 'https://pokeapi.co/api/v2/pokemon-species?limit=1025&offset=0';
  const response = await fetchPokemonSpecies(url);
  const speciesUrls = response.results.map(species => species.url);

  const speciesData = await Promise.all(speciesUrls.map(url => fetchPokemonSpecies(url)));
  return speciesData;
}

async function fetchPokemonData(url) {
  const response = await fetch(url);
  return response.json();
}

async function fetchAllPokemonData() {
  const speciesData = await fetchAllPokemonSpecies();
  const generations = {};

  for (const species of speciesData) {
    const generationName = species.generation.name;
    if (!generations[generationName]) {
      generations[generationName] = [];
    }

    const pokemonData = await fetchPokemonData(species.varieties[0].pokemon.url);
    pokemonData.generation = generationName;
    generations[generationName].push(pokemonData);
  }

  return generations;
}

fetchAllPokemonData().then(generations => {
  console.log(generations);
});

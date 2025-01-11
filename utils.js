'use strict';

export function almacenarDatosEnLocalStorage(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

export function obtenerDatosDeLocalStorage(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
}

export function mostrarFichaPokemon(pokemons) {
    const contenedorFichas = document.querySelector('.contenedor-fichas');

    for (const pokemon of pokemons) {
        const divFicha = document.createElement('div');
        divFicha.classList.add('ficha');
        divFicha.dataset.id = pokemon.id;

        const enlaceImg = document.createElement('a');
        const img = document.createElement('img');
        img.src = pokemon.sprites.other['official-artwork'].front_default;
        img.title = pokemon.name;
        img.width = 205;
        enlaceImg.appendChild(img);
        divFicha.appendChild(enlaceImg);

        const divDatos = document.createElement('div');
        const pID = document.createElement('p');
        pID.textContent = `N.º ${pokemon.id}`;
        divDatos.appendChild(pID);

        const tituloNombre = document.createElement('h3');
        tituloNombre.textContent = pokemon.name;
        divDatos.appendChild(tituloNombre);

        divFicha.appendChild(divDatos);

        contenedorFichas.appendChild(divFicha);
    }
}
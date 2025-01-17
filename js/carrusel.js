'use strict';

import { app } from "./main.js";
import { modificarImagenHeader } from "./utils.js";

const carrusel = document.querySelector('.carrusel-imagenes');
const image = document.querySelector('.carrusel-imagenes img');
//const prevButton = document.querySelector('.prev');
//const nextButton = document.querySelector('.next');
const maxPokemons = await app.obtenerMaxPokemons();

// Función para actualizar el carrusel
function actualizarCarrusel() {
    const numeroAleatorio = Math.floor(Math.random() * maxPokemons) + 1; // Genera un número aleatorio entre 1 y el máximo de pokémons disponibles
    image.src = '../img/logoPokeball.png'; // Cambia la imagen a la Pokéball
    carrusel.style.transform = 'scale(0.5)';
    setTimeout(() => {
        image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numeroAleatorio}.png`;
        carrusel.style.transform = 'scale(1)';
    }, 700); // Cambia a la nueva imagen después de 700ms
}

// Función para generar otro slide
function cambiarSlide() {
    actualizarCarrusel();
}

// Botones de navegación manual
/*nextButton.addEventListener('click', () => {
    cambiarSlide();
    reiniciarAutoSlide(); // Reinicia el temporizador de desplazamiento automático
});

prevButton.addEventListener('click', () => {
    cambiarSlide();
    reiniciarAutoSlide(); // Reinicia el temporizador de desplazamiento automático
});*/

// Desplazamiento automático
let autoSlide = setInterval(cambiarSlide, 3000); // Cambia cada 3 segundos

// Reinicia el temporizador de desplazamiento automático
function reiniciarAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(cambiarSlide, 3000);
}

// Modificar la imagen del header al hacer hover
modificarImagenHeader(await app.obtenerMaxPokemons());

// Inicializa el carrusel con una imagen aleatoria al cargar la página
actualizarCarrusel();
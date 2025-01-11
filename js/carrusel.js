const carrusel = document.querySelector('.carrusel-imagenes');
const images = document.querySelectorAll('.carrusel-imagenes img');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
let index = 0;

// Función para actualizar el carrusel
function updateCarrusel() {
    const width = images[0].clientWidth;
    carrusel.style.transform = `translateX(${-index * width}px)`;
}

// Función para avanzar al siguiente slide
function nextSlide() {
    index = (index + 1) % images.length;
    updateCarrusel();
}

// Función para retroceder al slide anterior
function prevSlide() {
    index = (index - 1 + images.length) % images.length;
    updateCarrusel();
}

// Botones de navegación manual
nextButton.addEventListener('click', () => {
    nextSlide();
    resetAutoSlide(); // Reinicia el temporizador de desplazamiento automático
});

prevButton.addEventListener('click', () => {
    prevSlide();
    resetAutoSlide(); // Reinicia el temporizador de desplazamiento automático
});

// Desplazamiento automático
let autoSlide = setInterval(nextSlide, 3000); // Cambia cada 3 segundos

// Reinicia el temporizador de desplazamiento automático
function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(nextSlide, 3000);
}

// Asegura que el carrusel se actualice al cambiar el tamaño de la ventana
window.addEventListener('resize', updateCarrusel);

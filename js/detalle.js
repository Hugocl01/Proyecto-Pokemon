// Obtén la URL actual
const url = new URL(window.location.href);

// Obtén los parámetros de la URL
const params = new URLSearchParams(url.search);

// Recoge un valor específico por nombre
const id = params.get('id');

// Mostrar los valores en consola
console.log(id);

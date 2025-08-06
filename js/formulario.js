window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulario');
 
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim(); 
    const clave = document.getElementById('clave').value;
    const email = document.getElementById('email').value.trim();
    const edad = document.getElementById('edad').value; 
    const ciudad = document.getElementById('ciudad').value;
    const hobbiSeleccionados = document.querySelectorAll("input[name='hobbis']:checked");
    const genero = document.querySelector("input[name='genero']:checked");

    // Mostrar en consola:
    console.log('Datos capturados:', { nombre, clave, email, edad, hobbiSeleccionados, genero, ciudad });

    form.reset();
  });
});

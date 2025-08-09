

//// modal
function abrirModal(e) {
  e.preventDefault()
  document.addEventListener('DOMContentLoaded', () => {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems);
    const modal = M.Modal.getInstance(document.getElementById('modal1'));
    // const form = document.getElementById('formulario');

    // form.addEventListener('submit', (e) => { //el usuario presiona el boton submit
    //   e.preventDefault(); // Evita que se recargue

    console.log('Datos capturados:', { nombre, tel, email });

    modal.open()
  });
  // });
}


// funcion obtener Datos formularios  

function ObtenerDatos(e) {
  e.preventDefault()
  var elems = document.querySelectorAll('.modal');
  var instances = M.Modal.init(elems);
  const modal = M.Modal.getInstance(document.getElementById('modal1'));
  const form = document.getElementById('formulario');

  // window.addEventListener('DOMContentLoaded', () => {
  //   const form = document.getElementById('formulario');

  //   //addEventListener función de JavaScript que sirve para escuchar eventos en un elemento HTML (Click - submit)
  //   form.addEventListener('submit', (e) => { //el usuario presiona el boton submit
  //     e.preventDefault(); // Evita que se recargue


  let nombre = document.getElementById('nombre').value.trim();
  let tel = document.getElementById('telefono').value.trim();
  let email = document.getElementById('email').value.trim();
  let ciudad = document.getElementById('ciudad').value.trim();
  let pais = document.getElementById('pais').value.trim();
  let genero = document.querySelector("input[name='genero']:checked").value;
  //let genero = document.getElementById('genero').value.trim();
  let Consumo = parseFloat(document.getElementById('consumo').value);
  let desde = parseFloat(document.getElementById('fecha-inicio').value);
  let hasta = document.getElementById('fecha-hasta').value;

  //VALIDACION DE REGISTRTOS

  document.registro.nombreobtenido.value = nombre
  document.registro.telobtenido.value = tel
  document.registro.emailobtenido.value = email
  document.registro.ciudadobtenida.value = ciudad
  document.registro.paisobtenido.value = pais
  document.registro.generobtenido.value = genero
  document.registro.Consumobtenido.value = Consumo
  document.registro.fechadesdeontenido.value = desde
  document.registro.fechahastaontenido.value = hasta


  console.log('Datos capturados:', { nombre, tel, email, ciudad, pais, genero, Consumo, desde });
  //  alert('Datos capturados:', { nombre, tel, email });

  modal.open();
  form.reset();

  //   });
  // });
}

function calcularConsumo(e) {
  e.preventDefault();

  const form = document.getElementById('registro');


  consumo = parseFloat(document.getElementById('Consumobtenido').value);
  periodo = parseFloat(document.getElementById('fechadesdeontenido').value);

  document.querySelector('miTabla');

  const eolicakwh = 1
  const seishrs = 2
  const preciokwh_colombia = 700

  //const preciokwh = 318.43

  consumo_dia = consumo / periodo
  precio_und = consumo_dia * preciokwh_colombia
  calculo_preciokwh = precio_und * periodo

  comumo_eolica_dia = eolicakwh * seishrs
  precio_eolica_dia = comumo_eolica_dia * preciokwh_colombia
  total_precio_eolica = precio_eolica_dia * periodo

  ahorrov = calculo_preciokwh - total_precio_eolica

  ahorro = (comumo_eolica_dia * periodo)

  console.log("datos ingresados:", { consumo, periodo })
  console.log("valor kwh", preciokwh_colombia, "\n kwh dia:", consumo_dia, "\n valor Und:", precio_und,
    "\n valor tatol:", calculo_preciokwh)
  // console.log({preciokwh_colombia, consumo_dia, precio_und, calculo_preciokwh})


  document.getElementById("Valor").value = preciokwh_colombia;
  document.getElementById("Consuno").value = consumo_dia;
  document.getElementById("valor_UND").value = precio_und;
  document.getElementById("Total").value = calculo_preciokwh;


  console.log("kwh eolica:", eolicakwh, "\n timpoviento: ", seishrs, "\n total dia: ", comumo_eolica_dia,
    "\n valor dia: ", precio_eolica_dia, "\n valormensual: ", total_precio_eolica)
  console.log({ eolicakwh, seishrs, comumo_eolica_dia, precio_eolica_dia, total_precio_eolica })

  document.getElementById("Valore").value = eolicakwh;
  document.getElementById("Consunoe").value = seishrs;
  document.getElementById("valor_UNDe").value = comumo_eolica_dia;
  document.getElementById("Totale").value = precio_eolica_dia;
  document.getElementById("Totaleo").value = total_precio_eolica



  console.log("ahorro mes con eolica: ", ahorro)

  document.getElementById("ahorro").value = ahorro
  document.getElementById("ahorrov").value = total_precio_eolica
  document.getElementById("ahorro1").value = ahorrov
  M.updateTextFields();
  mostrarGraficouser();

  // form.reset()
  
}


function mostrarGraficouser() {

  ahorro = parseFloat(document.getElementById('ahorro').value);
  periodo = parseFloat(document.getElementById('ahorrov').value);
  periodo = parseFloat(document.getElementById('ahorro1').value);

  consumo = parseFloat(document.getElementById('Consumobtenido').value);


  const data = [
    { datos: "kwh usuario", count: consumo },
    { datos: "kwh eolica", count: ahorro },

  ];

  new Chart(
    document.getElementById('energiaUser'),
    {
      type: 'doughnut',
      data: {
        labels: data.map(row => row.datos),
        datasets: [
          {
            label: 'energias (kwh)',
            data: data.map(row => row.count)
          }
        ]
        
      },
      options: {
        responsive: true,
        Animation: true,
        plugins: {
            subtitle: {
                display: true,
                text: 'comparativo kwh usuario y kwh eolica'
            }
        }
    }
    }
  );
}


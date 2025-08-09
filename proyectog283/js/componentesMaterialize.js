// $(function () {
//     $('.datepicker').pickadate({
//         selectMonths: true, // Creates a dropdown to control month
//         selectYears: 15 // Creates a dropdown of 15 years to control year
//     });
// });

//################ page index ################################
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.carousel');
  var instances = M.Carousel.init(elems);

});


document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems);
});


// ################## page forms #############################3

//Para el select
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);
});

// para la fecha
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.datepicker');
  var instances = M.Datepicker.init(elems);
});

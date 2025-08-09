// const ctx = document.getElementById('energiaChart').getContext('2d');

// const chart = new Chart(ctx, {
//     type: 'line',
//     data: data,
//     options: {
//         plugins: {
//             subtitle: {
//                 display: true,
//                 text: 'Custom Chart Subtitle'
//             }
//         }
//     }
// });

//function mostrarGraficabar() {
// 32,000 kWh. = 32 MW    18.42 GWh Un gigavatio-hora (símbolo GWh)

const ctx = document.getElementById('graficbar').getContext('2d');
const data = [
    { anos: 2018, count: 0 },
    { anos: 2019, count: 0 },
    { anos: 2020, count: 0 },
    { anos: 2021, count: 0 },
    { anos: 2022, count: 30 },
    { anos: 2023, count: 120 },
    { anos: 2024, count: 550 },
];
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data.map(row => row.anos),
        datasets: [
            {
                label: 'Produccion eolica (GWh)',
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
                text: 'Produccion anual energia ecolica en colombia'
            }
        }
    }
}
);
//}


const ctx1 = document.getElementById('graficbubble').getContext('2d');
const data1 = [
    { anos: 2018, count: 0 },
    { anos: 2019, count: 0 },
    { anos: 2020, count: 0 },
    { anos: 2021, count: 0 },
    { anos: 2022, count: 30 },
    { anos: 2023, count: 120 },
    { anos: 2024, count: 550 },
];
new Chart(ctx1, {
    type: 'bubble',
    data: {
        labels: data1.map(row => row.anos),
        datasets: [
            {
                label: 'Produccion eolica (GWh)',
                data: data1.map(row => row.count)
            }
        ]
    },
    options: {
        responsive: true,
        Animation: true,
        plugins: {
            subtitle: {
                display: true,
                text: 'Produccion anual energia ecolica en colombia'
            }
        }
    }
}
);

const ctx2 = document.getElementById('graficdoughnut').getContext('2d');
const data2 = [
    { anos: 2018, count: 0 },
    { anos: 2019, count: 0 },
    { anos: 2020, count: 0 },
    { anos: 2021, count: 0 },
    { anos: 2022, count: 30 },
    { anos: 2023, count: 120 },
    { anos: 2024, count: 550 },
];
new Chart(ctx2, {
    type: 'doughnut',
    data: {
        labels: data2.map(row => row.anos),
        datasets: [
            {
                label: 'Produccion eolica (GWh)',
                data: data2.map(row => row.count)
            }
        ]
    },
    options: {
        responsive: true,
        Animation: true,
        plugins: {
            subtitle: {
                display: true,
                text: 'Produccion anual energia ecolica en colombia'
            }
        }
    }
}
);
//}

const ctx3 = document.getElementById('graficline').getContext('2d');
const data3 = [
    { anos: 2018, count: 0 },
    { anos: 2019, count: 0 },
    { anos: 2020, count: 0 },
    { anos: 2021, count: 0 },
    { anos: 2022, count: 30 },
    { anos: 2023, count: 120 },
    { anos: 2024, count: 550 },
];
new Chart(ctx3, {
    type: 'line',
    data: {
        labels: data3.map(row => row.anos),
        datasets: [
            {
                label: 'Produccion eolica (GWh)',
                data: data3.map(row => row.count)
            }
        ]
    },
    options: {
        responsive: true,
        Animation: true,
        plugins: {
            subtitle: {
                display: true,
                text: 'Produccion anual energia ecolica en colombia'
            }
        }
    }
}
);

const ctx4 = document.getElementById('graficpolarArea').getContext('2d');
const data4 = [
    { anos: 2018, count: 0 },
    { anos: 2019, count: 0 },
    { anos: 2020, count: 0 },
    { anos: 2021, count: 0 },
    { anos: 2022, count: 30 },
    { anos: 2023, count: 120 },
    { anos: 2024, count: 550 },
];
new Chart(ctx4, {
    type: 'polarArea',
    data: {
        labels: data4.map(row => row.anos),
        datasets: [
            {
                label: 'Produccion eolica (GWh)',
                data: data4.map(row => row.count)
            }
        ]
    },
    options: {
        responsive: true,
        Animation: true,
        plugins: {
            subtitle: {
                display: true,
                text: 'Produccion anual energia ecolica en colombia'
            }
        }
    }
}
);

const ctx5 = document.getElementById('graficradar').getContext('2d');
const data5 = [
    { anos: 2018, count: 0 },
    { anos: 2019, count: 0 },
    { anos: 2020, count: 0 },
    { anos: 2021, count: 0 },
    { anos: 2022, count: 30 },
    { anos: 2023, count: 120 },
    { anos: 2024, count: 550 },
];
new Chart(ctx5, {
    type: 'radar',
    data: {
        labels: data5.map(row => row.anos),
        datasets: [
            {
                label: 'Produccion eolica (GWh)',
                data: data5.map(row => row.count)
            }
        ]
    },
    options: {
        responsive: true,
        Animation: true,
        plugins: {
            subtitle: {
                display: true,
                text: 'Produccion anual energia ecolica en colombia'
            }
        }
    }
}
);


// const data = [
//     // { anos: 2010, count: 0 },
//     // { anos: 2011, count: 18.42  },
//     // { anos: 2012, count: 160.2  },
//     // { anos: 2013, count: ahorro },
//     // { anos: 2014, count: ahorro },
//     // { anos: 2015, count: ahorro },
//     // { anos: 2016, count: ahorro },
//     // { anos: 2017, count: ahorro },
//     { anos: 2018, count: 0 },
//     { anos: 2019, count: 0 },
//     { anos: 2020, count: 0 },
//     { anos: 2021, count: 0 },
//     { anos: 2022, count: 30 },
//     { anos: 2023, count: 120 },
//     { anos: 2024, count: 550 },
// ];
// const ctx = document.getElementById('graficbar');
// new Chart(ctx, {
//     type: 'bar',
//     data: data,
//     options: {
//         responsive: true,
//         plugins: {
//             title: {
//                 display: true,
//             }
//         }
//     }
// });
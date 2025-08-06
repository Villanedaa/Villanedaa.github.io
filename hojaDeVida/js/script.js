function downloadPDF() {
    const element = document.querySelector('.container-lg');

    const opt = {
        margin: [2, 5, 1, 5], // [arriba, izquierda, abajo, derecha] en mm
        filename: 'Hoja_de_Vida_Mayelli_Amaya.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            scrollY: 0
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    html2pdf().set(opt).from(element).save();
}
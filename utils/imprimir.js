export function generarHtmlImpresion({ anverso, reverso, orden, fill1, fill2, esVertical, esVertical2, titulo = "Impresión" }) {
  // Usamos cm para respetar el tamaño físico al imprimir
  // 3.5cm x 4.5cm como pediste, con un pequeño “marco” para corte.
  const objectFitMode = fill1 ? "fill" : "contain";
  const objectFitModeR = fill2 ? "fill" : "contain";

  var widthSlot2 = esVertical2 ? "3.4cm" : "4.9cm";
  var heightSlot2 = esVertical2 ? "4.9cm" : "3.4cm";

  var widthSlot1 = esVertical ? "3.4cm" : "4.9cm";
  var heightSlot1 = esVertical ? "4.9cm" : "3.4cm";
  return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${titulo}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page {
    size: A4;
    margin: 10mm;
  }
  html, body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
  }
  .sheet {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12mm;
    align-items: start;
  }
  .card {
    width: ${widthSlot1}; /* 3.4 + 0.3 bleed por lado aprox visual */
    padding: 3mm;
    border: 0.5pt solid #999;
    border-radius: 2mm;
    text-align: center;
  }

    .card2 {
    width: ${widthSlot2}; /* 3.4 + 0.3 bleed por lado aprox visual */
    padding: 3mm;
    border: 0.5pt solid #999;
    border-radius: 2mm;
    text-align: center;
  }
  .title {
    font-size: 12pt;
    margin: 0 0 6mm 0;
  }
  .slot {
    width: ${widthSlot1};
    height: ${heightSlot1};
    margin: 0 auto;
    border: 0.5pt dashed #666; /* guía de corte */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #fff;
  }
  .slot img {
    /* que llene el rectángulo sin deformarse */
    width: 100%;
    height: 100%;
    object-fit: ${objectFitMode};
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    transform-origin: center center;
  }

  .slotR {
    width: ${widthSlot2};
    height: ${heightSlot2};
    margin: 0 auto;
    border: 0.5pt dashed #666; /* guía de corte */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #fff;
  }
  .slotR img {
    /* que llene el rectángulo sin deformarse */
    width: 100%;
    height: 100%;
    object-fit: ${objectFitModeR};
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    transform-origin: center center;
  }
 
  .label {
    margin-top: 4mm;
    font-size: 10pt;
  }

  /* Marcas de corte ligeras */
  .crop {
    position: relative;
    width: 3.4cm;
    height: 4.9cm;
  }
  .crop:before, .crop:after {
    content: "";
    position: absolute;
    background: #000;
  }
  /* esquinas (arriba-izq y abajo-der) */
  .crop:before {
    top: -3mm; left: -3mm;
    width: 6mm; height: 0.2mm;
    box-shadow:
      0 0 0 0 #000,
      0 6mm 0 0 #000,
      6mm 0 0 0 #000,
      6mm 6mm 0 0 #000;
  }
  .crop:after {
    display: none; /* opcional, ya tenemos dashed + esquinas */
  }

  @media print {
    .no-print { display: none; }
  }

  .footer {
    margin-top: 12mm;
    font-size: 9pt;
    color: #666;
    text-align: center;
  }
</style>
</head>
<body onload="setTimeout(() => { window.print(); }, 250)">
  <div class="sheet">
    <!-- ANVERSO -->
    <div class="card">
      <h2 class="title">Anverso, orden ${orden}</h2>
      <div class="slot">
        <img src="${anverso}" alt="Anverso"  />
      </div>
      <div class="label">3.4 cm × 4.9 cm</div>
    </div>

    <!-- REVERSO -->
    <div class="card2">
      <h2 class="title">Reverso, orden ${orden} </h2>
      <div class="slotR">
        <img src="${reverso}" alt="Reverso"  />
      </div>
      <div class="label">3.4 cm × 4.9 cm</div>
    </div>
  </div>

  <div class="footer no-print">
    Vista previa generada. Al imprimir, selecciona escala 100% y desactiva márgenes adicionales del navegador si es posible.
  </div>
</body>
</html>`
}

export function generarHtmlImpresion({ anverso, reverso, rotationDegFront = 0, rotationDegBack = 0, titulo = "Impresión" }) {
  // Usamos cm para respetar el tamaño físico al imprimir
  // 3.5cm x 4.5cm como pediste, con un pequeño “marco” para corte.
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
    width: 4.1cm; /* 3.5 + 0.3 bleed por lado aprox visual */
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
    width: 3.5cm;
    height: 4.5cm;
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
    object-fit: cover;
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
    width: 3.5cm;
    height: 4.5cm;
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
      <h2 class="title">Anverso</h2>
      <div class="slot">
        <img src="${anverso}" alt="Anverso" style="transform: rotate(${rotationDegFront}deg);" />
      </div>
      <div class="label">3.5 cm × 4.5 cm</div>
    </div>

    <!-- REVERSO -->
    <div class="card">
      <h2 class="title">Reverso</h2>
      <div class="slot">
        <img src="${reverso}" alt="Reverso" style="transform: rotate(${rotationDegBack}deg);" />
      </div>
      <div class="label">3.5 cm × 4.5 cm</div>
    </div>
  </div>

  <div class="footer no-print">
    Vista previa generada. Al imprimir, selecciona escala 100% y desactiva márgenes adicionales del navegador si es posible.
  </div>
</body>
</html>`
}

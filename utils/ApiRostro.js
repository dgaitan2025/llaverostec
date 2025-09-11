export async function segmentarRostro(base64) {
  const response = await fetch("http://www.server.daossystem.pro:3405/Rostro/Segmentar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ RostroA: base64 })
  })

  return await response.json() // 👉 solo devuelve el JSON
}
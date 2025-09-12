export async function segmentarRostro(base64) {
  const response = await fetch("http://www.server.daossystem.pro:3405/Rostro/Segmentar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ RostroA: base64 })
  })

  if (!response.ok) {
    throw new Error(`❌ Error en la API: ${response.status}`)
  }

  return await response.json() // 👉 solo devuelve el JSON
}

export async function VerificarRostro(rostroA, rostroB ) {
  const response = await fetch("http://www.server.daossystem.pro:3405/Rostro/Segmentar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ RostroA: rostroA, RostroB: rostroB })
  })

  if (!response.ok) {
    throw new Error(`❌ Error en la API: ${response.status}`)
  }

  return await response.json() // 👉 solo devuelve el JSON
}
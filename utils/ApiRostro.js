import {UrlWithApiFace, ENDPOINTS} from "../Service/apiConfig"

export async function segmentarRostro(base64) {
  const response = await fetch(UrlWithApiFace(ENDPOINTS.segmentar), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ RostroA: base64, RostroB:" " })
  })

  if (!response.ok) {
    throw new Error(`❌ Error en la API: ${response.status}`)
  }

  return await response.json() // 👉 solo devuelve el JSON
}

export async function VerificarRostro(rostroA, rostroB ) {
  const response = await fetch(UrlWithApiFace(ENDPOINTS.verificar), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ RostroA: rostroA, RostroB: rostroB })
  })

  if (!response.ok) {
    throw new Error(`❌ Error en la API: ${response.status}`)
  }

  return await response.json() // 👉 solo devuelve el JSON
}
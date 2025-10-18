import { UrlWithApiRD, ENDPOINTS } from "../Service/apiConfig"


export async function obtenerOrdenPendiente(operadorId) {
  try {
    const endpoint = ENDPOINTS.obtenerOrdenOP.replace("{operador}", operadorId)
    const response = await fetch(UrlWithApiRD(endpoint))

    const data = await response.json().catch(() => ({})) // evita error si no hay cuerpo JSON

    if (!response.ok) {
      // manejar respuestas específicas
      if (response.status === 404) {
       
        
        return null
      }

      throw new Error(data.mensaje || "Error al obtener ordenes pendiente")
    }

    // ✅ Si llega aquí, la respuesta es correcta (HTTP 200)
    const datosReducidos = {
      tipoNFC: data.tipo_Grabado,
      textUrl: data.link,
      link: data.link,
      nombre: data.nombre,
      telefono_detalle: data.telefono,
      foto_anverso: data.foto_Anverso,
      foto_reverso: data.foto_Reverso,
      id_tipo_grabado: data.tipo_Grabado === "URL" ? 1 : 2,
      id_orden: data.id_Orden,
      id_Detalle: data.id_Detalle,
      fase_actual: data.fase_actual,
      domicilio: data.entrega_domicilio,
    }

    localStorage.setItem("ordenPendiente", JSON.stringify(datosReducidos))

    console.log("✅ Orden pendiente:", data)
    return data

  } catch (error) {
    console.error("❌ Error al llamar API:", error)
    
    return null
  }
}


export async function ordenCliente(usuarioId) {
  try {
    const response = await fetch(UrlWithApiRD(ENDPOINTS.obtenerOrdeneCL(usuarioId)))

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`)
    }

    const data = await response.json() // ✅ Aquí obtienes la data real del backend
    console.log("Respuesta ordenes cliente:", data)
    return data
  } catch (error) {
    console.error("Error al obtener las órdenes:", error)
    return [] // Retornar array vacío por seguridad
  }
}

export async function actualizarEstadoOrden(idDetalle) {
  try {
    const response = await fetch(UrlWithApiRD(ENDPOINTS.actualizarEstadoOrden), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(idDetalle)
    });

    if (!response.ok) {
      const msg = `HTTP error! status: ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    console.log("✅ Respuesta actualizar estado:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    // ⚠️ Lanza el error de nuevo para que el que llame lo pueda manejar
    throw error;
  }
}


export async function obtenerOrdenFinalizadas(usuarioId) {
  try {
    const endpoint = ENDPOINTS.ordenesFinalizadas.replace("{id}", usuarioId)
    const response = await fetch(UrlWithApiRD(endpoint))

    const data = await response.json().catch(() => ({})) // evita error si no hay cuerpo JSON

    if (!response.ok) {
      // manejar respuestas específicas
      if (response.status === 404) {
       
        
        return null
      }

      throw new Error(data.mensaje || "Error al obtener ordenes pendiente")
    }

    console.log("✅ Orden pendiente:", data)
    return data

  } catch (error) {
    console.error("❌ Error al llamar API:", error)
    
    return null
  }
}

export async function registrarFaseQA({ idDetalle, idFase, comentario }) {
  const url = UrlWithApiRD(ENDPOINTS.qaRechazada); 

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idDetalle,
        idFase,
        comentario,
      }),
    });

    // Manejar error HTTP
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error HTTP:", response.status, errorText);
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ QA registrada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al registrar QA (fetch):", error);
    throw error;
  }
}

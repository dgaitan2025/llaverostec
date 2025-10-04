// utils/camara.js
import { nextTick } from "vue"
import { segmentarRostro } from "../utils/ApiRostro"
import { initStickers, aplicarFiltro, previewPhoto, imageRef, canvasRef } from "../utils/stickers"
import { ref } from "vue"

let stream = null
const fotoTomada = ref("");
const respuestaFiltro = ref()

export const abrirCamara = async (dialog, videoRef, fileInput) => {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: true })
    stream = s
    dialog.value = true
    await nextTick()
    if (!videoRef.value) {
      console.warn("⚠️ El video todavía no está montado")
      return
    }
    videoRef.value.srcObject = stream
  } catch (err) {
    console.error(err) // 👈 ver el error real
    console.warn("⚠️ No se pudo acceder a la cámara, usar input file")
    if (fileInput?.value && typeof fileInput.value.click === "function") {
      fileInput.value.click()
    }
  }
}

async function RecortarRostro() {
  const soloBase64 = fotoTomada.value.split(",")[1]
  const datos = await segmentarRostro(soloBase64)
  return datos
}

export const tomarFaceID = async (videoRef, formData, campoFoto, cerrarFn) => {
  if (!videoRef.value) {
    return { resultado: false, mensaje: "No hay cámara" }
  }

  const canvasTmp = document.createElement("canvas")
  canvasTmp.width = videoRef.value.videoWidth
  canvasTmp.height = videoRef.value.videoHeight
  canvasTmp.getContext("2d").drawImage(videoRef.value, 0, 0)

  // 🔹 Guardar en el campo dinámico
  formData.value[campoFoto] = canvasTmp.toDataURL("image/png").split(",")[1]

  cerrarFn()
  return { resultado: true, mensaje: `✅ Foto guardada en '${campoFoto}'` }
}

export const tomarFoto = async (videoRef, formData, cerrarFn) => {
  if (!videoRef.value) {
    return { resultado: false, mensaje: "No hay cámara" }
  }

  const canvasTmp = document.createElement("canvas")
  canvasTmp.width = videoRef.value.videoWidth
  canvasTmp.height = videoRef.value.videoHeight
  canvasTmp.getContext("2d").drawImage(videoRef.value, 0, 0)
  fotoTomada.value = canvasTmp.toDataURL("image/png")

  try {
    const respuesta = await RecortarRostro()
    console.log("respuesta de api jony " , respuesta)

    if (respuesta.resultado) {
      console.log("rostro Jony ",respuesta.rostro)
      
      previewPhoto.value = "data:image/png;base64," + respuesta.rostro
      console.log("preview ", previewPhoto)
      respuestaFiltro.value = await aplicarFiltro()
      console.log("respuestaFIltro", respuestaFiltro)
      console.log("ingresa " + respuestaFiltro.foto)
      
       

      if (respuestaFiltro.value.verificado) {
        formData.value.FotografiaBase64 = respuestaFiltro.value.foto
        
       

        cerrarFn()
        return { resultado: true, mensaje: "Rostro Reconocido" }

      } else {
        if (respuesta.rostro === null) {


        }
        cerrarFn()
        return { resultado: false, mensaje: "Error al reconocer rostro" }
      }

    } else {
      previewPhoto.value = fotoTomada.value
      respuestaFiltro.value = await aplicarFiltro()
      console.log(respuestaFiltro.value)
      console.log(respuestaFiltro.value.verificado)
      if (respuestaFiltro.value.verificado) {
        formData.value.FotografiaBase64 = respuestaFiltro.value.foto
        formData.value.Foto = respuestaFiltro.value.foto

        cerrarFn()
        return { resultado: true, mensaje: "Foto sin segmentar, rostro Reconocido" }

      } else {
        cerrarFn()
        return { resultado: false, mensaje: "Error al reconocer rostro" }
      }
    }
  } catch (e) {
    previewPhoto.value = fotoTomada.value
    console.error("❌ Error comunicando con API:", e)

    localStorage.setItem("fotoUsuario", previewPhoto.value)
    cerrarFn()

    return { resultado: false, mensaje: "Fallo de comunicación con API, se usa foto sin segmentar" }
  }
}



export const cerrarCamara = (dialog) => {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
  dialog.value = false
}

export const mostrarPreview = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { previewPhoto.value = ev.target.result }
  reader.readAsDataURL(file)
}

// utils/camara.js
import { nextTick } from "vue"
import { previewPhoto } from "./stickers"
import {segmentarRostro} from "../utils/ApiRostro"

let stream = null


export const abrirCamara = async (dialog, videoRef, fileInput) => {
  try {
    console.log("👉 dialog recibido:", dialog)
  console.log("👉 esRef?", dialog && typeof dialog === "object" && "value" in dialog)
    const s = await navigator.mediaDevices.getUserMedia({ video: true })
    console.log("pasa1")
    stream = s
    console.log("pasa2")
    dialog.value = true
    console.log("pasa3")

    await nextTick()

    if (!videoRef.value) {
      console.warn("⚠️ El video todavía no está montado")
      return
    }

    console.log("pasa4")
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
  const datos = await segmentarRostro(previewPhoto.value)
  return datos
}

export const tomarFoto = (videoRef, formData, cerrarFn) => {
  if (!videoRef.value) return
  const canvasTmp = document.createElement("canvas")
  canvasTmp.width = videoRef.value.videoWidth
  canvasTmp.height = videoRef.value.videoHeight
  canvasTmp.getContext("2d").drawImage(videoRef.value, 0, 0)
  previewPhoto.value = canvasTmp.toDataURL("image/png")
  RecortarRostro().then(respuesta => {
    if (respuesta?.rostro) {
      previewPhoto.value = respuesta.rostro
      formData.value.photoUser = previewPhoto.value
      console.log("✅ Base64 con prefijo:", previewPhoto.value)

      localStorage.setItem("fotoUsuario", previewPhoto.value)
    } else {
      console.error("❌ No se pudo segmentar rostro")
    }

    cerrarFn()
  })
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

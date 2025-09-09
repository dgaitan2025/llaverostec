export async function iniciarCamara(videoElement, fileInputRef) {
  if (navigator.mediaDevices?.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoElement.srcObject = stream
      return stream
    } catch (err) {
      console.warn("⚠️ No se pudo acceder a la cámara, activando subida de foto.")
      if (fileInputRef?.value) {
        fileInputRef.value.click() // 🔹 Abre el selector de archivos
      }
      return null
    }
  } else {
    console.warn("⚠️ Este dispositivo no tiene cámara, activando subida de foto.")
    if (fileInputRef?.value) {
      fileInputRef.value.click()
    }
    return null
  }
}

export function capturarFoto(videoElement) {
  const canvas = document.createElement("canvas")
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight
  const ctx = canvas.getContext("2d")
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/png")
}

export function detenerCamara(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
}

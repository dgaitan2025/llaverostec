export function convertirABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result.split(",")[1] // quitar encabezado
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}
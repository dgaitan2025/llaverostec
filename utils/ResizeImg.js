// utils/ResizeImg.js
export const analizarImagen = async (event) => {
  const file = event?.target?.files?.[0]
  if (!file) return null

  // ✅ Validar tipo
  if (!file.type.startsWith('image/')) {
    return null
  }

  // ✅ Leer imagen como base64
  const base64 = await leerArchivoComoBase64(file)

  // ✅ Obtener dimensiones
  const dimensiones = await obtenerDimensiones(base64)

  const esVertical = dimensiones.orientacion === 'vertical'
  const base64Puro = base64.split(',')[1]

  // ✅ Retornar todos los datos útiles
  return { 
    base64Puro,  
    esVertical 
  }
}


export const analizarBase64 = async (foto) => {
  if (!foto) return null

  // Si la cadena ya viene con el prefijo, no lo agregues dos veces
  const fotoMIME = foto.startsWith('data:image')
    ? foto
    : `data:image/png;base64,${foto}`

  // ✅ Obtener dimensiones
  const dimensiones = await obtenerDimensiones(fotoMIME)
  const esVertical = dimensiones.orientacion === 'vertical'

  // ✅ Obtener solo la parte base64 (sin prefijo)
  const base64Puro = fotoMIME.split(',')[1]

  // ✅ Retornar los datos útiles
  return { 
    base64Puro,  
    esVertical 
  }
}

// Función auxiliar para leer el archivo
const leerArchivoComoBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Función auxiliar para calcular dimensiones
const obtenerDimensiones = (base64) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        ancho: img.width,
        alto: img.height,
        orientacion: img.width > img.height ? 'horizontal' : 'vertical'
      })
    }
    img.onerror = reject
    img.src = base64
  })
}

import { ref, watch } from 'vue'

// 🔹 Exportación nombrada
export function usePlaca(formDataNFC, esVertical, esVertical2) {
    const archivo = ref(null)
    const archivo2 = ref(null)

    const imagenFinal1 = ref(null)
    const modo1 = ref('Seleccione foto 1')
    const modo2 = ref('Seleccione foto 2')
    const placa = ref('')

    const generarImagenConTexto = async () => {
        if (modo1.value === 'Placa' ||  modo2.value === 'Placa') {
            const texto = placa.value?.trim() || 'SIN PLACA'
            const img = new Image()
            img.src = '/imagenes/placa.png'

            img.onload = async () => {
                // 🧩 Crear un canvas temporal (no visible)
                const canvasTmp = document.createElement('canvas')
                const ctx = canvasTmp.getContext('2d')

                // Ajustar tamaño al de la imagen original
                canvasTmp.width = img.width
                canvasTmp.height = img.height

                // Dibujar la imagen original
                ctx.drawImage(img, 0, 0, img.width, img.height)

                // Calcular centro
                const centerX = img.width / 2
                const centerY = img.height / 2

                // Texto negro, centrado
                let fontSize = img.width
                ctx.fillStyle = 'black'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'

                // Reducir tamaño hasta que encaje
                do {
                    fontSize--
                    ctx.font = `bold ${fontSize}px Arial`
                } while (ctx.measureText(texto).width > img.width * 0.95)

                // Escribir el texto en el centro
                ctx.fillText(texto, centerX, centerY + 35)

                // 🔹 Obtener Base64 final
                const base64Final = canvasTmp.toDataURL('image/png')

                // Analizar orientación
                const dimensiones = await obtenerDimensiones(base64Final)
                esVertical.value = dimensiones.orientacion === 'vertical'
                

                // 🔹 Guardar en variables / formulario
                imagenFinal1.value = base64Final

                if(modo1.value === 'Placa'){
                    formDataNFC.value.foto_anverso = base64Final.split(',')[1]
                }
                if (modo2.value === 'Placa'){
                    esVertical2.value = dimensiones.orientacion === 'vertical'
                    formDataNFC.value.foto_reverso = base64Final.split(',')[1]
                }
                
                

                // ✅ Eliminar el canvas temporal para liberar memoria
                canvasTmp.remove()
            }

            img.onerror = (err) => console.error('Error al cargar la imagen base:', err)

        }
    }

    const validarPlaca = (valor) => {
        if (!valor) return 'La placa es obligatoria.'
        const limpio = valor.replace(/\s+/g, '')
        const regex = /^[A-Z]\d{3}[A-Z]{3}$/
        if (regex.test(limpio)) {
            generarImagenConTexto()
            return true
        }
        formDataNFC.value.foto_anverso = null
        return 'Formato inválido. Ejemplo válido: M 767KHJ'
    }

    const formatearPlaca = () => {
        let valor = placa.value.replace(/\s+/g, '').toUpperCase()
        if (valor.length > 1) valor = valor[0] + ' ' + valor.slice(1)
        placa.value = valor
    }

    const obtenerDimensiones = async (base64) => {
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

    // 🔹 Retornamos todo lo necesario
    return {
        archivo,
        archivo2,
        imagenFinal1,
        modo1,
        modo2,
        placa,
        generarImagenConTexto,
        validarPlaca,
        formatearPlaca,
    }
}

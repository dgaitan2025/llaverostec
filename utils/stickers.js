// utils/stickers.js
import * as faceapi from "face-api.js"
import { ref, nextTick } from "vue"

export const filtros = ref(["perrito", "princesa", "lentes"])
export const filtroActivo = ref(null)
export const previewPhoto = ref(null)
export const imageRef = ref(null)
export const canvasRef = ref(null)

const STICKERS = { lentes: null, princesa: null, perrito: null }

export const initStickers = async () => {
    if (typeof window !== "undefined") {
        STICKERS.lentes = new Image()
        STICKERS.lentes.src = "/stickers/lentes.png"
        STICKERS.princesa = new Image()
        STICKERS.princesa.src = "/stickers/corona.png"
        STICKERS.perrito = new Image()
        STICKERS.perrito.src = "/stickers/perro.png"
        STICKERS.bigote = new Image()
        STICKERS.bigote.src = "/stickers/bigote2.png"
    }

    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    ])
    // console.log("✅ Modelos cargados")
}

const modelosListos = () =>
    faceapi.nets.tinyFaceDetector.isLoaded &&
    faceapi.nets.faceLandmark68Net.isLoaded

const meanPoint = (pts) => {
    const s = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 })
    return { x: s.x / pts.length, y: s.y / pts.length }
}
const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

const drawCenteredRotated = (ctx, img, cx, cy, w, h, angleRad) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angleRad)
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
    ctx.restore()
}

export const aplicarFiltro = async (filtrosSeleccionados = []) => {
    if (!previewPhoto.value) return
    await nextTick()

    const img = imageRef.value
    const canvas = canvasRef.value
    if (!img || !canvas) return
    if (!img.complete || img.naturalWidth === 0) {
        await new Promise(r => { img.onload = r; img.onerror = r })
    }
    if (!modelosListos()) return

    const ctx = canvas.getContext("2d")
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const det = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
    if (!det) {
        alert("❌ No se detectó ningún rostro en la foto")
        return
    }

    const lm = det.landmarks
    const leftEye = meanPoint(lm.getLeftEye())
    const rightEye = meanPoint(lm.getRightEye())
    const eyeCenter = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 }
    const eyeDist = dist(leftEye, rightEye)
    const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x)
    const leftBrow = lm.getLeftEyeBrow()
    const rightBrow = lm.getRightEyeBrow()
    const browY = Math.min(...leftBrow.map(p => p.y), ...rightBrow.map(p => p.y))
    const headTopY = browY - 0.60 * eyeDist
    const nosePts = lm.getNose()
    const noseTip = nosePts[Math.floor(nosePts.length / 2)]

    // 👇 Recorremos SOLO los seleccionados
    for (const f of filtrosSeleccionados) {
        const sticker = STICKERS[f]
        if (!sticker?.complete) await new Promise(r => (sticker.onload = r, sticker.onerror = r))

        let targetW, targetH, posX, posY
        const ratio = sticker.naturalHeight / sticker.naturalWidth || 1

        switch (f) {
            case "lentes":
                targetW = eyeDist * 2.2
                targetH = targetW * ratio
                posX = eyeCenter.x
                posY = eyeCenter.y + eyeDist * 0.02
                break
            case "princesa":
                targetW = eyeDist * 3.0
                targetH = targetW * ratio
                posX = eyeCenter.x
                posY = headTopY - targetH * 0.15
                break
            case "perrito":
                targetW = eyeDist * 3.0
                targetH = targetW * ratio
                posX = noseTip.x + 20
                posY = noseTip.y - eyeDist * 1.2
                break
            case "bigote":
                targetW = eyeDist * 1.8 // un poco más ancho que la nariz
                targetH = targetW * ratio
                posX = noseTip.x + 20
                posY = noseTip.y + eyeDist * 0.25 // 👈 debajo de la nariz
                break
        }



        drawCenteredRotated(ctx, sticker, posX, posY, targetW, targetH, angle)
    }

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"))
    return blob
}


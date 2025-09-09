<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="600px"
    persistent
  >
    <v-card>
      <v-toolbar color="indigo-lighten-1" dark>
        <v-toolbar-title>Registro de usuario</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field v-model="formData.nombre" label="Nombre y apellido" prepend-inner-icon="mdi-account" required />
          <v-text-field v-model="formData.email" label="Correo electrónico" type="email"
                        prepend-inner-icon="mdi-email" :rules="[v => !!v || 'El correo es requerido']" required />
          <v-text-field v-model="formData.phone" label="Número de teléfono" type="tel"
                        prepend-inner-icon="mdi-phone" :rules="[v => !!v || 'El teléfono es requerido']" required />
          <v-text-field v-model="formData.birthdate" label="Fecha de nacimiento" type="date"
                        prepend-inner-icon="mdi-calendar" required />
          <v-text-field v-model="formData.nickname" label="Nickname" prepend-inner-icon="mdi-account" required />
          <v-text-field v-model="formData.password" label="Contraseña" type="password"
                        prepend-inner-icon="mdi-lock" required />

          <!-- Si quieres múltiples, deja multiple; si solo una, quítalo y cambia notifications a string -->
          <v-combobox
            v-model="formData.notifications"
            label="Notificaciones"
            :items="['Correo', 'WhatsApp', 'Ambas']"
            multiple
            chips
          />

          <!-- Fotografía -->
          <div class="d-flex ga-3 mt-2">
            <v-btn color="secondary" @click="abrirCamara" prepend-icon="mdi-camera">
              Tomar Foto
            </v-btn>

            <!-- Modal cámara -->
            <v-dialog v-model="dialog" max-width="600">
              <v-card>
                <v-card-title>Tomar Foto</v-card-title>
                <v-card-text>
                  <video ref="videoRef" autoplay playsinline style="width:100%; border-radius:8px;" />
                </v-card-text>
                <v-card-actions>
                  <v-btn color="green" @click="tomarFoto">Capturar</v-btn>
                  <v-btn color="red" @click="cerrarCamara">Cancelar</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <!-- Input para subir foto -->
            <input ref="fileInput" type="file" accept="image/*" style="display: none;" @change="mostrarPreview" />
          </div>
        </v-form>

        <!-- Imagen oculta para análisis -->
        <img v-if="previewPhoto" :src="previewPhoto" ref="imageRef" alt="" style="display:none" />

        <!-- Canvas con la foto y el filtro -->
        <canvas v-if="previewPhoto" ref="canvasRef" style="max-width:100%; border:1px solid #ccc;" />

        <!-- Barra de filtros -->
        <div v-if="previewPhoto" class="d-flex justify-center mt-3">
          <v-btn v-for="f in filtros" :key="f" class="mx-2" @click="filtroActivo = f">
            {{ f }}
          </v-btn>
        </div>

        <!-- Guardar foto -->
        <div v-if="previewPhoto" class="text-center mt-3">
          <v-btn color="success" @click="guardarFoto">Guardar Foto</v-btn>
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" color="red" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" @click="submitForm">Registrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import * as faceapi from 'face-api.js'
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const valid = ref(false)
const loading = ref(false)
const previewPhoto = ref(null)

const formData = ref({
  nombre: '',
  email: '',
  phone: '',
  birthdate: '',
  nickname: '',
  password: '',
  photo: null,
  notifications: []
})

const dialog = ref(false)
const videoRef = ref(null)
const fileInput = ref(null)
let stream = null

const canvasRef = ref(null)
const imageRef = ref(null)
const filtroActivo = ref(null)
const filtros = ref(['perrito', 'princesa', 'lentes'])

// ⬇️ SOLO declarar; inicializar en cliente
const STICKERS = { lentes: null, princesa: null, perrito: null }

onMounted(async () => {
  try {
    // ⬇️ esto evita el error en SSR
    if (typeof window !== 'undefined') {
      STICKERS.lentes = new window.Image()
      STICKERS.lentes.src = '/stickers/lentes.png'
      STICKERS.princesa = new window.Image()
      STICKERS.princesa.src = '/stickers/corona.png'   // tu asset de corona
      STICKERS.perrito = new window.Image()
      STICKERS.perrito.src = '/stickers/perro.png'    // asegúrate que exista
    }

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    ])
    console.log('✅ Modelos cargados')
  } catch (e) {
    console.error('❌ No se pudieron cargar los modelos:', e)
  }
})

watch(() => props.modelValue, (abierto) => { if (!abierto) cerrarCamara() })
onBeforeUnmount(() => cerrarCamara())

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

watch([previewPhoto, filtroActivo], async () => {
  if (!previewPhoto.value || !filtroActivo.value) return
  await nextTick()
  const imgEl = imageRef.value
  if (!imgEl) return
  if (!imgEl.complete || imgEl.naturalWidth === 0) {
    await new Promise(r => { imgEl.onload = r; imgEl.onerror = r })
  }
  if (!modelosListos()) return
  await aplicarFiltro()
})

const aplicarFiltro = async () => {
  const img = imageRef.value
  const canvas = canvasRef.value
  if (!img || !canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  try {
    const detections = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
    if (!detections) return

    const lm = detections.landmarks
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

    await dibujarStickerSegunFiltro(ctx, { eyeCenter, eyeDist, angle, headTopY, noseTip })
  } catch (err) {
    console.error('❌ Error en la detección:', err)
  }
}

const dibujarStickerSegunFiltro = async (ctx, m) => {
  const { eyeCenter, eyeDist, angle, headTopY, noseTip } = m

  if (filtroActivo.value === 'lentes') {
    const img = STICKERS.lentes
    if (!img?.complete) await new Promise(r => (img.onload = r, img.onerror = r))
    const targetW = eyeDist * 2.2
    const ratio = img.naturalHeight / img.naturalWidth || 0.35
    const targetH = targetW * ratio
    drawCenteredRotated(ctx, img, eyeCenter.x, eyeCenter.y + eyeDist * 0.02, targetW, targetH, angle)
  }

  if (filtroActivo.value === 'princesa') { // <-- coincide con la UI
    const img = STICKERS.princesa
    if (!img?.complete) await new Promise(r => (img.onload = r, img.onerror = r))
    const targetW = eyeDist * 3.0
    const ratio = img.naturalHeight / img.naturalWidth || 0.5
    const targetH = targetW * ratio
    drawCenteredRotated(ctx, img, eyeCenter.x, headTopY - targetH * 0.15, targetW, targetH, angle)
  }

  if (filtroActivo.value === 'perrito') {
    const img = STICKERS.perrito
    if (!img?.complete) await new Promise(r => (img.onload = r, img.onerror = r))
    const targetW = eyeDist * 3.0
    const ratio = img.naturalHeight / img.naturalWidth || 0.8
    const targetH = targetW * ratio
    drawCenteredRotated(ctx, img, noseTip.x+20, noseTip.y - eyeDist * 1.2, targetW, targetH, angle)
  }
}


// 📷 Cámara
const abrirCamara = async () => {
  if (navigator.mediaDevices?.getUserMedia) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true })
      dialog.value = true
      await nextTick()
      if (videoRef.value) videoRef.value.srcObject = stream
      console.log('✅ Cámara detectada')
    } catch (err) {
      console.warn('⚠️ No se pudo acceder a la cámara, usar input file')
      fileInput.value?.click()
    }
  } else {
    console.warn('❌ Este dispositivo no tiene cámara')
    fileInput.value?.click()
  }
}

const tomarFoto = () => {
  if (!videoRef.value) return
  const canvasTmp = document.createElement('canvas')
  canvasTmp.width = videoRef.value.videoWidth
  canvasTmp.height = videoRef.value.videoHeight
  canvasTmp.getContext('2d').drawImage(videoRef.value, 0, 0)
  previewPhoto.value = canvasTmp.toDataURL('image/png')
  formData.value.photo = previewPhoto.value
  cerrarCamara()
}

const cerrarCamara = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  dialog.value = false
}

const mostrarPreview = (e) => {
  const file = e.target.files ? e.target.files[0] : formData.value.photo
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      previewPhoto.value = ev.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 💾 Guardar imagen final (si ya se dibujó en canvas)
const guardarFoto = () => {
  if (!canvasRef.value) return
  const dataUrl = canvasRef.value.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = 'foto_con_filtro.png'
  link.click()
}

// Envío (mock)
const submitForm = async () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    console.log('Datos:', formData.value)
    alert('Registro exitoso 🚀')
    emit('update:modelValue', false)
  }, 1500)
}
</script>

<style scoped>
/* Ajustes menores opcionales */
</style>

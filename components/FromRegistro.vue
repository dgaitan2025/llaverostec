<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { abrirCamara, cerrarCamara, tomarFoto, mostrarPreview } from "../utils/camara"
import { initStickers, aplicarFiltro, previewPhoto, imageRef, canvasRef } from "../utils/stickers"
import { useRouter } from 'vue-router'
import { convertirABase64 } from "../utils/funciones.js"
import dialogStatus from "../components/dialogStatus.vue"

const router = useRouter()
const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(["update:modelValue"])
const filtrosActivos = ref([])
const valid = ref(false)
const loading = ref(false)
const form = ref(null)
const dialog = ref(false)
const videoRef = ref(null)
const fileInput = ref(null)

const dialogEvento = ref(false)
const loadingEvento = ref(false)
const dialogState = ref("")
const dialogMessage = ref("")


//Reglas para validar campos
const rules = {
    required: v => !!v || "Este campo es obligatorio",
    email: v => /.+@.+\..+/.test(v) || "Correo inválido",
    combo: v => (v && v.length > 0) || "Debe seleccionar al menos una notificación",
    avatar: v => !!v || "Debe capturar o subir una foto"
}

//Al detectar cambios, ejecuta cambiar el filtro
watch(filtrosActivos, async (nuevo) => {

    const blob = await aplicarFiltro(nuevo, formData)
    formData.value.fotografia2 = blob
    console.log("foto filtro:", formData.photoAvatar)
})

//Opciones de camara
const onAbrirCamara = () => {
    abrirCamara(dialog, videoRef, fileInput)
}

const onCerrarCamara = () => {
    cerrarCamara(dialog)
}

const onTomarFoto = () => {
    tomarFoto(videoRef, formData, () => cerrarCamara(dialog))
}

//Limpia el formulario al cerrar
const resetForm = () => {
    form.value?.reset()
    form.value?.resetValidation()

    Object.assign(formData.value, {
        email: "",
        telefono: "",
        fechaNacimiento: "",
        nickname: "",
        passwordHash: "",
        fotografia: "",
        fotografiaMime: "",
        fotografia2: "",
        fotografia2Mime: "",
        rolId: 4
        //notifications: []
    })

    previewPhoto.value = null
    filtrosActivos.value = []
    emit("update:modelValue", false)
}

// Datos del formulario
const formData = ref({
    email: "",
    telefono: "",
    fechaNacimiento: "", // formato YYYY-MM-DD
    nickname: "",
    passwordHash: "",
    fotografia: "",       // si no mandas imagen, usa null
    fotografiaMime: "",
    fotografia2: "",
    fotografia2Mime: "",
    rolId: 4
})

const fromNoti = ref({
    notifications: ""


})

//Inica los sticket y al tomar la foto se abre la vista previa
onMounted(() => initStickers())
watch(previewPhoto, () => aplicarFiltro())

//Opcion para descargar la foto
const guardarFoto = () => {
    if (!canvasRef.value) return
    const dataUrl = canvasRef.value.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "foto_con_filtro.png"
    a.click()
}

//envia los campos al backend
const submitForm = async () => {
  // 🔹 Mostrar el diálogo en modo "procesando"
  dialogEvento.value = true
  loadingEvento.value = true
  dialogState.value = ""
  dialogMessage.value = ""

  // 🔹 Validar que existan fotos


  if (!formData.value.fotografia || !formData.value.fotografia2) {
    loadingEvento.value = false
    dialogState.value = "error"
    dialogMessage.value = "⚠️ Debe capturar una foto y aplicar un filtro antes de registrar"
    return
  }

  // 🔹 Validación del formulario
  const { valid } = await form.value.validate()
  if (!valid) {
    loadingEvento.value = false
    dialogState.value = "error"
    dialogMessage.value = "⚠️ Por favor corrige los errores del formulario"
    return
  }

    const base64Foto = await convertirABase64(formData.value.fotografia)
  formData.value.fotografia = base64Foto

  const base64Foto2 = await convertirABase64(formData.value.fotografia2)
  formData.value.fotografia2 = base64Foto2

  try {
    // 🔹 Enviar datos a la API
    const response = await fetch("https://api-llaveros.onrender.com/api/usuarios/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()
    console.log("Respuesta API:", data)

    if (response.ok) {
      // ✅ Éxito
      dialogState.value = "success"
      dialogMessage.value = "Registro exitoso 🚀"
      emit("update:modelValue", false)

      // 👇 si quieres redirigir
      // router.push('/usuario')
    } else {
      // ❌ Error de validación en API
      dialogState.value = "error"
      dialogMessage.value = data?.title || "❌ Error al registrar el usuario"
    }
  } catch (error) {
    console.error("Error creando usuario:", error)
    dialogState.value = "error"
    dialogMessage.value = "❌ Error de conexión con el servidor"
  } finally {
    // 🔹 Quitar el spinner
    loadingEvento.value = false
  }
}


//Valida que el nickname no exista
const validarNickname = async (value) => {
    if (!value) return "El nickname es obligatorio"
    try {
        const response = await fetch(
            `https://micolegio.somee.com/api/usuarios/validar?nombre=${value}`
        )
        const data = await response.json()
        return data.existe === false || "El nickname ya está en uso"
    } catch {
        return "Error al validar nickname"
    }
}

</script>

<template>
    <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="600px"
        persistent>
        <v-card>
            <v-toolbar color="indigo-lighten-1" dark>
                <v-toolbar-title>Registro de usuario</v-toolbar-title>
            </v-toolbar>

            <v-card-text>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <!-- campos -->
                    <v-text-field v-model="formData.nickname" label="Nickname" :rules="[rules.required]" required />
                    <v-text-field v-model="formData.email" label="Correo" type="email"
                        :rules="[rules.required, rules.email]" required />
                    <v-text-field v-model="formData.telefono" label="Teléfono" type="tel" :rules="[rules.required]"
                        required />
                    <v-text-field v-model="formData.fechaNacimiento" label="Fecha nacimiento" type="date"
                        :rules="[rules.required]" required />

                    <v-text-field v-model="formData.passwordHash" label="Contraseña" type="password"
                        :rules="[rules.required]" required />

                    <!-- ComboBox validado -->
                    <v-combobox v-model="fromNoti.notifications" label="Notificaciones" :items="['Correo', 'WhatsApp']"
                        multiple chips :rules="[rules.combo]" required />

                    <!-- Fotografía -->
                    <div class="d-flex ga-3 mt-2">
                        <v-btn color="secondary" @click="onAbrirCamara" prepend-icon="mdi-camera">
                            Tomar Foto
                        </v-btn>

                        <v-dialog v-model="dialog" max-width="600">
                            <v-card>
                                <v-card-title>Tomar Foto</v-card-title>
                                <v-card-text>
                                    <video ref="videoRef" autoplay playsinline style="width:100%; border-radius:8px;" />
                                </v-card-text>
                                <v-card-actions>
                                    <v-btn color="green" @click="onTomarFoto">Capturar</v-btn>
                                    <v-btn color="red" @click="onCerrarCamara">Cancelar</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                        <input ref="fileInput" type="file" accept="image/*" style="display:none"
                            @change="mostrarPreview" />
                    </div>
                </v-form>

                <img v-if="previewPhoto" :src="previewPhoto" ref="imageRef" alt="" style="display:none" />
                <canvas v-if="previewPhoto" ref="canvasRef" style="max-width:100%; border:1px solid #ccc;" />



                <div v-if="previewPhoto" class="text-center mt-3">
                    <v-combobox v-model="filtrosActivos" label="Filtros / Stickers"
                        :items="['perrito', 'princesa', 'lentes', 'bigote']" multiple chips />
                    <v-btn color="success" @click="guardarFoto">Guardar Foto</v-btn>
                </div>
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn variant="text" color="red" @click="resetForm">Cancelar</v-btn>
                <v-btn color="primary" :loading="loading" @click="submitForm">Registrar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <dialogStatus
  v-model="dialogEvento"
  :loading="loadingEvento"
  :state="dialogState"
  :message="dialogMessage"
  :auto-close="3000"
/>
</template>

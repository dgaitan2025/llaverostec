<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { abrirCamara, cerrarCamara, tomarFoto, mostrarPreview } from "../utils/camara"
import { initStickers, aplicarFiltro, previewPhoto, imageRef, canvasRef } from "../utils/stickers"
import { useRouter } from 'vue-router'

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


//Reglas para validar campos
const rules = {
    required: v => !!v || "Este campo es obligatorio",
    email: v => /.+@.+\..+/.test(v) || "Correo inválido",
    combo: v => (v && v.length > 0) || "Debe seleccionar al menos una notificación",
    avatar: v => !!v || "Debe capturar o subir una foto"
}

//Al detectar cambios, ejecuta cambiar el filtro
watch(filtrosActivos, async (nuevo) => {
    const base64 = await aplicarFiltro(nuevo, formData)
    formData.value.photoAvatar = base64
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
    // Limpia los campos de texto y reglas
    form.value?.reset()
    form.value?.resetValidation()

    // Limpia manualmente tu objeto formData
    Object.assign(formData.value, {
        nombre: "",
        email: "",
        phone: "",
        birthdate: "",
        nickname: "",
        password: "",
        photoUser: null,
        photoAvatar: null,
        notifications: []
    })

    // Limpia foto y filtros
    previewPhoto.value = null
    filtrosActivos.value = []

    // Cierra el diálogo
    emit("update:modelValue", false)
}

// Datos del formulario
const formData = ref({
    nombre: "",
    email: "",
    phone: "",
    birthdate: "",
    nickname: "",
    password: "",
    photoUser: null,
    photoAvatar: null,
    notifications: []
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
    if (!formData.value.photoUser || !formData.value.photoAvatar) {
    alert("⚠️ Debe capturar una foto y aplicar un filtro antes de registrar")
    return
  }
    const { valid } = await form.value.validate()
    if (!valid) {
        return
    }

    setTimeout(() => {
        loading.value = false
        console.log("Datos:", formData.value)
        alert("Registro exitoso 🚀")
        emit("update:modelValue", false)

        // 👇 redirección programática
        router.push('/usuario')
    }, 800)
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
                    <v-text-field v-model="formData.nombre" label="Nombre" :rules="[rules.required]" required />
                    <v-text-field v-model="formData.email" label="Correo" type="email"
                        :rules="[rules.required, rules.email]" required />
                    <v-text-field v-model="formData.phone" label="Teléfono" type="tel" :rules="[rules.required]"
                        required />
                    <v-text-field v-model="formData.birthdate" label="Fecha nacimiento" type="date"
                        :rules="[rules.required]" required />
                    <v-text-field v-model="formData.nickname" label="Nickname" :rules="[rules.required]" required />
                    <v-text-field v-model="formData.password" label="Contraseña" type="password"
                        :rules="[rules.required]" required />

                    <!-- ComboBox validado -->
                    <v-combobox v-model="formData.notifications" label="Notificaciones" :items="['Correo', 'WhatsApp']"
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
</template>

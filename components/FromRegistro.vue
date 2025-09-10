<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { abrirCamara, cerrarCamara, tomarFoto, mostrarPreview } from "../utils/camara"
import { initStickers, aplicarFiltro, filtros, filtroActivo, previewPhoto, imageRef, canvasRef } from "../utils/stickers"
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(["update:modelValue"])
const filtrosActivos = ref([])
watch(filtrosActivos, async (nuevo) => {
  const base64 = await aplicarFiltro(nuevo, formData)
  formData.value.photoAvatar=base64
  console.log("foto filtro:", formData.photoAvatar)
})

const valid = ref(false)
const loading = ref(false)

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

// datos a enviar a db
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

const dialog = ref(false)
const videoRef = ref(null)
const fileInput = ref(null)
onMounted(() => initStickers())
onBeforeUnmount(() => cerrarCamara(dialog))
watch(previewPhoto, () => aplicarFiltro())
watch(filtroActivo, () => aplicarFiltro())

const guardarFoto = () => {
    if (!canvasRef.value) return
    const dataUrl = canvasRef.value.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "foto_con_filtro.png"
    a.click()
}

const submitForm = async () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    console.log("Datos:", formData.value)
    alert("Registro exitoso 🚀")
    emit("update:modelValue", false)

    // 👇 redirección programática
    router.push('/usuario')
  }, 800)
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
                    <v-text-field v-model="formData.nombre" label="Nombre y apellido" prepend-inner-icon="mdi-account"
                        required />
                    <v-text-field v-model="formData.email" label="Correo electrónico" type="email"
                        prepend-inner-icon="mdi-email" :rules="[v => !!v || 'El correo es requerido']" required />
                    <v-text-field v-model="formData.phone" label="Número de teléfono" type="tel"
                        prepend-inner-icon="mdi-phone" :rules="[v => !!v || 'El teléfono es requerido']" required />
                    <v-text-field v-model="formData.birthdate" label="Fecha de nacimiento" type="date"
                        prepend-inner-icon="mdi-calendar" required />
                    <v-text-field v-model="formData.nickname" label="Nickname" prepend-inner-icon="mdi-account"
                        required />
                    <v-text-field v-model="formData.password" label="Contraseña" type="password"
                        prepend-inner-icon="mdi-lock" required />

                    <v-combobox v-model="formData.notifications" label="Notificaciones"
                        :items="['Correo', 'WhatsApp']" multiple chips />

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
                <v-btn variant="text" color="red" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
                <v-btn color="primary" :loading="loading" @click="submitForm">Registrar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

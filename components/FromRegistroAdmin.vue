<script setup>
import { ref, onMounted, watch } from "vue"
import { abrirCamara, cerrarCamara, tomarFoto, mostrarPreview } from "../utils/camara"
import { initStickers, aplicarFiltro, previewPhoto, imageRef, canvasRef } from "../utils/stickers"
import dialogStatus from "../components/dialogStatus.vue"
import { UrlWithApiRD, ENDPOINTS } from "../Service/apiConfig"
import { validarEdad } from "../utils/FuncionesRegistro"
import { toRaw } from "vue"

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
const cierre = ref()


//Reglas para validar campos
const rules = {
    required: v => !!v || "Este campo es obligatorio",
    email: v => /.+@.+\..+/.test(v) || "Correo inválido",
    combo: v => (v && v.length > 0) || "Debe seleccionar al menos una notificación",
    avatar: v => !!v || "Debe capturar o subir una foto",
    onlyNumbers: v => /^[0-9]*$/.test(v) || 'Solo se permiten números',
    exactLength: v => v.length === 8 || 'El teléfono debe tener 8 dígitos',
    edad: validarEdad
}

//Opciones de camara
const onCerrarCamara = () => {
    cerrarCamara(dialog)
}

// Validación para confirmar que las contraseñas coincidan

const showPassword = ref(false)
const passwordsMatch = v =>
    v === formData.value.PasswordPlano || 'Las contraseñas no coinciden'

const onAbrirCamara = () => {
    abrirCamara(dialog, videoRef, fileInput)
}

const onTomarFoto = async () => {
    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""
    const respuesta = await tomarFoto(videoRef, formData, () => cerrarCamara(dialog))
    if (respuesta.resultado) {
        loadingEvento.value = false
        dialogState.value = "success"
        dialogMessage.value = respuesta.mensaje
        cierre.value = 2000

    } else {

        loadingEvento.value = false
        dialogState.value = "error"
        dialogMessage.value = respuesta.mensaje
        cierre.value = false
    }
}

//Al detectar cambios, ejecuta cambiar el filtro
watch(filtrosActivos, async (nuevo) => {
    const resultado = await aplicarFiltro(nuevo, formData)

    if (!resultado) return   // 👈 si es undefined, no sigue

    formData.value.Fotografia2Base64 = resultado.foto   // ✅ guardar la imagen/base64

})

const roles = ref([
    { text: "Administrador", value: 1 },
    { text: "Operador", value: 5 },
    { text: "Supervisor", value: 2 },
    { text: "Cliente", value: 4 },
    { text: "Repartidor", value: 3 },
    { text: "EntregaTienda", value: 6 },
])


//Limpia el formulario al cerrar
const resetForm = () => {
    form.value?.reset()
    form.value?.resetValidation()

    Object.assign(formData.value, {
        Email: "",
        Nickname: "",
        PasswordPlano: "",
        Telefono: "",
        FechaNacimiento: "",
        RolId: "",
        FotografiaBase64: "",
        fotografiaMime: "image/png",
        Fotografia2Base64: "",
        Fotografia2Mime: "image/png"
        //notifications: []
    })

    previewPhoto.value = null
    filtrosActivos.value = []
    emit("update:modelValue", false)
}

// Datos del formulario
const formData = ref({
    Email: "",
    Nickname: "",
    PasswordPlano: "",
    Telefono: "",
    FechaNacimiento: "", // formato YYYY-MM-DD
    RolId: "",
    FotografiaBase64: "",       // si no mandas imagen, usa null
    FotografiaMime: "image/png",
    Fotografia2Base64: "",
    Fotografia2Mime: "image/png"

})

const fromNoti = ref({
    notifications: ""
})

//Inica los sticket y al tomar la foto se abre la vista previa
onMounted(() => initStickers())


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


    if (!formData.value.FotografiaBase64 || !formData.value.Fotografia2Base64) {
        loadingEvento.value = false
        dialogState.value = "error"
        dialogMessage.value = "⚠️ Debe capturar una foto y aplicar un filtro antes de registrar"
        cierre.value = 5000
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

    try {
        // 🔹 Enviar datos a la API
        const response = await fetch(UrlWithApiRD(ENDPOINTS.registro), {
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
            dialogMessage.value = data.mensaje || "❌ Error al registrar el usuario"
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
                    <v-text-field v-model="formData.Nickname" label="Nickname" :rules="[rules.required]" required />
                    <v-text-field v-model="formData.Email" label="Correo" type="email"
                        :rules="[rules.required, rules.email]" required />
                    <v-text-field v-model="formData.Telefono" label="Teléfono" type="tel" maxlength="8"
                        :rules="[rules.required, rules.onlyNumbers, rules.exactLength]" required />
                    <v-text-field v-model="formData.FechaNacimiento" label="Fecha nacimiento" type="date"
                        :rules="[rules.required, rules.edad]" required />

                    <v-text-field v-model="formData.PasswordPlano" label="Contraseña"
                        :type="showPassword ? 'text' : 'password'"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="showPassword = !showPassword" :rules="[rules.required]" required />

                    <v-text-field v-model="formData.PasswordRepeat" label="Repetir contraseña"
                        :type="showPassword ? 'text' : 'password'"
                        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                        @click:append-inner="showPassword = !showPassword" :rules="[rules.required, passwordsMatch]"
                        required />


                    <!-- ComboBox validado -->
                    <v-combobox v-model="fromNoti.notifications" label="Notificaciones" :items="['Correo', 'WhatsApp']"
                        multiple chips :rules="[rules.combo]" required />

                    <v-select v-model="formData.RolId" :items="roles" item-title="text" item-value="value"
                        label="Tipo de usuario" :rules="[rules.required]" required />

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

    <dialogStatus v-model="dialogEvento" :loading="loadingEvento" :state="dialogState" :message="dialogMessage"
        :auto-close="cierre" />
</template>

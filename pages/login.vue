<template>
    <v-container fluid class="d-flex align-center justify-center fill-height">
        <v-row align="center" justify="center" class="w-100">
            <v-col cols="12" sm="8" md="6" lg="4">
                <!-- Logo -->
                <NuxtLink to="/" class="d-flex justify-center">
                    <v-img class="mx-auto my-6" max-width="60" src="/imagenes/Logo.jpg" />
                </NuxtLink>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <!-- Card de login -->
                    <v-card class="mx-auto pa-6 pa-sm-8" elevation="8" rounded="lg">
                        <div class="text-subtitle-1 text-medium-emphasis mb-2">Usuario</div>

                        <!-- Email -->
                        <v-text-field ref="usuarioField" v-model="formData.usuario" density="compact"
                            placeholder="Nombre de usuario" prepend-inner-icon="mdi-account" variant="outlined"
                            :rules="[rules.required]" required />

                        <!-- Password -->
                        <div
                            class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between mb-2">
                            Contraseña
                            <a class="text-caption text-decoration-none text-blue" href="#"
                                @click.prevent="showRecuperar = true" rel="noopener noreferrer" target="_blank">
                                Recuperar contraseña
                            </a>
                        </div>

                        <v-text-field v-model="formData.password"
                            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                            :type="visible ? 'text' : 'password'" density="compact" placeholder="Ingrese contraseña"
                            prepend-inner-icon="mdi-lock-outline" variant="outlined" :rules="[rules.required]" required
                            @click:append-inner="visible = !visible" />
                        <div class="d-flex justify-center my-4">
                            <v-btn icon size="s-large" class="d-flex justify-center align-center" @click="faceID">
                                <v-icon size="48" color="indigo-lighten-1">mdi-face-recognition</v-icon>
                            </v-btn>
                        </div>
                        <!-- Botón login -->
                        <v-btn class="mb-6" color="blue" size="large" variant="tonal" block @click="submitForm">
                            Ingresar
                        </v-btn>

                        <!-- Signup -->
                        <v-card-text class="text-center">
                            <a class="text-blue text-decoration-none" href="#" @click.prevent="showRegistrar = true"
                                rel="noopener noreferrer" target="_blank">
                                Registro
                                <v-icon icon="mdi-chevron-right"></v-icon>
                            </a>
                        </v-card-text>
                    </v-card>
                </v-form>
                <RecuperarDialog v-model="showRecuperar" />
                <RegistroDialog v-model="showRegistrar" />
            </v-col>
        </v-row>

        <client-only>
            <PiePagina />
        </client-only>
    </v-container>
    <dialogStatus v-model="dialogEvento" :loading="loadingEvento" :state="dialogState" :message="dialogMessage"
        :auto-close="3000" />
</template>

<script setup>
const usuarioField = ref(null)
import { ref } from "vue"
import PiePagina from "../components/piePagina.vue"
import RecuperarDialog from "../components/recuperarclave.vue"
import RegistroDialog from "../components/FromRegistro.vue"
import { useRouter } from "vue-router"
import dialogStatus from "../components/dialogStatus.vue"

const dialogEvento = ref(false)
const loadingEvento = ref(false)
const dialogState = ref("")
const dialogMessage = ref("")
const loading = ref(false)
const usuarioLogueado = ref(null)
const errorMsg = ref("")

const router = useRouter()
const showRecuperar = ref(false)
const showRegistrar = ref(false)
const visible = ref(false)

const formData = ref({
    usuario: "",
    password: "",
    photo: ""
})



const rules = {
    required: v => !!v || "Este campo es obligatorio",
    email: v => /.+@.+\..+/.test(v) || "Correo inválido"
}

const valid = ref(false)
const form = ref(null)

const faceID = async () => {


    const errors = await usuarioField.value.validate() // 👉 []
    if (errors.length > 0) {
        console.log("❌ Error:", errors[0])
        return
    }

    console.log("✅ Usuario válido:", formData.value.usuario)
    router.push("/usuario")


    console.log("Validación correcta, procesando...")

    setTimeout(() => {
        console.log("✅ Datos:", formData.value)
        router.push("/usuario")
    }, 800)
}

const submitForm = async () => {
    await form.value.validate()
    if (!formData.value.usuario || !formData.value.password) {
        return
    }

    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""


    try {
        const response = await fetch("https://api-llaveros.onrender.com/api/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData.value)
        })

        const data = await response.json()
        console.log("Respuesta API:", data)

        if (response.ok && data.success) {
            usuarioLogueado.value = data.usuario
            localStorage.setItem("usuario", JSON.stringify(data.usuario))

            // ✅ Actualiza el diálogo
            loadingEvento.value = false
            dialogState.value = "success"
            dialogMessage.value = "Bienvenido " + data.usuario.nickname

            // Redirección opcional
            router.push("/usuario")
        } else {
            // ❌ Error de credenciales
            loadingEvento.value = false
            dialogState.value = "error"
            dialogMessage.value = data.message || "Error al iniciar sesión"
        }
    } catch (err) {
        // ❌ Error de red
        loadingEvento.value = false
        dialogState.value = "error"
        dialogMessage.value = "Error de conexión con el servidor"
        console.error(err)
    } finally {
        loading.value = false
    }
}
</script>

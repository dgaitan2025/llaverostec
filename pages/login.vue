<template>
    <v-container fluid class="d-flex align-center justify-center fill-height">
        <v-row align="center" justify="center" class="w-100">
            <v-col cols="12" sm="8" md="6" lg="4">
                <!-- Logo -->
                <NuxtLink to="/" class="d-flex justify-center">
                    <v-img class="mx-auto my-6" max-width="60" src="/imagenes/Logo.jpg" />
                </NuxtLink>
                <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="submitForm">
                    <!-- Card de login -->
                    <v-card class="mx-auto pa-6 pa-sm-8" elevation="8" rounded="lg">
                        <div class="text-subtitle-1 text-medium-emphasis mb-2">Usuario</div>

                        <!-- Email -->
                        <v-text-field ref="usuarioField" v-model="formData.Identificador" density="compact"
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

                        <v-text-field v-model="formData.Password"
                            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                            :type="visible ? 'text' : 'password'" density="compact" placeholder="Ingrese contraseña"
                            prepend-inner-icon="mdi-lock-outline" variant="outlined" :rules="[rules.required]" required
                            @click:append-inner="visible = !visible" />
                        <div class="d-flex justify-center my-4">
                            <v-btn icon size="s-large" class="d-flex justify-center align-center"
                                @click="onAbrirCamara">
                                <v-icon size="48" color="indigo-lighten-1">mdi-face-recognition</v-icon>
                            </v-btn>

                            <v-dialog v-model="dialog" max-width="600">
                                <v-card>
                                    <v-card-title>Tomar Foto</v-card-title>
                                    <v-card-text>
                                        <video ref="videoRef" autoplay playsinline
                                            style="width:100%; border-radius:8px;" />
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn color="green" @click="onTomarFoto">Capturar</v-btn>
                                        <v-btn color="red" @click="onCerrarCamara">Cancelar</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                        </div>
                        <!-- Botón login -->
                        <v-btn class="mb-6" color="blue" size="large" variant="tonal" block type="submit">
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
import { UrlWithApiRD, ENDPOINTS } from "../Service/apiConfig"
import { VerificarRostro } from "../utils/ApiRostro"
import { abrirCamara, cerrarCamara, tomarFaceID, mostrarPreview } from "../utils/camara"

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
    Identificador: "",
    Password: "",
    FotografiaBase64: "",
    Foto: ""
})



const rules = {
    required: v => !!v || "Este campo es obligatorio",
    email: v => /.+@.+\..+/.test(v) || "Correo inválido"
}

const valid = ref(false)
const form = ref(null)


const submitForm = async () => {
    await form.value.validate()
    if (!formData.value.Identificador || !formData.value.Password) {
        return
    }

    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""


    try {
        const response = await fetch(UrlWithApiRD(ENDPOINTS.login), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData.value)
        })

        const data = await response.json()
        console.log("Respuesta API:", data)


        if (response.ok && data.estaActivo) {
            localStorage.setItem("usuario", JSON.stringify(data))
            const token = useCookie("token")
            token.value = JSON.stringify({ nickname: data.token })
            loadingEvento.value = false
            dialogState.value = "success"
            dialogMessage.value = "Bienvenido " + data.nickname

            console.log("validando ROL", data.usuario.rolId)

            // Redirigir según el rol
            if (data.usuario.rolId === 4) {
                router.push("/usuario")
            } else if (data.usuario.rolId === 5) {
                router.push("/operador")
            }else if (data.usuario.rolId === 6) {
                router.push("/mostrador")
            }else if (data.usuario.rolId === 3) {
                router.push("/repartidor")
            }else if (data.usuario.rolId === 1) {
                router.push("/administrador")
            }else if (data.usuario.rolId === 2) {
                router.push("/supervisor")
            }
             else {
                navigateTo('/') // fallback
            } 


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
        dialogMessage.value = err.message.includes("Credenciales")
            ? err.message
            : "Error de conexión con el servidor"
        console.error(err)
    } finally {
        loading.value = false
    }
}

// Reconocimiento facial 

const dialog = ref(false)
const fileInput = ref(null)
const videoRef = ref(null)
const onAbrirCamara = async () => {
    await form.value.validate()
    if (!formData.value.Identificador) {
        return
    }
    abrirCamara(dialog, videoRef, fileInput)
}

const onCerrarCamara = () => {
    cerrarCamara(dialog)
}



/*

const onTomarFoto = async () => {
    tomarFoto(videoRef, formData, () => cerrarCamara(dialog))

    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""


    try {
        const response = await fetch(
            `https://api-llaveros.onrender.com/api/usuarios/by-nickname/${formData.value.Identificador}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            }
        )

        const data = await response.json()
        console.log("Respuesta API:", data)

        if (response.ok && data.success) {
            usuarioLogueado.value = data.usuario
            localStorage.setItem("usuario", JSON.stringify(data.usuario))


            
        } else {
            loadingEvento.value = false
            dialogState.value = "error"
            dialogMessage.value = data.message || "Error en la autenticación"
        }
    } catch (err) {
        loadingEvento.value = false
        dialogState.value = "error"
        dialogMessage.value = "Error de conexión con el servidor"
        console.error(err)
    } finally {
        loading.value = false
    }



    Verificar().then(respuesta => {
        console.log("👉 Respuesta API rostro:", respuesta)

        if (respuesta?.coincide) {
            
            loadingEvento.value = false
            dialogState.value = "success"
            dialogMessage.value = "Bienvenido" 

            router.push("/usuario")
        } else {
            console.error("❌ No se pudo verificar rostro")
             loadingEvento.value = false
            dialogState.value = "error"
            dialogMessage.value = "Error en la autenticación"
        }

       
    })
}*/

const onTomarFoto = async () => {
    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""
    // 👇 Capturamos el resultado
    const respuesta = await tomarFaceID(videoRef, formData,"Foto", () => cerrarCamara(dialog))

    if (!respuesta.resultado) {
        loadingEvento.value = false
        dialogState.value = "error"
        dialogMessage.value = "No se pudo capturar la foto"
        return
    }

    
    console.log("foto capturada:", formData.value.Foto.substring(0, 50))

    try {
        const response = await fetch(UrlWithApiRD(ENDPOINTS.loginFace), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData.value)
        })

        const data = await response.json()
        console.log("Respuesta API:", data)

        if(!data.success){
            loadingEvento.value = false
            dialogState.value = "error";
            dialogMessage.value = data.message;
        }else if (response.ok && data.usuario.estaActivo) {
            localStorage.setItem("usuario", JSON.stringify(data.usuario))
            const token = useCookie("token")
            token.value = JSON.stringify({ nickname: data.usuario.token })
            loadingEvento.value = false
            dialogState.value = "success"
            dialogMessage.value = "Bienvenido " + data.usuario.nickname

            // Redirigir según el rol
            if (data.usuario.rolId === 4) {
                router.push("/usuario")
            } else if (data.usuario.rolId === 5) {
                router.push("/operador")
            }else if (data.usuario.rolId === 6) {
                router.push("/mostrador")
            }else if (data.usuario.rolId === 3) {
                router.push("/repartidor")
            }else if (data.usuario.rolId === 1) {
                router.push("/administrador")
            }else if (data.usuario.rolId === 2) {
                router.push("/supervisor")
            }
             else {
                navigateTo('/') // fallback
            } 


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
        dialogMessage.value = err.message.includes("Credenciales")
            ? err.message
            : "Error de conexión con el servidor"
        console.error(err)
    } finally {
        loading.value = false
    }


}
</script>

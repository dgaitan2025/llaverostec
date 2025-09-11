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
                        <v-text-field v-model="formData.usuario" density="compact" placeholder="Nombre de usuario"
                            prepend-inner-icon="mdi-account" variant="outlined" :rules="[rules.required]" required />

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
</template>

<script setup>
import { ref } from "vue"
import PiePagina from "../components/piePagina.vue"
import RecuperarDialog from "../components/recuperarclave.vue"
import RegistroDialog from "../components/FromRegistro.vue"
import { useRouter } from "vue-router"

const router = useRouter()
const showRecuperar = ref(false)
const showRegistrar = ref(false)
const visible = ref(false)

const formData = ref({
    usuario: "",
    password: ""
})

const rules = {
    required: v => !!v || "Este campo es obligatorio",
    email: v => /.+@.+\..+/.test(v) || "Correo inválido"
}

const valid = ref(false)
const form = ref(null)
const submitForm = async () => {
    await form.value.validate()
    if (!formData.value.usuario || !formData.value.password) {
        return
    }

    setTimeout(() => {
        console.log("✅ Datos:", formData.value)

        router.push("/usuario")
    }, 800)
}
</script>

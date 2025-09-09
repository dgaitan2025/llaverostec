<template>
    <v-container fluid class="d-flex align-center justify-center fill-height">
        <v-row align="center" justify="center" class="w-100">
            <v-col cols="12" sm="8" md="6" lg="4">
                <!-- Logo -->
                <NuxtLink to="/" class="d-flex justify-center">
                    <v-img class="mx-auto my-6" max-width="60" src="/imagenes/Logo.jpg" />
                </NuxtLink>

                <!-- Card de login -->
                <v-card class="mx-auto pa-6 pa-sm-8" elevation="8" rounded="lg">
                    <div class="text-subtitle-1 text-medium-emphasis mb-2">Account</div>

                    <!-- Email -->
                    <v-text-field density="compact" placeholder="Email address" prepend-inner-icon="mdi-email-outline"
                        variant="outlined"></v-text-field>

                    <!-- Password -->
                    <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between mb-2">
                        Password
                        <a class="text-caption text-decoration-none text-blue" href="#" @click.prevent="showRecuperar = true" rel="noopener noreferrer"
                            target="_blank">
                            Reiniciar contraseña
                        </a>

                    </div>

                    <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                        :type="visible ? 'text' : 'password'" density="compact" placeholder="Enter your password"
                        prepend-inner-icon="mdi-lock-outline" variant="outlined"
                        @click:append-inner="visible = !visible"></v-text-field>

                    <!-- Botón login -->
                    <v-btn class="mb-6" color="blue" size="large" variant="tonal" block>
                        Log In
                    </v-btn>

                    <!-- Signup -->
                    <v-card-text class="text-center">
                        <a class="text-blue text-decoration-none" href="#" @click.prevent="showRegistrar = true" rel="noopener noreferrer" target="_blank">
                            Registro
                            <v-icon icon="mdi-chevron-right"></v-icon>
                        </a>
                    </v-card-text>
                </v-card>
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
import { ref } from "vue";
import PiePagina from "../components/piePagina.vue";
import RecuperarDialog from "../components/recuperarclave.vue"
import RegistroDialog from "../components/FromRegistro.vue"
const showRecuperar = ref(false)
const showRegistrar = ref(false)
const visible = ref(false);
</script>

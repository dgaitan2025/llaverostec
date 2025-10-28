<template>
    <v-container class="pa-6 text-center">
        <h3 class="mb-4">Vista previa con marco dinámico</h3>

        <!-- Subir imagen -->
        <v-file-input label="Seleccionar imagen" accept="image/*" prepend-icon="mdi-image" density="comfortable"
            @change="orientacioIMG" />

        <!-- Marco dinámico -->
        <div class="mx-auto mt-6 position-relative" :style="{
            width: esVertical ? '3.4cm' : '4.9cm',
            height: esVertical ? '4.9cm' : '3.4cm',
            border: '1px solid #000',
            background: '#fff',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            transition: 'all 0.3s ease',
            }">
            <!-- Imagen -->
            <img v-if="imagenBase64" :src="imagenBase64" :style="{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
                transform: `rotate(${rotacion}deg)`,
                transition: 'transform 0.3s ease',
            }" alt="Vista previa" />

            <div v-else style="color: gray;">Sin imagen</div>
            
        </div>

    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { analizarImagen } from "../utils/ResizeImg"


const imagenBase64 = ref(null)
const dimensiones = ref(null)
const rotacion = ref(0)
const esVertical = ref(false)


const orientacioIMG = async (event) => {
    const resultado = await analizarImagen(event)
    if (!resultado) {
        alert("no es una imagen")
        return
    }
    imagenBase64.value = resultado.base64
    dimensiones.value = resultado.dimensiones
    esVertical.value = resultado.esVertical
}



</script>

<style scoped>
.pos-label {
    pointer-events: none;
}
</style>

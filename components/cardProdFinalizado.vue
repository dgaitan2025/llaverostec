<template>
  <v-container fluid>
    <v-row dense>
      <v-col
        v-for="(item, index) in grabados"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="mx-auto" elevation="4" rounded="xl" min-height="200">
          <!-- 🟢 Corrige el src de imagen -->
          

          <v-card-title class="text-center">
            <v-chip color="indigo" text-color="white">
              {{ item.tipo_grabado }}
            </v-chip>
          </v-card-title>

          <v-card-text class="text-center">
            <!-- 🟢 Cambia 'Link' por 'URL' -->
            <template v-if="item.tipo_grabado === 'URL'">
              <p>
                <strong>Link:</strong>
                <a
                  :href="formatLink(item.link)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-darken-2"
                >
                  {{ item.link }}
                </a>
              </p>
            </template>

            <template v-else-if="item.tipo_grabado === 'Contacto'">
              <p><strong>Nombre:</strong> {{ item.nombre || 'No disponible' }}</p>
              <p><strong>Teléfono:</strong> {{ item.telefono || 'No disponible' }}</p>
            </template>
 
            <template v-else>
              <p class="text-grey">Tipo desconocido</p>
            </template>

            <p v-if="item.texto" class="mt-2 text-grey">
              <em>{{ "Orden: " + item.id_Orden }}</em>
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  grabados: {
    type: Array,
    required: true,
  },
});

// Imagen por defecto
const fallbackImage = "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg";

// 🟢 Agrega MIME si falta
function getImageSrc(base64) {
  if (!base64) return fallbackImage;
  if (base64.startsWith("data:image")) return base64;
  return `data:image/png;base64,${base64}`;
}

// 🟢 Asegura que el link tenga protocolo
function formatLink(link) {
  if (!link) return "#";
  if (!/^https?:\/\//i.test(link)) return `https://${link}`;
  return link;
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-grabado {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* distribuye imagen y texto */
  height: 420px; /* puedes ajustar */
}


</style>




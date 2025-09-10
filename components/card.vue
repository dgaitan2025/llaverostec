<template>
  <v-card class="tarjeta-seccion">
    <v-row no-gutters>
      <!-- Imagen -->
      <v-col
        cols="12"
        md="6"
        v-if="imageLeft"
        class="d-flex align-center justify-center"
      >
        <v-img
          :src="image"
          alt="Imagen"
          cover
          class="imagen-card"
        />
      </v-col>

      <!-- Texto -->
      <v-col cols="12" md="6" class="pa-4">
        <v-card-title class="titulo">{{ title }}</v-card-title>
        <v-card-text class="texto" v-html="text"></v-card-text>
      </v-col>

      <!-- Imagen a la derecha -->
      <v-col
        cols="12"
        md="6"
        v-if="!imageLeft"
        class="d-flex align-center justify-center"
      >
        <v-img
          :src="image"
          alt="Imagen"
          cover
          class="imagen-card"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String, required: true },
  imageLeft: { type: Boolean, default: true } // true = imagen a la izquierda
})
</script>

<style scoped>
.tarjeta-seccion {

  height: auto;
  min-height: 400px;
  
  margin: 10px;
  margin-bottom: 20px;
  scroll-margin-top: 70px;
}

.imagen-card {
  width: 100%;   /* ✅ ocupar todo el ancho */
  height: auto;  /* ✅ ocupar todo el alto */
  object-fit: cover; /* ✅ recorta sin deformar */
}

.titulo {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2C3E50;
}

.texto {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
}

</style>

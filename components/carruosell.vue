<template>
  <v-carousel
    width="100%"
    height="500"
    style="max-height: 80vh;"
    show-arrows="hover"
    cycle
  >
    <v-carousel-item
      v-for="(slide, i) in slides"
      :key="i"
    >
      <v-img
        :src="slide"
        height="100%"
        cover
      />
    </v-carousel-item>
  </v-carousel>
</template>

<script setup>
const slides = [
  '/imagenes/llavero.jpg' ,
  '/imagenes/momentos.jpg' ,
  '/imagenes/nfc.jpg' ,
 
]
</script>
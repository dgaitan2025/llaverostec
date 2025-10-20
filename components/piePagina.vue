<template>
  <v-footer class="text-center d-flex flex-column ga-2 py-1 mt-6" color="indigo-lighten-1">
    <div class="d-flex ga-3">
      <v-btn
        v-for="icon in icons"
        :key="icon"
        :icon="icon"
        density="comfortable"
        variant="text"
      ></v-btn>
    </div>

    <v-divider class="my-2" thickness="2" width="50"></v-divider>

    <div class="text-caption font-weight-regular opacity-60">
      De la llama que inspira al llavero que conecta, fusionamos lo artesanal con lo tecnológico para acompañarte siempre.
    </div> 

    <v-divider></v-divider>

    <div>
      {{ new Date().getFullYear() }} — <strong>Teckey</strong>
    </div>
  </v-footer>
</template>
<script setup>
  const icons = [
    'mdi-facebook',
    'mdi-twitter',
    'mdi-instagram',
  ]
</script>
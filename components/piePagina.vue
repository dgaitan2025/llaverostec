<template>
  <v-footer class="text-center d-flex flex-column ga-2 py-1 mt-6" color="indigo-lighten-1">
    <div class="footer-bottom px-4">
      <!-- 🔹 Íconos sociales -->
      <div class="d-flex ga-3 justify-center">
        <v-btn v-for="icon in icons" :key="icon" :icon="icon" density="comfortable" variant="text" color="white" />
      </div>
      
        <!--<v-img src="/imagenes/Logo.png" max-width="90" contain class="footer-logo" /> -->
      


       <!--🔹 Frase -->

      Llavero que conecta, fusionamos lo artesanal
      con lo tecnológico para acompañarte siempre.


      <v-divider class="my-2"></v-divider>
      <div class="text-caption font-weight-medium text-white">
        {{ new Date().getFullYear() }} — <strong>Teckey</strong>
      </div>

      <!-- 🔹 Año, marca y logo en la misma línea -->




    </div>
  </v-footer>
</template>

<script setup>
const icons = ["mdi-facebook", "mdi-twitter", "mdi-instagram"];
</script>

<style scoped>
.footer-bottom {
  width: 100%;
  align-items: center;
  /* centrado vertical */
}

.footer-logo {
  transition: transform 0.3s ease;
  display: block;
  /* ocupa su propia línea */
  margin: 0 auto;
}

.footer-logo:hover {
  transform: scale(1.05);
}
</style>

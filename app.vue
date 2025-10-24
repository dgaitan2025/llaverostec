<template>
  <v-app>
    <div class="contenedor-marca-agua">
      <v-main>
        <!-- Aquí se cargan las páginas -->
        <NuxtPage />
      </v-main>
    </div>
  </v-app>
</template>

<style>
.contenedor-marca-agua {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* 🔹 Imagen de marca de agua */
.contenedor-marca-agua::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("/imagenes/Logo.png") center center no-repeat;
  background-size: 400px; /* Ajusta el tamaño de la imagen */
  opacity: 0.08; /* Controla la transparencia */
  pointer-events: none; /* No bloquea clics ni inputs */
  z-index: 0;
}


</style>

<template>
  <Sidebar
    :foto="formData.photo" 
    title="Sandra Adams"
    subtitle="sandra_a88@gmail.com"
    :items="menuItems"
  >
    <!-- Contenido dinámico dentro del slot -->
    <div class="pa-6">
      <h2>Bienvenido </h2>
      <p>Aquí podras crear tu llavero.</p>
    </div>
  </Sidebar>

  <PiePagina/>
</template>

<script setup>
import Sidebar from "../components/barraUser.vue"
import PiePagina from "../components/piePagina.vue"
import { ref, onMounted } from "vue"

const formData = ref({ photo: "" })

const menuItems = [
  { icon: "mdi-image", title: "Crear llavero", value: "shared" },
  { icon: "mdi-folder", title: "Mis diseños", value: "myfiles" },
  { icon: "mdi-login", title: "Salir", value: "Login" }
]


onMounted(() => {
  if (process.client) {
    const fotoGuardada = localStorage.getItem("fotoUsuario")
    formData.value.photo = fotoGuardada
  }
})
</script>

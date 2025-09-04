<script setup>
import { ref } from 'vue'

const drawer = ref(false)
const goTo = (id) => {
  const section = document.getElementById(id)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' }) // 👈 scroll suave
    drawer.value = false
  }
}
</script>

<template>
  <v-app-bar :elevation="2" rounded color= "#5086c1">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
    </template>

    <v-app-bar-title>Teckey</v-app-bar-title>
     <template v-slot:append>
    <v-btn icon="mdi-facebook"></v-btn>

    <v-btn icon="mdi-whatsapp"></v-btn>

    <v-btn icon="mdi-account"></v-btn>
  </template>
  </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary color= "#5086c1" rounded>
    <v-list>
      <v-list-item link @click="goTo('vision')">
        <v-list-item-title >Visión</v-list-item-title>
      </v-list-item>
      <v-list-item link @click="goTo('mision')">
        <v-list-item-title>Misión</v-list-item-title>
      </v-list-item>
      <v-list-item link @click="goTo('contacto')">
        <v-list-item-title>Contacto</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

</template>


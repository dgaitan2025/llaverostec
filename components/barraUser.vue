<template>
  <v-app>
    <v-navigation-drawer expand-on-hover permanent rail>
      <!-- Usuario -->
      <v-list>
        <v-list-item
          :prepend-avatar="foto"
          :subtitle="subtitle"
          :title="title"
        />
      </v-list>

      <v-divider />

      <!-- Menú dinámico -->
      <v-list density="compact" nav>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          @click="$emit('item-click', item)"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido de la página -->
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
const props = defineProps({
  foto: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  items: { type: Array, required: true, default: () => [] }
})
</script>

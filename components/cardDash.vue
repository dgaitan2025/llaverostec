<template>
  <v-card class="mx-auto my-4" prepend-icon="mdi-tune" :subtitle="orden.faseActual" max-width="800">
    <template v-slot:title>
      <span class="font-weight-black">Orden #{{ orden.id_Orden }}</span>
    </template>
    <div class="px-4 pb-2">
      <v-progress-linear
        color="lime"
        height="10"
        :model-value="orden.porcentaje"
        striped
        rounded
        class="w-100"
      ></v-progress-linear>
      <div class="text-center mt-2">
        <small>Paso {{ orden.pasoActual }} / {{ orden.totalFases }}</small>
      </div>
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  orden: {
    type: Object,
    required: true
  }
})
</script>

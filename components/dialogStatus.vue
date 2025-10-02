<template>
  <v-dialog
    :model-value="internalVisible"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="400"
  >
    <v-card class="pa-6 text-center">
      <!-- Estado cargando -->
      <div v-if="loading">
        <v-progress-circular
          color="primary"
          indeterminate
          :size="59"
          :width="12"
          class="mb-4"
        />
        <div class="text-subtitle-1">Procesando...</div>
      </div>

      <!-- Estado éxito -->
      <div v-else-if="state === 'success'">
        <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
        <div class="text-subtitle-1">{{ message || "Operación exitosa" }}</div>
      </div>

      <!-- Estado error -->
      <div v-else-if="state === 'error'">
        <v-icon color="error" size="64" class="mb-4">mdi-close-circle</v-icon>
        <div class="text-subtitle-1">{{ message || "Ocurrió un error" }}</div>
      </div>

      <!-- Botón cerrar (solo si no está cargando) -->
      <v-card-actions v-if="!loading" class="justify-center">
        <v-btn color="primary" @click="emit('update:modelValue', false)">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  loading: { type: Boolean, default: true },
  state: { type: String, default: "" }, // "success" | "error"
  message: { type: String, default: "" },
  autoClose: { type: [Boolean, Number], default: false }
})

const emit = defineEmits(["update:modelValue"])
const internalVisible = ref(props.modelValue)
let autoCloseTimer = null

watch(
  () => [props.modelValue, props.loading],
  ([visible, loading]) => {
    internalVisible.value = visible

    if (visible && !loading && props.autoClose) {
      // limpiar cualquier timer previo
      if (autoCloseTimer) clearTimeout(autoCloseTimer)

      const delay = typeof props.autoClose === "number" ? props.autoClose : 3000

      autoCloseTimer = setTimeout(() => {
        emit("update:modelValue", false)
        autoCloseTimer = null
      }, delay)
    }
  }
)
</script>

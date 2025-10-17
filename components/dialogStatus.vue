<template>
  <v-dialog
    :model-value="internalVisible"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="400"
    transition="dialog-bottom-transition"
    persistent
  >
    <v-card class="pa-6 text-center dialog-card">
      <!-- Estado cargando -->
      <transition name="fade">
        <div v-if="loading" class="status-content">
          <v-progress-circular
            color="primary"
            indeterminate
            :size="59"
            :width="12"
            class="mb-4"
          />
          <div class="dialog-text loading-text">Procesando...</div>
        </div>
      </transition>

      <!-- Estado éxito -->
      <transition name="fade">
        <div v-if="state === 'success'" class="status-content">
          <v-icon color="success" size="64" class="mb-3 icon-animated">mdi-check-circle</v-icon>
          <div class="dialog-text success-text">{{ message || "Operación exitosa" }}</div>
        </div>
      </transition>

      <!-- Estado error -->
      <transition name="fade">
        <div v-if="state === 'error'" class="status-content">
          <v-icon color="error" size="64" class="mb-3 icon-animated">mdi-close-circle</v-icon>
          <div class="dialog-text error-text">{{ message || "Ocurrió un error" }}</div>
        </div>
      </transition>

      <!-- Botón cerrar (solo si no está cargando) -->
      <v-card-actions v-if="!loading" class="justify-center mt-4">
        <v-btn color="primary" variant="elevated" rounded="lg" @click="emit('update:modelValue', false)">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  loading: { type: Boolean, default: true },
  state: { type: String, default: "" },
  message: { type: String, default: "" },
  autoClose: { type: [Boolean, Number], default: false },
});

const emit = defineEmits(["update:modelValue"]);
const internalVisible = ref(props.modelValue);
let autoCloseTimer = null;

watch(
  () => [props.modelValue, props.loading],
  ([visible, loading]) => {
    internalVisible.value = visible;

    if (visible && !loading && props.autoClose) {
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      const delay = typeof props.autoClose === "number" ? props.autoClose : 3000;
      autoCloseTimer = setTimeout(() => {
        emit("update:modelValue", false);
        autoCloseTimer = null;
      }, delay);
    }
  }
);
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");

.dialog-card {
  border-radius: 20px;
  background: linear-gradient(145deg, #ffffff, #f2f3f5);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
  font-family: "Poppins", sans-serif;
}

.dialog-text {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: color 0.3s ease;
}

.success-text {
  color: #2e7d32;
  text-shadow: 0 0 8px rgba(46, 125, 50, 0.4);
}

.error-text {
  color: #c62828;
  text-shadow: 0 0 8px rgba(198, 40, 40, 0.3);
}

.loading-text {
  color: #1565c0;
  font-style: italic;
}

.icon-animated {
  animation: pulse 1.2s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
    opacity: 0.85;
  }
  to {
    transform: scale(1.1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.status-content {
  animation: slideUp 0.4s ease forwards;
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

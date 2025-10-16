<template>
  <div class="text-center pa-4">
    <v-btn
      :color="colorBoton"
      :disabled="botonDeshabilitado"
      :loading="procesando"
      @click="ejecutarAccionActual"
      class="px-6"
      prepend-icon="mdi-play-circle"
    >
      {{ textoBoton }}
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 📦 Props
const props = defineProps({
  acciones: {
    type: Array,
    required: true // [{ label, valor, funcion }]
  },
  colorInicial: {
    type: String,
    default: 'primary'
  },
  colorFinal: {
    type: String,
    default: 'success'
  }
})

// 📤 Emits
const emit = defineEmits(['accion-ejecutada', 'completado'])

// 🧠 Estado interno
const indiceActual = ref(0)
const procesando = ref(false)
const botonDeshabilitado = ref(false)

// 🧾 Computed: Texto dinámico
const textoBoton = computed(() => {
  if (botonDeshabilitado.value) return '✅ Finalizado'
  return props.acciones[indiceActual.value]?.label || '✅ Finalizado'
})

// 🎨 Computed: Color del botón
const colorBoton = computed(() => {
  return botonDeshabilitado.value ? props.colorFinal : props.colorInicial
})

// ▶️ Lógica principal
const ejecutarAccionActual = async () => {
  if (indiceActual.value >= props.acciones.length || botonDeshabilitado.value) return

  const accion = props.acciones[indiceActual.value]
  procesando.value = true

  try {
    if (typeof accion.funcion === 'function') {
      await accion.funcion()
    }
    emit('accion-ejecutada', accion)
  } catch (err) {
    console.error('Error ejecutando acción:', err)
  } finally {
    procesando.value = false
    indiceActual.value++

    if (indiceActual.value >= props.acciones.length) {
      // 🚫 Bloquea el botón
      botonDeshabilitado.value = true
      emit('completado')
    }
  }
}
</script>

<style scoped>
.v-btn {
  font-weight: bold;
  transition: all 0.3s;
}
</style>

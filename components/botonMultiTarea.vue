<template>
  <div class="text-center pa-4 flex flex-col items-center gap-2">
    <!-- Botón principal -->
    <v-btn :color="colorBoton" :disabled="botonDeshabilitado" :loading="procesando" @click="ejecutarAccionActual"
      class="px-6" prepend-icon="mdi-play-circle">
      {{ textoBoton }}
    </v-btn>




  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  acciones: {
    type: Array,
    required: true
  },
  faseActual: {
    type: Number,
    required: true
  },
  colorInicial: { type: String, default: 'primary' },
  colorFinal: { type: String, default: 'success' }
})

const emit = defineEmits(['accion-ejecutada', 'completado'])

const indiceActual = ref(0)
const procesando = ref(false)
const botonDeshabilitado = ref(false)
const faseActualBoton = ref('')

// 🔹 Inicializa la fase actual
const inicializarDesdeFase = () => {
  const index = props.acciones.findIndex(a =>
    Array.isArray(a.fase)
      ? a.fase.includes(props.faseActual)
      : a.fase === props.faseActual
  )
  indiceActual.value = index >= 0 ? index : 0
  botonDeshabilitado.value = indiceActual.value >= props.acciones.length
  faseActualBoton.value = props.acciones[indiceActual.value]?.valor || ''
}

// Observa cambios en la fase actual
watch(() => props.faseActual, inicializarDesdeFase, { immediate: true })

// 🔹 Texto dinámico
const textoBoton = computed(() =>
  botonDeshabilitado.value
    ? '✅ Finalizado'
    : props.acciones[indiceActual.value]?.label || '✅ Finalizado'
)

// 🔹 Color dinámico
const colorBoton = computed(() =>
  botonDeshabilitado.value ? props.colorFinal : props.colorInicial
)

// ▶️ Ejecutar acción principal (detiene avance si falla)
const ejecutarAccionActual = async () => {
  if (indiceActual.value >= props.acciones.length || botonDeshabilitado.value) return;

  const accion = props.acciones[indiceActual.value];
  procesando.value = true;

  try {
    let resultado = { ok: true };

    if (typeof accion.funcion === "function") {
      resultado = await accion.funcion(); // 👈 puede devolver ok/error
    }

    // 🚫 Si devuelve error, no avanzar
    if (!resultado || resultado.ok === false) {
      console.warn(`⚠️ Acción falló: ${resultado?.error || "Error desconocido"}`);


      return; // 👈 Detiene el flujo
    }

    // ✅ Si todo bien, avanza
    emit("accion-ejecutada", accion);
    indiceActual.value++;
    faseActualBoton.value = props.acciones[indiceActual.value]?.valor || "";

    if (indiceActual.value >= props.acciones.length) {
      botonDeshabilitado.value = true;
      emit("completado");
    }
  } catch (e) {
    console.error("❌ Error inesperado:", e);
    alert(`Error crítico en "${accion.label}".`);
  } finally {
    procesando.value = false;
  }
};

</script>

<style scoped>
.boton-opcion {
  width: 180px;
  /* ✅ Tamaño fijo */
  height: 40px;
  /* ✅ Misma altura */
  font-weight: 600;
  font-size: 15px;
  border-width: 2px;
  border-radius: 12px;
  text-transform: none;
  transition: all 0.25s ease-in-out;
  margin-top: 10px;
}

/* ✨ Espaciado y efecto hover */
.boton-opcion:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 🌈 Efecto al hacer clic */
.boton-opcion:active {
  transform: scale(0.97);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
}
</style>

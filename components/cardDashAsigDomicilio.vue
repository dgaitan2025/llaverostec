<template>
  <v-card
    class="mx-auto my-4"
    prepend-icon="mdi-tune"
    :subtitle="orden.faseActual"
    max-width="800"
  >
    <template v-slot:title>
      <span class="font-weight-black">Orden #{{ orden.id_Orden }}</span>
    </template>

    <!-- Barra de progreso -->
    <div class="px-4 pb-2">
      <v-progress-linear
        color="lime"
        height="10"
        :model-value="orden.pago_realizado === 1 ? orden.porcentaje + 20 : orden.porcentaje"
        striped
        rounded
        class="w-100"
      />
    </div>

    <div class="text-center mt-0">
      <small>{{ orden.persona_Entregar }} / {{ orden.telefono }}</small>
    </div>
    <div class="text-center mt-0">
      <small>{{ orden.direccion_entrega }}</small>
    </div>

    <!-- 🧩 Nuevo: Select de usuarios (solo visible cuando hay usuarios disponibles) -->
    <div v-if="usuarios.length > 0" class="px-4 pt-2">
      <v-select
        v-model="usuarioSeleccionado"
        :items="usuarios"
        item-title="nickname"
        item-value="usuarioId"
        label="Asignar repartidor"
        variant="outlined"
        density="compact"
        prepend-icon="mdi-account"
        @update:model-value="asignarRepartidor"
      ></v-select>
    </div>

    <!-- 🟢 Botones de acción -->
    <div v-if="orden.pasoActual === 6" class="text-center pb-4">
      <v-btn color="blue" class="px-8" @click="manejarAccion" disabled>En camino</v-btn>
    </div>

    <div v-if="orden.pasoActual === 7" class="text-center pb-4">
      <v-btn color="blue" class="px-8" @click="manejarAccion" disabled>En sitio</v-btn>
    </div>

    <div
      v-if="orden.tipo_pago === 2 && orden.pasoActual === 8"
      class="text-center pb-4"
    >
      <v-btn
        :color="orden.pago_realizado === 0 ? 'red' : 'blue'"
        class="px-8"
        @click="manejarAccion"
        disabled
      >
        {{ orden.pago_realizado === 0 ? 'Cobrar' : 'Entregar' }}
      </v-btn>
    </div>

    <div
      v-if="orden.tipo_pago === 3 && orden.pasoActual === 8"
      class="text-center pb-4"
    >
      <v-btn
        :color="orden.pago_realizado === 0 ? 'red' : 'blue'"
        class="px-8"
        @click="manejarAccion"
        disabled
      >
        {{ orden.pago_realizado === 0 ? 'Validar Transferencia' : 'Entregar' }}
      </v-btn>
    </div>
  </v-card>

  <!-- Diálogo de estado -->
  <dialogStatus
    v-model="dialogEvento"
    :loading="loadingEvento"
    :state="dialogState"
    :message="dialogMessage"
    :auto-close="cierre"
  />
</template>

<script setup>
import { defineProps, ref } from "vue";
import { pagarOrden, usuarioEntrega, actualizarEstadoOrden } from "../utils/API_ordenes";
import dialogStatus from "../components/dialogStatus.vue";

const dialogEvento = ref(false);
const loadingEvento = ref(false);
const dialogState = ref("");
const dialogMessage = ref("");
const cierre = ref();

const usuarioSeleccionado = ref(null);

// 🧩 Si la orden ya tiene un repartidor asignado, buscarlo y seleccionarlo
watch(
  () => orden.usuarioRepartidor,
  (nuevoValor) => {
    if (nuevoValor && usuarios.length > 0) {
      const asignado = usuarios.find(u => u.usuarioId === nuevoValor);
      if (asignado) usuarioSeleccionado.value = asignado.usuarioId;
    } else {
      usuarioSeleccionado.value = null; // mostrar "Asignar repartidor"
    }
  },
  { immediate: true } // para ejecutarlo también al cargar el componente
);

async function asignarRepartidor(nuevoUsuarioId) {
  if (!nuevoUsuarioId) return;

  try {
    dialogEvento.value = true;
    loadingEvento.value = true;
    dialogState.value = "";
    dialogMessage.value = "Asignando repartidor...";

    const resultUsuario = await usuarioEntrega(nuevoUsuarioId, orden.id_Orden);

    if (resultUsuario.ok) {
      dialogState.value = "success";
      dialogMessage.value = `Repartidor asignado correctamente`;
    } else {
      dialogState.value = "error";
      dialogMessage.value = resultUsuario.message || "Error al asignar repartidor";
    }
  } catch (error) {
    dialogState.value = "error";
    dialogMessage.value = error.message;
  } finally {
    loadingEvento.value = false;
    cierre.value = 2000;
  }
}


// ✅ Recibir props
const { orden, usuarios } = defineProps({
  orden: { type: Object, required: true },
  usuarios: { type: Array, default: () => [] },
});

// 🔹 Usuario logueado
const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
console.log("usuario activo:", usuarioGuardado.usuarioId);



// 🔹 Acción al presionar el botón
async function manejarAccion() {
  dialogEvento.value = true;
  loadingEvento.value = true;
  dialogState.value = "";
  dialogMessage.value = "Procesando acción...";

  try {
    // Caso 1: Pago pendiente
    if (orden.pago_realizado === 0 && orden.pasoActual === 8) {
      const resultado = await pagarOrden(orden.id_Orden);

      if (resultado.ok) {
        dialogState.value = "success";
        dialogMessage.value = resultado.message;
      } else {
        dialogState.value = "error";
        dialogMessage.value = resultado.message;
      }
    }
    // Caso 2: Entrega (requiere usuario seleccionado)
    else if (orden.pago_realizado === 1 && orden.pasoActual === 8) {
      if (!usuarioSeleccionado.value) {
        dialogState.value = "error";
        dialogMessage.value = "Seleccione un repartidor antes de entregar.";
        loadingEvento.value = false;
        return;
      }

      const resultUsuario = await usuarioEntrega(usuarioSeleccionado.value, orden.id_Orden);
      if (resultUsuario.ok) {
        const result = await actualizarEstadoOrden(orden.id_detalle);
        if (result?.mensaje) {
          dialogState.value = "success";
          dialogMessage.value = "Orden entregada correctamente";
        } else {
          dialogState.value = "error";
          dialogMessage.value = "Error al actualizar fase de entrega";
        }
      } else {
        dialogState.value = "error";
        dialogMessage.value = "Error al registrar repartidor";
      }
    }
    // Caso 3: Avance normal
    else if (orden.pasoActual === 6 || orden.pasoActual === 7) {
      const result = await actualizarEstadoOrden(orden.id_detalle);
      if (result?.mensaje) {
        dialogState.value = "success";
        dialogMessage.value = "Cambio de fase exitoso";
      } else {
        dialogState.value = "error";
        dialogMessage.value = "Error en cambio de fase";
      }
    } else {
      dialogState.value = "error";
      dialogMessage.value = "Opción no válida";
    }
  } catch (error) {
    dialogState.value = "error";
    dialogMessage.value = error.message;
  } finally {
    loadingEvento.value = false;
    cierre.value = 2000;
  }
}
</script>

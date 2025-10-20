<template>
  <v-card class="mx-auto my-4" prepend-icon="mdi-tune" :subtitle="orden.faseActual" max-width="800">
    <template v-slot:title>
      <span class="font-weight-black">Orden #{{ orden.id_Orden }}</span>
    </template>

    <!-- Barra de progreso -->
    <div class="px-4 pb-2">
      <v-progress-linear color="lime" height="10"
        :model-value="orden.pago_realizado === 1 ? orden.porcentaje + 20 : orden.porcentaje" striped rounded
        class="w-100" />

    </div>

    <!-- 🟢 Botón dinámico (solo en fases Pago o Entrega) -->
    <div v-if="orden.pasoActual === 6" class="text-center pb-4">
      <v-btn color="blue" class="px-8" @click="manejarAccion">
        En camino
      </v-btn>
    </div>

    <div v-if="orden.pasoActual === 7" class="text-center pb-4">
      <v-btn color="blue" class="px-8" @click="manejarAccion">
        En sitio
      </v-btn>
    </div>

    


    <div v-if="orden.tipo_pago === 2 && orden.pasoActual === 8" class="text-center pb-4">
      <v-btn :color="orden.pago_realizado === 0 ? 'red' : 'blue'" class="px-8" @click="manejarAccion">
        {{ orden.pago_realizado === 0 ? 'Cobrar' : 'Entregar' }}
      </v-btn>
    </div>

    <div v-if="orden.tipo_pago === 3 && orden.pasoActual === 8" class="text-center pb-4">
      <v-btn :color="orden.pago_realizado === 0 ? 'red' : 'blue'" class="px-8" @click="manejarAccion">
        {{ orden.pago_realizado === 0 ? 'Validar Transferencia' : 'Entregar' }}
      </v-btn>
    </div>
  </v-card>
  <dialogStatus v-model="dialogEvento" :loading="loadingEvento" :state="dialogState" :message="dialogMessage"
    :auto-close="cierre" />
</template>

<script setup>
import { defineProps } from "vue"
import { pagarOrden, usuarioEntrega, actualizarEstadoOrden } from "../utils/API_ordenes"
import dialogStatus from "../components/dialogStatus.vue"

const dialogEvento = ref(false)
const loadingEvento = ref(false)
const dialogState = ref("")
const dialogMessage = ref("")
const cierre = ref()

// ✅ Recibir la orden desde el componente padre
const { orden } = defineProps({
  orden: {
    type: Object,
    required: true
  }
})



const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
console.log("usuario:", usuarioGuardado.usuarioId);


// 🔹 Acción al presionar el botón
async function manejarAccion() {
  dialogEvento.value = true
  loadingEvento.value = true
  dialogState.value = ""
  dialogMessage.value = "Registrando pago"

  if (orden.pago_realizado === 0 && orden.pasoActual === 8) {


    const resultado = await pagarOrden(orden.id_Orden);

    if (resultado.ok) {
      loadingEvento.value = false;
      dialogState.value = "success";
      dialogMessage.value = resultado.message
      cierre.value = 2000;

    } else {
      loadingEvento.value = false;
      dialogState.value = "error";
      dialogMessage.value = resultado.message
      cierre.value = 2000;

    }


  } else if (orden.pago_realizado === 1 && orden.pasoActual === 8) {




    const resultUsuario = await usuarioEntrega(usuarioGuardado.usuarioId, orden.id_Orden);

    if (resultUsuario.ok) {

      const result = await actualizarEstadoOrden(orden.id_detalle);
      if (result?.mensaje) {
        loadingEvento.value = false;
        dialogState.value = "success";
        dialogMessage.value = "Orden Entregada"
        cierre.value = 2000;
      } else {
        loadingEvento.value = false;
        dialogState.value = "error";
        dialogMessage.value = "Orden no Entregada"
        cierre.value = 2000;
      }

 
    }

  } else if(orden.pasoActual === 6 || orden.pasoActual === 7){

    const result = await actualizarEstadoOrden(orden.id_detalle);
      if (result?.mensaje) {
        loadingEvento.value = false;
        dialogState.value = "success";
        dialogMessage.value = "Cambio de fase exitoso"
        cierre.value = 2000;
      } else {
        loadingEvento.value = false;
        dialogState.value = "error";
        dialogMessage.value = "Error en cambio de fase"
        cierre.value = 2000;
      }


  }
  
  
  else {
    loadingEvento.value = false;
    dialogState.value = "error";
    dialogMessage.value = "Error al procesar opcion"
    cierre.value = 2000;

  }
}
</script>

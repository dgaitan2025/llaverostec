<template>
  <Sidebar v-if="usuario && usuario.fotografia2" :foto="usuario.fotografia2" :title="usuario.nickname"
    :subtitle="usuario.email" :items="menuItems" @item-click="handleMenuClick">
     <RegistroDialog v-model="showRegistrar" />
    <div class="pa-6 text-center">
      <!-- Foto clickeable -->
      <v-avatar size="80" class="cursor-pointer" @click="dialogFoto = true">
        <v-img :src="usuario.fotografia2" alt="Foto de usuario" />
      </v-avatar>
      <h2 class="mt-4">Bienvenido {{ usuario.nickname }}</h2>
      <p>Entregas pendientes</p>
    </div>

    <!-- dasboard -->

    <div v-if="mostrardashboard" class="pa-6 text-center">
      <OrdenCard v-for="item in ordenes" :key="item.id_Orden" :orden="item" />

    </div>

    <div v-if="mostrardashboardEntrega" class="pa-6 text-center">
      <OrdenCardEntrega v-for="item in ordenes" :key="item.id_Orden" :orden="item" />

    </div>

  </Sidebar>

  <!-- Dialog con la foto grande -->
  <v-dialog v-model="dialogFoto" max-width="500">
    <v-card>
      <v-img :src="usuario.fotografia2" alt="Foto en grande" />
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="dialogFoto = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <PiePagina />

  <dialogStatus v-model="dialogEvento" :loading="loadingEvento" :state="dialogState" :message="dialogMessage"
    :auto-close="cierre" />
</template>

<script setup>
import Sidebar from "../components/barraUser.vue"
import PiePagina from "../components/piePagina.vue"
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import dialogStatus from "../components/dialogStatus.vue"
import { startConnection, on, connection } from "../utils/signalr";
import OrdenCard from "../components/cardDashEntregaDomicilio.vue"
import { PendienteEntregaDomicilio, ordenPendienteEntrega} from "../utils/API_ordenes"
import OrdenCardEntrega from "../components/cardDashEntrega.vue"
import RegistroDialog from "../components/FromRegistroAdmin.vue"

const ordenes = ref([])
const mostrardashboardEntrega = ref(false)
const showRegistrar = ref(false)


let connectionListener = null;

onMounted(async () => {
  // 👉 Define el listener
  connectionListener = async (payload) => {
    console.log("📡 Datos recibidos:", payload);
    ordenes.value = await PendienteEntregaDomicilio();
  };

  // 👉 Registra el evento antes de conectar
  on("RecibirSaludo", connectionListener);

  // 👉 Inicia la conexión (espera a que esté lista)
  await startConnection();
});

onUnmounted(() => {
  try {
    if (connection?.off && connectionListener) {
      connection.off("RecibirSaludo", connectionListener);
      console.log("🧹 Listener eliminado correctamente");
    }
  } catch (err) {
    console.warn("⚠️ No se pudo eliminar el listener SignalR:", err);
  } finally {
    connectionListener = null;
  }
});

const cierre = ref()
const dialogEvento = ref(false)
const loadingEvento = ref(false)
const dialogState = ref("")
const dialogMessage = ref("")

onMounted(() => {
  if (process.client) {
    const usuarioGuardado = localStorage.getItem("usuario")
    if (usuarioGuardado) {
      usuario.value = JSON.parse(usuarioGuardado)
      
    }
  }
})

const mostrarFormulario = ref(false)
const router = useRouter()
const dialogFoto = ref(false)
const mostrardashboard = ref(false)
const mostrarCardFinalizados = ref(false)

const menuItems = [
  { icon: "mdi-monitor-dashboard", title: "Ordenes domicilio", value: "pendientesdomicilio" },
   { icon: "mdi-monitor-dashboard", title: "Ordenes entrega tienda", value: "pendientesmostrador" },
   { icon: "mdi-account", title: "Registrar", value: "registrar" },
  { icon: "mdi-login", title: "Salir", value: "exit" }
]

const usuario = ref({
  id: null,
  email: "",
  nickname: "",
  photo: ""
})


async function handleMenuClick(item) {
  if (item.value === "exit") {
    const sesion = useCookie("token")
    sesion.value = null
    localStorage.removeItem("usuario")
    router.push("/login")
  }
  else if (item.value === "pendientesdomicilio") {
    //conectar()
    mostrardashboardEntrega.value = false;
    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""

    ordenes.value = await PendienteEntregaDomicilio()

    if (Array.isArray(ordenes.value) && ordenes.value.length > 0) {
      loadingEvento.value = false;
      dialogState.value = "success";
      dialogMessage.value = "Órdenes encontradas: " + ordenes.value.length;
      cierre.value = 2000;
      mostrardashboard.value = true;
    } else {
      loadingEvento.value = false;
      dialogState.value = "error";
      dialogMessage.value = "No tiene órdenes";
      cierre.value = 2000;
      mostrardashboard.value = false;
    }

  }else if (item.value === "pendientesmostrador") {
    //conectar()
    mostrardashboard.value = false;
    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""

    ordenes.value = await ordenPendienteEntrega()

    if (Array.isArray(ordenes.value) && ordenes.value.length > 0) {
      loadingEvento.value = false;
      dialogState.value = "success";
      dialogMessage.value = "Órdenes encontradas: " + ordenes.value.length;
      cierre.value = 2000;
      mostrardashboardEntrega.value = true;
    } else {
      loadingEvento.value = false;
      dialogState.value = "error";
      dialogMessage.value = "No tiene órdenes";
      cierre.value = 2000;
      mostrardashboardEntrega.value = false;
    }

  }else if (item.value === "registrar"){

    showRegistrar.value = true

  }else {
    loadingEvento.value = false;
      dialogState.value = "error";
      dialogMessage.value = "Error en seleccion de opcion";
      cierre.value = 2000;
      mostrardashboard.value = false;
      mostrardashboardEntrega.value = false;
      showRegistrar.value = false
  }
}

</script>

<template>
  <Sidebar
    :foto="usuario.photo" 
    :title="usuario.nickname"
    :subtitle="usuario.email"
    :items="menuItems"
    @item-click="handleMenuClick"
  >
    <!-- Contenido dinámico dentro del slot -->

    <div class="pa-6 text-center">
      <!-- Foto clickeable -->
      <v-avatar size="80" class="cursor-pointer" @click="dialogFoto = true">
        <v-img :src="usuario.photo" alt="Foto de usuario" />
      </v-avatar>
      <h2 class="mt-4">Bienvenido {{ usuario.nickname }}</h2>
      <p>Aquí podrás crear tu llavero.</p>

       <!-- Aquí ya estarán visibles siempre -->
  <v-text-field v-model="mensaje" label="Mensaje a escribir en NFC"></v-text-field>
  <v-btn color="primary" @click="escribir">Escribir en NFC</v-btn>
    </div>
  </Sidebar>
  <!-- Dialog con la foto grande -->
  <v-dialog v-model="dialogFoto" max-width="500">
    <v-card>
      
      <v-img :src="usuario.photo" alt="Foto en grande" />
      <v-card-actions class="justify-center">
        <v-btn color="primary" @click="dialogFoto = false">Cerrar</v-btn>

        
      </v-card-actions>
    </v-card>
  </v-dialog>

   
    
  

  <PiePagina/>
</template>

<script setup>
import Sidebar from "../components/barraUser.vue"
import PiePagina from "../components/piePagina.vue"
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"


const router = useRouter()
const dialogFoto = ref(false)

const formData = ref({ photo: "" })

const menuItems = [
  { icon: "mdi-image", title: "Crear llavero", value: "shared" },
  { icon: "mdi-folder", title: "Mis diseños", value: "myfiles" },
  { icon: "mdi-login", title: "Salir", value: "exit" }
]

const usuario = ref({
  id: null,
  email: "",
  nickname: "",
  photo: ""
})

onMounted(() => {
  if (process.client) {
    const usuarioGuardado = localStorage.getItem("usuario")
    if (usuarioGuardado) {
      usuario.value = JSON.parse(usuarioGuardado)
    }
  }
})

const handleMenuClick = (item) => {
  if (item.value === "exit") {
    const sesion = useCookie("usuario")
    sesion.value = null   // 👈 limpia cookie
    localStorage.removeItem("usuario")   // limpia sesión
    router.push("/login")                // redirige al login
  } else {
    console.log("👉 Item clickeado:", item.value)
  }
}


//escritura 
const mensaje = ref("");

async function escribir() {
  if (!("NDEFReader" in window)) {
    alert("❌ Este dispositivo o navegador no soporta NFC.");
    return;
  }

  try {
    const ndef = new NDEFReader();
    await ndef.write({
      records: [
        {
          recordType: "text",
          data: mensaje.value,
        },
      ],
    });
    alert("✅ Mensaje escrito: " + mensaje.value);
  } catch (err) {
    console.error(err);
    alert("⚠️ Error al escribir: " + err);
  }
}
</script>

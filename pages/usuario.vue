<template>
  <Sidebar v-if="usuario && usuario.fotografia2" :foto="usuario.fotografia2" :title="usuario.nickname" :subtitle="usuario.email" :items="menuItems"
    @item-click="handleMenuClick">
    <div class="pa-6 text-center">
      <!-- Foto clickeable -->
      <v-avatar size="80" class="cursor-pointer" @click="dialogFoto = true">
        <v-img :src="usuario.fotografia2" alt="Foto de usuario" />
      </v-avatar>
      <h2 class="mt-4">Bienvenido {{ usuario.nickname }}</h2>
      <p>Aquí podrás crear tu llavero.</p>
    </div>

    <div v-if="mostrarFormulario" class="pa-6 text-center">
      <!-- Selector de tipo de dato -->
      <v-select v-model="formDataNFC.tipoNFC" :items="['Texto', 'URL', 'Contacto']" label="Selecciona qué grabar en NFC" />
      
      <!-- Campos condicionales -->
      <div v-if="formDataNFC.tipoNFC === 'Texto'">
        <v-textarea v-model="formDataNFC.textUrl" label="Escribe el texto a grabar" auto-grow></v-textarea>
      </div>

      <div v-else-if="formDataNFC.tipoNFC === 'URL'">
        <v-text-field v-model="formDataNFC.textUrl" label="Ingresa la URL" type="url"></v-text-field>
      </div>

      <div v-else-if="formDataNFC.tipoNFC === 'Contacto'">
        <v-text-field v-model="formDataNFC.nombre" label="Nombre"></v-text-field>
        <v-text-field v-model="formDataNFC.telefono" label="Telefono"></v-text-field>
      </div>

      <!-- Tomar Foto -->
      <v-select v-model="opcionFoto" :items="['Tomar Foto', 'Subir Archivo']" label="Selecciona cómo agregar la foto"
        prepend-icon="mdi-camera" @update:model-value="manejarSeleccionFoto" />

      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title>Tomar Foto</v-card-title>
          <v-card-text>
            <video ref="videoRef" autoplay playsinline style="width:100%; border-radius:8px;" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="green" @click="onTomarFoto" >Capturar</v-btn>
            <v-btn color="red" @click="onCerrarCamara">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="mostrarPreview" />

      <div v-if="previewPhoto" class="pa-6 text-center">
        <v-img :src="previewPhoto" max-width="300" class="mx-auto rounded" alt="Vista previa" />
        
      </div>
      <v-btn color="primary" @click="guardarNFC">Solicitar</v-btn>
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
</template>

<script setup>
import Sidebar from "../components/barraUser.vue"
import PiePagina from "../components/piePagina.vue"
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { abrirCamara, cerrarCamara, tomarFoto, mostrarPreview } from "../utils/camara"
import { previewPhoto } from "../utils/stickers"
const dialog = ref(false)
const videoRef = ref(null)
const fileInput = ref(null)
const opcionFoto = ref(null)

//Formulario de NFC
const formDataNFC = ref({
  tipoNFC:"",
  textUrl:"",
  nombre:"",
  telefono:"",
  fotografia: "",
})

const guardarNFC = () => {
    try {
      formDataNFC.value.fotografia = previewPhoto.value
    // 1️⃣ Guardar en localStorage
    localStorage.setItem("formDataNFC", JSON.stringify(formDataNFC.value))
    alert("✅ Datos guardados en localStorage")

    // 2️⃣ Resetear campos
    formDataNFC.value = {
      tipoNFC: "",
      textUrl: "",
      nombre: "",
      telefono: "",
      fotografia: "",
    }

    // 3️⃣ Limpiar preview/canvas
    previewPhoto.value = null
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext("2d")
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
  } catch (error) {
    console.error("❌ Error al guardar en localStorage:", error)
  }
}


const manejarSeleccionFoto = (valor) => {
  if (valor === 'Tomar Foto') {
    onAbrirCamara()  // 👈 tu función existente
    opcionFoto.value = null
  } else if (valor === 'Subir Archivo') {
    fileInput.value.click() // 👈 dispara input de archivo
    opcionFoto.value = null
  }
}

const onAbrirCamara = () => {
  abrirCamara(dialog, videoRef, fileInput)


}

const onCerrarCamara = () => {
  cerrarCamara(dialog)

}

const onTomarFoto = () => {
  tomarFoto(videoRef, formDataNFC, () => {
    cerrarCamara(dialog)
    previewPhoto.value = formDataNFC.value.fotografia  // ✅ usar lo que ya guardó
    console.log("foto a ver "+  previewPhoto.value)
  })
}


const mostrarFormulario = ref(false)
const router = useRouter()
const dialogFoto = ref(false)
const fotoCapturada = ref(null)
const nombre = ref("")  // ✅ agregado para evitar warning
const email = ref("")   // ✅ agregado para evitar warning

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
    const sesion = useCookie("token")
    sesion.value = null
    localStorage.removeItem("usuario")
    router.push("/login")
  } else if (item.value === "shared") {
    mostrarFormulario.value = true   // 👈 activa el formulario
  } else {
    mostrarFormulario.value = false  // 👈 oculta en otras opciones
  }
}

// 🔹 Selección de tipo de dato
const tipoDato = ref("Texto")
const mensaje = ref("")

// 🔹 Escritura en NFC
async function escribir() {
  if (!("NDEFReader" in window)) {
    alert("❌ Este dispositivo o navegador no soporta NFC.");
    return;
  }

  let record;

  if (tipoDato.value === "Texto") {
    record = { recordType: "text", data: mensaje.value }
  }
  else if (tipoDato.value === "URL") {
    record = { recordType: "url", data: mensaje.value }
  }
  else if (tipoDato.value === "Contacto") {
    // vCard básico (puedes personalizarlo con más campos)
    const vcard = `BEGIN:VCARD
      VERSION:3.0
      FN:${usuario.value.nickname}
      EMAIL:${usuario.value.email}
      END:VCARD`
    record = { recordType: "mime", mediaType: "text/vcard", data: vcard }
  }

  try {
    const ndef = new NDEFReader();
    await ndef.write({ records: [record] });
    alert(`✅ ${tipoDato.value} escrito correctamente en NFC`);
  } catch (err) {
    console.error(err);
    alert("⚠️ Error al escribir: " + err);
  }
}

const formData = ref({

  fotografia: "",
})
</script>

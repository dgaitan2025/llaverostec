<template>
  <Sidebar v-if="usuario && usuario.fotografia2" :foto="usuario.fotografia2" :title="usuario.nickname"
    :subtitle="usuario.email" :items="menuItems" @item-click="handleMenuClick">
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

      <v-select v-model="formDataNFC.Id_Tipo_Grabado" :items="[
        { text: 'URL', value: 1 },
        { text: 'Contacto', value: 2 },

      ]" item-title="text" item-value="value" label="Grabador de NFC" />
      <!-- Campos condicionales -->

      <div v-if="formDataNFC.Id_Tipo_Grabado === 1">
        <v-text-field v-model="formDataNFC.link" label="Ingresa la URL" type="url"></v-text-field>
      </div>

      <div v-else-if="formDataNFC.Id_Tipo_Grabado === 2">
        <v-text-field v-model="formDataNFC.Nombre" label="Nombre"></v-text-field>
        <v-text-field v-model="formDataNFC.telefonoC" label="Telefono"></v-text-field>
      </div>

      <!-- Tomar Foto -->
      <v-select v-model="opcionFoto" :items="['Tomar Foto', 'Subir Archivo']" label="Fotografia Anverso"
        prepend-icon="mdi-camera" @update:model-value="manejarSeleccionFoto" />

      <v-dialog v-model="dialog" max-width="600" persistent>
        <v-card>
          <v-card-title>Tomar Foto</v-card-title>
          <v-card-text>
            <video ref="videoRef" autoplay playsinline style="width:100%; border-radius:8px;" />
          </v-card-text>
          <v-card-actions>
            <v-btn color="green" @click="onTomarFoto">Capturar</v-btn>
            <v-btn color="red" @click="onCerrarCamara">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="mostrarPreview1" />

      <!-- Primera foto -->
      <div v-if="formDataNFC.foto_anverso" style="text-align:center; margin-top:8px;">
        <!-- Marco fijo -->
        <div ref="marcoFrontalRef"
          style="width:3.5cm; height:4.5cm; border:1px solid #000; overflow:hidden; margin:auto; display:flex; align-items:center; justify-content:center;">
          <!-- Imagen -->
          <img :src="`data:image/png;base64,${formDataNFC.foto_anverso}`" :style="{
            transform: `rotate(${rotation}deg)`,

            objectFit: 'contain',
            display: 'block',

            width: rotation === 0 || rotation === 180 ? 'auto' : 'auto',

            height: rotation === 0 || rotation === 180 ? '100%' : '100%'
          }" />
        </div>

        <!-- Botón para rotar -->
        <v-btn color="primary" size="small" class="mt-4" @click="rotarImagen">
          Rotar
        </v-btn>
      </div>

      <!-- Segunda foto -->
      <v-select v-model="opcionFoto2" :items="['Tomar Foto 2', 'Subir Archivo 2']" label="Fotografia Reverso"
        prepend-icon="mdi-camera" @update:model-value="manejarSeleccionFoto" />

      <input ref="fileInput2" type="file" accept="image/*" style="display:none" @change="mostrarPreview2" />

      <div v-if="formDataNFC.foto_reverso" style="text-align:center; margin-top:8px;">
        <!-- Marco fijo -->
        <div
          style="width:3.5cm; height:4.5cm; border:1px solid #000; overflow:hidden; margin:auto; display:flex; align-items:center; justify-content:center;">
          <!-- Imagen -->
          <img :src="`data:image/png;base64,${formDataNFC.foto_reverso}`" :style="{
            transform: `rotate(${rotation2}deg)`,

            objectFit: 'contain',
            display: 'block',

            width: rotation2 === 0 || rotation2 === 180 ? 'auto' : 'auto',

            height: rotation2 === 0 || rotation2 === 180 ? '100%' : '100%'
          }" />
        </div>

        <!-- Botón para rotar -->
        <v-btn color="primary" size="small" class="mt-4" @click="rotarImagen2">
          Rotar
        </v-btn>
      </div>

      <v-select v-model="formDataNFC.id_Tipo_Pago" :items="[
        { text: 'Efectivo', value: 1 },
        { text: 'Transferencia', value: 2 },
        { text: 'Línea', value: 3 }
      ]" item-title="text" item-value="value" label="Método de pago" />

      <v-select v-model="formDataNFC.entrega" :items="['Presencial', 'Domicilio']" label="Entrega" />

      <div v-if="formDataNFC.entrega === 'Domicilio'">
        <v-text-field v-model="formDataNFC.persona_Entregar" label="Nombre"></v-text-field>
        <v-text-field v-model="formDataNFC.telefono" label="Telefono"></v-text-field>
        <v-text-field v-model="formDataNFC.direccion_entrega" label="Direccion"></v-text-field>
      </div>





      <v-btn color="primary" size="small" class="mt-4" @click="guardarNFC">Solicitar</v-btn>
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
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { abrirCamara, cerrarCamara, tomarFaceID, mostrarPreview } from "../utils/camara"
import { previewPhoto } from "../utils/stickers"
import { UrlWithApiRD, ENDPOINTS } from "../Service/apiConfig"
import dialogStatus from "../components/dialogStatus.vue"
import html2canvas from "html2canvas";
const dialog = ref(false)
const videoRef = ref(null)
const fileInput = ref(null)
const opcionFoto = ref(null)
const cierre = ref()

const previewPhoto1 = ref(null) // 👉 Nueva preview
const fotoActual = ref(null)
const dialogEvento = ref(false)
const loadingEvento = ref(false)
const dialogState = ref("")
const dialogMessage = ref("")

// Estado para la rotación
const rotation = ref(0)
const rotation2 = ref(0)

onMounted(() => {
  if (process.client) {
    const usuarioGuardado = localStorage.getItem("usuario")
    if (usuarioGuardado) {
      usuario.value = JSON.parse(usuarioGuardado)
      formDataNFC.id_Usuario = usuario.value.usuarioId


    }
  }
})

// Función para rotar
const rotarImagen = () => {
  rotation.value = (rotation.value + 90) % 360 // rota en pasos de 90°
//  capturarImagen(marcoFrontalRef, 'frontal')
  console.log(rotation)
}

const rotarImagen2 = async () => {

  rotation2.value = (rotation2.value + 90) % 360 // rota en pasos de 90°
  console.log(rotation)
}


const marcoFrontalRef = ref(null);
const marcoReversoRef = ref(null);

const capturarImagen = async (marcoRef, tipo) => {
  if (marcoRef.value) {
    const canvas = await html2canvas(marcoRef.value, {
      useCORS: true,
      scale: 2
    });

    const dataUrl = canvas.toDataURL("image/png");
    if (tipo === "frontal") {
      formDataNFC.value.foto_anverso = dataUrl.split(",")[1];
    } else if (tipo === "reverso") {
      formDataNFC.value.foto_reverso = dataUrl.split(",")[1];
    }
    console.log(`📸 Capturada ${tipo}:`, dataUrl);
  }
}
//Formulario de NFC
const formDataNFC = ref({
  id_Usuario: 0,
  id_Tipo_Pago: 0,
  fecha: getFechaActual(), // siempre formato YYYY-MM-DD
  total: 10,
  persona_Entregar: "",
  direccion_entrega: "",
  telefono: "",
  estado: 1,


  detalles: JSON.stringify([
    {
      id_articulo: 1,
      id_fase: 3,
      cantidad: 1,
      precio: 50,
      subtotal: 50,
      foto_anverso: "",
      foto_reverso: "",
      link: "",
      texto: "No valido",
      Id_Tipo_Grabado: 0,
      Nombre: "",
      telefonoC: 0,
      
    }
  ])

})




function getFechaActual() {
  const hoy = new Date()
  const año = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0') // meses empiezan en 0
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

const guardarNFC = async () => {

  dialogEvento.value = true
  loadingEvento.value = true
  dialogState.value = ""
  dialogMessage.value = ""
  capturarImagen(marcoFrontalRef, 'frontal')

  try {
    const orden = {
      id_Usuario: formDataNFC.value.id_Usuario,
      id_Tipo_Pago: formDataNFC.value.id_Tipo_Pago,
      fecha: formDataNFC.value.fecha,
      total: formDataNFC.value.total,
      persona_Entregar: formDataNFC.value.persona_Entregar,
      direccion_entrega: formDataNFC.value.direccion_entrega,
      telefono: formDataNFC.value.telefono,
      estado: formDataNFC.value.estado,
      detalles: JSON.stringify([{
        id_articulo: 1,
        id_fase: 3,
        cantidad: 1,
        precio: 50,
        subtotal: 50,
        foto_anverso: formDataNFC.value.foto_anverso,
        foto_reverso: formDataNFC.value.foto_reverso,
        link: formDataNFC.value.link || "",
        texto: "No valido",
        Id_Tipo_Grabado: formDataNFC.value.Id_Tipo_Grabado,
        Nombre: formDataNFC.value.Nombre,
        telefonoC: formDataNFC.value.telefonoC,
      }])
    }


    const response = await fetch(UrlWithApiRD(ENDPOINTS.crearOrden), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orden)
    })

    const data = await response.json()
    console.log("Respuesta API:", data)

    if (data.success) {
      loadingEvento.value = false
      dialogState.value = "success"
      dialogMessage.value = "Creada con exitoso " + data.id_orden
      cierre.value = 2000
    }


    console.log("Datos de form", formDataNFC.value)
    console.log("Datos de form2", orden)
    formDataNFC.value.fotografia = previewPhoto.value
    // 1️⃣ Guardar en localStorage
    localStorage.setItem("formDataNFC", JSON.stringify(formDataNFC.value))
    //alert("✅ Datos guardados en localStorage")

    // 2️⃣ Resetear campos
    formDataNFC.value = {

      textUrl: "",
      nombre: "",
      telefono: "",
      tipoPago: "",
      entrega: "",
      nombreRecive: "",
      telefonoRecive: "",
      direccionResive: "",
      fotografia: null,
      fotografia2: null,
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
    fotoActual.value = "foto_anverso"
    onAbrirCamara()  // 👈 tu función existente
    previewPhoto1.value = formDataNFC.value.fotografia
    console.log("Ese es el preview 1", previewPhoto1)
    opcionFoto.value = null
  }
  else if (valor === 'Subir Archivo') {
    fileInput.value.click() // 👈 dispara input de archivo
    opcionFoto.value = null
  }
  else if (valor === 'Tomar Foto 2') {
    fotoActual.value = "foto_reverso"
    onAbrirCamara()

    opcionFoto2.value = null
  } else if (valor === 'Subir Archivo 2') {
    fileInput2.value.click()
    opcionFoto2.value = null
  }
}





const onAbrirCamara = () => {
  abrirCamara(dialog, videoRef, fileInput)


}

const onCerrarCamara = () => {
  cerrarCamara(dialog)

}

const onTomarFoto = async () => {
  await tomarFaceID(videoRef, formDataNFC, fotoActual.value, () => {
    cerrarCamara(dialog)
    previewPhoto1.value = formDataNFC.value.fotografia  // ✅ usar lo que ya guardó
    console.log("foto a ver " + previewPhoto.value)
    formDataNFC.value = { ...formDataNFC.value }
    console.log("📸 Foto capturada en:", formDataNFC.value[fotoActual.value])
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

const fileInput2 = ref(null)
const opcionFoto2 = ref(null)



const mostrarPreview2 = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      formDataNFC.value.foto_reverso = ev.target.result.split(",")[1]

    }
    reader.readAsDataURL(file)
  }
}

const mostrarPreview1 = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      formDataNFC.value.foto_anverso = ev.target.result.split(",")[1]

    }
    reader.readAsDataURL(file)
  }
}


</script>

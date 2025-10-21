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
    <v-form ref="formNFC">
      <div v-if="mostrarFormulario" class="pa-6 text-center">
        <!-- Selector de tipo de dato -->

        <v-select v-model="formDataNFC.id_tipo_grabado" :items="[
          { text: 'URL', value: 1 },
          { text: 'Contacto', value: 2 },

        ]" item-title="text" item-value="value" label="Grabador de NFC"
          :rules="[v => !!v || 'Selecciona un tipo de grabado']" />
        <!-- Campos condicionales -->

        <div v-if="formDataNFC.id_tipo_grabado === 1">
          <v-text-field v-model="formDataNFC.link" label="Ingresa la URL" type="url"
            :rules="[v => !!v || 'La URL es obligatoria', , v => esURLValida(v) || 'URL válida invalida, falta http: o https:']"></v-text-field>
        </div>

        <div v-else-if="formDataNFC.id_tipo_grabado === 2">
          <v-text-field v-model="formDataNFC.nombre" label="Nombre"
            :rules="[v => !!v || 'El nombre es obligatorio']"></v-text-field>
          <v-text-field v-model="formDataNFC.telefono_detalle" label="Telefono"
            :rules="[v => !!v || 'El teléfono es obligatorio']"></v-text-field>
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
          <div ref="marcoReversoRef"
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
          { text: 'Efectivo', value: 2 },
          { text: 'Transferencia', value: 3 },

        ]" item-title="text" item-value="value" label="Método de pago"
          :rules="[v => !!v || 'Selecciona un método de pago']" />

        <v-select v-model="formDataNFC.entrega" :items="['Presencial', 'Domicilio']" label="Entrega"
          :rules="[v => !!v || 'Selecciona el tipo de entrega']" />

        <div v-if="formDataNFC.entrega === 'Domicilio'">

          <v-text-field v-model="formDataNFC.persona_Entregar" label="Nombre"
            :rules="[v => !!v || 'El nombre de entrega es obligatorio']"></v-text-field>
          <v-text-field v-model="formDataNFC.telefono" label="Telefono"
            :rules="[v => !!v || 'El teléfono de entrega es obligatorio']"></v-text-field>
          <v-text-field v-model="formDataNFC.direccion_entrega" label="Direccion"
            :rules="[v => !!v || 'La dirección es obligatoria']"></v-text-field>
        </div>





        <v-btn color="primary" size="small" class="mt-4" @click="validarFormulario">Solicitar</v-btn>
      </div>
    </v-form>

    <div v-if="mostrarCardFinalizados" class="pa-6 text-center">
      <CardGrabado :grabados="listaGrabados" />
    </div>

    <!-- dasboard -->

    <div v-if="mostrardashboard" class="pa-6 text-center">
      <OrdenCard v-for="item in ordenes" :key="item.id_Orden" :orden="item" />

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
import { abrirCamara, cerrarCamara, tomarFaceID, mostrarPreview } from "../utils/camara"
import { previewPhoto } from "../utils/stickers"
import { UrlWithApiRD, ENDPOINTS } from "../Service/apiConfig"
import dialogStatus from "../components/dialogStatus.vue"
import html2canvas from "html2canvas";
import { startConnection, on, connection } from "../utils/signalr";
import { watch } from "vue"
import OrdenCard from "../components/cardDash.vue"
import { ordenCliente } from "../utils/API_ordenes"
import CardGrabado from "../components/cardProdFinalizado.vue"

const ordenes = ref([])


let connectionListener = null;

onMounted(async () => {
  // 👉 Define el listener
  connectionListener = async (payload) => {
    console.log("📡 Datos recibidos:", payload);
    ordenes.value = await ordenCliente(usuario.value.usuarioId);
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

function esURLValida(valor) {
  if (!valor) return false;
  try {
    const url = new URL(valor);
    // opcional: validar que tenga protocolo http o https
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}


// Función para rotar
const rotarImagen = () => {
  rotation.value = (rotation.value + 90) % 360 // rota en pasos de 90°
  //capturarImagen(marcoFrontalRef, 'frontal')
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
  entrega_domicilio: false,


  detalles: JSON.stringify([
    {
      id_articulo: 1,
      cantidad: 1,
      precio: 50,
      subtotal: 50,
      foto_anverso: null,
      foto_reverso: null,
      link: "",
      texto: "No valido",
      id_tipo_grabado: 0,
      nombre: "",
      telefono_detalle: 0,

    }
  ])

})

watch(() => formDataNFC.value.entrega, (nuevoValor) => {
  formDataNFC.value.entrega_domicilio = (nuevoValor === 'Domicilio')
})


function getFechaActual() {
  const hoy = new Date()
  const año = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0') // meses empiezan en 0
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${año}-${mes}-${dia}`
}

const formNFC = ref(null);

const validarFormulario = async () => {
  dialogEvento.value = true
  loadingEvento.value = true
  dialogState.value = ""
  dialogMessage.value = ""
  const { valid } = await formNFC.value.validate();

  if (!valid) {
    console.warn("❌ Faltan campos obligatorios");
    loadingEvento.value = false
    dialogState.value = "error";
    dialogMessage.value = "Por favor, completa todos los campos requeridos.";
    cierre.value = 2000
    return;
  }

  if (!formDataNFC.value.foto_anverso || !formDataNFC.value.foto_reverso) {
    loadingEvento.value = false
    dialogState.value = "error";
    dialogMessage.value = "Debes subir ambas fotografías (anverso y reverso).";
    cierre.value = 2000
    return;
  }



  guardarNFC()
}

const guardarNFC = async () => {



  dialogEvento.value = true
  loadingEvento.value = true
  dialogState.value = ""
  dialogMessage.value = ""
  capturarImagen(marcoFrontalRef, 'frontal')
  capturarImagen(marcoReversoRef, 'reverso')

  try {
    const orden = {
      id_Usuario: usuario.value.usuarioId,
      id_Tipo_Pago: formDataNFC.value.id_Tipo_Pago,
      fecha: formDataNFC.value.fecha,
      total: formDataNFC.value.total,
      persona_Entregar: formDataNFC.value.persona_Entregar,
      direccion_entrega: formDataNFC.value.direccion_entrega,
      telefono: formDataNFC.value.telefono,
      estado: formDataNFC.value.estado,
      entrega_domicilio: formDataNFC.value.entrega_domicilio ? 1 : 0,
      detalles: JSON.stringify([{
        id_articulo: 1,
        cantidad: 1,
        precio: 50,
        subtotal: 50,
        foto_anverso: formDataNFC.value.foto_anverso,
        foto_reverso: formDataNFC.value.foto_reverso,
        texto: "No valido",
        id_tipo_grabado: formDataNFC.value.id_tipo_grabado,
        link: formDataNFC.value.link || "",
        nombre: formDataNFC.value.nombre,
        telefono_detalle: formDataNFC.value.telefono_detalle,
      }])
    }

    console.log("Datos de la orden a enviar ", orden)


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
    } else {
      loadingEvento.value = false
      dialogState.value = "error"
      dialogMessage.value = "Error al crear la orden"
      cierre.value = 2000
      return
    }


    console.log("Datos de form", formDataNFC.value)
    console.log("Datos de form2", orden)
    formDataNFC.value.fotografia = previewPhoto.value
    // 1️⃣ Guardar en localStorage
    localStorage.setItem("formDataNFC", JSON.stringify(formDataNFC.value))
    //alert("✅ Datos guardados en localStorage")

    // 2️⃣ Resetear campos
    formDataNFC.value = {

      id_Usuario: 0,
      id_Tipo_Pago: 0,
      fecha: getFechaActual(), // siempre formato YYYY-MM-DD
      total: 10,
      persona_Entregar: "",
      direccion_entrega: "",
      telefono: "",
      estado: 1,
      entrega_domicilio: false,


      detalles: JSON.stringify([
        {
          id_articulo: 1,
          cantidad: 1,
          precio: 50,
          subtotal: 50,
          foto_anverso: null,
          foto_reverso: null,
          link: "",
          texto: "No valido",
          id_tipo_grabado: 0,
          nombre: "",
          telefono_detalle: 0,

        }
      ])
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
const mostrardashboard = ref(false)
const mostrarCardFinalizados = ref(false)
const listaGrabados = ref([]);

const menuItems = [
  { icon: "mdi-image", title: "Crear llavero", value: "shared" },
  { icon: "mdi-folder", title: "Mis diseños", value: "myfiles" },
  { icon: "mdi-monitor-dashboard", title: "Dashboard", value: "dashboard" },
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
  } else if (item.value === "shared") {
    mostrarCardFinalizados.value = false;
    mostrardashboard.value = false;
    mostrarFormulario.value = true   // 👈 activa el formulario
  }
  else if (item.value === "dashboard") {
    //conectar()
    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""

    mostrarFormulario.value = false
    mostrarCardFinalizados.value = false

    ordenes.value = await ordenCliente(usuario.value.usuarioId)

    if (Array.isArray(ordenes.value) && ordenes.value.length > 0) {
      loadingEvento.value = false;
      dialogState.value = "success";
      dialogMessage.value = "Órdenes encontradas: " + ordenes.value.length;
      cierre.value = 2000;
      mostrardashboard.value = true;
    } else {
      loadingEvento.value = false;
      dialogState.value = "error";
      dialogMessage.value = "No tiene órdenes finalizadas";
      cierre.value = 2000;
      mostrardashboard.value = false;
    }




  } else if (item.value === "myfiles") {
    dialogEvento.value = true
    loadingEvento.value = true
    dialogState.value = ""
    dialogMessage.value = ""

    mostrardashboard.value = false
    mostrarFormulario.value = false
    const resultado = await obtenerOrdenFinalizadas(usuario.value.usuarioId);

    if (Array.isArray(resultado) && resultado.length > 0) {
      loadingEvento.value = false
      dialogState.value = "success"
      dialogMessage.value = "Orden encontradas: " + resultado.length
      cierre.value = 2000;
      mostrarCardFinalizados.value = true;
    } else {

      loadingEvento.value = false
      dialogState.value = "error"
      dialogMessage.value = "No Tiene ordenes finalizadas"
      cierre.value = 2000;
      mostrarCardFinalizados.value = false;
    }
    console.log("Datos finalizados", resultado);

    // Asigna al ref (no lo redeclares con const)
    listaGrabados.value = resultado;

    mostrarCardFinalizados.value = true;
  }
  else {
    loadingEvento.value = false;
      dialogState.value = "error";
      dialogMessage.value = "Error en seleccion de opcion";
      cierre.value = 2000;
      mostrardashboard.value = false;
      mostrarCardFinalizados.value = false;
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

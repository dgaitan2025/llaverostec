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
      <div v-if="mostrarFormulario" class="pa-6 mx-auto text-center" style="max-width: 600px;">
        <!-- Selector de tipo de dato -->

        <v-select v-model="formDataNFC.id_tipo_grabado" :items="[
          { text: 'URL', value: 1 },
          { text: 'Contacto', value: 2 },

        ]" item-title="text" item-value="value" label="Grabador de NFC"
          :rules="[v => !!v || 'Selecciona un tipo de grabado']" />
        <!-- Campos condicionales -->

        <div v-if="formDataNFC.id_tipo_grabado === 1">
          <v-text-field v-model="formDataNFC.link" label="Ingresa la URL" type="url"
            :rules="[v => !!v || 'La URL es obligatoria', v => esURLValida(v) || 'URL válida invalida, falta http: o https:']"></v-text-field>
        </div>

        <div v-else-if="formDataNFC.id_tipo_grabado === 2">
          <v-text-field v-model="formDataNFC.nombre" label="Nombre"
            :rules="[v => !!v || 'El nombre es obligatorio']"></v-text-field>
          <v-text-field v-model="formDataNFC.telefono_detalle" label="Telefono"
            :rules="[v => !!v || 'El teléfono es obligatorio']"></v-text-field>
        </div>

        <!-- Tomar Foto -->
        <v-select v-model="opcionFoto" :items="subirImagen" label="Fotografia Anverso" prepend-icon="mdi-camera"
          @update:model-value="manejarSeleccionFoto" />

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

        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="orientacioIMG" />

        <!-- Primera foto -->
        <div v-if="formDataNFC.foto_anverso" style="text-align:center; margin-top:8px;">
          <!-- Marco fijo -->
          <div class="mx-auto mt-6 position-relative" :style="{
            width: esVertical ? '3.4cm' : '4.9cm',
            height: esVertical ? '4.9cm' : '3.4cm',
            border: '1px solid #000',
            background: '#fff',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            transition: 'all 0.3s ease',
          }">
            <!-- Imagen -->
            <img :src="`data:image/png;base64,${formDataNFC.foto_anverso}`" :style="{
              width: '100%',
              height: '100%',
              objectFit: estirar ? 'fill' : 'contain',
              transition: 'transform 0.3s ease',
            }" />


          </div>
          <!-- Checkbox centrado -->
          <v-row justify="center" class="mt-2 align-center">
            <v-col cols="auto">
              <v-checkbox v-model="estirar" label="Estirar imagen al marco." hide-details density="compact" />
            </v-col>
            <v-col cols="auto">
              <v-tooltip text="Su imagen será eliminada después de la entrega del llavero.">
                <template #activator="{ props }">
                  <v-icon v-bind="props" color="primary">mdi-information</v-icon>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>

        </div>

        <!-- Segunda foto -->
        <v-select v-model="opcionFoto2" :items="subirImagen2" label="Fotografia Reverso" prepend-icon="mdi-camera"
          @update:model-value="manejarSeleccionFoto" />

        <input ref="fileInput2" type="file" accept="image/*" style="display:none" @change="orientacioIMG2" />

        <div v-if="formDataNFC.foto_reverso" style="text-align:center; margin-top:8px;">
          <!-- Marco fijo -->
          <div class="mx-auto mt-6 position-relative" :style="{
            width: esVertical2 ? '3.4cm' : '4.9cm',
            height: esVertical2 ? '4.9cm' : '3.4cm',
            border: '1px solid #000',
            background: '#fff',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            transition: 'all 0.3s ease',
          }">
            <!-- Imagen -->
            <img :src="`data:image/png;base64,${formDataNFC.foto_reverso}`" :style="{
              width: '100%',
              height: '100%',
              objectFit: estirar2 ? 'fill' : 'contain',
              transition: 'transform 0.3s ease',
            }" />
          </div>
          <v-row justify="center" class="mt-2 align-center">
            <v-col cols="auto">
              <v-checkbox v-model="estirar2" label="Estirar imagen al marco." hide-details density="compact" />
            </v-col>

            <v-col cols="auto">
              <v-tooltip text="Su imagen será eliminada después de la entrega del llavero." open-on-touch>
                <template #activator="{ props }">
                  <v-icon v-bind="props" color="primary">mdi-information</v-icon>
                </template>
              </v-tooltip>
            </v-col>
          </v-row>
        </div>

        <v-select v-model="formDataNFC.id_Tipo_Pago" :items="itemsPago" item-title="text" item-value="value"
          label="Método de pago" :rules="[v => !!v || 'Selecciona un método de pago']" />

        <v-select v-model="formDataNFC.entrega" :items="itemsEntrega" label="Entrega"
          :rules="[v => !!v || 'Selecciona el tipo de entrega']" />

        <div v-if="formDataNFC.entrega === 'Domicilio'">

          <v-text-field v-model="formDataNFC.persona_Entregar" label="Nombre"
            :rules="[v => !!v || 'El nombre de entrega es obligatorio']"></v-text-field>
          <v-text-field v-model="formDataNFC.telefono" label="Telefono"
            :rules="[v => !!v || 'El teléfono de entrega es obligatorio']"></v-text-field>
          <v-text-field v-model="formDataNFC.direccion_entrega" label="Direccion"
            :rules="[v => !!v || 'La dirección es obligatoria']"></v-text-field>
        </div>

        <div v-if="formDataNFC.entrega === 'Interior colegio Mixto Belen'">

          <v-text-field v-model="formDataNFC.persona_Entregar" label="Nombre"
            :rules="[v => !!v || 'El nombre de entrega es obligatorio']"></v-text-field>
          <v-text-field v-model="formDataNFC.telefono" label="Teléfono" type="text" inputmode="numeric" maxlength="8"
            counter="8" :rules="[
              v => !!v || 'El teléfono es obligatorio',
              v => v.length === 8 || 'Debe tener exactamente 8 dígitos'
            ]" @input="limitarTelefono" />

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

  <v-dialog v-model="dialogTC" max-width="800px" persistent>
    <v-card>
      <v-toolbar color="indigo-darken-3" dark>
        <v-toolbar-title>Completa tu pago</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="dialogTC = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <v-card-text class="pa-0" style="height: 600px;">
        <iframe v-if="checkoutUrl" :src="checkoutUrl" width="100%" height="100%" style="border: none;"></iframe>

        <div v-else class="text-center pa-6">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-4">Cargando pago...</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <dialogStatus v-model="dialogEvento" :loading="loadingEvento" :state="dialogState" :message="dialogMessage"
    :auto-close="cierre" />
</template>

<script setup>
import Sidebar from "../components/barraUser.vue"
import PiePagina from "../components/piePagina.vue"
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { abrirCamara, cerrarCamara, tomarFaceID, } from "../utils/camara"
import { previewPhoto } from "../utils/stickers"
import { UrlWithApiRD, ENDPOINTS } from "../Service/apiConfig"
import dialogStatus from "../components/dialogStatus.vue"
import { startConnection, on, connection } from "../utils/signalr";
import { watch } from "vue"
import OrdenCard from "../components/cardDash.vue"
import { ordenCliente, obtenerOrdenFinalizadas } from "../utils/API_ordenes"
import CardGrabado from "../components/cardProdFinalizado.vue"
import { crearCheckout } from "../utils/Pago_recurrenteTC"

const estirar = ref(false) // <--- nuevo checkbox
const estirar2 = ref(false) // <--- nuevo checkbox
import { analizarImagen } from "../utils/ResizeImg"

const limitarTelefono = (e) => {
  // elimina cualquier carácter no numérico y corta a 8 dígitos
  const valor = e.target.value.replace(/\D/g, '').slice(0, 8)
  e.target.value = valor
  formDataNFC.value.telefono = valor
}

const esVertical = ref(false)
const esVertical2 = ref(false)

const orientacioIMG = async (event) => {
  const resultado = await analizarImagen(event)
  if (!resultado) {
    alert("no es una imagen")
    return
  }
  formDataNFC.value.foto_anverso = resultado.base64Puro
  esVertical.value = resultado.esVertical
}

const orientacioIMG2 = async (event) => {
  const resultado = await analizarImagen(event)
  if (!resultado) {
    alert("no es una imagen")
    return
  }
  formDataNFC.value.foto_reverso = resultado.base64Puro
  esVertical2.value = resultado.esVertical
}


const checkoutUrl = ref(null);
const dialogTC = ref(false)
const itemSelect = ref("")

// 🔹 Función para abrir el pago en modal
const abrirPago = async (orden) => {
  dialogTC.value = true;
  checkoutUrl.value = null;
  try {
    checkoutUrl.value = await crearCheckout(orden); // <-- tu orden real
  } catch (e) {
    console.error('Error creando checkout:', e.message);
    dialogTC.value = false;
  }
};


const ordenes = ref([])


let connectionListener = null;

onMounted(async () => {
  // 👉 Define el listener
  connectionListener = async (payload) => {
    console.log("📡 Datos recibidos:", payload);

    if (itemSelect.value === "dashboard") {
      ordenes.value = await ordenCliente(usuario.value.usuarioId);

    } else if (itemSelect.value === "ordenesFinalizadas") {
      await obtenerOrdenFinalizadas(usuario.value.usuarioId);

    }




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


onMounted(() => {
  // ✅ Solo se ejecuta en el cliente (evita error 500 en SSR)
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const estado = params.get("estado");

    if (estado === "cancelado") {
      dialogEvento.value = true
      loadingEvento.value = true
      dialogState.value = ""
      dialogMessage.value = ""
      // Envía el mensaje al padre (el componente principal con el modal)
      window.parent.postMessage({ estado }, "*");
      console.log("📤 Mensaje enviado al padre con estado:", estado);

      loadingEvento.value = false
      dialogState.value = "error";
      dialogMessage.value = "Pago cancelado, se cobrara al entregar producto.";
      cierre.value = 5000

      window.history.replaceState({}, "", window.location.origin + window.location.pathname);

      // 🔹 Restablecer el título correctamente
      document.title = window.location.origin + window.location.pathname; // Cambia por el título que quieras mostrar
    } else if (estado === "exito") {
      dialogEvento.value = true
      loadingEvento.value = true
      dialogState.value = ""
      dialogMessage.value = ""
      // Envía el mensaje al padre (el componente principal con el modal)
      window.parent.postMessage({ estado }, "*");
      console.log("📤 Mensaje enviado al padre con estado:", estado);

      loadingEvento.value = false
      dialogState.value = "success";
      dialogMessage.value = "Pago realizado con exito.";
      cierre.value = 5000

      window.history.replaceState({}, "", window.location.origin + window.location.pathname);

      // 🔹 Restablecer el título correctamente
      document.title = window.location.origin + window.location.pathname;

    }
  }
});



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





//Formulario de NFC
const formDataNFC = ref({
  id_Usuario: 0,
  id_Tipo_Pago: "Seleccione Metodo pago",
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
  formDataNFC.value.entrega_domicilio = (nuevoValor === 'Domicilio' || nuevoValor === 'Interior colegio Mixto Belen')
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
        precio: 10,
        subtotal: 10,
        foto_anverso: formDataNFC.value.foto_anverso,
        foto_reverso: formDataNFC.value.foto_reverso,
        texto: "No valido",
        id_tipo_grabado: formDataNFC.value.id_tipo_grabado,
        link: formDataNFC.value.link || "",
        nombre: formDataNFC.value.nombre,
        telefono_detalle: formDataNFC.value.telefono_detalle,
        fill_img1: estirar.value,
        fill_img2: estirar2.value
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

      if (orden.id_Tipo_Pago === 1) {

        try {
          //await abrirPago(data.id_orden);
          await crearCheckout(data.id_orden)
        } catch (err) {
          console.error("Error en el pago:", err.message);
        }


      }


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

    //limpia las variables 
    formDataNFC.value.foto_anverso = "";
    formDataNFC.value.foto_reverso = "";
    esVertical2.value = false;
    esVertical.value = false;
    estirar.value = false
    estirar2.value = false
    ordenes.value = await ordenCliente(usuario.value.usuarioId)
    itemSelect.value = "dashboard"
    mostrardashboard.value = true;
    mostrarFormulario.value = false

    // 3️⃣ Limpiar preview/canvas
    previewPhoto.value = null
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext("2d")
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
  } catch (error) {
    loadingEvento.value = false
    dialogState.value = "error"
    dialogMessage.value = "Error al comunicar con api"
    cierre.value = 2000
    console.error("❌ Error al guardar en localStorage:", error)
  }
}


const manejarSeleccionFoto = (valor) => {
  if (valor === 'Tomar Foto') {
    fotoActual.value = "foto_anverso"
    onAbrirCamara()  // 👈 tu función existente
    //previewPhoto1.value = formDataNFC.value.fotografia
    //console.log("Ese es el preview 1", previewPhoto1)
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

  })
}


const mostrarFormulario = ref(false)
const router = useRouter()
const dialogFoto = ref(false)
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
    itemSelect.value = "exit"
    const sesion = useCookie("token")
    sesion.value = null
    localStorage.removeItem("usuario")
    router.push("/login")
  } else if (item.value === "shared") {
    itemSelect.value = "crearllavero"
    mostrarCardFinalizados.value = false;
    mostrardashboard.value = false;
    mostrarFormulario.value = true   // 👈 activa el formulario
  }
  else if (item.value === "dashboard") {
    //conectar()
    itemSelect.value = "dashboard"
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

    itemSelect.value = "ordenesFinalizadas"
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


const itemsPago = [
  // { text: 'Tarjeta Q 15.00', value: 1 }, // <-- comentario válido aquí
  { text: 'Efectivo Q 10.00', value: 2 },
  { text: 'Transferencia Q 10.00', value: 3 }
];

const itemsEntrega = [
  //'Presencial', 
  //'Domicilio',
  'Interior colegio Mixto Belen'
];
const subirImagen = [
  // 'Tomar Foto', 
  'Subir Archivo'
]

const subirImagen2 = [

  //'Tomar Foto 2', 
  'Subir Archivo 2'
]


</script>
